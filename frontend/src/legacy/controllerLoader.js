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
      definitionSource,
      "window.__synapseConfigureMarkdownHooks && window.__synapseConfigureMarkdownHooks();",
      `\n/* ${bootSection.fileName} */\n${bootSection.source}`,
      "\n//# sourceURL=synapse-legacy-controller-combined.js"
    ].join("\n");
  }

  executeCombinedScript(source) {
    const script = this.documentRef.createElement("script");
    script.dataset.synapseControllerSection = "combined";
    script.textContent = source;
    this.documentRef.body.appendChild(script);
  }

  async loadCombinedController() {
    const definitionSections = [];
    for (const fileName of this.definitionFiles) {
      definitionSections.push(await this.fetchSection(fileName));
    }
    const bootSection = await this.fetchSection(this.bootFile);
    this.globalScope.__synapseConfigureMarkdownHooks = this.configureMarkdownHooks;
    try {
      this.executeCombinedScript(this.combinedSource(definitionSections, bootSection));
    } finally {
      delete this.globalScope.__synapseConfigureMarkdownHooks;
    }
  }

  async load() {
    this.exposeUtilities();
    await this.loadCombinedController();
  }
}

export { LegacyControllerLoader };
