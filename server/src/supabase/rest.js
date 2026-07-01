import { config } from "../config.js";

const DEFAULT_TIMEOUT_MS = 8000;

function normalizedSupabaseUrl() {
  return String(config.supabaseUrl || "").replace(/\/+$/, "");
}

function supabaseStorageEnabled() {
  return Boolean(normalizedSupabaseUrl() && config.supabaseServiceRoleKey);
}

async function checkSupabaseStorage() {
  if (!supabaseStorageEnabled()) return false;
  await supabaseRequest("GET", "users", {
    query: { select: "id", limit: 1 },
    timeoutMs: 5000
  });
  return true;
}

function supabaseStorageHeaders({ prefer = "", hasBody = false } = {}) {
  const headers = {
    Accept: "application/json",
    apikey: config.supabaseServiceRoleKey,
    Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    "Accept-Profile": config.supabaseDbSchema
  };
  if (hasBody) {
    headers["Content-Type"] = "application/json";
    headers["Content-Profile"] = config.supabaseDbSchema;
  }
  if (prefer) headers.Prefer = prefer;
  return headers;
}

function supabaseTableUrl(table, query = {}) {
  const url = new URL(`${normalizedSupabaseUrl()}/rest/v1/${table}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function supabaseRequest(method, table, { query = {}, body, prefer = "", allowEmpty = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!supabaseStorageEnabled()) {
    throw new Error("Supabase storage is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(supabaseTableUrl(table, query), {
      method,
      headers: supabaseStorageHeaders({ prefer, hasBody: body !== undefined }),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const detail = typeof payload === "string"
        ? payload
        : payload?.message || payload?.error_description || payload?.details || payload?.hint || "";
      throw new Error(
        `Supabase ${table} ${method} failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`
      );
    }

    if (!text && allowEmpty) return null;
    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Supabase ${table} ${method} timed out after ${Math.ceil(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function firstSupabaseRow(payload) {
  return Array.isArray(payload) ? payload[0] || null : (payload && typeof payload === "object" ? payload : null);
}

export { checkSupabaseStorage, firstSupabaseRow, supabaseRequest, supabaseStorageEnabled };
