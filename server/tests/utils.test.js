import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { billingPlanList, hasActivePro, subscriptionAccessPlan, userEntitlements } from "../src/billing/plans.js";
import { allowedReturnUrl } from "../src/routes/billing.js";
import { stableUserId } from "../src/utils/ids.js";
import { allowedValue, cleanString, limitValue, validateProgressPayload } from "../src/utils/validators.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryDir = path.resolve(__dirname, "../src/repositories");
const serverRoot = path.resolve(__dirname, "..");

test("stableUserId is deterministic and scoped by provider", () => {
  assert.equal(stableUserId("local_demo", "abc"), stableUserId("local_demo", "abc"));
  assert.notEqual(stableUserId("local_demo", "abc"), stableUserId("supabase", "abc"));
});

test("validators clamp and sanitize public input", () => {
  assert.equal(cleanString(" hello\nworld ", 20), "hello world");
  assert.equal(allowedValue("PUBLIC", ["private", "shared", "public"], "private"), "public");
  assert.equal(allowedValue("owner", ["private", "shared", "public"], "private"), "private");
  assert.equal(limitValue(999, 50, 200), 200);
});

test("progress payload validation rejects malformed input", () => {
  assert.equal(validateProgressPayload({ score: "90" }).ok, true);
  assert.equal(validateProgressPayload(null).ok, true);
  assert.equal(validateProgressPayload([]).ok, false);
  assert.equal(validateProgressPayload({ score: "not-a-number" }).error, "Progress score must be a number.");
});

test("repository list queries inline sanitized LIMIT values", () => {
  const files = [
    "flashcardsRepository.js",
    "focusSessionsRepository.js",
    "generatedContentRepository.js",
    "progressRepository.js",
    "studyRoomsRepository.js"
  ];

  for (const file of files) {
    const source = fs.readFileSync(path.join(repositoryDir, file), "utf8");
    assert.match(source, /const safeLimit = limitValue\(/, `${file} should clamp the requested limit`);
    assert.doesNotMatch(source, /LIMIT\s+\?/i, `${file} should not bind LIMIT as a placeholder`);
    assert.match(source, /LIMIT \$\{safeLimit\}/, `${file} should inline only the sanitized integer limit`);
  }
});

test("billing plan metadata separates subscription and one-time Checkout modes", () => {
  const plans = billingPlanList();
  assert.equal(plans.find(plan => plan.id === "free")?.mode, null);
  assert.equal(plans.find(plan => plan.id === "pro_monthly")?.mode, "subscription");
  assert.equal(plans.find(plan => plan.id === "pro_yearly")?.mode, "payment");
});

test("billing entitlements only grant Pro for active unexpired statuses", () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();

  assert.equal(hasActivePro({ plan: "pro_monthly", subscriptionStatus: "active", currentPeriodEnd: future }), true);
  assert.equal(hasActivePro({ plan: "pro_yearly", subscriptionStatus: "active", currentPeriodEnd: future }), true);
  assert.equal(hasActivePro({ plan: "free", subscriptionStatus: "active", currentPeriodEnd: future }), false);
  assert.equal(hasActivePro({ plan: "pro_monthly", subscriptionStatus: "past_due", currentPeriodEnd: future }), false);
  assert.equal(hasActivePro({ plan: "pro_monthly", subscriptionStatus: "active", currentPeriodEnd: past }), false);
  assert.equal(subscriptionAccessPlan("pro_monthly", "canceled"), "free");
  assert.equal(userEntitlements({ plan: "pro_monthly", subscriptionStatus: "active", currentPeriodEnd: future }).features.proStudy, true);
});

test("billing return URLs stay on allowed origins", () => {
  const fallbackOrigin = "http://127.0.0.1:3001";
  const fallback = "http://127.0.0.1:3001/frontend/index.html";
  assert.equal(allowedReturnUrl("", fallbackOrigin, "/frontend/index.html"), fallback);
  assert.equal(allowedReturnUrl("https://evil.example/checkout", fallbackOrigin, "/frontend/index.html"), fallback);
  assert.equal(
    allowedReturnUrl("http://127.0.0.1:5173/frontend/billing-success.html?session_id={CHECKOUT_SESSION_ID}", fallbackOrigin),
    "http://127.0.0.1:5173/frontend/billing-success.html?session_id={CHECKOUT_SESSION_ID}"
  );
});

test("stripe billing routes verify webhooks and keep secrets server-side", () => {
  const routeSource = fs.readFileSync(path.join(serverRoot, "src/routes/billing.js"), "utf8");
  const schemaSource = fs.readFileSync(path.join(serverRoot, "src/db/schema.sql"), "utf8");
  const configSource = fs.readFileSync(path.join(serverRoot, "src/config.js"), "utf8");
  const generatedContentRoute = fs.readFileSync(path.join(serverRoot, "src/routes/generatedContent.js"), "utf8");

  for (const envName of [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_PRO_MONTHLY",
    "STRIPE_PRICE_PRO_YEARLY"
  ]) {
    assert.ok(configSource.includes(envName), `${envName} should be read from server environment`);
  }

  for (const field of [
    "stripe_customer_id",
    "stripe_subscription_id",
    "plan VARCHAR(80)",
    "subscription_status VARCHAR(80)",
    "current_period_end DATETIME"
  ]) {
    assert.ok(schemaSource.includes(field), `users schema should include ${field}`);
  }

  assert.ok(routeSource.includes("checkout.sessions.create"), "billing route should create Stripe Checkout Sessions");
  assert.ok(routeSource.includes("billingPortal.sessions.create"), "billing route should create Stripe Customer Portal sessions");
  assert.ok(routeSource.includes("webhooks.constructEvent"), "webhook route must verify Stripe signatures");
  assert.ok(routeSource.includes("checkout.session.completed"), "webhook route should handle completed Checkout");
  assert.ok(routeSource.includes("customer.subscription.updated"), "webhook route should handle subscription updates");
  assert.ok(routeSource.includes("customer.subscription.deleted"), "webhook route should handle subscription cancellation");
  assert.ok(routeSource.includes("invoice.payment_failed"), "webhook route should handle failed invoice payments");
  assert.ok(generatedContentRoute.includes("requireProWhenRequested"), "Pro-marked generated content writes should be gated server-side");
});
