import { html, joinHtml } from "../html.js";
import { MobileNavigation } from "./MobileNavigation.js";
import { HistoryNavigation } from "./HistoryNavigation.js?v=account-menu-v2";
import { SummaryNavigation } from "./SummaryNavigation.js";
import { UploadStage } from "./UploadStage.js";
import { AnalysisStage } from "./AnalysisStage.js";
import { AssistantPanel, OpenAssistantButton } from "./AssistantPanel.js";

export function AppShellMarkup() {
  return joinHtml([
    MobileNavigation(),
    html`
      <div id="appLayout" class="app-layout initial-state">
        ${HistoryNavigation()}
        ${SummaryNavigation()}
        <main id="mainNotes" class="notes-area">
          ${UploadStage()}
          ${AnalysisStage()}
        </main>
        ${AssistantPanel()}
      </div>
    `,
    OpenAssistantButton(),
  ]);
}
