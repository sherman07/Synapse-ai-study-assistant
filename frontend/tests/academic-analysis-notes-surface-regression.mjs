import assert from "node:assert/strict";
import { PROMPT_MODE_OPTIONS } from "../src/react/constants.js";
import { renderStudyNotesSurface } from "../src/legacy/notesSurface.js";

const academicMode = PROMPT_MODE_OPTIONS.find(([value]) => value === "professor_mode");
assert.ok(academicMode, "Academic Analysis should keep the professor_mode key for saved-history compatibility");
assert.equal(academicMode[1], "Academic Analysis");
assert.equal(
  academicMode[2],
  "Builds academic argument, critical analysis, thesis statements, and essay-ready explanations from the source."
);

const html = [
  "<h1>Vaccination ethics</h1>",
  "<h2>Academic Overview</h2>",
  "<p>[Source-based] The lecture treats vaccination policy as an ethical problem about state power.</p>",
  "<h2>Central Argument</h2>",
  "<p>[Academic interpretation] The source is examining when coercion can be justified rather than merely whether vaccines work.</p>",
  "<h2>Key Tensions / Debates</h2>",
  "<ul><li>[Source-based] Liberty vs collective welfare appears where individual refusal is weighed against public harm.</li></ul>",
  "<h2>Critical Analysis</h2>",
  "<h3>Claim</h3><p>The state may restrict liberty to protect welfare.</p>",
  "<h3>Evidence from source</h3><p>[Source-based] The source uses necessity and proportionality.</p>",
  "<h3>Academic interpretation</h3><p>[Academic interpretation] State power is conditional.</p>",
  "<h3>Limitation</h3><p>[Limitation] The boundary of excessive coercion remains unresolved.</p>",
  "<h2>Essay-Ready Thesis Statements</h2>",
  "<ol><li>[Essay use] Coercion is justified only when necessary, proportionate, and fair.</li></ol>",
  "<h2>Model Academic Paragraph</h2>",
  "<p>[Essay use] A high-grade paragraph links evidence, analysis, and limitation.</p>",
  "<h2>Professional Vocabulary Bank</h2>",
  "<table><thead><tr><th>Phrase</th><th>Meaning</th><th>How to use it</th></tr></thead><tbody><tr><td>conditional justification</td><td>Works only under limits</td><td>Use for proportionate coercion.</td></tr></tbody></table>",
  "<h2>High-Grade Discussion Points</h2>",
  "<ul><li>[Academic interpretation] Do not treat liberty as absolute.</li></ul>",
  "<h2>Essay / Tutorial Use</h2>",
  "<p>[Essay use] Use the strongest evidence and avoid overclaiming.</p>",
].join("");

const rendered = renderStudyNotesSurface(html, {
  collapseSecondary: true,
  promptMode: "professor_mode",
});

assert.ok(rendered.includes("academic-analysis-surface"));
assert.ok(rendered.includes("academic-overview-card"));
assert.ok(rendered.includes("central-argument-card"));
assert.ok(rendered.includes("key-tensions-grid"));
assert.ok(rendered.includes("critical-analysis-section"));
assert.ok(rendered.includes("essay-thesis-grid"));
assert.ok(rendered.includes("model-paragraph-card"));
assert.ok(rendered.includes("vocabulary-bank-table"));
assert.ok(rendered.includes("discussion-checklist"));
assert.ok(rendered.includes("notes-section-chip source-based"));
assert.ok(rendered.includes("notes-section-chip academic-interpretation"));
assert.ok(rendered.includes("notes-section-chip limitation"));
assert.ok(rendered.includes("notes-section-chip essay-use"));
assert.ok(rendered.includes("<details class=\"academic-analysis-section critical-analysis-section\" open"));

console.log("academic analysis notes surface regression passed");
