import { allowedValue, cleanString } from "../utils/validators.js";

const LEARNING_INTENTIONS = ["hobby", "skill", "project", "assessment"];
const MESSAGE_ROLES = ["user", "assistant"];

function requiredString(value, field, limit = 240) {
  const cleaned = cleanString(value, limit);
  if (!cleaned) throw new Error(`${field} is required.`);
  return cleaned;
}

function normalizeSubject(input = {}, userId) {
  const intention = allowedValue(input.intention, LEARNING_INTENTIONS, "");
  if (!intention) throw new Error("Learning intention is invalid.");

  return {
    id: requiredString(input.id, "Subject id", 120),
    userId: requiredString(userId, "User id", 120),
    title: requiredString(input.title, "Subject title"),
    intention,
    goal: cleanString(input.goal, 2000),
    status: allowedValue(input.status, ["active", "paused", "completed", "archived"], "active"),
  };
}

function normalizeMessage(input = {}) {
  const role = allowedValue(input.role, MESSAGE_ROLES, "");
  if (!role) throw new Error("Message role must be user or assistant.");

  return {
    id: cleanString(input.id, 120) || null,
    role,
    content: requiredString(input.content, "Message content", 12000),
    idempotencyKey: cleanString(input.idempotencyKey, 120) || null,
  };
}

export { LEARNING_INTENTIONS, MESSAGE_ROLES, normalizeMessage, normalizeSubject };
