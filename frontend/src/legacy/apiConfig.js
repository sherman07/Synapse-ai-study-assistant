const API_BASE = (() => {
  const configured = window.SYNAPSE_API_BASE || document.body?.dataset?.apiBase || "";
  if (configured) return String(configured).replace(/\/+$/, "");
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:") return "http://127.0.0.1:8001";
  const staticDevPorts = ["5500", "5173", "3000", "8080"];
  const isStaticDevServer = /^(127\.0\.0\.1|localhost)$/.test(hostname) && staticDevPorts.includes(port);
  if (isStaticDevServer) return "http://127.0.0.1:8001";
  return `${protocol}//${window.location.host}`;
})();

export { API_BASE };
