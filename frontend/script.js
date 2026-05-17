(function bootLegacyController() {
  function load() {
    if (document.querySelector("script[data-synapse-controller]")) return;

    const controllerScript = document.createElement("script");
    controllerScript.src = "./src/legacy/controller.js";
    controllerScript.dataset.synapseController = "true";
    controllerScript.async = false;
    document.body.appendChild(controllerScript);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
    return;
  }

  load();
})();
