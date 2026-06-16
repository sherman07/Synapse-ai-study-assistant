import assert from "node:assert/strict";
import { renderStudyNotesSurface } from "../src/legacy/notesSurface.js";

const html = [
  "<h1>Vaccination policy and liberty</h1>",
  "<p>Use the note structure below to revise fast.</p>",
  "<h2>Key Takeaways</h2>",
  "<p>[Direct from source]</p>",
  "<p>Mandates must stay necessary and proportionate (Slide 15).</p>",
  "<h2>Exam Answer Templates</h2>",
  "<p>[Tutor explanation]</p>",
  "<p>Start with the principle, then cite the strongest lecture evidence.</p>",
].join("");

const rendered = renderStudyNotesSurface(html, { collapseSecondary: true });

assert.ok(rendered.includes("notes-summary-card"));
assert.equal((rendered.match(/<details class=\"notes-section\"/g) || []).length, 2);
assert.ok(rendered.includes('data-section-title="Key Takeaways"'));
assert.ok(rendered.includes('data-section-title="Exam Answer Templates"'));
assert.ok(rendered.includes("notes-section-chip source"));
assert.ok(rendered.includes("notes-section-chip must-know"));
assert.ok(rendered.includes("notes-section-chip tutor"));
assert.ok(rendered.includes("notes-section-chip exam-use"));
assert.ok(rendered.includes("<details class=\"notes-section\" open"));
assert.ok(rendered.includes("notes-inline-badges"));
assert.ok(rendered.includes("Mandates must stay necessary and proportionate (Slide 15)."));

console.log("source strict notes surface regression passed");
