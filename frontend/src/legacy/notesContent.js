class NotesContentBuilder {
  static sectionsToMarkdown(sectionMap) {
    return Object.entries(sectionMap || {})
      .map(([title, content]) => {
        const body = String(content || "").trim();
        if (!body) return "";
        return `## ${title}\n\n${body}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  static ensureRenderableSummary(summary, sectionMap = {}) {
    const value = String(summary || "").trim();
    return value || this.sectionsToMarkdown(sectionMap);
  }
}

const sectionsToMarkdown = sectionMap => NotesContentBuilder.sectionsToMarkdown(sectionMap);
const ensureRenderableSummary = (summary, sectionMap) => (
  NotesContentBuilder.ensureRenderableSummary(summary, sectionMap)
);

export {
  NotesContentBuilder,
  ensureRenderableSummary,
  sectionsToMarkdown
};
