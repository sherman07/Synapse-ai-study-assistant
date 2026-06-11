import { createPool } from "../db/pool.js";
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

async function createProgress(userId, payload = {}) {
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
  return getProgress(userId, row.id);
}

async function listProgress(userId, limit = 50) {
  const [rows] = await createPool().execute(
    "SELECT * FROM progress_records WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?",
    [userId, limitValue(limit)]
  );
  return rows.map(mapProgress);
}

async function getProgress(userId, progressId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM progress_records WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(progressId, 96)]
  );
  return rows[0] ? mapProgress(rows[0]) : null;
}

async function patchProgress(userId, progressId, patch = {}) {
  const current = await getProgress(userId, progressId);
  if (!current) return null;
  return createProgress(userId, { ...current.payload, ...current, ...patch, id: current.id });
}

async function deleteProgress(userId, progressId) {
  const [result] = await createPool().execute(
    "DELETE FROM progress_records WHERE user_id = ? AND id = ?",
    [userId, cleanString(progressId, 96)]
  );
  return result.affectedRows > 0;
}

export { createProgress, deleteProgress, getProgress, listProgress, patchProgress };
