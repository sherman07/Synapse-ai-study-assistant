Object.assign(window, {
  addLinksFromInput,
  addQuizTypeRow,
  analyzeMaterials,
  askAI,
  askConnection,
  askSelectedMindPoint,
  askTimelineEventTutor,
  changeSourceZoom,
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
  jumpToFlashcardFromList,
  loadHistoryEntry,
  loadQuizHistoryRecord,
  openActiveMindMapSection,
  openAssistant,
  openFilePicker,
  openFlashcardListModal,
  openQuizHistoryModal,
  openQuizSettingsModal,
  openTimelineEventNotes,
  openVisualGuideWebImage,
  openVisualModal,
  quickAsk,
  regenerateFlashcards,
  removeFile,
  removeLink,
  removeQuizTypeRow,
  renderSourceTextFallback,
  resetVoiceTutorSession,
  resetWorkspace,
  revealQuizAnswer,
  saveQuizSettingsFromModal,
  selectMindBranch,
  selectMindChild,
  selectMindPoint,
  selectSourceItem,
  selectTimelineEvent,
  sendVoiceTutorText,
  sendVoiceTutorTypedAnswer,
  setActiveFlashcard,
  setActiveQuizQuestion,
  setFlashcardCountMode,
  setTimelineFilter,
  showFullSummary,
  startVoiceTutorSession,
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
  updateStudyPathTextAnswer
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
renderHistory();
setupVisualGuideTool();
setupTimelineTool();
setupQuizTool();
setupFlashcardTool();

const activeHistoryId = safeGetLocalStorage(ACTIVE_HISTORY_KEY, "");
if (activeHistoryId && getHistory().some(item => item.id === activeHistoryId)) {
  loadHistoryEntry(activeHistoryId, { preserveScroll: true });
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
