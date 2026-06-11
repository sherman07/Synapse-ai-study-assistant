import crypto from "node:crypto";

function shortHash(value, length = 24) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, length);
}

function stableUserId(provider, subject) {
  return `user_${shortHash(`${provider || "anonymous"}:${subject || "anonymous"}`)}`;
}

function randomId(prefix) {
  const safePrefix = typeof prefix === "string" && prefix.trim() ? prefix.trim() : "id";
  return `${safePrefix}_${crypto.randomUUID()}`;
}

export { randomId, shortHash, stableUserId };
