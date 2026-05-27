import { API_BASE } from "./apiConfig.js";
import { ApiConnectionError, SynapseApiClient } from "./apiClient.js";
import {
  safeGetLocalStorage,
  safeReadJSONStorage,
  safeRemoveLocalStorage,
  safeSetLocalStorage,
  safeWriteJSONStorage
} from "./storage.js";
import {
  cleanAutoLanguageSectionTitles,
  hydrateSectionsFromSummary,
  removeAutoBilingualHeadings
} from "./sectionUtils.js";
import {
  formatBytes,
  getYouTubeVideoIdClient,
  getYoutubeTranscriptState,
  removeDetectedUrlsClient,
  sourceIcon,
  sourceItemLooksLikeYouTube,
  sourceKindFromFile,
  youtubeEmbedUrlFromItem,
  youtubeWatchUrlFromItem
} from "./sourceUtils.js";
import {
  cacheRecordKeys,
  loadFirstCacheItems,
  pruneCacheRecords,
  transactCacheStore
} from "./indexedDbStore.js";
import { ensureRenderableSummary } from "./notesContent.js";
import {
  cleanMindText,
  configureMarkdownRenderer,
  escapeAttr,
  escapeHTML,
  inlineMarkdownHTML,
  markdownToHTML,
  renderMath,
  shorten,
  typeInto
} from "./markdownRenderer.js?v=probability-table-v1";
import { LegacyControllerLoader } from "./controllerLoader.js?v=combined-loader-v4";

const CONTROLLER_VERSION = "sectioned-v14";
const CONTROLLER_DEFINITION_FILES = [
  "01_uploadedfiles.js",
  "02_openvisualmodal.js",
  "03_rendertimeline.js",
  "04_rendervisualguidelaunch.js",
  "05_persistcurrentquiztohistory.js",
  "06_deleteflashcarddeck.js",
  "07_focusmindmappoint.js",
  "08_extractrealtimeresponsetranscript.js",
  "09_togglesourceviewer.js",
];
const CONTROLLER_BOOT_FILE = "99_boot.js";
const apiClient = new SynapseApiClient(API_BASE);

const controllerLoader = new LegacyControllerLoader({
  baseUrl: import.meta.url,
  bootFile: CONTROLLER_BOOT_FILE,
  configureMarkdownRenderer,
  definitionFiles: CONTROLLER_DEFINITION_FILES,
  globalScope: window,
  utilities: {
    API_BASE,
    ApiConnectionError,
    apiClient,
    cacheRecordKeys,
    cleanAutoLanguageSectionTitles,
    cleanMindText,
    escapeAttr,
    escapeHTML,
    ensureRenderableSummary,
    formatBytes,
    getYouTubeVideoIdClient,
    getYoutubeTranscriptState,
    hydrateSectionsFromSummary,
    inlineMarkdownHTML,
    loadFirstCacheItems,
    markdownToHTML,
    pruneCacheRecords,
    removeAutoBilingualHeadings,
    removeDetectedUrlsClient,
    renderMath,
    safeGetLocalStorage,
    safeReadJSONStorage,
    safeRemoveLocalStorage,
    safeSetLocalStorage,
    safeWriteJSONStorage,
    shorten,
    sourceIcon,
    sourceItemLooksLikeYouTube,
    sourceKindFromFile,
    transactCacheStore,
    typeInto,
    youtubeEmbedUrlFromItem,
    youtubeWatchUrlFromItem
  },
  version: CONTROLLER_VERSION
});

controllerLoader.load().catch(error => {
  console.error("Synapse controller failed to load:", error);
});
