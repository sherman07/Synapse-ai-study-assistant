import { createPool } from "../db/pool.js";
import { firstSupabaseRow, supabaseRequest, supabaseStorageEnabled } from "../supabase/rest.js";
import { randomId } from "../utils/ids.js";
import {
  allowedValue,
  cleanString,
  firstValue,
  intValue,
  jsonString,
  jsonValue,
  limitValue,
  nullableString
} from "../utils/validators.js";

function normalizeDate(value) {
  const raw = cleanString(value, 80);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 23).replace("T", " ");
}

function mapFocusSession(row = {}) {
  const metrics = jsonValue(row.metrics_json, {});
  return {
    id: row.id,
    sessionId: row.id,
    userId: row.user_id,
    studyRoomId: row.study_room_id || "",
    generatedContentId: row.generated_content_id || "",
    materialId: row.material_id || "",
    materialTitle: row.material_title || "",
    studyGoal: row.study_goal || "",
    status: row.status || "completed",
    selectedScene: row.selected_scene || metrics?.selectedScene || "",
    musicType: row.music_type || metrics?.musicType || "",
    ambientSound: row.ambient_sound || metrics?.ambientSound || "",
    pomodoroDuration: row.pomodoro_minutes || metrics?.pomodoroDuration || null,
    startedAt: row.started_at || metrics?.startedAt || "",
    endedAt: row.ended_at || metrics?.endedAt || "",
    totalFocusTime: row.total_focus_seconds || metrics?.totalFocusTime || 0,
    metrics,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowFromPayload(userId, payload = {}) {
  const metrics = {
    flashcardsCompleted: payload.flashcardsCompleted ?? null,
    quizScore: payload.quizScore ?? null,
    mistakesMade: Array.isArray(payload.mistakesMade) ? payload.mistakesMade : [],
    completedTasks: Array.isArray(payload.completedTasks) ? payload.completedTasks : [],
    aiReflection: payload.aiReflection || "",
    recommendedNextStep: payload.recommendedNextStep || "",
    sessionDate: payload.sessionDate || ""
  };
  return {
    id: cleanString(payload.id || payload.sessionId, 96) || randomId("focus"),
    user_id: userId,
    study_room_id: nullableString(firstValue(payload, ["study_room_id", "studyRoomId"]), 96),
    generated_content_id: nullableString(firstValue(payload, ["generated_content_id", "generatedContentId"]), 96),
    material_id: nullableString(firstValue(payload, ["material_id", "materialId"]), 191),
    material_title: nullableString(firstValue(payload, ["material_title", "materialTitle"]), 500),
    study_goal: nullableString(firstValue(payload, ["study_goal", "studyGoal"]), 8000),
    status: allowedValue(payload.status, ["planned", "active", "completed", "cancelled"], "completed"),
    selected_scene: nullableString(firstValue(payload, ["selected_scene", "selectedScene"]), 120),
    music_type: nullableString(firstValue(payload, ["music_type", "musicType"]), 120),
    ambient_sound: nullableString(firstValue(payload, ["ambient_sound", "ambientSound"]), 120),
    pomodoro_minutes: intValue(firstValue(payload, ["pomodoro_minutes", "pomodoroDuration"]), 0) || null,
    started_at: normalizeDate(firstValue(payload, ["started_at", "startedAt"])),
    ended_at: normalizeDate(firstValue(payload, ["ended_at", "endedAt"])),
    total_focus_seconds: Math.max(0, intValue(firstValue(payload, ["total_focus_seconds", "totalFocusTime"]), 0)),
    metrics_json: payload.metrics || payload.metrics_json || metrics
  };
}

async function mysqlCreateFocusSession(userId, payload = {}) {
  const row = rowFromPayload(userId, payload);
  const [existing] = await createPool().execute(
    "SELECT user_id FROM focus_sessions WHERE id = ? LIMIT 1",
    [row.id]
  );
  if (existing[0] && existing[0].user_id !== userId) {
    const error = new Error("Focus session id is not available.");
    error.status = 403;
    throw error;
  }
  await createPool().execute(
    `INSERT INTO focus_sessions (
      id, user_id, study_room_id, generated_content_id, material_id, material_title,
      study_goal, status, selected_scene, music_type, ambient_sound, pomodoro_minutes,
      started_at, ended_at, total_focus_seconds, metrics_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      study_room_id = VALUES(study_room_id),
      generated_content_id = VALUES(generated_content_id),
      material_id = VALUES(material_id),
      material_title = VALUES(material_title),
      study_goal = VALUES(study_goal),
      status = VALUES(status),
      selected_scene = VALUES(selected_scene),
      music_type = VALUES(music_type),
      ambient_sound = VALUES(ambient_sound),
      pomodoro_minutes = VALUES(pomodoro_minutes),
      started_at = VALUES(started_at),
      ended_at = VALUES(ended_at),
      total_focus_seconds = VALUES(total_focus_seconds),
      metrics_json = VALUES(metrics_json)`,
    [
      row.id,
      row.user_id,
      row.study_room_id,
      row.generated_content_id,
      row.material_id,
      row.material_title,
      row.study_goal,
      row.status,
      row.selected_scene,
      row.music_type,
      row.ambient_sound,
      row.pomodoro_minutes,
      row.started_at,
      row.ended_at,
      row.total_focus_seconds,
      jsonString(row.metrics_json, {})
    ]
  );
  return mysqlGetFocusSession(userId, row.id);
}

async function mysqlListFocusSessions(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const [rows] = await createPool().execute(
    `SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ${safeLimit}`,
    [userId]
  );
  return rows.map(mapFocusSession);
}

async function mysqlGetFocusSession(userId, sessionId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM focus_sessions WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(sessionId, 96)]
  );
  return rows[0] ? mapFocusSession(rows[0]) : null;
}

