import { FileUp, GitBranch, NotebookTabs, Sparkles } from "lucide-react";

const fallbackItems = [
  { icon: FileUp, label: "Upload" },
  { icon: Sparkles, label: "Analyse" },
  { icon: NotebookTabs, label: "Notes" },
  { icon: GitBranch, label: "Map" }
];

export function SceneFallback() {
  return (
    <div className="scene-fallback" aria-label="Synapse transforms uploaded material into notes, maps, questions, and feedback">
      <div className="fallback-core">
        <Sparkles size={30} />
      </div>
      {fallbackItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div className={`fallback-node fallback-node-${index + 1}`} key={item.label}>
            <Icon size={18} />
            <span>{item.label}</span>
          </div>
        );
      })}
      <div className="fallback-ring" aria-hidden="true" />
    </div>
  );
}
