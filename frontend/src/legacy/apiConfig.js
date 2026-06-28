function isPrivateIpv4Host(hostname) {
  const value = String(hostname || "").toLowerCase();
  const parts = value.split(".");
  if (parts.length !== 4 || parts.some(part => !/^\d+$/.test(part))) return false;
  const nums = parts.map(Number);
  if (nums.some(num => num < 0 || num > 255)) return false;
  return nums[0] === 10
    || (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31)
    || (nums[0] === 192 && nums[1] === 168);
}

function isLoopbackHost(hostname) {
  const value = String(hostname || "").toLowerCase();
  return value === "127.0.0.1" || value === "localhost" || value === "::1" || value === "[::1]";
}

function isLocalDevHost(hostname) {
  return isLoopbackHost(hostname) || isPrivateIpv4Host(hostname);
}

function localServiceHost(hostname) {
  if (!hostname || isLoopbackHost(hostname)) return "127.0.0.1";
  return hostname;
}

const API_BASE = (() => {
  const { protocol, hostname, port } = window.location;
  const backendPort = String(window.SYNAPSE_BACKEND_PORT || document.body?.dataset?.apiPort || "8001").trim();
  const localBackend = `http://${localServiceHost(hostname)}:${backendPort || "8001"}`;
  const configured = String(window.SYNAPSE_API_BASE || document.body?.dataset?.apiBase || "").replace(/\/+$/, "");
  const currentOrigin = `${protocol}//${window.location.host}`.replace(/\/+$/, "");
  if (configured && !(isLocalDevHost(hostname) && port !== backendPort && configured === currentOrigin)) {
    return configured;
  }
  if (protocol === "file:") return localBackend;
  if (isLocalDevHost(hostname) && port !== backendPort) return localBackend;
  return `${protocol}//${window.location.host}`;
})();

export { API_BASE };
