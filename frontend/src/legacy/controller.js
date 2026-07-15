import { API_BASE } from "./apiConfig.js?v=ai-broadcast-v12";
import { ApiConnectionError, SynapseApiClient } from "./apiClient.js";
import {
  DATA_API_BASE,
  cancelBroadcastJobInDataApi,
  createBroadcastJobInDataApi,
  dataApiClient,
  deleteGeneratedContentFromDataApi,
  deleteBroadcastJobFromDataApi,
  fetchBroadcastJobFromDataApi,
  fetchBroadcastJobsFromDataApi,
  fetchGeneratedContentFromDataApi,
  patchBroadcastJobInDataApi,
  persistGeneratedContentToDataApi,
  retryBroadcastJobInDataApi
} from "./dataApiClient.js?v=ai-broadcast-v12";
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
  renderStudyNotesSurface,
  shouldCollapseSecondarySections
} from "./notesSurface.js";
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
} from "./markdownRenderer.js?v=ai-broadcast-v12";
import { LegacyControllerLoader } from "./controllerLoader.js?v=ai-broadcast-v12";

const CONTROLLER_VERSION = "ai-broadcast-v12";
const CONTROLLER_DEFINITION_FILES = [
  "01_uploadedfiles.js",
  "02_openvisualmodal.js",
  "03_rendertimeline.js",
  "04_rendervisualguidelaunch.js",
  "04_masterygraph.js",
  "05_persistcurrentquiztohistory.js",
  "06_deleteflashcarddeck.js",
  "07_focusmindmappoint.js",
  "08_extractrealtimeresponsetranscript.js",
  "09_togglesourceviewer.js",
  "10_focusroombridge.js",
  "11_generationjobs.js",
  "12_broadcastjobs.js",
  "13_studytoolmemory.js",
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
    DATA_API_BASE,
    ApiConnectionError,
    apiClient,
    cacheRecordKeys,
    cancelBroadcastJobInDataApi,
    cleanAutoLanguageSectionTitles,
    cleanMindText,
    createBroadcastJobInDataApi,
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
    dataApiClient,
    deleteBroadcastJobFromDataApi,
    deleteGeneratedContentFromDataApi,
    fetchBroadcastJobFromDataApi,
    fetchBroadcastJobsFromDataApi,
    fetchGeneratedContentFromDataApi,
    patchBroadcastJobInDataApi,
    persistGeneratedContentToDataApi,
    removeAutoBilingualHeadings,
    removeDetectedUrlsClient,
    renderMath,
    renderStudyNotesSurface,
    retryBroadcastJobInDataApi,
    safeGetLocalStorage,
    safeReadJSONStorage,
    safeRemoveLocalStorage,
    safeSetLocalStorage,
    safeWriteJSONStorage,
    shorten,
    shouldCollapseSecondarySections,
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

controllerLoader.load()
  .then(() => {
    window.dispatchEvent(new Event("synapse-runtime-ready"));
  })
  .catch(error => {
    console.error("Synapse controller failed to load:", error);
    window.dispatchEvent(new CustomEvent("synapse-runtime-failed", {
      detail: { message: "The Synapse workspace controller could not be initialized." }
    }));
  });
