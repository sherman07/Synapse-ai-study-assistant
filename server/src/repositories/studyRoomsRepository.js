import { createPool } from "../db/pool.js";
import { randomId } from "../utils/ids.js";
import { allowedValue, cleanString, jsonString, jsonValue, limitValue, nullableString } from "../utils/validators.js";

function mapStudyRoom(row = {}) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    title: row.title,
    description: row.description || "",
    visibility: row.visibility || "private",
    settings: jsonValue(row.settings_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listStudyRooms(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const [rows] = await createPool().execute(
    `SELECT * FROM study_rooms
     WHERE owner_user_id = ? OR id IN (SELECT study_room_id FROM study_room_members WHERE user_id = ?)
     ORDER BY updated_at DESC
     LIMIT ${safeLimit}`,
    [userId, userId]
  );
  return rows.map(mapStudyRoom);
}

async function createStudyRoom(userId, payload = {}) {
  const id = cleanString(payload.id, 96) || randomId("room");
  if (payload.id) {
    const [existing] = await createPool().execute(
      "SELECT owner_user_id FROM study_rooms WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing[0]) {
      if (existing[0].owner_user_id !== userId) {
        const error = new Error("Study room id is not available.");
        error.status = 403;
        throw error;
      }
      return patchStudyRoom(userId, id, payload);
    }
  }
  await createPool().execute(
    `INSERT INTO study_rooms (id, owner_user_id, title, description, visibility, settings_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      cleanString(payload.title || "Study Room", 255) || "Study Room",
      nullableString(payload.description, 4000),
      allowedValue(payload.visibility, ["private", "shared", "public"], "private"),
      jsonString(payload.settings || payload.settings_json || {}, {})
    ]
  );
  await createPool().execute(
    `INSERT INTO study_room_members (study_room_id, user_id, role)
     VALUES (?, ?, 'owner')
     ON DUPLICATE KEY UPDATE role = 'owner'`,
    [id, userId]
  );
  return getStudyRoom(userId, id);
}

async function getStudyRoom(userId, roomId) {
  const [rows] = await createPool().execute(
    `SELECT * FROM study_rooms
     WHERE id = ? AND (owner_user_id = ? OR id IN (SELECT study_room_id FROM study_room_members WHERE user_id = ?))
     LIMIT 1`,
    [cleanString(roomId, 96), userId, userId]
  );
  return rows[0] ? mapStudyRoom(rows[0]) : null;
}

async function patchStudyRoom(userId, roomId, patch = {}) {
  const fields = [];
  const values = [];
  if (patch.title !== undefined) {
    fields.push("title = ?");
    values.push(cleanString(patch.title, 255) || "Study Room");
  }
  if (patch.description !== undefined) {
    fields.push("description = ?");
    values.push(nullableString(patch.description, 4000));
  }
  if (patch.visibility !== undefined) {
    fields.push("visibility = ?");
    values.push(allowedValue(patch.visibility, ["private", "shared", "public"], "private"));
  }
  if (patch.settings !== undefined || patch.settings_json !== undefined) {
    fields.push("settings_json = ?");
    values.push(jsonString(patch.settings || patch.settings_json || {}, {}));
  }
  if (!fields.length) return getStudyRoom(userId, roomId);
  values.push(cleanString(roomId, 96), userId);
  const [result] = await createPool().execute(
    `UPDATE study_rooms SET ${fields.join(", ")} WHERE id = ? AND owner_user_id = ?`,
    values
  );
  return result.affectedRows ? getStudyRoom(userId, roomId) : null;
}

async function deleteStudyRoom(userId, roomId) {
  const [result] = await createPool().execute(
    "DELETE FROM study_rooms WHERE id = ? AND owner_user_id = ?",
    [cleanString(roomId, 96), userId]
  );
  return result.affectedRows > 0;
}

export { createStudyRoom, deleteStudyRoom, getStudyRoom, listStudyRooms, patchStudyRoom };
