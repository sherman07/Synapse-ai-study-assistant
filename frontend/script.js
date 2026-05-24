(function bootLegacyController() {
  function load() {
    if (document.querySelector("script[data-synapse-controller]")) return;

    const version = "math-regex-v2";
    const controllerScript = document.createElement("script");
    controllerScript.type = "module";
    controllerScript.src = `./src/legacy/controller.js?v=${version}`;
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
