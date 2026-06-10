function renderFocusRoomShell() {
  return `
    <section id="focusRoomSurface" class="focus-room-surface react-focus-room" aria-live="polite">
      <div id="focusRoomSetup" class="focus-room-view focus-room-setup-view"></div>
      <div id="focusRoomSession" class="focus-room-view focus-room-session-view"></div>
      <aside id="focusLearningPanel" class="ai-learning-panel" aria-label="AI Learning Panel"></aside>
      <div id="focusSessionSummary" class="summary-overlay"></div>
      <div id="focusStudyHistory" class="focus-room-view focus-history-view"></div>
    </section>
  `;
}

export { renderFocusRoomShell };
