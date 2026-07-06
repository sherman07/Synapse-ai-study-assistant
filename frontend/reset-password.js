/* Synapse Supabase password recovery controller. */
(function() {
  "use strict";

  let recoveryReady = false;

  function getEl(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = getEl(id);
    if (element) element.textContent = value;
  }

  function showStatus(kind, message, actions = []) {
    const status = getEl("resetPasswordStatus");
    if (!status) return;
    status.className = `auth-form-status ${kind} show`;
    status.textContent = "";

    const messageNode = document.createElement("div");
    messageNode.textContent = message;
    status.appendChild(messageNode);

    if (actions.length) {
      const actionWrap = document.createElement("div");
      actionWrap.className = "auth-status-actions";
      actions.forEach(action => {
        const link = document.createElement("a");
        link.className = `auth-status-button auth-status-link ${action.primary ? "auth-status-button-primary" : ""}`.trim();
        link.href = action.href;
        link.textContent = action.label;
        actionWrap.appendChild(link);
      });
      status.appendChild(actionWrap);
    }
  }

  function showError(id, message) {
    const element = getEl(id);
    if (!element) return;
    element.textContent = message || "";
    element.classList.toggle("show", Boolean(message));
  }

  function clearFieldErrors() {
    showError("newPasswordError", "");
    showError("confirmNewPasswordError", "");
  }

  function passwordIsStrong(password) {
    return String(password || "").length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  }

  function validatePasswordFields() {
    clearFieldErrors();
    const password = getEl("newPassword")?.value || "";
    const confirmPassword = getEl("confirmNewPassword")?.value || "";
    let valid = true;

    if (!passwordIsStrong(password)) {
      showError("newPasswordError", "Use at least 8 characters with a letter and number.");
      valid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      showError("confirmNewPasswordError", "Passwords do not match.");
      valid = false;
    } else if (!confirmPassword) {
      showError("confirmNewPasswordError", "Confirm your new password.");
      valid = false;
    }

    return valid;
  }

  function setLoading(isLoading) {
    const button = getEl("resetPasswordSubmit");
    if (!button) return;
    button.disabled = isLoading || !recoveryReady;
    button.classList.toggle("loading", Boolean(isLoading));
  }

  function revealRecoveryForm() {
    const form = getEl("resetPasswordForm");
    if (form) form.hidden = false;
    recoveryReady = true;
    setLoading(false);
    setText("resetPasswordSubtitle", "Choose a strong password to secure your Synapse workspace.");
    showStatus("success", "Reset link verified. You can choose a new password now.");
    getEl("newPassword")?.focus?.();
  }

  function disableRecoveryForm(message, title = "Reset link expired") {
    recoveryReady = false;
    const form = getEl("resetPasswordForm");
    if (form) form.hidden = true;
    setText("resetPasswordTitle", title);
    setText("resetPasswordSubtitle", "Request a new Synapse password reset email to continue.");
    showStatus("error", message || "This reset link is invalid or expired.", [
      { label: "Request New Link", href: "forgot-password.html", primary: true },
      { label: "Back to Login", href: "login.html" }
    ]);
  }

  function setupPasswordToggle(buttonId, inputId) {
    const button = getEl(buttonId);
    const input = getEl(inputId);
    if (!button || !input) return;
    button.addEventListener("click", () => {
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      const icon = button.querySelector("i");
      if (icon) icon.className = showing ? "bi bi-eye" : "bi bi-eye-slash";
    });
  }

  async function prepareRecovery() {
    if (!window.SynapseAuth?.isConfigured?.()) {
      disableRecoveryForm(
        "Supabase Auth is not configured. Add the public Supabase URL and publishable key, then request a new reset link.",
        "Password reset needs Supabase"
      );
      return;
    }

    try {
      const result = await window.SynapseAuth.preparePasswordRecovery();
      if (result?.ok) {
        revealRecoveryForm();
        return;
      }
      disableRecoveryForm(result?.message || result?.error || "This reset link is invalid or expired.");
    } catch (error) {
      disableRecoveryForm(error.message || "Synapse could not verify this reset link.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!recoveryReady) return;
    if (!validatePasswordFields()) return;

    setLoading(true);
    showStatus("info", "Updating your password...");
    try {
      await window.SynapseAuth.updatePassword(getEl("newPassword").value);
      const success = getEl("resetPasswordSuccess");
      if (success) success.classList.add("show");
      const form = getEl("resetPasswordForm");
      if (form) form.hidden = true;
      const status = getEl("resetPasswordStatus");
      if (status) status.classList.remove("show");
      setText("resetPasswordTitle", "Password updated");
      setText("resetPasswordSubtitle", "Your Synapse account is ready for the next sign in.");
    } catch (error) {
      setLoading(false);
      showStatus("error", error.message || "Could not update your password. Request a new reset link and try again.", [
        { label: "Request New Link", href: "forgot-password.html" }
      ]);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggle("toggleNewPassword", "newPassword");
    setupPasswordToggle("toggleConfirmNewPassword", "confirmNewPassword");
    getEl("newPassword")?.addEventListener("input", clearFieldErrors);
    getEl("confirmNewPassword")?.addEventListener("input", clearFieldErrors);
    getEl("resetPasswordForm")?.addEventListener("submit", handleSubmit);
    prepareRecovery();
  });
})();
