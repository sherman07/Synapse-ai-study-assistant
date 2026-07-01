import { createPool } from "../db/pool.js";
import { firstSupabaseRow, supabaseRequest, supabaseStorageEnabled } from "../supabase/rest.js";
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

async function mysqlListStudyRooms(userId, limit = 50) {
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

async function mysqlCreateStudyRoom(userId, payload = {}) {
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
      return mysqlPatchStudyRoom(userId, id, payload);
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
  return mysqlGetStudyRoom(userId, id);
}

async function mysqlGetStudyRoom(userId, roomId) {
  const [rows] = await createPool().execute(
    `SELECT * FROM study_rooms
     WHERE id = ? AND (owner_user_id = ? OR id IN (SELECT study_room_id FROM study_room_members WHERE user_id = ?))
     LIMIT 1`,
    [cleanString(roomId, 96), userId, userId]
  );
  return rows[0] ? mapStudyRoom(rows[0]) : null;
}

async function mysqlPatchStudyRoom(userId, roomId, patch = {}) {
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
  if (!fields.length) return mysqlGetStudyRoom(userId, roomId);
  values.push(cleanString(roomId, 96), userId);
  const [result] = await createPool().execute(
    `UPDATE study_rooms SET ${fields.join(", ")} WHERE id = ? AND owner_user_id = ?`,
    values
  );
  return result.affectedRows ? mysqlGetStudyRoom(userId, roomId) : null;
}

async function mysqlDeleteStudyRoom(userId, roomId) {
  const [result] = await createPool().execute(
    "DELETE FROM study_rooms WHERE id = ? AND owner_user_id = ?",
    [cleanString(roomId, 96), userId]
  );
  return result.affectedRows > 0;
}

function supabaseStudyRoomRow(userId, payload = {}, id = "") {
  return {
    id,
    owner_user_id: userId,
    title: cleanString(payload.title || "Study Room", 255) || "Study Room",
    description: nullableString(payload.description, 4000),
    visibility: allowedValue(payload.visibility, ["private", "shared", "public"], "private"),
    settings_json: payload.settings || payload.settings_json || {}
  };
}

async function supabaseGetRoomRow(roomId) {
  const payload = await supabaseRequest("GET", "study_rooms", {
    query: {
      select: "*",
      id: `eq.${cleanString(roomId, 96)}`,
      limit: 1
    }
  });
  return firstSupabaseRow(payload);
}

async function supabaseUserIsRoomMember(userId, roomId) {
  const rows = await supabaseRequest("GET", "study_room_members", {
    query: {
      select: "study_room_id",
      user_id: `eq.${cleanString(userId, 80)}`,
      study_room_id: `eq.${cleanString(roomId, 96)}`,
      limit: 1
    }
  });
  return Boolean(firstSupabaseRow(rows));
}

async function supabaseCanAccessStudyRoom(userId, roomId) {
  const row = await supabaseGetRoomRow(roomId);
  if (!row) return null;
  if (row.owner_user_id === userId) return row;
  return (await supabaseUserIsRoomMember(userId, roomId)) ? row : null;
}

async function supabaseListStudyRooms(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const ownedRows = await supabaseRequest("GET", "study_rooms", {
    query: {
      select: "*",
      owner_user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc",
      limit: safeLimit
    }
  });
  const memberRows = await supabaseRequest("GET", "study_room_members", {
    query: {
      select: "study_room_id",
      user_id: `eq.${cleanString(userId, 80)}`,
      limit: safeLimit
    }
  });
  const ownedIds = new Set((Array.isArray(ownedRows) ? ownedRows : []).map(row => row.id));
  const memberIds = (Array.isArray(memberRows) ? memberRows : [])
    .map(row => cleanString(row.study_room_id, 96))
    .filter(id => id && !ownedIds.has(id));
  let sharedRows = [];
  if (memberIds.length) {
    sharedRows = await supabaseRequest("GET", "study_rooms", {
      query: {
        select: "*",
        id: `in.(${memberIds.join(",")})`,
        limit: safeLimit
      }
    });
  }
  return [...(Array.isArray(ownedRows) ? ownedRows : []), ...(Array.isArray(sharedRows) ? sharedRows : [])]
    .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))
    .slice(0, safeLimit)
    .map(mapStudyRoom);
}

