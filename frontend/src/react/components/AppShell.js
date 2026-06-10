import { Fragment, h } from "../runtime.js";
import { MobileNavigation } from "./MobileNavigation.js?v=react-shell-v2";
import { HistoryNavigation } from "./HistoryNavigation.js?v=react-shell-v2";
import { SummaryNavigation } from "./SummaryNavigation.js?v=react-shell-v2";
import { UploadStage } from "./UploadStage.js?v=react-shell-v2";
import { AnalysisStage } from "./AnalysisStage.js?v=react-shell-v2";
import { AssistantPanel, OpenAssistantButton } from "./AssistantPanel.js?v=react-shell-v2";

export function AppShell() {
  return h(
    Fragment,
    null,
    h(MobileNavigation),
    h(
      "div",
      { id: "appLayout", className: "app-layout initial-state" },
      h(HistoryNavigation),
      h(SummaryNavigation),
      h(
        "main",
        { id: "mainNotes", className: "notes-area" },
        h(UploadStage),
        h(AnalysisStage)
      ),
      h(AssistantPanel)
    ),
    h(OpenAssistantButton)
  );
}
