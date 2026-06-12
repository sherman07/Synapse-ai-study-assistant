(function () {
  const navMenu = document.getElementById("navMenu");
  const mobileToggle = document.getElementById("mobileToggle");
  const authModal = document.getElementById("authModal");
  const contactForm = document.getElementById("contactForm");

  function openAuthModal() {
    if (!authModal) return;
    authModal.classList.add("open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("static-modal-open");
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("static-modal-open");
  }

  mobileToggle?.addEventListener("click", () => {
    const expanded = mobileToggle.getAttribute("aria-expanded") === "true";
    mobileToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu?.classList.toggle("open", !expanded);
  });

  navMenu?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement)) return;
    if (!target.getAttribute("href")?.startsWith("#")) return;
    mobileToggle?.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("open");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-action="get-started"]')) {
      openAuthModal();
      return;
    }
    if (target.closest('[data-action="close-auth"]')) {
      closeAuthModal();
    }
  });

  authModal?.addEventListener("click", (event) => {
    if (event.target === authModal) closeAuthModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAuthModal();
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    if (!button) return;
    button.textContent = "Enquiry Saved";
    button.disabled = true;
    window.setTimeout(() => {
      button.textContent = "Send Enquiry";
      button.disabled = false;
      contactForm.reset();
    }, 1400);
  });
}());