async function supabaseCreateStudyRoom(userId, payload = {}) {
  const id = cleanString(payload.id, 96) || randomId("room");
  const existing = payload.id ? await supabaseGetRoomRow(id) : null;
  if (existing) {
    if (existing.owner_user_id !== userId) {
      const error = new Error("Study room id is not available.");
      error.status = 403;
      throw error;
    }
    return supabasePatchStudyRoom(userId, id, payload);
  }
  const saved = await supabaseRequest("POST", "study_rooms", {
    body: [supabaseStudyRoomRow(userId, payload, id)],
    prefer: "return=representation"
  });
  await supabaseRequest("POST", "study_room_members", {
    query: { on_conflict: "study_room_id,user_id" },
    body: [{ study_room_id: id, user_id: userId, role: "owner" }],
    prefer: "resolution=merge-duplicates,return=minimal",
    allowEmpty: true
  });
  const savedRow = firstSupabaseRow(saved);
  return savedRow ? mapStudyRoom(savedRow) : supabaseGetStudyRoom(userId, id);
}

async function supabaseGetStudyRoom(userId, roomId) {
  const row = await supabaseCanAccessStudyRoom(userId, roomId);
  return row ? mapStudyRoom(row) : null;
}

async function supabasePatchStudyRoom(userId, roomId, patch = {}) {
  const current = await supabaseGetRoomRow(roomId);
  if (!current || current.owner_user_id !== userId) return null;
  const next = {};
  if (patch.title !== undefined) next.title = cleanString(patch.title, 255) || "Study Room";
  if (patch.description !== undefined) next.description = nullableString(patch.description, 4000);
  if (patch.visibility !== undefined) next.visibility = allowedValue(patch.visibility, ["private", "shared", "public"], "private");
  if (patch.settings !== undefined || patch.settings_json !== undefined) {
    next.settings_json = patch.settings || patch.settings_json || {};
  }
  if (!Object.keys(next).length) return mapStudyRoom(current);
  const rows = await supabaseRequest("PATCH", "study_rooms", {
    query: {
      id: `eq.${cleanString(roomId, 96)}`,
      owner_user_id: `eq.${cleanString(userId, 80)}`
    },
    body: next,
    prefer: "return=representation"
  });
  const row = firstSupabaseRow(rows);
  return row ? mapStudyRoom(row) : null;
}

async function supabaseDeleteStudyRoom(userId, roomId) {
  const rows = await supabaseRequest("DELETE", "study_rooms", {
    query: {
      id: `eq.${cleanString(roomId, 96)}`,
      owner_user_id: `eq.${cleanString(userId, 80)}`
    },
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows.length > 0 : Boolean(rows);
}

async function mirrorMysql(operation, label) {
  try {
    return await operation();
  } catch (error) {
    console.warn(`[storage] MySQL ${label} mirror failed: ${error.message}`);
    return null;
  }
}

async function listStudyRooms(userId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListStudyRooms(userId, limit);
    } catch (error) {
      console.warn(`[storage] Supabase study-room list failed: ${error.message}`);
    }
  }
  return mysqlListStudyRooms(userId, limit);
}

async function createStudyRoom(userId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateStudyRoom(userId, payload);
  const supabaseItem = await supabaseCreateStudyRoom(userId, payload);
  await mirrorMysql(() => mysqlCreateStudyRoom(userId, payload), "study-room upsert");
  return supabaseItem;
}

async function getStudyRoom(userId, roomId) {
  if (supabaseStorageEnabled()) {
    try {
      const item = await supabaseGetStudyRoom(userId, roomId);
      if (item) return item;
    } catch (error) {
      console.warn(`[storage] Supabase study-room get failed: ${error.message}`);
    }
  }
  return mysqlGetStudyRoom(userId, roomId);
}

async function patchStudyRoom(userId, roomId, patch = {}) {
  if (!supabaseStorageEnabled()) return mysqlPatchStudyRoom(userId, roomId, patch);
  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchStudyRoom(userId, roomId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase study-room patch failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(() => mysqlPatchStudyRoom(userId, roomId, patch), "study-room patch");
  return supabaseItem || mysqlItem || getStudyRoom(userId, roomId);
}

async function deleteStudyRoom(userId, roomId) {
  if (!supabaseStorageEnabled()) return mysqlDeleteStudyRoom(userId, roomId);
  let deleted = false;
  try {
    deleted = await supabaseDeleteStudyRoom(userId, roomId);
  } catch (error) {
    console.warn(`[storage] Supabase study-room delete failed: ${error.message}`);
  }
  const mysqlDeleted = await mirrorMysql(() => mysqlDeleteStudyRoom(userId, roomId), "study-room delete");
  return deleted || Boolean(mysqlDeleted);
}

export { createStudyRoom, deleteStudyRoom, getStudyRoom, listStudyRooms, patchStudyRoom };
