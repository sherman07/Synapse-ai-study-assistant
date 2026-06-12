import Stripe from "stripe";
import { config } from "../config.js";

let stripeClient = null;

function stripeConfigured() {
  return Boolean(config.stripe.secretKey);
}

function stripeWebhookConfigured() {
  return Boolean(config.stripe.webhookSecret);
}

function missingStripeConfig() {
  const missing = [];
  if (!config.stripe.secretKey) missing.push("STRIPE_SECRET_KEY");
  if (!config.stripe.webhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!config.stripe.priceProMonthly) missing.push("STRIPE_PRICE_PRO_MONTHLY");
  if (!config.stripe.priceProYearly) missing.push("STRIPE_PRICE_PRO_YEARLY");
  return missing;
}

function stripe() {
  if (!stripeConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripe.secretKey, {
      apiVersion: "2026-02-25.clover"
    });
  }
  return stripeClient;
}

export { missingStripeConfig, stripe, stripeConfigured, stripeWebhookConfigured };
