import { createPool } from "../db/pool.js";
import { stableUserId } from "../utils/ids.js";
import { cleanString, jsonString, jsonValue, nullableString } from "../utils/validators.js";

function normalizeIdentity(identity = {}) {
  const provider = cleanString(identity.auth_provider || identity.authProvider || "anonymous", 60) || "anonymous";
  const subject = cleanString(
    identity.auth_subject || identity.authSubject || identity.accountId || identity.id || "anonymous",
    191
  ) || "anonymous";
  return {
    id: cleanString(identity.id || stableUserId(provider, subject), 80),
    auth_provider: provider,
    auth_subject: subject,
    email: nullableString(identity.email, 255),
    display_name: nullableString(identity.display_name || identity.displayName, 255),
    auth_mode: nullableString(identity.auth_mode || identity.authMode || provider, 80),
    role: cleanString(identity.role || "student", 80) || "student",
    metadata_json: identity.metadata || {}
  };
}

function mapUser(row = {}) {
  return {
    id: row.id,
    authProvider: row.auth_provider,
    authSubject: row.auth_subject,
    email: row.email || "",
    displayName: row.display_name || "",
    authMode: row.auth_mode || row.auth_provider || "",
    role: row.role || "student",
    metadata: jsonValue(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function upsertUser(identity = {}) {
  const user = normalizeIdentity(identity);
  await createPool().execute(
    `INSERT INTO users (
      id, auth_provider, auth_subject, email, display_name, auth_mode, role, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      display_name = VALUES(display_name),
      auth_mode = VALUES(auth_mode),
      role = VALUES(role),
      metadata_json = VALUES(metadata_json)`,
    [
      user.id,
      user.auth_provider,
      user.auth_subject,
      user.email,
      user.display_name,
      user.auth_mode,
      user.role,
      jsonString(user.metadata_json, {})
    ]
  );
  return getUserByProviderSubject(user.auth_provider, user.auth_subject);
}

async function getUserByProviderSubject(provider, subject) {
  const [rows] = await createPool().execute(
    "SELECT * FROM users WHERE auth_provider = ? AND auth_subject = ? LIMIT 1",
    [provider, subject]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

async function getUserById(userId) {
  const [rows] = await createPool().execute("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
  return rows[0] ? mapUser(rows[0]) : null;
}

async function patchUser(userId, patch = {}) {
  const fields = [];
  const values = [];
  if (patch.email !== undefined) {
    fields.push("email = ?");
    values.push(nullableString(patch.email, 255));
  }
  if (patch.displayName !== undefined || patch.display_name !== undefined) {
    fields.push("display_name = ?");
    values.push(nullableString(patch.displayName || patch.display_name, 255));
  }
  if (patch.role !== undefined) {
    fields.push("role = ?");
    values.push(cleanString(patch.role, 80) || "student");
  }
  if (patch.metadata !== undefined) {
    fields.push("metadata_json = ?");
    values.push(jsonString(patch.metadata, {}));
  }
  if (!fields.length) return getUserById(userId);
  values.push(userId);
  await createPool().execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return getUserById(userId);
}

export { getUserById, mapUser, normalizeIdentity, patchUser, upsertUser };
