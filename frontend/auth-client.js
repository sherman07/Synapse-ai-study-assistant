/* Synapse production auth, billing, and account-data helpers. */
(function() {
  "use strict";

  const SESSION_KEY = "synapse.auth.session.v1";
  const LAST_EMAIL_KEY = "synapse.auth.lastEmail.v1";
  const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const LOCAL_INDEXED_DB_NAMES = [
    "synapse.visual.assets.v1",
    "synapse.source.assets.v1"
  ];

  let supabaseClient = null;
  let supabaseScriptPromise = null;

  function readConfig() {
    const body = document.body?.dataset || {};
    return {
      supabaseUrl: String(window.SYNAPSE_SUPABASE_URL || body.supabaseUrl || "").trim(),
      supabaseAnonKey: String(window.SYNAPSE_SUPABASE_ANON_KEY || body.supabaseAnonKey || "").trim(),
      apiBase: String(window.SYNAPSE_API_BASE || body.apiBase || "").replace(/\/+$/, ""),
      billingPlans: Array.isArray(window.SYNAPSE_BILLING_PLANS) ? window.SYNAPSE_BILLING_PLANS : [
        {
          id: "starter",
          label: "Starter",
          priceId: String(window.SYNAPSE_STRIPE_PRICE_STARTER || "").trim(),
          description: "500 credits for quick revision sessions"
        },
        {
          id: "student",
          label: "Student",
          priceId: String(window.SYNAPSE_STRIPE_PRICE_STUDENT || "").trim(),
          description: "1500 credits for regular coursework"
        },
        {
          id: "pro",
          label: "Pro",
          priceId: String(window.SYNAPSE_STRIPE_PRICE_PRO || "").trim(),
          description: "4000 credits for heavier study periods"
        }
      ]
    };
  }

  function isConfigured() {
    const config = readConfig();
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

  function isLocalDevHost(hostname) {
    const value = String(hostname || "").toLowerCase();
    return value === "127.0.0.1" || value === "localhost" || value === "::1" || value === "[::1]";
  }

  function apiBase() {
    const configured = readConfig().apiBase;
    if (configured) return configured;
    const { protocol, hostname, port } = window.location;
    const backendPort = String(window.SYNAPSE_BACKEND_PORT || document.body?.dataset?.apiPort || "8001").trim();
    if (protocol === "file:") return `http://127.0.0.1:${backendPort || "8001"}`;
    if (isLocalDevHost(hostname) && port !== backendPort) {
      return `http://127.0.0.1:${backendPort || "8001"}`;
    }
    return `${protocol}//${window.location.host}`;
  }

  function appEntryUrl() {
    return (window.location.pathname || "").includes("/frontend/") ? "index.html" : "frontend/index.html";
  }

  function absoluteAppUrl() {
    return new URL(appEntryUrl(), window.location.href).toString();
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function readJSON(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeLocalStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }

  function dispatchAuthChange(session) {
    window.dispatchEvent(new CustomEvent("synapse-auth-changed", { detail: { session } }));
  }

  function publicSessionFromSupabase(sessionPayload) {
    const user = sessionPayload?.user || null;
    const metadata = user?.user_metadata || {};
    const email = normalizeEmail(user?.email || metadata.email || "");
    const firstName = String(metadata.first_name || metadata.firstName || "").trim();
    const lastName = String(metadata.last_name || metadata.lastName || "").trim();
    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim()
      || String(metadata.full_name || metadata.name || "").trim()
      || email
      || "Synapse Student";
    return {
      accountId: user?.id || email,
      email,
      displayName,
      firstName,
      lastName,
      role: metadata.role || "student",
      plan: metadata.plan || "Starter",
      credits: Number(metadata.credits || 0),
      authProvider: metadata.provider || user?.app_metadata?.provider || "supabase",
      authMode: "supabase",
      createdAt: user?.created_at || new Date().toISOString(),
      signedInAt: new Date().toISOString(),
      expiresAt: sessionPayload?.expires_at || null
    };
  }

  function saveSession(session) {
    if (!session) {
      removeLocalStorage(SESSION_KEY);
      dispatchAuthChange(null);
      return null;
    }
    writeJSON(SESSION_KEY, session);
    if (session.email) {
      try { window.localStorage.setItem(LAST_EMAIL_KEY, session.email); } catch {}
    }
    dispatchAuthChange(session);
    return session;
  }

  function getStoredSession() {
    const session = readJSON(SESSION_KEY, null);
    return session && typeof session === "object" ? session : null;
  }

  function loadSupabaseScript() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (supabaseScriptPromise) return supabaseScriptPromise;
    supabaseScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SUPABASE_CDN}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.supabase), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = SUPABASE_CDN;
      script.async = true;
      script.onload = () => resolve(window.supabase);
      script.onerror = () => reject(new Error("Could not load Supabase Auth."));
      document.head.appendChild(script);
    });
    return supabaseScriptPromise;
  }

  async function getSupabaseClient() {
    if (!isConfigured()) return null;
    if (supabaseClient) return supabaseClient;
    const loaded = await loadSupabaseScript();
    if (!loaded?.createClient) throw new Error("Supabase Auth library is unavailable.");
    const config = readConfig();
    supabaseClient = loaded.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    });
    supabaseClient.auth.onAuthStateChange((_event, sessionPayload) => {
      if (sessionPayload?.user) saveSession(publicSessionFromSupabase(sessionPayload));
      else saveSession(null);
    });
    return supabaseClient;
  }

  async function syncSessionFromProvider() {
    if (!isConfigured()) return getStoredSession();
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data?.session?.user) return saveSession(publicSessionFromSupabase(data.session));
    return getStoredSession();
  }

  async function signUpEmail({ firstName, lastName, email, password, role }) {
    const client = await getSupabaseClient();
    if (!client) throw new Error("Production auth is not configured.");
    const { data, error } = await client.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        data: {
          first_name: String(firstName || "").trim(),
          last_name: String(lastName || "").trim(),
          role: role || "student",
          plan: "Starter",
          credits: 0
        },
        emailRedirectTo: absoluteAppUrl()
      }
    });
    if (error) throw error;
    if (data?.session?.user) return { session: saveSession(publicSessionFromSupabase(data.session)) };
    return { requiresEmailConfirmation: true };
  }

  async function signInEmail({ email, password }) {
    const client = await getSupabaseClient();
    if (!client) throw new Error("Production auth is not configured.");
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizeEmail(email),
      password
    });
    if (error) throw error;
    return { session: saveSession(publicSessionFromSupabase(data.session)) };
  }

  async function signInWithGoogle({ redirectTo = absoluteAppUrl() } = {}) {
    const client = await getSupabaseClient();
    if (!client) throw new Error("Production auth is not configured.");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    if (error) throw error;
    return { redirected: true };
  }

  async function resetPassword(email) {
    const client = await getSupabaseClient();
    if (!client) throw new Error("Production auth is not configured.");
    const { error } = await client.auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: absoluteAppUrl()
    });
    if (error) throw error;
    return { ok: true };
  }

  async function signOut() {
    if (isConfigured()) {
      const client = await getSupabaseClient();
      await client?.auth?.signOut?.();
    }
    saveSession(null);
  }

  async function accessToken() {
    if (isConfigured()) {
      const client = await getSupabaseClient();
      const { data } = await client.auth.getSession();
      if (data?.session?.access_token) {
        saveSession(publicSessionFromSupabase(data.session));
        return data.session.access_token;
      }
    }
    return getStoredSession()?.accessToken || "";
  }

  async function authHeaders(extra = {}) {
    const token = await accessToken();
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
  }

  async function apiFetch(path, options = {}) {
    const headers = await authHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {})
    });
    return window.fetch(`${apiBase()}/${String(path || "").replace(/^\/+/, "")}`, {
      ...options,
      headers
    });
  }

  async function createCheckoutSession({ planId, priceId, successUrl, cancelUrl }) {
    const response = await apiFetch("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        price_id: priceId,
        success_url: successUrl || `${window.location.origin}${window.location.pathname}?billing=success`,
        cancel_url: cancelUrl || `${window.location.origin}${window.location.pathname}?billing=cancelled`
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not start checkout.");
    return data;
  }

  async function createPortalSession({ returnUrl } = {}) {
    const response = await apiFetch("/billing/portal", {
      method: "POST",
      body: JSON.stringify({
        return_url: returnUrl || `${window.location.origin}${window.location.pathname}`
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not open billing portal.");
    return data;
  }

  async function requestServerExport() {
    const response = await apiFetch("/account/export", { method: "GET" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not export server account data.");
    return data;
  }

  async function requestAccountDeletion() {
    const response = await apiFetch("/account/delete", { method: "POST", body: JSON.stringify({ confirm: true }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not delete account.");
    return data;
  }

  async function deleteLocalDatabases() {
    if (!window.indexedDB) return;
    await Promise.all(LOCAL_INDEXED_DB_NAMES.map(name => new Promise(resolve => {
      const request = window.indexedDB.deleteDatabase(name);
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    })));
  }

  function collectLocalData() {
    const localStorageData = {};
    try {
      Object.keys(window.localStorage || {})
        .filter(key => key.startsWith("synapse."))
        .forEach(key => {
          const raw = window.localStorage.getItem(key);
          if (key === SESSION_KEY) {
            try {
              const parsed = JSON.parse(raw);
              delete parsed.accessToken;
              localStorageData[key] = JSON.stringify(parsed);
              return;
            } catch {}
          }
          localStorageData[key] = raw;
        });
    } catch {}
    return {
      exportedAt: new Date().toISOString(),
      origin: window.location.origin,
      session: getStoredSession(),
      localStorage: localStorageData,
      indexedDbNames: LOCAL_INDEXED_DB_NAMES
    };
  }

  async function clearLocalSynapseData() {
    try {
      Object.keys(window.localStorage || {})
        .filter(key => key.startsWith("synapse."))
        .forEach(key => window.localStorage.removeItem(key));
    } catch {}
    await deleteLocalDatabases();
    dispatchAuthChange(null);
  }

  function downloadJSON(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.SynapseAuth = {
    apiBase,
    authHeaders,
    clearLocalSynapseData,
    collectLocalData,
    createCheckoutSession,
    createPortalSession,
    downloadJSON,
    getBillingPlans: () => readConfig().billingPlans,
    getStoredSession,
    isConfigured,
    requestAccountDeletion,
    requestServerExport,
    resetPassword,
    saveSession,
    signInEmail,
    signInWithGoogle,
    signOut,
    signUpEmail,
    syncSessionFromProvider
  };
  document.documentElement.dataset.synapseAuthClient = "loaded";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      syncSessionFromProvider().catch(error => console.warn("Synapse auth sync failed:", error));
    }, { once: true });
  } else {
    syncSessionFromProvider().catch(error => console.warn("Synapse auth sync failed:", error));
  }
})();
