(function () {
  const statusCard = document.getElementById("billingStatusCard");

  function setStatus(message) {
    if (!statusCard) return;
    statusCard.textContent = message;
    statusCard.classList.toggle("show", Boolean(message));
  }

  async function refreshBilling() {
    const auth = window.SynapseAuth;
    if (!auth?.fetchBillingEntitlements) {
      setStatus("Billing client is not available yet.");
      return;
    }
    try {
      const data = await auth.fetchBillingEntitlements();
      const entitlements = data.entitlements || {};
      const plan = entitlements.plan || "free";
      const status = entitlements.subscriptionStatus || "inactive";
      setStatus(`Current server billing state: ${plan} / ${status}. Stripe webhooks remain the source of truth.`);
    } catch (error) {
      setStatus(error.message || "Could not refresh billing status.");
    }
  }

  refreshBilling();
}());
