export function loadLegacyController() {
  if (document.querySelector("script[data-synapse-controller]")) return;

  const controllerScript = document.createElement("script");
  controllerScript.src = new URL("./controller.js", import.meta.url).href;
  controllerScript.dataset.synapseController = "true";
  controllerScript.async = false;
  document.body.appendChild(controllerScript);
}
