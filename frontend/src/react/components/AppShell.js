import { Fragment, h } from "../runtime.js";
import { MobileNavigation } from "./MobileNavigation.js?v=ai-broadcast-v8";
import { HistoryNavigation } from "./HistoryNavigation.js?v=ai-broadcast-v8";
import { SummaryNavigation } from "./SummaryNavigation.js?v=ai-broadcast-v8";
import { UploadStage } from "./UploadStage.js?v=ai-broadcast-v8";
import { AnalysisStage } from "./AnalysisStage.js?v=ai-broadcast-v8";
import { AssistantPanel, OpenAssistantButton } from "./AssistantPanel.js?v=ai-broadcast-v8";

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
