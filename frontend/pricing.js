(function () {
  const status = document.getElementById("billingStatus");
  const buttons = Array.from(document.querySelectorAll("[data-checkout-plan]"));

  function setStatus(message, type = "info") {
    if (!status) return;
    status.textContent = message || "";
    status.dataset.type = type;
  }

  function authPage(page = "login") {
    return new URL(`${page}.html`, window.location.href).toString();
  }

  async function startCheckout(planId, checkoutMode) {
    const auth = window.SynapseAuth;
    const session = auth?.getStoredSession?.();
    if (!session?.email) {
      setStatus("Please sign in before upgrading to Pro.", "error");
      window.location.href = authPage("login");
      return;
    }
    if (!auth?.createCheckoutSession) {
      setStatus("Billing client is not available. Refresh and try again.", "error");
      return;
    }
    setStatus("Opening secure Stripe Checkout...");
    buttons.forEach(button => {
      button.disabled = true;
    });
    try {
      const checkout = await auth.createCheckoutSession({ planId, checkoutMode });
      if (!checkout?.url) throw new Error("Stripe did not return a Checkout URL.");
      window.location.href = checkout.url;
    } catch (error) {
      setStatus(error.message || "Could not open Stripe Checkout.", "error");
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const planId = button.dataset.checkoutPlan;
      if (planId === "free") {
        window.location.href = new URL("index.html", window.location.href).toString();
        return;
      }
      startCheckout(planId, button.dataset.checkoutMode || undefined);
    });
  });

  window.SynapseAuth?.syncBillingSessionFromServer?.().catch(() => {});
}());
