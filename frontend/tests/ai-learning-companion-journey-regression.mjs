import assert from "node:assert/strict";
import test from "node:test";

import { buildLearningJourney } from "../src/react/learningJourney.js";

test("a learning journey advances from orienting to explaining when evidence is saved", () => {
  const journey = buildLearningJourney({
    intention: "skill",
    hasSession: true,
    evidence: [{ evidenceType: "self_check" }],
  });

  assert.deepEqual(journey.map(stage => stage.complete), [true, true, false]);
  assert.equal(journey[2].label, "Apply it");
});

test("assessment journeys ask for evidence under pressure as the final stage", () => {
  const journey = buildLearningJourney({ intention: "assessment", hasSession: true, evidence: [] });
  assert.equal(journey[2].label, "Prove it under pressure");
});
