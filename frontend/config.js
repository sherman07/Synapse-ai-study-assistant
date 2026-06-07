/*
  Public runtime config for Synapse.
  Replace these values during deployment. Do not put secret keys in this file.
*/
window.SYNAPSE_API_BASE = window.SYNAPSE_API_BASE || "";
window.SYNAPSE_CONTACT_ENDPOINT = window.SYNAPSE_CONTACT_ENDPOINT || "";

window.SYNAPSE_SUPABASE_URL = window.SYNAPSE_SUPABASE_URL || "";
window.SYNAPSE_SUPABASE_ANON_KEY = window.SYNAPSE_SUPABASE_ANON_KEY || "";

window.SYNAPSE_STRIPE_PRICE_STARTER = window.SYNAPSE_STRIPE_PRICE_STARTER || "";
window.SYNAPSE_STRIPE_PRICE_STUDENT = window.SYNAPSE_STRIPE_PRICE_STUDENT || "";
window.SYNAPSE_STRIPE_PRICE_PRO = window.SYNAPSE_STRIPE_PRICE_PRO || "";
window.SYNAPSE_BILLING_PLANS = window.SYNAPSE_BILLING_PLANS || [
  {
    id: "starter",
    label: "Starter",
    priceId: window.SYNAPSE_STRIPE_PRICE_STARTER,
    description: "500 credits for quick revision sessions"
  },
  {
    id: "student",
    label: "Student",
    priceId: window.SYNAPSE_STRIPE_PRICE_STUDENT,
    description: "1500 credits for regular coursework"
  },
  {
    id: "pro",
    label: "Pro",
    priceId: window.SYNAPSE_STRIPE_PRICE_PRO,
    description: "4000 credits for heavier study periods"
  }
];
