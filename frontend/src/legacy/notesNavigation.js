function cleanNavigationTitle(value) {
  return String(value || "")
    .trim()
    .replace(/\s+#+\s*$/, "")
    .replace(/!?(?:\[([^\]]+)\])\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function navigationAnchor(value, usedAnchors = new Map()) {
  const base = String(value || "section")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
  const count = usedAnchors.get(base) || 0;
  usedAnchors.set(base, count + 1);
  return `section-${base}${count ? `-${count + 1}` : ""}`;
}

function generatedHeadingEntries(summary) {
  const source = String(summary || "").replace(/\r\n?/g, "\n");
  const headingPattern = /^(#{2,4})\s+(.+?)\s*#*\s*$/gm;
  const entries = [];
  const usedAnchors = new Map();
  let match = null;
  let currentEntry = null;

  while ((match = headingPattern.exec(source))) {
    const level = match[1].length;
    const title = cleanNavigationTitle(match[2]);
    if (!title) continue;
    if (level === 2) {
      currentEntry = {
        title,
        start: match.index,
        anchor: navigationAnchor(title, usedAnchors),
        children: [],
      };
      entries.push(currentEntry);
      continue;
    }
    if (currentEntry) {
      currentEntry.children.push({
        title,
        level,
        anchor: navigationAnchor(`${currentEntry.title}-${title}`, usedAnchors),
      });
    }
  }

  return entries
    .map((entry, index) => ({
      title: entry.title,
      markdown: source.slice(entry.start, entries[index + 1]?.start || source.length).trim(),
      anchor: entry.anchor,
      children: entry.children,
    }))
    .filter((entry, index, list) => list.findIndex(candidate => candidate.title.toLowerCase() === entry.title.toLowerCase()) === index);
}

function buildGeneratedNoteNavigation(summary, sectionMap = {}) {
  const generatedEntries = generatedHeadingEntries(summary);
  if (generatedEntries.length) return generatedEntries;

  const usedAnchors = new Map();
  return Object.entries(sectionMap || {})
    .map(([rawTitle, markdown]) => ({
      title: cleanNavigationTitle(rawTitle),
      markdown: String(markdown || "").trim(),
    }))
    .filter(entry => entry.title)
    .map(entry => ({
      ...entry,
      anchor: navigationAnchor(entry.title, usedAnchors),
      children: [],
    }));
}

export { buildGeneratedNoteNavigation };
