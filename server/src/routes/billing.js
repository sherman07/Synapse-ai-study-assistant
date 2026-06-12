import { Router } from "express";
import { config } from "../config.js";
import { checkoutPlan, checkoutPlanByPrice, billingPlanList, subscriptionAccessPlan, userEntitlements } from "../billing/plans.js";
import { missingStripeConfig, stripe, stripeConfigured, stripeWebhookConfigured } from "../billing/stripe.js";
import { requireUser } from "../middleware/auth.js";
import {
  getUserById,
  getUserByStripeCustomerId,
  getUserByStripeSubscriptionId,
  updateUserStripeCustomer,
  updateUserSubscription
} from "../repositories/usersRepository.js";
import { cleanString } from "../utils/validators.js";
import { asyncRoute } from "./helpers.js";

const router = Router();
const webhookRouter = Router();

function configError(res, required = missingStripeConfig()) {
  return res.status(503).json({
    ok: false,
    error: "Stripe billing is not configured.",
    missing: required
  });
}

function requestOrigin(req) {
  const origin = cleanString(req.headers.origin, 500);
  if (origin) return origin.replace(/\/+$/, "");
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || `127.0.0.1:${config.port}`;
  return `${protocol}://${host}`.replace(/\/+$/, "");
}

function allowedReturnUrl(input, fallbackOrigin, fallbackPath = "/frontend/index.html") {
  const fallback = new URL(fallbackPath, fallbackOrigin).toString();
  const raw = cleanString(input, 1000);
  if (!raw) return fallback;
  let parsed;
  try {
    parsed = new URL(raw, fallbackOrigin);
  } catch {
    return fallback;
  }
  const allowedOrigins = new Set([...config.corsOrigins, fallbackOrigin].map(origin => origin.replace(/\/+$/, "")));
  if (!["http:", "https:"].includes(parsed.protocol)) return fallback;
  if (!allowedOrigins.has(parsed.origin)) return fallback;
  return parsed.toString();
}

function stripeId(value) {
  if (!value) return "";
  if (typeof value === "string") return cleanString(value, 255);
  return cleanString(value.id, 255);
}

function dateFromStripeSeconds(value) {
  const seconds = Number(value || 0);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : null;
}

function subscriptionPriceId(subscription = {}) {
  return cleanString(subscription.items?.data?.[0]?.price?.id, 255);
}

function planFromSubscription(subscription = {}) {
  const metadataPlan = cleanString(subscription.metadata?.plan, 80);
  if (metadataPlan) return metadataPlan;
  return checkoutPlanByPrice(subscriptionPriceId(subscription))?.plan || "free";
}

async function ensureStripeCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const client = stripe();
  const customer = await client.customers.create({
    email: user.email || undefined,
    name: user.displayName || undefined,
    metadata: {
      user_id: user.id
    }
  });
  await updateUserStripeCustomer(user.id, customer.id);
  return customer.id;
}

function checkoutMode(plan, requestedMode) {
  const requested = cleanString(requestedMode, 40);
  if (plan.id === "pro_yearly" && requested === "payment") return "payment";
  return plan.mode;
}

function subscriptionIdFromBillingObject(eventObject = {}) {
  if (eventObject.object === "subscription") return stripeId(eventObject.id);
  return stripeId(eventObject.subscription);
}

async function updateFromSubscription(subscription) {
  const subscriptionId = stripeId(subscription.id);
  const customerId = stripeId(subscription.customer);
  const user = subscriptionId
    ? await getUserByStripeSubscriptionId(subscriptionId)
    : null;
  const customerUser = !user && customerId ? await getUserByStripeCustomerId(customerId) : null;
  const targetUser = user || customerUser;
  if (!targetUser) return null;

  const status = cleanString(subscription.status, 80) || "inactive";
  const metadataPlan = planFromSubscription(subscription);
  const accessPlan = subscriptionAccessPlan(metadataPlan, status);
  return updateUserSubscription(targetUser.id, {
    stripeCustomerId: customerId || targetUser.stripeCustomerId,
    stripeSubscriptionId: subscriptionId || targetUser.stripeSubscriptionId,
    plan: accessPlan,
    subscriptionStatus: status,
    currentPeriodEnd: dateFromStripeSeconds(subscription.current_period_end)
  });
}

async function updateCheckoutCompleted(session) {
  const userId = cleanString(session.metadata?.user_id, 80);
  const targetUser = userId ? await getUserById(userId) : null;
  if (!targetUser) return null;

  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);
  if (session.mode === "subscription" && subscriptionId) {
    const subscription = await stripe().subscriptions.retrieve(subscriptionId);
    return updateFromSubscription(subscription);
  }

  if (session.mode === "payment") {
    if (session.payment_status && session.payment_status !== "paid") {
      return updateUserStripeCustomer(targetUser.id, customerId);
    }
    const plan = cleanString(session.metadata?.plan, 80) || "pro_yearly";
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    return updateUserSubscription(targetUser.id, {
      stripeCustomerId: customerId || targetUser.stripeCustomerId,
      stripeSubscriptionId: null,
      plan,
      subscriptionStatus: "active",
      currentPeriodEnd: periodEnd
    });
  }

  return updateUserStripeCustomer(targetUser.id, customerId);
}

