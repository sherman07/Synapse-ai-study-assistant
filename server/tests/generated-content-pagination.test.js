import assert from "node:assert/strict";
import test from "node:test";
import { generatedContentSectionPage } from "../src/repositories/generatedContentRepository.js";

test("generated content section pages return stable pagination metadata", () => {
  const result = generatedContentSectionPage({
    id: "content_1",
    title: "Study Notes",
    language: "english",
    sections: {
      Overview: "First",
      "Key ideas": "Second",
      "Revision": "Third",
      "Exam checks": "Fourth"
    }
  }, 2, 2);

  assert.equal(result.page, 2);
  assert.equal(result.page_size, 2);
  assert.equal(result.total_sections, 4);
  assert.equal(result.total_pages, 2);
  assert.equal(result.has_next, false);
  assert.deepEqual(result.items.map(item => item.title), ["Revision", "Exam checks"]);
  assert.equal("connections" in result, false);
});
