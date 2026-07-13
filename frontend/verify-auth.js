/* Synapse Supabase verification page controller. */
(function() {
  "use strict";

  function appEntryUrl() {
    return (window.location.pathname || "").includes("/frontend/") ? "index.html" : "frontend/index.html";
  }

  function workspaceUrl() {
    return window.SynapseAuth?.absoluteAppUrl?.() || appEntryUrl();
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  function setStep(name, state) {
    const step = document.querySelector(`[data-verify-step="${name}"]`);
    if (!step) return;
    step.classList.toggle("is-complete", state === "complete");
    step.classList.toggle("is-current", state === "current");
  }

  function setStatus(kind, title, detail) {
    const status = getEl("verifyStatus");
    if (!status) return;
    const icons = {
      success: "bi-check-circle",
      pending: "bi-envelope-open",
      error: "bi-exclamation-triangle",
      loading: "bi-arrow-repeat"
    };
    status.className = `verify-status verify-status-${kind}`;
    status.textContent = "";

    const iconWrap = document.createElement("div");
    iconWrap.className = "verify-status-icon";
    const icon = document.createElement("i");
    icon.className = `bi ${icons[kind] || icons.loading}`;
    iconWrap.appendChild(icon);

    const copy = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = title;
    const body = document.createElement("span");
    body.textContent = detail;
    copy.append(heading, body);
    status.append(iconWrap, copy);
  }

  function setCopy(title, subtitle) {
    const titleEl = getEl("verifyTitle");
    const subtitleEl = getEl("verifySubtitle");
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  }

  function showWorkspaceAction() {
    const button = getEl("openWorkspaceButton");
    if (!button) return;
    button.href = workspaceUrl();
    button.classList.remove("is-disabled");
    button.removeAttribute("aria-disabled");
  }

  function showPendingAction() {
    const button = getEl("openWorkspaceButton");
    if (!button) return;
    button.href = "login.html";
    button.querySelector("span").textContent = "Go to Login";
    button.querySelector("i").className = "bi bi-box-arrow-in-right";
  }

  async function completeVerification() {
    if (!window.SynapseAuth?.isConfigured?.()) {
      setCopy("Verification needs Supabase", "Add the public Supabase URL and publishable key, then open the confirmation link again.");
      setStatus("error", "Supabase Auth is not configured.", "This page cannot complete verification without the hosted auth client.");
      showPendingAction();
      return;
    }

    const result = await window.SynapseAuth.completeAuthRedirect();
    if (result?.ok && result?.session) {
      setCopy("You are verified", "Your secure Synapse workspace is ready.");
      setStatus("success", "Verification complete.", "Opening your workspace now. You can also continue with the button below.");
      setStep("email", "complete");
      setStep("workspace", "complete");
      showWorkspaceAction();
      window.setTimeout(() => {
        window.location.href = workspaceUrl();
      }, 1400);
      return;
    }

    if (result?.status === "error") {
      setCopy("Verification link problem", "The confirmation link could not be completed.");
      setStatus("error", "Supabase could not verify this link.", result.error || "Request a new verification email or log in if the account is already active.");
      setStep("email", "current");
      showPendingAction();
      return;
    }

    setCopy("Check your inbox", "The account exists, but this browser does not have a verified Supabase session yet.");
    setStatus("pending", "Waiting for email verification.", result?.message || "Open the newest Synapse verification link, then return here.");
    setStep("email", "current");
    showPendingAction();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setStep("email", "current");
    completeVerification().catch(error => {
      setCopy("Verification paused", "Something interrupted the Supabase callback.");
      setStatus("error", "Could not finish verification.", error.message || "Try the latest verification link again.");
      showPendingAction();
    });
  });
})();
