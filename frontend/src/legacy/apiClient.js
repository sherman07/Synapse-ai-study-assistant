class ApiConnectionError extends Error {
  constructor(message, { cause } = {}) {
    super(message);
    this.name = "ApiConnectionError";
    this.cause = cause;
  }
}

class SynapseApiClient {
  constructor(baseUrl, { fetchImpl = window.fetch.bind(window) } = {}) {
    this.baseUrl = String(baseUrl || "").replace(/\/+$/, "");
    this.fetchImpl = fetchImpl;
  }

  endpoint(path) {
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${cleanPath}`;
  }

  timeoutMessage(timeoutMs) {
    const seconds = Math.max(1, Math.round(Number(timeoutMs || 0) / 1000));
    return `Synapse backend did not respond within ${seconds} seconds. Try a smaller source set or increase window.SYNAPSE_ANALYSIS_TIMEOUT_MS.`;
  }

  async fetch(path, options = {}) {
    const url = this.endpoint(path);
    const { timeoutMs, ...fetchOptions } = options || {};
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
      timeoutId = window.setTimeout(() => controller.abort(), timeoutLimit);
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
      if (timeoutId) window.clearTimeout(timeoutId);
      if (callerSignal && abortFromCaller) {
        callerSignal.removeEventListener("abort", abortFromCaller);
      }
    }
  }
}

export { ApiConnectionError, SynapseApiClient };
