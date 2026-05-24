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

  async fetch(path, options = {}) {
    const url = this.endpoint(path);
    try {
      return await this.fetchImpl(url, options);
    } catch (error) {
      throw new ApiConnectionError(
        [
          `Cannot reach the Synapse backend at ${this.baseUrl}.`,
          "Start it with `.venv/bin/python run_backend.py`, then try again."
        ].join(" "),
        { cause: error }
      );
    }
  }
}

export { ApiConnectionError, SynapseApiClient };
