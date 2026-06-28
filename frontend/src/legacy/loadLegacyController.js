export function loadLegacyController() {
  if (document.querySelector("script[data-synapse-controller]")) return;

  const version = "voice-tutor-v3";
  const controllerScript = document.createElement("script");
  controllerScript.type = "module";
  controllerScript.src = `${new URL("./controller.js", import.meta.url).href}?v=${version}`;
  controllerScript.dataset.synapseController = "true";
  controllerScript.async = false;
  document.body.appendChild(controllerScript);
}
