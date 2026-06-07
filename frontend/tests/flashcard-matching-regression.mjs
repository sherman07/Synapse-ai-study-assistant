import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const flashcardPath = path.resolve(__dirname, "../src/legacy/controller_sections/06_deleteflashcarddeck.js");
const source = fs.readFileSync(flashcardPath, "utf8");

const makeHelpers = new Function(
  "window",
  "cleanMindText",
  "shorten",
  `
  ${source}
  return {
    buildFlashcardMatchingPairs,
    connectFlashcardMatchPair,
    createFlashcardMatchingState,
    flashcardMatchValidationSummary,
    stableFlashcardShuffle
  };
  `
);

const cleanMindText = value => String(value || "").replace(/\s+/g, " ").trim();
const shorten = (value, limit = 140) => {
  const text = String(value || "");
  return text.length > limit ? text.slice(0, limit - 1).trim() + "…" : text;
};

const {
  buildFlashcardMatchingPairs,
  connectFlashcardMatchPair,
  createFlashcardMatchingState,
  flashcardMatchValidationSummary,
  stableFlashcardShuffle
} = makeHelpers({ SYNAPSE_FLASHCARD_MATCH_LIMIT: 4 }, cleanMindText, shorten);

const cards = [
  { id: "concept 1", front: "Working memory", back: "Temporarily holds and manipulates information." },
  { id: "concept 2", front: "Encoding", back: "Turns information into a form that can be stored." },
  { id: "concept 3", front: "Retrieval", back: "Brings stored information back into active use." },
  { id: "duplicate", front: "Retrieval", back: "Brings stored information back into active use." }
];

const pairs = buildFlashcardMatchingPairs(cards, 4);
assert.equal(pairs.length, 3);
assert.equal(pairs[0].termId, "term-concept_1");
assert.equal(pairs[0].branchId, "branch-concept_1");

const shuffledA = stableFlashcardShuffle(pairs.map(pair => ({ id: pair.branchId })), "same-seed");
const shuffledB = stableFlashcardShuffle(pairs.map(pair => ({ id: pair.branchId })), "same-seed");
assert.deepEqual(shuffledA, shuffledB);

const state = createFlashcardMatchingState(cards);
connectFlashcardMatchPair(pairs[0].termId, pairs[1].branchId, state);
connectFlashcardMatchPair(pairs[1].termId, pairs[1].branchId, state);
assert.equal(state.matches[pairs[0].termId], undefined);
assert.equal(state.matches[pairs[1].termId], pairs[1].branchId);

connectFlashcardMatchPair(pairs[0].termId, pairs[0].branchId, state);
connectFlashcardMatchPair(pairs[2].termId, pairs[2].branchId, state);
const summary = flashcardMatchValidationSummary(pairs, state);
assert.deepEqual(summary, { total: 3, matched: 3, correct: 3, wrong: 0, complete: true });

console.log("flashcard matching regression passed");
