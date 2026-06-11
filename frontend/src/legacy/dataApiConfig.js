function isLocalDevHost(hostname) {
  const value = String(hostname || "").toLowerCase();
  return value === "127.0.0.1" || value === "localhost" || value === "::1" || value === "[::1]";
}

const DATA_API_BASE = (() => {
  const win = globalThis.window || globalThis;
  const doc = globalThis.document || {};
  const configured = win.SYNAPSE_DATA_API_BASE || doc.body?.dataset?.dataApiBase || "";
  if (configured) return String(configured).replace(/\/+$/, "");
  const location = win.location || {};
  const dataPort = String(win.SYNAPSE_DATA_API_PORT || doc.body?.dataset?.dataApiPort || "3001").trim();
  const localDataApi = `http://127.0.0.1:${dataPort || "3001"}`;
  const { protocol = "file:", hostname = "127.0.0.1", port = "" } = location;
  if (protocol === "file:") return localDataApi;
  if (isLocalDevHost(hostname) && port !== dataPort) return localDataApi;
  return `${protocol}//${location.host || hostname}`;
})();

export { DATA_API_BASE };
