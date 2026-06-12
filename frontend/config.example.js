/*
  Copy this file to config.js during deployment, fill in real values, and load it
  before auth-client.js in each public HTML entrypoint.
*/
window.SYNAPSE_API_BASE = "https://api.your-domain.com";
window.SYNAPSE_DATA_API_BASE = "https://data-api.your-domain.com";
window.SYNAPSE_CONTACT_ENDPOINT = "https://api.your-domain.com/contact";

window.SYNAPSE_SUPABASE_URL = "https://your-project.supabase.co";
window.SYNAPSE_SUPABASE_ANON_KEY = "your-public-anon-key";

// Stripe secret keys and price IDs live on the Express data API server only.
// The frontend sends only these public plan IDs.
window.SYNAPSE_BILLING_PLANS = [
  {
    id: "free",
    label: "Free",
    mode: null,
    price: "$0",
    cadence: "forever",
    description: "Core study generation for getting started"
  },
  {
    id: "pro_monthly",
    label: "Pro Monthly",
    mode: "subscription",
    price: "$9",
    cadence: "per month",
    description: "Upgrade to Pro with monthly billing"
  },
  {
    id: "pro_yearly",
    label: "Pro Yearly",
    mode: "payment",
    price: "$90",
    cadence: "per year",
    description: "Upgrade to Pro with one-time annual access"
  }
];
