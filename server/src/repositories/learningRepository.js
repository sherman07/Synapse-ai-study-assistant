import { createPool } from "../db/pool.js";
import { firstSupabaseRow, supabaseRequest, supabaseStorageEnabled } from "../supabase/rest.js";
import { randomId } from "../utils/ids.js";
import { allowedValue, cleanString, intValue, jsonString, jsonValue, limitValue, nullableString } from "../utils/validators.js";

const LEARNING_INTENTIONS = ["hobby", "skill", "project", "assessment"];
const MESSAGE_ROLES = ["user", "assistant"];
const SUBJECT_STATUSES = ["active", "paused", "completed", "archived"];
const SESSION_STATUSES = ["active", "completed", "abandoned"];

function requiredString(value, field, limit = 240) {
  const cleaned = cleanString(value, limit);
  if (!cleaned) throw new Error(`${field} is required.`);
  return cleaned;
}

function normalizeSubject(input = {}, userId) {
  const intention = allowedValue(input.intention, LEARNING_INTENTIONS, "");
  if (!intention) throw new Error("Learning intention is invalid.");

  return {
    id: cleanString(input.id, 120) || randomId("subject"),
    userId: requiredString(userId, "User id", 120),
    title: requiredString(input.title, "Subject title"),
    intention,
    goal: cleanString(input.goal, 2000),
    status: allowedValue(input.status, SUBJECT_STATUSES, "active"),
    summary: cleanString(input.summary, 8000),
    currentSessionId: nullableString(input.currentSessionId || input.current_session_id, 120),
    currentUnitId: nullableString(input.currentUnitId || input.current_unit_id, 120),
  };
}

function normalizeMessage(input = {}) {
  const role = allowedValue(input.role, MESSAGE_ROLES, "");
  if (!role) throw new Error("Message role must be user or assistant.");

  return {
    id: cleanString(input.id, 120) || randomId("learning_message"),
    role,
    content: requiredString(input.content, "Message content", 12000),
    idempotencyKey: cleanString(input.idempotencyKey || input.idempotency_key, 120) || null,
    turnStatus: allowedValue(input.turnStatus || input.turn_status, ["complete", "pending", "failed"], "complete"),
    decision: input.decision || input.decision_json || {},
  };
}

function normalizeSession(input = {}, userId, subjectId) {
  return {
    id: cleanString(input.id, 120) || randomId("learning_session"),
    userId: requiredString(userId, "User id", 120),
    subjectId: requiredString(subjectId, "Subject id", 120),
    availableTimeMinutes: Math.max(0, Math.min(intValue(input.availableTimeMinutes || input.available_time_minutes, 0), 480)),
    activeObjective: cleanString(input.activeObjective || input.active_objective, 1000),
    status: allowedValue(input.status, SESSION_STATUSES, "active"),
    summary: cleanString(input.summary, 8000),
  };
}

function mapSubject(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title || "",
    intention: row.intention || "skill",
    goal: row.goal || "",
    status: row.status || "active",
    summary: row.summary || "",
    currentSessionId: row.current_session_id || null,
    currentUnitId: row.current_unit_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSession(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    availableTimeMinutes: Number(row.available_time_minutes || 0),
    activeObjective: row.active_objective || "",
    status: row.status || "active",
    summary: row.summary || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row = {}) {
  return {
    id: row.id,
    sessionId: row.session_id,
    sequence: Number(row.sequence_number || 0),
    role: row.role,
    content: row.content || "",
    turnStatus: row.turn_status || "complete",
    idempotencyKey: row.idempotency_key || null,
    decision: jsonValue(row.decision_json, {}),
    createdAt: row.created_at,
  };
}

function subjectRow(subject) {
  return {
    id: subject.id,
    user_id: subject.userId,
    title: subject.title,
    intention: subject.intention,
    goal: subject.goal || null,
    status: subject.status,
    summary: subject.summary || null,
    current_session_id: subject.currentSessionId,
    current_unit_id: subject.currentUnitId,
  };
}

function sessionRow(session) {
  return {
    id: session.id,
    user_id: session.userId,
    subject_id: session.subjectId,
    available_time_minutes: session.availableTimeMinutes,
    active_objective: session.activeObjective || null,
    status: session.status,
    summary: session.summary || null,
  };
}

async function mirrorMysql(operation, label) {
  try {
    return await operation();
  } catch (error) {
    console.warn(`[storage] MySQL ${label} mirror failed: ${error.message}`);
    return null;
  }
}

async function mysqlGetSubject(userId, subjectId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM learning_subjects WHERE user_id = ? AND id = ? LIMIT 1",
    [cleanString(userId, 120), cleanString(subjectId, 120)]
  );
  return rows[0] ? mapSubject(rows[0]) : null;
}

