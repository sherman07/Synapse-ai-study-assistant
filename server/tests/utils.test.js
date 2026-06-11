import assert from "node:assert/strict";
import test from "node:test";
import { stableUserId } from "../src/utils/ids.js";
import { allowedValue, cleanString, limitValue, validateProgressPayload } from "../src/utils/validators.js";

test("stableUserId is deterministic and scoped by provider", () => {
  assert.equal(stableUserId("local_demo", "abc"), stableUserId("local_demo", "abc"));
  assert.notEqual(stableUserId("local_demo", "abc"), stableUserId("supabase", "abc"));
});

test("validators clamp and sanitize public input", () => {
  assert.equal(cleanString(" hello\nworld ", 20), "hello world");
  assert.equal(allowedValue("PUBLIC", ["private", "shared", "public"], "private"), "public");
  assert.equal(allowedValue("owner", ["private", "shared", "public"], "private"), "private");
  assert.equal(limitValue(999, 50, 200), 200);
});

test("progress payload validation rejects malformed input", () => {
  assert.equal(validateProgressPayload({ score: "90" }).ok, true);
  assert.equal(validateProgressPayload(null).ok, true);
  assert.equal(validateProgressPayload([]).ok, false);
  assert.equal(validateProgressPayload({ score: "not-a-number" }).error, "Progress score must be a number.");
});
