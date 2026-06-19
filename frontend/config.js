/*
  Public runtime config for Synapse.
  Replace these values during deployment. Do not put secret keys in this file.
*/
function synapseIsPrivateIpv4Host(hostname) {
  const value = String(hostname || "").toLowerCase();
  const parts = value.split(".");
  if (parts.length !== 4 || parts.some(part => !/^\d+$/.test(part))) return false;
  const nums = parts.map(Number);
  if (nums.some(num => num < 0 || num > 255)) return false;
  return nums[0] === 10
    || (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31)
    || (nums[0] === 192 && nums[1] === 168);
}

const SYNAPSE_IS_LOCAL_HOST = ["127.0.0.1", "localhost", "::1", "[::1]"].includes(window.location.hostname)
  || synapseIsPrivateIpv4Host(window.location.hostname);
const SYNAPSE_LOCAL_API_BASE = "http://127.0.0.1:8001";
const SYNAPSE_LOCAL_DATA_API_BASE = "http://127.0.0.1:3001";

window.SYNAPSE_API_BASE = window.SYNAPSE_API_BASE || (SYNAPSE_IS_LOCAL_HOST ? SYNAPSE_LOCAL_API_BASE : "");
window.SYNAPSE_DATA_API_BASE = window.SYNAPSE_DATA_API_BASE || (SYNAPSE_IS_LOCAL_HOST ? SYNAPSE_LOCAL_DATA_API_BASE : "");
window.SYNAPSE_CONTACT_ENDPOINT = window.SYNAPSE_CONTACT_ENDPOINT || (SYNAPSE_IS_LOCAL_HOST ? `${SYNAPSE_LOCAL_API_BASE}/contact` : "");

window.SYNAPSE_SUPABASE_URL = window.SYNAPSE_SUPABASE_URL || "";
window.SYNAPSE_SUPABASE_ANON_KEY = window.SYNAPSE_SUPABASE_ANON_KEY || "";

window.SYNAPSE_BILLING_PLANS = window.SYNAPSE_BILLING_PLANS || [
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