async function markSubscriptionInactive(eventObject, status = "inactive") {
  const subscriptionId = subscriptionIdFromBillingObject(eventObject);
  const customerId = stripeId(eventObject.customer);
  const user = subscriptionId
    ? await getUserByStripeSubscriptionId(subscriptionId)
    : null;
  const customerUser = !user && customerId ? await getUserByStripeCustomerId(customerId) : null;
  const targetUser = user || customerUser;
  if (!targetUser) return null;
  return updateUserSubscription(targetUser.id, {
    stripeCustomerId: customerId || targetUser.stripeCustomerId,
    stripeSubscriptionId: subscriptionId || targetUser.stripeSubscriptionId,
    plan: "free",
    subscriptionStatus: status,
    currentPeriodEnd: null
  });
}

router.get("/plans", (_req, res) => {
  res.json({
    ok: true,
    plans: billingPlanList(),
    stripeConfigured: stripeConfigured(),
    missing: missingStripeConfig()
  });
});

router.get("/entitlements", requireUser, (req, res) => {
  res.json({ ok: true, entitlements: userEntitlements(req.user), user: req.user });
});

router.post("/create-checkout-session", requireUser, asyncRoute(async (req, res) => {
  const plan = checkoutPlan(req.body?.plan_id || req.body?.planId);
  if (!plan || plan.id === "free") {
    return res.status(400).json({ ok: false, error: "Choose a paid Pro plan to open Checkout." });
  }
  const required = ["STRIPE_SECRET_KEY"];
  if (!config.stripe.secretKey) return configError(res, required);
  if (!plan.priceId) return configError(res, [plan.id === "pro_monthly" ? "STRIPE_PRICE_PRO_MONTHLY" : "STRIPE_PRICE_PRO_YEARLY"]);

  const mode = checkoutMode(plan, req.body?.checkout_mode || req.body?.checkoutMode || req.body?.mode);
  const origin = requestOrigin(req);
  const successUrl = allowedReturnUrl(
    req.body?.success_url || req.body?.successUrl,
    origin,
    "/frontend/billing-success.html?session_id={CHECKOUT_SESSION_ID}"
  );
  const cancelUrl = allowedReturnUrl(
    req.body?.cancel_url || req.body?.cancelUrl,
    origin,
    "/frontend/billing-cancel.html"
  );
  const customerId = await ensureStripeCustomer(req.user);
  const session = await stripe().checkout.sessions.create({
    mode,
    customer: customerId,
    client_reference_id: req.user.id,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      user_id: req.user.id,
      plan: plan.plan,
      checkout_mode: mode
    },
    subscription_data: mode === "subscription"
      ? {
          metadata: {
            user_id: req.user.id,
            plan: plan.plan
          }
        }
      : undefined
  });

  res.status(201).json({
    ok: true,
    id: session.id,
    url: session.url,
    plan: plan.plan,
    mode
  });
}));

router.post("/create-portal-session", requireUser, asyncRoute(async (req, res) => {
  if (!config.stripe.secretKey) return configError(res, ["STRIPE_SECRET_KEY"]);
  const customerId = await ensureStripeCustomer(req.user);
  const origin = requestOrigin(req);
  const returnUrl = allowedReturnUrl(req.body?.return_url || req.body?.returnUrl, origin, "/frontend/index.html");
  const portal = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
  res.status(201).json({ ok: true, url: portal.url });
}));

webhookRouter.post("/", asyncRoute(async (req, res) => {
  if (!stripeConfigured() || !stripeWebhookConfigured()) {
    return configError(res, missingStripeConfig().filter(name => name === "STRIPE_SECRET_KEY" || name === "STRIPE_WEBHOOK_SECRET"));
  }
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe().webhooks.constructEvent(req.body, signature, config.stripe.webhookSecret);
  } catch (error) {
    return res.status(400).json({ ok: false, error: `Webhook signature verification failed: ${error.message}` });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await updateCheckoutCompleted(event.data.object);
      break;
    case "checkout.session.async_payment_succeeded":
      await updateCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await updateFromSubscription(event.data.object);
      break;
    case "customer.subscription.deleted":
      await markSubscriptionInactive(event.data.object, "canceled");
      break;
    case "invoice.payment_failed":
      await markSubscriptionInactive(event.data.object, "past_due");
      break;
    default:
      break;
  }

  res.json({ ok: true, received: true });
}));

export {
  allowedReturnUrl,
  router as billingRouter,
  webhookRouter as billingWebhookRouter
};
