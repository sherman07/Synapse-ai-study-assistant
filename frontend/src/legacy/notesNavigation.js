function cleanNavigationTitle(value) {
  return String(value || "")
    .trim()
    .replace(/\s+#+\s*$/, "")
    .replace(/!?(?:\[([^\]]+)\])\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generatedHeadingEntries(summary) {
  const source = String(summary || "").replace(/\r\n?/g, "\n");
  const headingPattern = /^##(?!#)\s+(.+?)\s*#*\s*$/gm;
  const entries = [];
  let match = null;

  while ((match = headingPattern.exec(source))) {
    const title = cleanNavigationTitle(match[1]);
    if (!title) continue;
    entries.push({
      title,
      start: match.index,
    });
  }

  return entries
    .map((entry, index) => ({
      title: entry.title,
      markdown: source.slice(entry.start, entries[index + 1]?.start || source.length).trim(),
    }))
    .filter((entry, index, list) => list.findIndex(candidate => candidate.title.toLowerCase() === entry.title.toLowerCase()) === index);
}

function buildGeneratedNoteNavigation(summary, sectionMap = {}) {
  const generatedEntries = generatedHeadingEntries(summary);
  if (generatedEntries.length) return generatedEntries;

  return Object.entries(sectionMap || {})
    .map(([rawTitle, markdown]) => ({
      title: cleanNavigationTitle(rawTitle),
      markdown: String(markdown || "").trim(),
    }))
    .filter(entry => entry.title);
}

export { buildGeneratedNoteNavigation };
