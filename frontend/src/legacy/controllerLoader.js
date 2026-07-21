class LegacyControllerLoader {
  constructor({
    baseUrl,
    bootFile,
    configureMarkdownRenderer,
    definitionFiles,
    documentRef = globalThis.document,
    globalScope = globalThis,
    utilities = {},
    version
  }) {
    this.baseUrl = baseUrl;
    this.bootFile = bootFile;
    this.configureMarkdownRenderer = configureMarkdownRenderer;
    this.definitionFiles = definitionFiles;
    this.documentRef = documentRef;
    this.globalScope = globalScope;
    this.utilities = utilities;
    this.version = version;
  }

  exposeUtilities() {
    Object.assign(this.globalScope, this.utilities);
    this.globalScope.__synapseRuntimeUtilitiesReady = true;
    this.globalScope.dispatchEvent(new Event("synapse-runtime-utilities-ready"));
  }

  sectionUrl(fileName) {
    const url = new URL(`./controller_sections/${fileName}`, this.baseUrl);
    return `${url.href}?v=${this.version}`;
  }

  async fetchSection(fileName) {
    const response = await fetch(this.sectionUrl(fileName));
    if (!response.ok) {
      throw new Error(`Could not load ${fileName}: ${response.status}`);
    }
    return {
      fileName,
      source: await response.text()
    };
  }

  configureMarkdownHooks = () => {
    this.configureMarkdownRenderer({
      getLearningFigureByMarker: this.globalScope.getLearningFigureByMarker,
      renderInlineVisualCard: this.globalScope.renderInlineVisualCard,
      renderInlineVisualReference: this.globalScope.renderInlineVisualReference
    });
  };

  combinedSource(definitionSections, bootSection) {
    const definitionSource = definitionSections
      .map(({ fileName, source }) => `\n/* ${fileName} */\n${source}`)
      .join("\n");
    return [
      "globalThis.__synapseCombinedEvalStarted = true;",
      definitionSource,
      "globalThis.__synapseConfigureMarkdownHooks && globalThis.__synapseConfigureMarkdownHooks();",
      `\n/* ${bootSection.fileName} */\n${bootSection.source}`,
      "\n//# sourceURL=synapse-legacy-controller-combined.js"
    ].join("\n");
  }

  loadSectionScript(fileName) {
    return new Promise((resolve, reject) => {
      const script = this.documentRef.createElement("script");
      script.src = this.sectionUrl(fileName);
      script.dataset.synapseControllerSection = fileName;
      script.async = false;
      script.addEventListener("load", () => resolve(script), { once: true });
      script.addEventListener("error", () => {
        reject(new Error(`The Synapse controller section could not be loaded: ${fileName}`));
      }, { once: true });
      this.documentRef.body.appendChild(script);
    });
  }

  loadRuntimeScript(fileName) {
    return new Promise((resolve, reject) => {
      const script = this.documentRef.createElement("script");
      const url = new URL(`./${fileName}`, this.baseUrl);
      script.src = `${url.href}?v=${this.version}`;
      script.type = "text/javascript";
      script.dataset.synapseControllerSection = "combined-runtime";
      script.async = false;
      const captureError = event => {
        if (!event.filename || event.filename === script.src || event.filename.includes(fileName)) {
          this.globalScope.__synapseControllerRuntimeError = event.error?.stack || event.message || String(event.error || event);
        }
      };
      this.globalScope.addEventListener("error", captureError, true);
      script.addEventListener("load", () => resolve(script), { once: true });
      script.addEventListener("error", () => {
        this.globalScope.removeEventListener("error", captureError, true);
        reject(new Error(`The Synapse combined controller could not be loaded: ${fileName}`));
      }, { once: true });
      script.addEventListener("load", () => {
        this.globalScope.removeEventListener("error", captureError, true);
      }, { once: true });
      this.documentRef.body.appendChild(script);
    });
  }

  executeCombinedScript(source) {
    return new Promise((resolve, reject) => {
      const script = this.documentRef.createElement("script");
      const blob = new Blob([source], { type: "text/javascript" });
      const objectUrl = URL.createObjectURL(blob);
      script.dataset.synapseControllerSection = "combined";
      script.type = "text/javascript";
      script.async = false;
      script.src = objectUrl;
      script.addEventListener("load", () => {
        URL.revokeObjectURL(objectUrl);
        resolve(script);
      }, { once: true });
      script.addEventListener("error", () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("The combined Synapse controller module could not be executed."));
      }, { once: true });
      this.documentRef.body.appendChild(script);
    });
  }

  async loadCombinedController() {
    if (this.globalScope.__synapseCombinedControllerReady) return;
    await new Promise(resolve => {
      const finish = () => {
        this.globalScope.removeEventListener("synapse-combined-controller-ready", finish);
        resolve();
      };
      this.globalScope.addEventListener("synapse-combined-controller-ready", finish, { once: true });
      if (this.globalScope.__synapseCombinedControllerReady) finish();
    });
  }

  async load() {
    this.globalScope.__synapseConfigureMarkdownHooks = this.configureMarkdownHooks;
    this.exposeUtilities();
    await this.loadCombinedController();
    delete this.globalScope.__synapseConfigureMarkdownHooks;
  }
}

export { LegacyControllerLoader };
