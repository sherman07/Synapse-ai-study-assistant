/*
  Copy this file to config.js during deployment, fill in real values, and load it
  before auth-client.js in each public HTML entrypoint.
*/
window.SYNAPSE_API_BASE = "https://api.your-domain.com";
window.SYNAPSE_CONTACT_ENDPOINT = "https://api.your-domain.com/contact";

window.SYNAPSE_SUPABASE_URL = "https://your-project.supabase.co";
window.SYNAPSE_SUPABASE_ANON_KEY = "your-public-anon-key";

window.SYNAPSE_STRIPE_PRICE_STARTER = "price_starter";
window.SYNAPSE_STRIPE_PRICE_STUDENT = "price_student";
window.SYNAPSE_STRIPE_PRICE_PRO = "price_pro";
window.SYNAPSE_BILLING_PLANS = [
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
