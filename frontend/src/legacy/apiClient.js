class ApiConnectionError extends Error {
  constructor(message, { cause } = {}) {
    super(message);
    this.name = "ApiConnectionError";
    this.cause = cause;
  }
}

const SYNAPSE_CLIENT_ID_KEY = "synapse.client.id.v1";

function browserWindow() {
  return globalThis.window || globalThis;
}

function cleanHeaderValue(value, limit = 220) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, limit);
}

function randomClientId() {
  const cryptoApi = globalThis.crypto || browserWindow().crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function getSynapseClientId() {
  const win = browserWindow();
  try {
    const existing = win.localStorage?.getItem(SYNAPSE_CLIENT_ID_KEY);
    if (existing) return existing;
    const next = randomClientId();
    win.localStorage?.setItem(SYNAPSE_CLIENT_ID_KEY, next);
    return next;
  } catch {
    return randomClientId();
  }
}

function headersToObject(headers = {}) {
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    const output = {};
    headers.forEach((value, key) => {
      output[key] = value;
    });
    return output;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...(headers || {}) };
}

class SynapseApiClient {
  constructor(baseUrl, { fetchImpl } = {}) {
    const win = browserWindow();
    this.baseUrl = String(baseUrl || "").replace(/\/+$/, "");
    this.fetchImpl = fetchImpl || win.fetch?.bind(win) || globalThis.fetch?.bind(globalThis);
  }

  endpoint(path) {
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${cleanPath}`;
  }

  timeoutMessage(timeoutMs) {
    const seconds = Math.max(1, Math.round(Number(timeoutMs || 0) / 1000));
    return `Synapse backend did not respond within ${seconds} seconds. Try a smaller source set or increase window.SYNAPSE_ANALYSIS_TIMEOUT_MS.`;
  }

  async requestHeaders(headers = {}) {
    const win = browserWindow();
    const next = headersToObject(headers);
    next["X-Synapse-Client-Id"] = cleanHeaderValue(getSynapseClientId(), 160);

    const session = win.SynapseAuth?.getStoredSession?.();
    if (session && typeof session === "object") {
      if (session.accountId) next["X-Synapse-User-Id"] = cleanHeaderValue(session.accountId, 160);
      if (session.email) next["X-Synapse-User-Email"] = cleanHeaderValue(session.email, 220);
      if (session.displayName) next["X-Synapse-User-Name"] = cleanHeaderValue(session.displayName, 180);
      if (session.authMode) next["X-Synapse-Auth-Mode"] = cleanHeaderValue(session.authMode, 60);
      if (session.role) next["X-Synapse-User-Role"] = cleanHeaderValue(session.role, 80);
    }

    if (win.SynapseAuth?.authHeaders && !next.Authorization && !next.authorization) {
      try {
        const authHeaders = await win.SynapseAuth.authHeaders({});
        if (authHeaders?.Authorization) next.Authorization = authHeaders.Authorization;
        if (authHeaders?.authorization) next.authorization = authHeaders.authorization;
      } catch (error) {
        console.warn("Synapse auth headers were not attached:", error);
      }
    }

    return next;
  }

  async fetch(path, options = {}) {
    const url = this.endpoint(path);
    const { timeoutMs, ...fetchOptions } = options || {};
    fetchOptions.headers = await this.requestHeaders(fetchOptions.headers || {});
    const timeoutLimit = Number(timeoutMs || 0);
    let controller = null;
    let timeoutId = null;
    let abortFromCaller = null;
    const callerSignal = fetchOptions.signal;
    if (timeoutLimit > 0 && typeof AbortController !== "undefined") {
      controller = new AbortController();
      abortFromCaller = () => controller.abort();
      if (callerSignal) {
        if (callerSignal.aborted) {
          controller.abort();
        } else {
          callerSignal.addEventListener("abort", abortFromCaller, { once: true });
        }
      }
      timeoutId = browserWindow().setTimeout(() => controller.abort(), timeoutLimit);
      fetchOptions.signal = controller.signal;
    }
    try {
      return await this.fetchImpl(url, fetchOptions);
    } catch (error) {
      if (controller?.signal?.aborted) {
        throw new ApiConnectionError(this.timeoutMessage(timeoutLimit), { cause: error });
      }
      throw new ApiConnectionError(
        [
          `Cannot reach the Synapse backend at ${this.baseUrl}.`,
          "Start it with `.venv/bin/python run_backend.py`, then try again."
        ].join(" "),
        { cause: error }
      );
    } finally {
      if (timeoutId) browserWindow().clearTimeout(timeoutId);
      if (callerSignal && abortFromCaller) {
        callerSignal.removeEventListener("abort", abortFromCaller);
      }
    }
  }
}

export { ApiConnectionError, SynapseApiClient };
