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

function synapseIsLoopbackHost(hostname) {
  return ["127.0.0.1", "localhost", "::1", "[::1]"].includes(String(hostname || "").toLowerCase());
}

const SYNAPSE_IS_LOOPBACK_HOST = synapseIsLoopbackHost(window.location.hostname);
const SYNAPSE_IS_LOCAL_HOST = SYNAPSE_IS_LOOPBACK_HOST || synapseIsPrivateIpv4Host(window.location.hostname);
const SYNAPSE_LOCAL_SERVICE_HOST = SYNAPSE_IS_LOOPBACK_HOST ? "127.0.0.1" : window.location.hostname;
const SYNAPSE_LOCAL_API_BASE = `http://${SYNAPSE_LOCAL_SERVICE_HOST}:8001`;
const SYNAPSE_LOCAL_DATA_API_BASE = `http://${SYNAPSE_LOCAL_SERVICE_HOST}:3001`;

window.SYNAPSE_API_BASE = window.SYNAPSE_API_BASE || (SYNAPSE_IS_LOCAL_HOST ? SYNAPSE_LOCAL_API_BASE : "");
window.SYNAPSE_DATA_API_BASE = window.SYNAPSE_DATA_API_BASE || (SYNAPSE_IS_LOCAL_HOST ? SYNAPSE_LOCAL_DATA_API_BASE : "");
window.SYNAPSE_CONTACT_ENDPOINT = window.SYNAPSE_CONTACT_ENDPOINT || (SYNAPSE_IS_LOCAL_HOST ? `${SYNAPSE_LOCAL_API_BASE}/contact` : "");
window.SYNAPSE_FOCUS_ROOM_ENABLED = window.SYNAPSE_FOCUS_ROOM_ENABLED === true
  || window.SYNAPSE_FOCUS_ROOM_ENABLED === "true";

window.SYNAPSE_SUPABASE_URL = window.SYNAPSE_SUPABASE_URL || "https://yoopvoutgfhnldhmqmip.supabase.co";
window.SYNAPSE_SUPABASE_ANON_KEY = window.SYNAPSE_SUPABASE_ANON_KEY || "sb_publishable_WhUSmLHyEZ7E_-R9_sjbPA_5KVgHzXF";

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
