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

const DATA_API_BASE = (() => {
  const win = globalThis.window || globalThis;
  const doc = globalThis.document || {};
  const location = win.location || {};
  const dataPort = String(win.SYNAPSE_DATA_API_PORT || doc.body?.dataset?.dataApiPort || "3001").trim();
  const { protocol = "file:", hostname = "127.0.0.1", port = "" } = location;
  const localDataApi = `http://${localServiceHost(hostname)}:${dataPort || "3001"}`;
  const configured = String(win.SYNAPSE_DATA_API_BASE || doc.body?.dataset?.dataApiBase || "").replace(/\/+$/, "");
  const currentOrigin = `${protocol}//${location.host || (port ? `${hostname}:${port}` : hostname)}`.replace(/\/+$/, "");
  if (configured && !(isLocalDevHost(hostname) && port !== dataPort && configured === currentOrigin)) {
    return configured;
  }
  if (protocol === "file:") return localDataApi;
  if (isLocalDevHost(hostname) && port !== dataPort) return localDataApi;
  return `${protocol}//${location.host || hostname}`;
})();

export { DATA_API_BASE };
