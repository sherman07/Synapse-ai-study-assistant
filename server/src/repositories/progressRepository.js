import { createPool } from "../db/pool.js";
import { firstSupabaseRow, supabaseRequest, supabaseStorageEnabled } from "../supabase/rest.js";
import { randomId } from "../utils/ids.js";
import { cleanString, firstValue, jsonString, jsonValue, limitValue, nullableString, numberValue } from "../utils/validators.js";

function mapProgress(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    studyRoomId: row.study_room_id || "",
    entityType: row.entity_type,
    entityId: row.entity_id,
    metricType: row.metric_type,
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    status: row.status || "",
    payload: jsonValue(row.payload_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowFromPayload(userId, payload = {}) {
  return {
    id: cleanString(payload.id, 96) || randomId("progress"),
    user_id: userId,
    study_room_id: nullableString(firstValue(payload, ["study_room_id", "studyRoomId"]), 96),
    entity_type: cleanString(firstValue(payload, ["entity_type", "entityType"]), 80) || "custom",
    entity_id: cleanString(firstValue(payload, ["entity_id", "entityId"]), 120) || "current",
    metric_type: cleanString(firstValue(payload, ["metric_type", "metricType"]), 120) || "progress",
    score: numberValue(payload.score, null),
    status: nullableString(payload.status, 80),
    payload_json: payload.payload || payload.payload_json || payload
  };
}

async function mysqlCreateProgress(userId, payload = {}) {
  const row = rowFromPayload(userId, payload);
  const [existing] = await createPool().execute(
    "SELECT user_id FROM progress_records WHERE id = ? LIMIT 1",
    [row.id]
  );
  if (existing[0] && existing[0].user_id !== userId) {
    const error = new Error("Progress record id is not available.");
    error.status = 403;
    throw error;
  }
  await createPool().execute(
    `INSERT INTO progress_records (
      id, user_id, study_room_id, entity_type, entity_id, metric_type, score, status, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      study_room_id = VALUES(study_room_id),
      entity_type = VALUES(entity_type),
      entity_id = VALUES(entity_id),
      metric_type = VALUES(metric_type),
      score = VALUES(score),
      status = VALUES(status),
      payload_json = VALUES(payload_json)`,
    [row.id, row.user_id, row.study_room_id, row.entity_type, row.entity_id, row.metric_type, row.score, row.status, jsonString(row.payload_json, {})]
  );
  return mysqlGetProgress(userId, row.id);
}

async function mysqlListProgress(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const [rows] = await createPool().execute(
    `SELECT * FROM progress_records WHERE user_id = ? ORDER BY updated_at DESC LIMIT ${safeLimit}`,
    [userId]
  );
  return rows.map(mapProgress);
}

async function mysqlGetProgress(userId, progressId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM progress_records WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(progressId, 96)]
  );
  return rows[0] ? mapProgress(rows[0]) : null;
}

async function mysqlPatchProgress(userId, progressId, patch = {}) {
  const current = await mysqlGetProgress(userId, progressId);
  if (!current) return null;
  return mysqlCreateProgress(userId, { ...current.payload, ...current, ...patch, id: current.id });
}

async function mysqlDeleteProgress(userId, progressId) {
  const [result] = await createPool().execute(
    "DELETE FROM progress_records WHERE user_id = ? AND id = ?",
    [userId, cleanString(progressId, 96)]
  );
  return result.affectedRows > 0;
}

function supabaseProgressRow(row = {}) {
  return {
    id: row.id,
    user_id: row.user_id,
    study_room_id: row.study_room_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    metric_type: row.metric_type,
    score: row.score,
    status: row.status,
    payload_json: row.payload_json
  };
}

async function supabaseExistingProgress(progressId) {
  const payload = await supabaseRequest("GET", "progress_records", {
    query: {
      select: "id,user_id",
      id: `eq.${cleanString(progressId, 96)}`,
      limit: 1
    }
  });
  return firstSupabaseRow(payload);
}

async function supabaseCreateProgress(userId, payload = {}) {
  const row = rowFromPayload(userId, payload);
  const existing = await supabaseExistingProgress(row.id);
  if (existing && existing.user_id !== userId) {
    const error = new Error("Progress record id is not available.");
    error.status = 403;
    throw error;
  }
  const saved = await supabaseRequest("POST", "progress_records", {
    query: { on_conflict: "id" },
    body: [supabaseProgressRow(row)],
    prefer: "resolution=merge-duplicates,return=representation"
  });
  const savedRow = firstSupabaseRow(saved);
  return savedRow ? mapProgress(savedRow) : supabaseGetProgress(userId, row.id);
}

async function supabaseListProgress(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const rows = await supabaseRequest("GET", "progress_records", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc",
      limit: safeLimit
    }
  });
  return Array.isArray(rows) ? rows.map(mapProgress) : [];
}

async function supabaseGetProgress(userId, progressId) {
  const rows = await supabaseRequest("GET", "progress_records", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(progressId, 96)}`,
      limit: 1
    }
  });
  const row = firstSupabaseRow(rows);
  return row ? mapProgress(row) : null;
}

async function supabasePatchProgress(userId, progressId, patch = {}) {
  const current = await supabaseGetProgress(userId, progressId);
  if (!current) return null;
  return supabaseCreateProgress(userId, { ...current.payload, ...current, ...patch, id: current.id });
}

async function supabaseDeleteProgress(userId, progressId) {
  const rows = await supabaseRequest("DELETE", "progress_records", {
    query: {
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(progressId, 96)}`
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

async function createProgress(userId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateProgress(userId, payload);
  const supabaseItem = await supabaseCreateProgress(userId, payload);
  await mirrorMysql(() => mysqlCreateProgress(userId, payload), "progress upsert");
  return supabaseItem;
}

async function listProgress(userId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListProgress(userId, limit);
    } catch (error) {
      console.warn(`[storage] Supabase progress list failed: ${error.message}`);
    }
  }
  return mysqlListProgress(userId, limit);
}

async function getProgress(userId, progressId) {
  if (supabaseStorageEnabled()) {
    try {
      const item = await supabaseGetProgress(userId, progressId);
      if (item) return item;
    } catch (error) {
      console.warn(`[storage] Supabase progress get failed: ${error.message}`);
    }
  }
  return mysqlGetProgress(userId, progressId);
}

async function patchProgress(userId, progressId, patch = {}) {
  if (!supabaseStorageEnabled()) return mysqlPatchProgress(userId, progressId, patch);
  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchProgress(userId, progressId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase progress patch failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(() => mysqlPatchProgress(userId, progressId, patch), "progress patch");
  return supabaseItem || mysqlItem || getProgress(userId, progressId);
}

async function deleteProgress(userId, progressId) {
  if (!supabaseStorageEnabled()) return mysqlDeleteProgress(userId, progressId);
  let deleted = false;
  try {
    deleted = await supabaseDeleteProgress(userId, progressId);
  } catch (error) {
    console.warn(`[storage] Supabase progress delete failed: ${error.message}`);
  }
  const mysqlDeleted = await mirrorMysql(() => mysqlDeleteProgress(userId, progressId), "progress delete");
  return deleted || Boolean(mysqlDeleted);
}

export { createProgress, deleteProgress, getProgress, listProgress, patchProgress };
