function renderFocusRoomShell() {
  return `
    <section id="focusRoomSurface" class="focus-room-surface d-none" aria-live="polite">
      <div id="focusRoomSetup" class="focus-room-view focus-room-setup-view"></div>
      <div id="focusRoomSession" class="focus-room-view focus-room-session-view d-none"></div>
      <aside id="focusLearningPanel" class="focus-learning-panel d-none" aria-label="AI Learning Panel"></aside>
      <div id="focusSessionSummary" class="focus-summary-overlay d-none"></div>
      <div id="focusStudyHistory" class="focus-room-view focus-history-view d-none"></div>
    </section>
  `;
}

export { renderFocusRoomShell };
