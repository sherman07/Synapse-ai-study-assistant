import assert from "node:assert/strict";
import { PROMPT_MODE_OPTIONS } from "../src/react/constants.js";
import { renderStudyNotesSurface } from "../src/legacy/notesSurface.js";

const professionalMode = PROMPT_MODE_OPTIONS.find(([value]) => value === "professor_mode");
assert.ok(professionalMode, "Professional Mode should keep the professor_mode key for saved-history compatibility");
assert.equal(professionalMode[1], "Professional Mode");
assert.equal(
  professionalMode[2],
  "Goes beyond the source to explain deeper meaning, useful background knowledge, concept connections, application, mistakes, and high-quality student thinking."
);

const html = [
  "<h1>Vectors in mechanics</h1>",
  "<h2>Big Picture</h2>",
  "<p>[Professional explanation] The lecture introduces vectors so students can reason about direction, magnitude, and spatial relationships rather than memorising symbols.</p>",
  "<h2>What You Actually Need To Understand</h2>",
  "<ul><li>[Professional explanation] Vectors let force and motion be treated as structured quantities.</li></ul>",
  "<h2>Concept Connections</h2>",
  "<ul><li>[Professional explanation] Components depend on coordinate axes and trigonometry.</li></ul>",
  "<h2>Deep Explanation</h2>",
  "<h3>Resolving forces</h3><p>[Professional explanation] Split a force when the useful direction is horizontal or vertical.</p>",
  "<h3>Limitation</h3><p>[Limitation] The notes do not fully derive every trigonometric identity.</p>",
  "<h2>Background Knowledge Layer</h2>",
  "<p>[Background knowledge] Sign conventions determine whether a component is positive or negative.</p>",
  "<h2>Application To New Situations</h2>",
  "<ol><li>[Application] Draw axes, resolve each vector, then check units and direction.</li></ol>",
  "<h2>High-Quality Student Thinking</h2>",
  "<p>[Professional explanation] A strong answer explains why a component method fits the geometry.</p>",
  "<h2>Common Mistakes</h2>",
  "<ul><li>[Application] Students often swap sine and cosine when the angle is measured from a different axis.</li></ul>",
  "<h2>How To Use This In Assessment</h2>",
  "<p>[Application] State the principle, show the resolving step, and interpret the sign.</p>",
  "<h2>Model High-Quality Output</h2>",
  "<p>[Application] The force is resolved into components because equilibrium is checked along independent axes.</p>",
  "<h2>Memory and Practice</h2>",
  "<ul><li>[Application] Memorise vector notation, practise drawing components, and check signs.</li></ul>",
].join("");

const rendered = renderStudyNotesSurface(html, {
  collapseSecondary: true,
  promptMode: "professor_mode",
});

assert.ok(rendered.includes("professional-mode-surface"));
assert.ok(rendered.includes("professional-big-picture-card"));
assert.ok(rendered.includes("professional-core-understanding-card"));
assert.ok(rendered.includes("professional-connections-grid"));
assert.ok(rendered.includes("professional-deep-explanation-section"));
assert.ok(rendered.includes("professional-background-card"));
assert.ok(rendered.includes("professional-application-card"));
assert.ok(rendered.includes("professional-high-quality-thinking-card"));
assert.ok(rendered.includes("professional-common-mistakes-card"));
assert.ok(rendered.includes("professional-assessment-use-card"));
assert.ok(rendered.includes("professional-model-output-card"));
assert.ok(rendered.includes("professional-memory-practice-card"));
assert.ok(rendered.includes("notes-section-chip professional-explanation"));
assert.ok(rendered.includes("notes-section-chip background-knowledge"));
assert.ok(rendered.includes("notes-section-chip application"));
assert.ok(rendered.includes("notes-section-chip limitation"));
assert.ok(!rendered.includes("notes-section-chip source-based"));
assert.ok(rendered.includes("<details class=\"professional-mode-section professional-deep-explanation-section\" open"));

console.log("professional mode notes surface regression passed");