async function mysqlCreateSubject(userId, payload = {}) {
  const subject = normalizeSubject(payload, userId);
  const [existing] = await createPool().execute("SELECT user_id FROM learning_subjects WHERE id = ? LIMIT 1", [subject.id]);
  if (existing[0] && existing[0].user_id !== userId) {
    const error = new Error("Learning subject id is not available.");
    error.status = 403;
    throw error;
  }
  const row = subjectRow(subject);
  await createPool().execute(
    `INSERT INTO learning_subjects (id, user_id, title, intention, goal, status, summary, current_session_id, current_unit_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), intention = VALUES(intention), goal = VALUES(goal),
       status = VALUES(status), summary = VALUES(summary), current_session_id = VALUES(current_session_id),
       current_unit_id = VALUES(current_unit_id)`,
    [row.id, row.user_id, row.title, row.intention, row.goal, row.status, row.summary, row.current_session_id, row.current_unit_id]
  );
  return mysqlGetSubject(userId, subject.id);
}

async function mysqlListSubjects(userId, limit = 50) {
  const safeLimit = limitValue(limit, 50, 100);
  const [rows] = await createPool().execute(
    `SELECT * FROM learning_subjects WHERE user_id = ? ORDER BY updated_at DESC LIMIT ${safeLimit}`,
    [cleanString(userId, 120)]
  );
  return rows.map(mapSubject);
}

async function mysqlCreateSession(userId, subjectId, payload = {}) {
  if (!(await mysqlGetSubject(userId, subjectId))) return null;
  const session = normalizeSession(payload, userId, subjectId);
  const row = sessionRow(session);
  await createPool().execute(
    `INSERT INTO learning_sessions (id, user_id, subject_id, available_time_minutes, active_objective, status, summary)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE available_time_minutes = VALUES(available_time_minutes), active_objective = VALUES(active_objective),
       status = VALUES(status), summary = VALUES(summary)`,
    [row.id, row.user_id, row.subject_id, row.available_time_minutes, row.active_objective, row.status, row.summary]
  );
  await createPool().execute("UPDATE learning_subjects SET current_session_id = ? WHERE id = ? AND user_id = ?", [session.id, subjectId, userId]);
  const [rows] = await createPool().execute("SELECT * FROM learning_sessions WHERE id = ? AND user_id = ? LIMIT 1", [session.id, userId]);
  return rows[0] ? mapSession(rows[0]) : null;
}

async function mysqlListSessions(userId, subjectId, limit = 50) {
  if (!(await mysqlGetSubject(userId, subjectId))) return [];
  const safeLimit = limitValue(limit, 50, 100);
  const [rows] = await createPool().execute(
    `SELECT * FROM learning_sessions WHERE user_id = ? AND subject_id = ? ORDER BY updated_at DESC LIMIT ${safeLimit}`,
    [cleanString(userId, 120), cleanString(subjectId, 120)]
  );
  return rows.map(mapSession);
}

async function mysqlListMessages(userId, sessionId, limit = 100) {
  const safeLimit = limitValue(limit, 100, 200);
  const [rows] = await createPool().execute(
    `SELECT m.* FROM learning_messages m JOIN learning_sessions s ON s.id = m.session_id
     WHERE s.user_id = ? AND m.session_id = ? ORDER BY m.sequence_number ASC LIMIT ${safeLimit}`,
    [cleanString(userId, 120), cleanString(sessionId, 120)]
  );
  return rows.map(mapMessage);
}