async function mysqlPatchFocusSession(userId, sessionId, patch = {}) {
  const current = await mysqlGetFocusSession(userId, sessionId);
  if (!current) return null;
  return mysqlCreateFocusSession(userId, { ...current.metrics, ...current, ...patch, id: current.id });
}

async function mysqlDeleteFocusSession(userId, sessionId) {
  const [result] = await createPool().execute(
    "DELETE FROM focus_sessions WHERE user_id = ? AND id = ?",
    [userId, cleanString(sessionId, 96)]
  );
  return result.affectedRows > 0;
}

async function supabaseExistingFocusSession(sessionId) {
  const payload = await supabaseRequest("GET", "focus_sessions", {
    query: {
      select: "id,user_id",
      id: `eq.${cleanString(sessionId, 96)}`,
      limit: 1
    }
  });
  return firstSupabaseRow(payload);
}

function supabaseFocusSessionRow(row = {}) {
  return {
    id: row.id,
    user_id: row.user_id,
    study_room_id: row.study_room_id,
    generated_content_id: row.generated_content_id,
    material_id: row.material_id,
    material_title: row.material_title,
    study_goal: row.study_goal,
    status: row.status,
    selected_scene: row.selected_scene,
    music_type: row.music_type,
    ambient_sound: row.ambient_sound,
    pomodoro_minutes: row.pomodoro_minutes,
    started_at: row.started_at,
    ended_at: row.ended_at,
    total_focus_seconds: row.total_focus_seconds,
    metrics_json: row.metrics_json
  };
}

async function supabaseCreateFocusSession(userId, payload = {}) {
  const row = rowFromPayload(userId, payload);
  const existing = await supabaseExistingFocusSession(row.id);
  if (existing && existing.user_id !== userId) {
    const error = new Error("Focus session id is not available.");
    error.status = 403;
    throw error;
  }
  const saved = await supabaseRequest("POST", "focus_sessions", {
    query: { on_conflict: "id" },
    body: [supabaseFocusSessionRow(row)],
    prefer: "resolution=merge-duplicates,return=representation"
  });
  const savedRow = firstSupabaseRow(saved);
  return savedRow ? mapFocusSession(savedRow) : supabaseGetFocusSession(userId, row.id);
}

async function supabaseListFocusSessions(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const rows = await supabaseRequest("GET", "focus_sessions", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc",
      limit: safeLimit
    }
  });
  return Array.isArray(rows) ? rows.map(mapFocusSession) : [];
}

async function supabaseGetFocusSession(userId, sessionId) {
  const rows = await supabaseRequest("GET", "focus_sessions", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(sessionId, 96)}`,
      limit: 1
    }
  });
  const row = firstSupabaseRow(rows);
  return row ? mapFocusSession(row) : null;
}

async function supabasePatchFocusSession(userId, sessionId, patch = {}) {
  const current = await supabaseGetFocusSession(userId, sessionId);
  if (!current) return null;
  return supabaseCreateFocusSession(userId, { ...current.metrics, ...current, ...patch, id: current.id });
}

async function supabaseDeleteFocusSession(userId, sessionId) {
  const rows = await supabaseRequest("DELETE", "focus_sessions", {
    query: {
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(sessionId, 96)}`
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

async function createFocusSession(userId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateFocusSession(userId, payload);
  const supabaseItem = await supabaseCreateFocusSession(userId, payload);
  await mirrorMysql(() => mysqlCreateFocusSession(userId, payload), "focus-session upsert");
  return supabaseItem;
}

async function listFocusSessions(userId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListFocusSessions(userId, limit);
    } catch (error) {
      console.warn(`[storage] Supabase focus-session list failed: ${error.message}`);
    }
  }
  return mysqlListFocusSessions(userId, limit);
}

async function getFocusSession(userId, sessionId) {
  if (supabaseStorageEnabled()) {
    try {
      const item = await supabaseGetFocusSession(userId, sessionId);
      if (item) return item;
    } catch (error) {
      console.warn(`[storage] Supabase focus-session get failed: ${error.message}`);
    }
  }
  return mysqlGetFocusSession(userId, sessionId);
}

async function patchFocusSession(userId, sessionId, patch = {}) {
  if (!supabaseStorageEnabled()) return mysqlPatchFocusSession(userId, sessionId, patch);
  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchFocusSession(userId, sessionId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase focus-session patch failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(() => mysqlPatchFocusSession(userId, sessionId, patch), "focus-session patch");
  return supabaseItem || mysqlItem || getFocusSession(userId, sessionId);
}

async function deleteFocusSession(userId, sessionId) {
  if (!supabaseStorageEnabled()) return mysqlDeleteFocusSession(userId, sessionId);
  let deleted = false;
  try {
    deleted = await supabaseDeleteFocusSession(userId, sessionId);
  } catch (error) {
    console.warn(`[storage] Supabase focus-session delete failed: ${error.message}`);
  }
  const mysqlDeleted = await mirrorMysql(() => mysqlDeleteFocusSession(userId, sessionId), "focus-session delete");
  return deleted || Boolean(mysqlDeleted);
}

export { createFocusSession, deleteFocusSession, getFocusSession, listFocusSessions, patchFocusSession };
