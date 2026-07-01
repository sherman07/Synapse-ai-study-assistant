Object.assign(window, {
  addLinksFromInput,
  addQuizTypeRow,
  analyzeMaterials,
  askAI,
  askConnection,
  askSelectedMindPoint,
  askTimelineEventTutor,
  changeSourceZoom,
  checkMemoryRecallAnswer,
  checkStudyPathAnswer,
  clearChat,
  clearFlashcardsAndShowBuilder,
  closeAssistant,
  closeFlashcardListModal,
  closeMindDetailPopup,
  closeQuizHistoryModal,
  closeQuizSettingsModal,
  closeStudyPathCelebration,
  deleteHistoryEntry,
  deleteQuizHistoryRecord,
  downloadNotesPDF,
  downloadVisualImageGuidePNG,
  expandAssistant,
  exportVisualGuidePDF,
  exportVisualGuidePNG,
  flipFlashcard,
  focusInlineVisual,
  generateFlashcards,
  generateQuiz,
  generateTimeline,
  generateVisualGuide,
  handleFlashcardMatchDragStart,
  handleFlashcardMatchDrop,
  getSynapseFocusRoomCurrentMaterial,
  getSynapseFocusRoomMaterial,
  getSynapseFocusRoomMaterials,
  jumpToFlashcardFromList,
  loadHistoryEntry,
  loadQuizHistoryRecord,
  markMasteryGraphSectionReviewed,
  notifyFocusRoomMaterialsChanged,
  openGenerationJob,
  openActiveMindMapSection,
  openAccountPanel,
  openAssistant,
  openFilePicker,
  openSynapseFocusRoom,
  openFlashcardListModal,
  openMasteryGraphSection,
  openQuizHistoryModal,
  openQuizSettingsModal,
  openTimelineEventNotes,
  openVisualGuideWebImage,
  openVisualModal,
  practiceMasteryGraphSection,
  quickAsk,
  recordMasterySectionOpen,
  regenerateFlashcards,
  removeFile,
  removeLink,
  removeQuizTypeRow,
  renderMasteryGraphPanel,
  renderSourceTextFallback,
  resetVoiceTutorSession,
  resetFlashcardMatching,
  resetWorkspace,
  closeAccountPanel,
  consumeFocusRoomReturnTarget,
  deleteAccountAndLocalData,
  goToAuthPage,
  exportAccountData,
  renderAccountMenu,
  revealQuizAnswer,
  saveQuizSettingsFromModal,
  scheduleMemoryReview,
  selectMindBranch,
  selectMindChild,
  selectMindPoint,
  selectFlashcardMatchBranch,
  selectFlashcardMatchTerm,
  selectSourceItem,
  selectTimelineEvent,
  sendVoiceTutorText,
  sendVoiceTutorTypedAnswer,
  setActiveFlashcard,
  setFlashcardActivityMode,
  setActiveQuizQuestion,
  setFlashcardCountMode,
  setMemoryFilter,
  setTimelineFilter,
  showFullSummary,
  signOutAccount,
  openBillingPortal,
  startVoiceTutorSession,
  startBillingCheckout,
  submitQuiz,
  switchTab,
  switchTool,
  toggleSourceViewer,
  toggleSummaryNav,
  toggleTimelineComplete,
  toggleVoiceTutorMute,
  updateFlashcardCustomCount,
  updateFlashcardLanguage,
  updateQuizAnswer,
  updateQuizChoiceAnswer,
  updateQuizDraftCount,
  updateQuizDraftExamMode,
  updateQuizDraftLanguage,
  updateQuizDraftTotal,
  updateQuizDraftType,
  updateStudyPathChoiceAnswer,
  updateStudyPathTextAnswer,
  validateFlashcardMatches,
  retryFlashcardMatching,
  renderFocusRoomWorkspaceActions,
  renderFlashcardMatchLines,
  returnFromFocusRoomToWorkspace,
  cancelGenerationJob,
  retryGenerationJob,
});

if (historySearch) {
  historySearch.addEventListener("input", event => renderHistory(event.target.value));
}
if (notesTranslateLanguage) {
  notesTranslateLanguage.addEventListener("change", event => translateCurrentNotes(event.target.value));
}
if (mobileHistorySearch) {
  mobileHistorySearch.addEventListener("input", event => {
    if (historySearch) historySearch.value = event.target.value;
    renderHistory(event.target.value);
  });
}
cleanExistingHistoryTitles();
if (typeof recoverGenerationJobsOnBoot === "function") {
  recoverGenerationJobsOnBoot();
}
renderHistory();
if (typeof syncHistoryWithDataApi === "function") {
  syncHistoryWithDataApi().catch(error => {
    console.warn("Could not load synced generated note history:", error);
  });
}
if (typeof renderFocusRoomWorkspaceActions === "function") {
  renderFocusRoomWorkspaceActions();
}
if (typeof notifyFocusRoomMaterialsChanged === "function") {
  notifyFocusRoomMaterialsChanged();
}
setupVisualGuideTool();
setupTimelineTool();
setupMasteryGraphTool();
setupQuizTool();
setupFlashcardTool();
renderAccountMenu();
window.addEventListener("synapse-auth-changed", () => {
  renderAccountMenu();
  if (typeof syncHistoryWithDataApi === "function") {
    syncHistoryWithDataApi().catch(error => {
      console.warn("Could not refresh synced generated note history:", error);
    });
  }
});

if (!window.__synapseFlashcardMatchResizeBound) {
  window.__synapseFlashcardMatchResizeBound = true;
  window.addEventListener("resize", () => {
    if (typeof renderFlashcardMatchLines === "function") {
      renderFlashcardMatchLines();
    }
  });
}

const activeHistoryId = safeGetLocalStorage(ACTIVE_HISTORY_KEY, "");
if (activeHistoryId && getHistory().some(item => item.id === activeHistoryId)) {
  Promise.resolve(loadHistoryEntry(activeHistoryId, { preserveScroll: true }))
    .then(() => {
      if (typeof consumeFocusRoomReturnTarget === "function") {
        consumeFocusRoomReturnTarget();
      }
    });
} else if (typeof consumeFocusRoomReturnTarget === "function") {
  consumeFocusRoomReturnTarget();
}

if (questionInput) questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askAI();
  }
});

if (voiceTextInput) voiceTextInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendVoiceTutorTypedAnswer();
  }
});

renderVoiceTutorHistory();