async function mysqlAppendMessage(userId, sessionId, payload = {}) {
  const [sessions] = await createPool().execute("SELECT id FROM learning_sessions WHERE id = ? AND user_id = ? LIMIT 1", [sessionId, userId]);
  if (!sessions[0]) return null;
  const message = normalizeMessage(payload);
  if (message.idempotencyKey) {
    const [existing] = await createPool().execute(
      "SELECT * FROM learning_messages WHERE session_id = ? AND idempotency_key = ? LIMIT 1",
      [sessionId, message.idempotencyKey]
    );
    if (existing[0]) return mapMessage(existing[0]);
  }
  const [sequenceRows] = await createPool().execute("SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_sequence FROM learning_messages WHERE session_id = ?", [sessionId]);
  const sequence = Number(sequenceRows[0]?.next_sequence || 1);
  await createPool().execute(
    `INSERT INTO learning_messages (id, session_id, sequence_number, role, content, turn_status, idempotency_key, decision_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [message.id, sessionId, sequence, message.role, message.content, message.turnStatus, message.idempotencyKey, jsonString(message.decision, {})]
  );
  const [rows] = await createPool().execute("SELECT * FROM learning_messages WHERE id = ? LIMIT 1", [message.id]);
  return rows[0] ? mapMessage(rows[0]) : null;
}

async function supabaseGetSubject(userId, subjectId) {
  const rows = await supabaseRequest("GET", "learning_subjects", { query: { select: "*", user_id: `eq.${cleanString(userId, 120)}`, id: `eq.${cleanString(subjectId, 120)}`, limit: 1 } });
  const row = firstSupabaseRow(rows);
  return row ? mapSubject(row) : null;
}

async function supabaseCreateSubject(userId, payload = {}) {
  const subject = normalizeSubject(payload, userId);
  const existingRows = await supabaseRequest("GET", "learning_subjects", { query: { select: "id,user_id", id: `eq.${subject.id}`, limit: 1 } });
  const existing = firstSupabaseRow(existingRows);
  if (existing && existing.user_id !== userId) {
    const error = new Error("Learning subject id is not available.");
    error.status = 403;
    throw error;
  }
  const saved = await supabaseRequest("POST", "learning_subjects", { query: { on_conflict: "id" }, body: [subjectRow(subject)], prefer: "resolution=merge-duplicates,return=representation" });
  return mapSubject(firstSupabaseRow(saved) || subjectRow(subject));
}

async function supabaseListSubjects(userId, limit = 50) {
  const rows = await supabaseRequest("GET", "learning_subjects", { query: { select: "*", user_id: `eq.${cleanString(userId, 120)}`, order: "updated_at.desc", limit: limitValue(limit, 50, 100) } });
  return Array.isArray(rows) ? rows.map(mapSubject) : [];
}

async function supabaseCreateSession(userId, subjectId, payload = {}) {
  if (!(await supabaseGetSubject(userId, subjectId))) return null;
  const session = normalizeSession(payload, userId, subjectId);
  const saved = await supabaseRequest("POST", "learning_sessions", { query: { on_conflict: "id" }, body: [sessionRow(session)], prefer: "resolution=merge-duplicates,return=representation" });
  await supabaseRequest("PATCH", "learning_subjects", { query: { id: `eq.${subjectId}`, user_id: `eq.${userId}` }, body: { current_session_id: session.id }, prefer: "return=representation" });
  return mapSession(firstSupabaseRow(saved) || sessionRow(session));
}

async function supabaseListSessions(userId, subjectId, limit = 50) {
  if (!(await supabaseGetSubject(userId, subjectId))) return [];
  const rows = await supabaseRequest("GET", "learning_sessions", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 120)}`,
      subject_id: `eq.${cleanString(subjectId, 120)}`,
      order: "updated_at.desc",
      limit: limitValue(limit, 50, 100),
    },
  });
  return Array.isArray(rows) ? rows.map(mapSession) : [];
}

