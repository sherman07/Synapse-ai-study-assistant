function isLocalDevHost(hostname) {
  const value = String(hostname || "").toLowerCase();
  return value === "127.0.0.1" || value === "localhost" || value === "::1" || value === "[::1]";
}

const API_BASE = (() => {
  const configured = window.SYNAPSE_API_BASE || document.body?.dataset?.apiBase || "";
  if (configured) return String(configured).replace(/\/+$/, "");
  const { protocol, hostname, port } = window.location;
  const backendPort = String(window.SYNAPSE_BACKEND_PORT || document.body?.dataset?.apiPort || "8001").trim();
  const localBackend = `http://127.0.0.1:${backendPort || "8001"}`;
  if (protocol === "file:") return localBackend;
  if (isLocalDevHost(hostname) && port !== backendPort) return localBackend;
  return `${protocol}//${window.location.host}`;
})();

export { API_BASE };
