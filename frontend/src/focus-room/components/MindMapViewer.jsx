export function MindMapViewer({ mindMap }) {
  if (!mindMap) {
    return <p>No mind map is attached to this material yet. Return to the workspace and generate one from your notes.</p>;
  }

  const branches = Array.isArray(mindMap.branches) ? mindMap.branches : [];
  if (branches.length) {
    return (
      <div className="mindmap-viewer">
        <div className="mindmap-center">{mindMap.center || "Study Notes"}</div>
        <div className="mindmap-branches">
          {branches.slice(0, 10).map((branch, index) => (
            <article className="mindmap-branch liquid-glass-lite" key={`${branch.title || "Branch"}-${index}`}>
              <strong>{branch.title || `Branch ${index + 1}`}</strong>
              <p>{branch.summary || branch.detail || "Open this branch in the workspace for more detail."}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return <pre className="mindmap-json">{JSON.stringify(mindMap, null, 2)}</pre>;
}
