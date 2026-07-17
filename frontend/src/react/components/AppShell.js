import { Fragment, h } from "../runtime.js";
import { MobileNavigation } from "./MobileNavigation.js?v=ai-broadcast-v14";
import { HistoryNavigation } from "./HistoryNavigation.js?v=ai-broadcast-v14";
import { SummaryNavigation } from "./SummaryNavigation.js?v=ai-broadcast-v14";
import { UploadStage } from "./UploadStage.js?v=ai-broadcast-v14";
import { CompanionWorkspace } from "./CompanionWorkspace.js?v=ai-broadcast-v14";
import { AnalysisStage } from "./AnalysisStage.js?v=ai-broadcast-v14";
import { AssistantPanel, OpenAssistantButton } from "./AssistantPanel.js?v=ai-broadcast-v14";

export function AppShell() {
  return h(
    Fragment,
    null,
    h(MobileNavigation),
    h(
      "div",
      { id: "appLayout", className: "app-layout initial-state", "data-learning-experience-mode": "materials" },
      h(HistoryNavigation),
      h(SummaryNavigation),
      h(
        "main",
        { id: "mainNotes", className: "notes-area" },
        h(
          "div",
          { className: "learning-experience-shell" },
          h(UploadStage),
          h(CompanionWorkspace)
        ),
        h(AnalysisStage)
      ),
      h(AssistantPanel)
    ),
    h(OpenAssistantButton)
  );
}
