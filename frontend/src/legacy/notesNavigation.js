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

function isNumberedNavigationHeading(title) {
  return /^(?:section\s+)?\d+\s*[.)\-:]/i.test(String(title || "").trim());
}

function makeHeadingNode(title, level, start, usedAnchors, parentTitle = "") {
  return {
    title,
    level,
    start,
    anchor: navigationAnchor(parentTitle ? `${parentTitle}-${title}` : title, usedAnchors),
    children: [],
  };
}

function dedupeNavigationTree(nodes) {
  const seen = new Set();
  return nodes.filter(node => {
    const key = node.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    node.children = dedupeNavigationTree(node.children || []);
    return true;
  });
}

function generatedHeadingEntries(summary) {
  const source = String(summary || "").replace(/\r\n?/g, "\n");
  const headingPattern = /^(#{2,4})\s+(.+?)\s*#*\s*$/gm;
  const headings = [];
  const usedAnchors = new Map();
  let hasNumberedLevelTwoHeading = false;
  let match = null;

  while ((match = headingPattern.exec(source))) {
    const level = match[1].length;
    const title = cleanNavigationTitle(match[2]);
    if (!title) continue;
    if (level === 2 && isNumberedNavigationHeading(title)) hasNumberedLevelTwoHeading = true;
    headings.push({ title, level, start: match.index });
  }

  const entries = [];
  const stack = [];
  let currentTopLevel = null;

  headings.forEach(heading => {
    const numberedTopLevel = heading.level === 2 && isNumberedNavigationHeading(heading.title);
    const shouldStartTopLevel = heading.level === 2 && (!hasNumberedLevelTwoHeading || numberedTopLevel || !currentTopLevel);

    if (shouldStartTopLevel) {
      const entry = makeHeadingNode(heading.title, heading.level, heading.start, usedAnchors);
      entries.push(entry);
      currentTopLevel = entry;
      stack.length = 0;
      stack.push(entry);
      return;
    }

    if (!currentTopLevel) {
      const entry = makeHeadingNode(heading.title, heading.level, heading.start, usedAnchors);
      entries.push(entry);
      currentTopLevel = entry;
      stack.length = 0;
      stack.push(entry);
      return;
    }

    while (stack.length && stack[stack.length - 1].level >= heading.level) stack.pop();
    const parent = stack[stack.length - 1] || currentTopLevel;
    const child = makeHeadingNode(heading.title, heading.level, heading.start, usedAnchors, parent.title);
    parent.children.push(child);
    stack.push(child);
  });

  const dedupedEntries = dedupeNavigationTree(entries);
  return dedupedEntries.map((entry, index) => ({
    title: entry.title,
    markdown: source.slice(entry.start, headings.find(heading => heading.start > entry.start && heading.level === 2 && isNumberedNavigationHeading(heading.title))?.start || source.length).trim(),
    anchor: entry.anchor,
    children: entry.children,
  }));
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
