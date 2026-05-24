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

  loadScript(fileName) {
    return new Promise((resolve, reject) => {
      const script = this.documentRef.createElement("script");
      script.src = this.sectionUrl(fileName);
      script.dataset.synapseControllerSection = fileName;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${fileName}`));
      this.documentRef.body.appendChild(script);
    });
  }

  configureMarkdownHooks() {
    this.configureMarkdownRenderer({
      getLearningFigureByMarker: this.globalScope.getLearningFigureByMarker,
      renderInlineVisualCard: this.globalScope.renderInlineVisualCard,
      renderInlineVisualReference: this.globalScope.renderInlineVisualReference
    });
  }

  async loadDefinitions() {
    for (const fileName of this.definitionFiles) {
      await this.loadScript(fileName);
    }
  }

  async load() {
    this.exposeUtilities();
    await this.loadDefinitions();
    this.configureMarkdownHooks();
    await this.loadScript(this.bootFile);
  }
}

export { LegacyControllerLoader };
