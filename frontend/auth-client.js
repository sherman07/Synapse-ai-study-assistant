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
      dataApiBase: String(window.SYNAPSE_DATA_API_BASE || body.dataApiBase || "").replace(/\/+$/, ""),
      billingPlans: Array.isArray(window.SYNAPSE_BILLING_PLANS) ? window.SYNAPSE_BILLING_PLANS : [
        {
          id: "free",
          label: "Free",
          mode: null,
          price: "$0",
          cadence: "forever",
          description: "Core study generation for getting started"
        },
        {
          id: "pro_monthly",
          label: "Pro Monthly",
          mode: "subscription",
          price: "$9",
          cadence: "per month",
          description: "Upgrade to Pro with monthly billing"
        },
        {
          id: "pro_yearly",
          label: "Pro Yearly",
          mode: "payment",
          price: "$90",
          cadence: "per year",
          description: "Upgrade to Pro with one-time annual access"
        }
      ]
    };
  }

  function isConfigured() {
    const config = readConfig();
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

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

  function isLocalDevHost(hostname) {
    const value = String(hostname || "").toLowerCase();
    return value === "127.0.0.1" || value === "localhost" || value === "::1" || value === "[::1]" || isPrivateIpv4Host(value);
  }

  function apiBase() {
    const { protocol, hostname, port } = window.location;
    const backendPort = String(window.SYNAPSE_BACKEND_PORT || document.body?.dataset?.apiPort || "8001").trim();
    const configured = readConfig().apiBase;
    const currentOrigin = `${protocol}//${window.location.host}`.replace(/\/+$/, "");
    if (configured && !(isLocalDevHost(hostname) && port !== backendPort && configured === currentOrigin)) {
      return configured;
    }
    if (protocol === "file:") return `http://127.0.0.1:${backendPort || "8001"}`;
    if (isLocalDevHost(hostname) && port !== backendPort) {
      return `http://127.0.0.1:${backendPort || "8001"}`;
    }
    return `${protocol}//${window.location.host}`;
  }

  function dataApiBase() {
    const { protocol, hostname, port } = window.location;
    const dataPort = String(window.SYNAPSE_DATA_API_PORT || document.body?.dataset?.dataApiPort || "3001").trim();
    const configured = readConfig().dataApiBase;
    const currentOrigin = `${protocol}//${window.location.host}`.replace(/\/+$/, "");
    if (configured && !(isLocalDevHost(hostname) && port !== dataPort && configured === currentOrigin)) {
      return configured;
    }
    if (protocol === "file:") return `http://127.0.0.1:${dataPort || "3001"}`;
    if (isLocalDevHost(hostname) && port !== dataPort) {
      return `http://127.0.0.1:${dataPort || "3001"}`;
    }
    return `${protocol}//${window.location.host}`;
  }

  function appEntryUrl() {
    return (window.location.pathname || "").includes("/frontend/") ? "index.html" : "frontend/index.html";
  }

  function absoluteAppUrl() {
    return new URL(appEntryUrl(), window.location.href).toString();
  }

  function verificationUrl() {
    return (window.location.pathname || "").includes("/frontend/") ? "verify.html" : "frontend/verify.html";
  }

  function absoluteVerificationUrl() {
    return new URL(verificationUrl(), window.location.href).toString();
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function urlAuthParams() {
    const params = new URLSearchParams(window.location.search || "");
    const hash = String(window.location.hash || "").replace(/^#/, "");
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      hashParams.forEach((value, key) => {
        if (!params.has(key)) params.set(key, value);
      });
    }
    return params;
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

  function displayPlan(plan) {
    const labels = {
      free: "Free",
      starter: "Free",
      pro_monthly: "Pro Monthly",
      pro_yearly: "Pro Yearly"
    };
    return labels[String(plan || "").toLowerCase()] || "Free";
  }

  function creditsForPlan(plan) {
    const key = String(plan || "").toLowerCase();
    if (key === "pro_monthly" || key === "pro_yearly") return 4000;
    return 500;
  }

  function mergeServerUserIntoSession(session, user = {}) {
    if (!session) return session;
    const plan = user.plan || session.plan || "free";
    return {
      ...session,
      accountId: user.id || session.accountId,
      email: user.email || session.email,
      displayName: user.displayName || session.displayName,
      role: user.role || session.role,
      plan: displayPlan(plan),
      billingPlan: plan,
      subscriptionStatus: user.subscriptionStatus || session.subscriptionStatus || "inactive",
      currentPeriodEnd: user.currentPeriodEnd || session.currentPeriodEnd || null,
      credits: creditsForPlan(plan)
    };
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
      plan: displayPlan(metadata.plan || "free"),
      billingPlan: metadata.plan || "free",
      subscriptionStatus: metadata.subscription_status || metadata.subscriptionStatus || "inactive",
      currentPeriodEnd: metadata.current_period_end || metadata.currentPeriodEnd || null,
      credits: Number(metadata.credits || creditsForPlan(metadata.plan || "free")),
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
    let session = getStoredSession();
    if (!isConfigured()) return syncBillingSessionFromServer(session);
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data?.session?.user) session = saveSession(publicSessionFromSupabase(data.session));
    return syncBillingSessionFromServer(session);
  }

  function isRepeatedSignupUser(user) {
    return Array.isArray(user?.identities) && user.identities.length === 0;
  }

  async function signInAfterRepeatedSignup(client, email, password) {
    if (!password) return null;
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data?.session?.user) return null;
      return saveSession(publicSessionFromSupabase(data.session));
    } catch {
      return null;
    }
  }

  async function signUpEmail({ firstName, lastName, email, password, role }) {
    const client = await getSupabaseClient();
    if (!client) throw new Error("Production auth is not configured.");
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          first_name: String(firstName || "").trim(),
          last_name: String(lastName || "").trim(),
          role: role || "student",
          plan: "Starter",
          credits: 0
        },
        emailRedirectTo: absoluteVerificationUrl()
      }
    });
    if (error) throw error;
    if (data?.session?.user) return { session: saveSession(publicSessionFromSupabase(data.session)) };
    if (data?.user && !data?.session) {
      if (isRepeatedSignupUser(data.user)) {
        const existingSession = await signInAfterRepeatedSignup(client, normalizedEmail, password);
        if (existingSession) {
          return {
            session: existingSession,
            signupStatus: "signed_in_existing",
            email: normalizedEmail
          };
        }
        return {
          requiresExistingAccountAction: true,
          signupStatus: "existing_account",
          emailConfirmationStatus: "existing_account",
          email: normalizedEmail,
          userId: data.user.id || ""
        };
      }
      return {
        requiresEmailConfirmation: true,
        signupStatus: "confirmation_pending",
        emailConfirmationStatus: "session_pending",
        email: normalizedEmail,
        userId: data.user.id || ""
      };
    }
    return {
      requiresEmailConfirmation: true,
      signupStatus: "confirmation_pending",
      emailConfirmationStatus: "unknown_delivery",
      email: normalizedEmail
    };
  }

  async function resendSignupConfirmation(email) {
    const client = await getSupabaseClient();
    if (!client) throw new Error("Production auth is not configured.");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Enter the email address you used to sign up.");
    const { error } = await client.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: absoluteVerificationUrl()
      }
    });
    if (error) throw error;
    return { resent: true, email: normalizedEmail };
  }

  async function completeAuthRedirect() {
    const params = urlAuthParams();
    const redirectError = params.get("error_description") || params.get("error");
    if (redirectError) {
      return {
        ok: false,
        status: "error",
        error: redirectError.replace(/\+/g, " ")
      };
    }

    const session = await syncSessionFromProvider();
    if (session?.accountId || session?.email) {
      return { ok: true, status: "signed_in", session };
    }

    return {
      ok: false,
      status: "pending",
      message: "Open your confirmation link from the same browser, or log in after verification."
    };
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
    const session = getStoredSession();
    const headers = { ...extra };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (session && typeof session === "object") {
      if (session.accountId) headers["X-Synapse-User-Id"] = cleanHeaderValue(session.accountId, 160);
      if (session.email) headers["X-Synapse-User-Email"] = cleanHeaderValue(session.email, 220);
      if (session.displayName) headers["X-Synapse-User-Name"] = cleanHeaderValue(session.displayName, 180);
      if (session.authMode) headers["X-Synapse-Auth-Mode"] = cleanHeaderValue(session.authMode, 60);
      if (session.role) headers["X-Synapse-User-Role"] = cleanHeaderValue(session.role, 80);
    }
    headers["X-Synapse-Client-Id"] = cleanHeaderValue(getSynapseClientId(), 160);
    return headers;
  }

  function cleanHeaderValue(value, limit = 220) {
    return String(value || "")
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, limit);
  }

  function randomClientId() {
    const cryptoApi = window.crypto || globalThis.crypto;
    if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
    return `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  }

  function getSynapseClientId() {
    const key = "synapse.client.id.v1";
    try {
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const next = randomClientId();
      window.localStorage.setItem(key, next);
      return next;
    } catch {
      return randomClientId();
    }
  }

  async function baseFetch(base, path, options = {}) {
    const headers = await authHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {})
    });
    return window.fetch(`${base}/${String(path || "").replace(/^\/+/, "")}`, {
      ...options,
      headers
    });
  }

  async function apiFetch(path, options = {}) {
    return baseFetch(apiBase(), path, options);
  }

  async function dataApiFetch(path, options = {}) {
    return baseFetch(dataApiBase(), path, options);
  }

  async function syncBillingSessionFromServer(session = getStoredSession()) {
    if (!session) return null;
    try {
      const response = await dataApiFetch("/api/users/me", { method: "GET" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error || !data.user) return session;
      return saveSession(mergeServerUserIntoSession(session, data.user));
    } catch {
      return session;
    }
  }

  async function fetchBillingPlans() {
    const response = await dataApiFetch("/api/billing/plans", { method: "GET" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not load billing plans.");
    return data;
  }

  async function fetchBillingEntitlements() {
    const response = await dataApiFetch("/api/billing/entitlements", { method: "GET" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not load billing status.");
    if (data.user) {
      const session = getStoredSession();
      if (session) saveSession(mergeServerUserIntoSession(session, data.user));
    }
    return data;
  }

  async function createCheckoutSession({ planId, checkoutMode, successUrl, cancelUrl }) {
    const response = await dataApiFetch("/api/billing/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        checkout_mode: checkoutMode,
        success_url: successUrl || new URL("billing-success.html?session_id={CHECKOUT_SESSION_ID}", window.location.href).toString(),
        cancel_url: cancelUrl || new URL("billing-cancel.html", window.location.href).toString()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Could not start checkout.");
    return data;
  }

  async function createPortalSession({ returnUrl } = {}) {
    const response = await dataApiFetch("/api/billing/create-portal-session", {
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
    completeAuthRedirect,
    createCheckoutSession,
    createPortalSession,
    dataApiBase,
    downloadJSON,
    fetchBillingEntitlements,
    fetchBillingPlans,
    getBillingPlans: () => readConfig().billingPlans,
    getStoredSession,
    isConfigured,
    requestAccountDeletion,
    requestServerExport,
    resendSignupConfirmation,
    resetPassword,
    saveSession,
    signInEmail,
    signInWithGoogle,
    signOut,
    signUpEmail,
    syncBillingSessionFromServer,
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