async function supabaseListMessages(userId, sessionId, limit = 100) {
  const sessionRows = await supabaseRequest("GET", "learning_sessions", { query: { select: "id", id: `eq.${cleanString(sessionId, 120)}`, user_id: `eq.${cleanString(userId, 120)}`, limit: 1 } });
  if (!firstSupabaseRow(sessionRows)) return [];
  const rows = await supabaseRequest("GET", "learning_messages", { query: { select: "*", session_id: `eq.${cleanString(sessionId, 120)}`, order: "sequence_number.asc", limit: limitValue(limit, 100, 200) } });
  return Array.isArray(rows) ? rows.map(mapMessage) : [];
}

async function supabaseAppendMessage(userId, sessionId, payload = {}) {
  const sessionRows = await supabaseRequest("GET", "learning_sessions", { query: { select: "id", id: `eq.${cleanString(sessionId, 120)}`, user_id: `eq.${cleanString(userId, 120)}`, limit: 1 } });
  if (!firstSupabaseRow(sessionRows)) return null;
  const message = normalizeMessage(payload);
  if (message.idempotencyKey) {
    const existingRows = await supabaseRequest("GET", "learning_messages", { query: { select: "*", session_id: `eq.${sessionId}`, idempotency_key: `eq.${message.idempotencyKey}`, limit: 1 } });
    const existing = firstSupabaseRow(existingRows);
    if (existing) return mapMessage(existing);
  }
  const messages = await supabaseListMessages(userId, sessionId, 200);
  const saved = await supabaseRequest("POST", "learning_messages", {
    body: [{ id: message.id, session_id: sessionId, sequence_number: messages.length + 1, role: message.role, content: message.content, turn_status: message.turnStatus, idempotency_key: message.idempotencyKey, decision_json: message.decision }],
    prefer: "return=representation"
  });
  return mapMessage(firstSupabaseRow(saved));
}

async function createLearningSubject(userId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateSubject(userId, payload);
  const item = await supabaseCreateSubject(userId, payload);
  await mirrorMysql(() => mysqlCreateSubject(userId, { ...payload, id: item.id }), "learning subject upsert");
  return item;
}

async function listLearningSubjects(userId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try { return await supabaseListSubjects(userId, limit); } catch (error) { console.warn(`[storage] Supabase learning subject list failed: ${error.message}`); }
  }
  return mysqlListSubjects(userId, limit);
}

async function createLearningSession(userId, subjectId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateSession(userId, subjectId, payload);
  const item = await supabaseCreateSession(userId, subjectId, payload);
  if (item) await mirrorMysql(() => mysqlCreateSession(userId, subjectId, { ...payload, id: item.id }), "learning session upsert");
  return item;
}

async function listLearningSessions(userId, subjectId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try { return await supabaseListSessions(userId, subjectId, limit); } catch (error) { console.warn(`[storage] Supabase learning session list failed: ${error.message}`); }
  }
  return mysqlListSessions(userId, subjectId, limit);
}

async function listLearningMessages(userId, sessionId, limit = 100) {
  if (supabaseStorageEnabled()) {
    try { return await supabaseListMessages(userId, sessionId, limit); } catch (error) { console.warn(`[storage] Supabase learning message list failed: ${error.message}`); }
  }
  return mysqlListMessages(userId, sessionId, limit);
}

async function appendLearningMessage(userId, sessionId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlAppendMessage(userId, sessionId, payload);
  const item = await supabaseAppendMessage(userId, sessionId, payload);
  if (item) await mirrorMysql(() => mysqlAppendMessage(userId, sessionId, { ...payload, id: item.id }), "learning message append");
  return item;
}

export {
  LEARNING_INTENTIONS,
  MESSAGE_ROLES,
  appendLearningMessage,
  createLearningSession,
  createLearningSubject,
  listLearningMessages,
  listLearningSessions,
  listLearningSubjects,
  normalizeMessage,
  normalizeSubject,
};
