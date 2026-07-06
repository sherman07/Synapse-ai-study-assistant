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

const BROADCAST_SCRIPT_MODEL = process.env.BROADCAST_SCRIPT_MODEL || "gpt-5.4-mini";
const BROADCAST_TTS_PROVIDER = process.env.BROADCAST_TTS_PROVIDER || "openai";
const BROADCAST_TTS_MODEL = process.env.BROADCAST_TTS_MODEL || "gpt-4o-mini-tts";

const BROADCAST_STATUSES = new Set([
  "queued",
  "extracting_source",
  "planning",
  "scripting",
  "validating",
  "generating_audio",
  "building_audio",
  "completed",
  "failed",
  "cancelled"
]);

function normaliseStatus(value, fallback = "queued") {
  const status = cleanString(value, 80).toLowerCase();
  return BROADCAST_STATUSES.has(status) ? status : fallback;
}

function mapBroadcastJob(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    sourceId: row.source_id || "",
    noteId: row.note_id || "",
    sourceFingerprint: row.source_fingerprint || "",
    title: row.title || "AI Broadcast",
    status: normaliseStatus(row.status),
    style: row.style || "calm_study_narrator",
    lengthMinutes: row.length_minutes || 5,
    customLengthMinutes: row.custom_length_minutes || null,
    voiceFormat: row.voice_format || "two_ai_hosts",
    depth: row.depth || "standard",
    language: row.language || "auto",
    progressMessage: row.progress_message || "Queued",
    progressPercent: row.progress_percent || 0,
    scriptModel: row.script_model || BROADCAST_SCRIPT_MODEL,
    ttsProvider: row.tts_provider || BROADCAST_TTS_PROVIDER,
    ttsModel: row.tts_model || BROADCAST_TTS_MODEL,
    plan: jsonValue(row.plan_json, {}),
    script: jsonValue(row.script_json, {}),
    validation: jsonValue(row.validation_json, {}),
    transcript: jsonValue(row.transcript_json, []),
    chapters: jsonValue(row.chapters_json, []),
    keyIdeas: jsonValue(row.key_ideas_json, []),
    sourceReferences: jsonValue(row.source_references_json, []),
    audioUrl: row.audio_url || "",
    audioMetadata: jsonValue(row.audio_metadata_json, {}),
    errorMessage: row.error_message || "",
    cancelledAt: row.cancelled_at || "",
    completedAt: row.completed_at || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowFromPayload(userId, payload = {}, existing = {}) {
  const style = allowedValue(firstValue(payload, ["style", "broadcastStyle"]), [
    "study_podcast",
    "exam_revision",
    "deep_explanation",
    "quick_recap",
    "debate_two_perspectives",
    "interview_style",
    "calm_study_narrator",
    "exam_preparation_coach",
    "natural_podcast_style",
    "deep_explanation_mode",
    "quick_revision_mode"
  ], existing.style || "calm_study_narrator");
  const voiceFormat = allowedValue(firstValue(payload, ["voice_format", "voiceFormat"]), [
    "single_narrator",
    "two_ai_hosts",
    "host_student",
    "teacher_student"
  ], existing.voice_format || "two_ai_hosts");
  const depth = allowedValue(payload.depth, [
    "simple",
    "standard",
    "advanced",
    "exam_focused"
  ], existing.depth || "standard");
  const language = allowedValue(payload.language, [
    "auto",
    "english",
    "chinese",
    "bilingual"
  ], existing.language || "auto");
  const lengthMinutes = Math.max(1, Math.min(60, intValue(firstValue(payload, ["length_minutes", "lengthMinutes"]), existing.length_minutes || 5)));
  const progressPercent = Math.max(0, Math.min(100, intValue(firstValue(payload, ["progress_percent", "progressPercent"]), existing.progress_percent || 0)));

  return {
    id: cleanString(payload.id || existing.id, 96) || randomId("broadcast"),
    user_id: userId,
    source_id: nullableString(firstValue(payload, ["source_id", "sourceId"]), 96) || existing.source_id || null,
    note_id: nullableString(firstValue(payload, ["note_id", "noteId", "generatedContentId"]), 96) || existing.note_id || null,
    source_fingerprint: nullableString(firstValue(payload, ["source_fingerprint", "sourceFingerprint"]), 191) || existing.source_fingerprint || null,
    title: cleanString(payload.title || existing.title || "AI Broadcast", 500) || "AI Broadcast",
    status: normaliseStatus(payload.status, existing.status || "queued"),
    style,
    length_minutes: lengthMinutes,
    custom_length_minutes: firstValue(payload, ["custom_length_minutes", "customLengthMinutes"]) ? intValue(firstValue(payload, ["custom_length_minutes", "customLengthMinutes"]), lengthMinutes) : existing.custom_length_minutes || null,
    voice_format: voiceFormat,
    depth,
    language,
    progress_message: cleanString(firstValue(payload, ["progress_message", "progressMessage"], existing.progress_message || "Queued"), 500),
    progress_percent: progressPercent,
    script_model: cleanString(firstValue(payload, ["script_model", "scriptModel"], existing.script_model || BROADCAST_SCRIPT_MODEL), 120) || BROADCAST_SCRIPT_MODEL,
    tts_provider: cleanString(firstValue(payload, ["tts_provider", "ttsProvider"], existing.tts_provider || BROADCAST_TTS_PROVIDER), 80) || BROADCAST_TTS_PROVIDER,
    tts_model: cleanString(firstValue(payload, ["tts_model", "ttsModel"], existing.tts_model || BROADCAST_TTS_MODEL), 120) || BROADCAST_TTS_MODEL,
    plan_json: firstValue(payload, ["plan_json", "plan"], existing.plan_json || {}),
    script_json: firstValue(payload, ["script_json", "script"], existing.script_json || {}),
    validation_json: firstValue(payload, ["validation_json", "validation"], existing.validation_json || {}),
    transcript_json: firstValue(payload, ["transcript_json", "transcript"], existing.transcript_json || []),
    chapters_json: firstValue(payload, ["chapters_json", "chapters"], existing.chapters_json || []),
    key_ideas_json: firstValue(payload, ["key_ideas_json", "keyIdeas"], existing.key_ideas_json || []),
    source_references_json: firstValue(payload, ["source_references_json", "sourceReferences"], existing.source_references_json || []),
    audio_url: nullableString(firstValue(payload, ["audio_url", "audioUrl"]), 1000) || existing.audio_url || null,
    audio_metadata_json: firstValue(payload, ["audio_metadata_json", "audioMetadata"], existing.audio_metadata_json || {}),
    error_message: nullableString(firstValue(payload, ["error_message", "errorMessage"]), 2000) || existing.error_message || null,
    cancelled_at: payload.cancelled_at || payload.cancelledAt || existing.cancelled_at || null,
    completed_at: payload.completed_at || payload.completedAt || existing.completed_at || null
  };
}

async function mysqlUpsertBroadcastJob(userId, payload = {}, existing = {}) {
  const row = rowFromPayload(userId, payload, existing);
  await createPool().execute(
    `INSERT INTO broadcast_jobs (
      id, user_id, source_id, note_id, source_fingerprint, title, status, style,
      length_minutes, custom_length_minutes, voice_format, depth, language,
      progress_message, progress_percent, script_model, tts_provider, tts_model,
      plan_json, script_json, validation_json, transcript_json, chapters_json,
      key_ideas_json, source_references_json, audio_url, audio_metadata_json,
      error_message, cancelled_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      source_id = VALUES(source_id),
      note_id = VALUES(note_id),
      source_fingerprint = VALUES(source_fingerprint),
      title = VALUES(title),
      status = VALUES(status),
      style = VALUES(style),
      length_minutes = VALUES(length_minutes),
      custom_length_minutes = VALUES(custom_length_minutes),
      voice_format = VALUES(voice_format),
      depth = VALUES(depth),
      language = VALUES(language),
      progress_message = VALUES(progress_message),
      progress_percent = VALUES(progress_percent),
      script_model = VALUES(script_model),
      tts_provider = VALUES(tts_provider),
      tts_model = VALUES(tts_model),
      plan_json = VALUES(plan_json),
      script_json = VALUES(script_json),
      validation_json = VALUES(validation_json),
      transcript_json = VALUES(transcript_json),
      chapters_json = VALUES(chapters_json),
      key_ideas_json = VALUES(key_ideas_json),
      source_references_json = VALUES(source_references_json),
      audio_url = VALUES(audio_url),
      audio_metadata_json = VALUES(audio_metadata_json),
      error_message = VALUES(error_message),
      cancelled_at = VALUES(cancelled_at),
      completed_at = VALUES(completed_at)`,
    [
      row.id,
      row.user_id,
      row.source_id,
      row.note_id,
      row.source_fingerprint,
      row.title,
      row.status,
      row.style,
      row.length_minutes,
      row.custom_length_minutes,
      row.voice_format,
      row.depth,
      row.language,
      row.progress_message,
      row.progress_percent,
      row.script_model,
      row.tts_provider,
      row.tts_model,
      jsonString(row.plan_json, {}),
      jsonString(row.script_json, {}),
      jsonString(row.validation_json, {}),
      jsonString(row.transcript_json, []),
      jsonString(row.chapters_json, []),
      jsonString(row.key_ideas_json, []),
      jsonString(row.source_references_json, []),
      row.audio_url,
      jsonString(row.audio_metadata_json, {}),
      row.error_message,
      row.cancelled_at,
      row.completed_at
    ]
  );
  return mysqlGetBroadcastJob(userId, row.id);
}

async function mysqlListBroadcastJobs(userId, limit = 50) {
  const safeLimit = limitValue(limit, 50, 100);
  const [rows] = await createPool().execute(
    `SELECT * FROM broadcast_jobs WHERE user_id = ? ORDER BY updated_at DESC LIMIT ${safeLimit}`,
    [userId]
  );
  return rows.map(mapBroadcastJob);
}

async function mysqlGetBroadcastJob(userId, jobId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM broadcast_jobs WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(jobId, 96)]
  );
  return rows[0] ? mapBroadcastJob(rows[0]) : null;
}

async function mysqlPatchBroadcastJob(userId, jobId, patch = {}) {
  const current = await mysqlGetBroadcastJob(userId, jobId);
  if (!current) return null;
  return mysqlUpsertBroadcastJob(userId, { ...current, ...patch, id: current.id }, {
    id: current.id,
    status: current.status,
    title: current.title
  });
}

async function mysqlDeleteBroadcastJob(userId, jobId) {
  const [result] = await createPool().execute(
    "DELETE FROM broadcast_jobs WHERE user_id = ? AND id = ?",
    [userId, cleanString(jobId, 96)]
  );
  return result.affectedRows > 0;
}

function supabaseBroadcastRow(row = {}) {
  return {
    id: row.id,
    user_id: row.user_id,
    source_id: row.source_id,
    note_id: row.note_id,
    source_fingerprint: row.source_fingerprint,
    title: row.title,
    status: row.status,
    style: row.style,
    length_minutes: row.length_minutes,
    custom_length_minutes: row.custom_length_minutes,
    voice_format: row.voice_format,
    depth: row.depth,
    language: row.language,
    progress_message: row.progress_message,
    progress_percent: row.progress_percent,
    script_model: row.script_model,
    tts_provider: row.tts_provider,
    tts_model: row.tts_model,
    plan_json: row.plan_json,
    script_json: row.script_json,
    validation_json: row.validation_json,
    transcript_json: row.transcript_json,
    chapters_json: row.chapters_json,
    key_ideas_json: row.key_ideas_json,
    source_references_json: row.source_references_json,
    audio_url: row.audio_url,
    audio_metadata_json: row.audio_metadata_json,
    error_message: row.error_message,
    cancelled_at: row.cancelled_at,
    completed_at: row.completed_at
  };
}

async function supabaseUpsertBroadcastJob(userId, payload = {}, existing = {}) {
  const row = rowFromPayload(userId, payload, existing);
  const saved = await supabaseRequest("POST", "broadcast_jobs", {
    query: { on_conflict: "id" },
    body: [supabaseBroadcastRow(row)],
    prefer: "resolution=merge-duplicates,return=representation"
  });
  const savedRow = firstSupabaseRow(saved);
  return savedRow ? mapBroadcastJob(savedRow) : null;
}

async function supabaseListBroadcastJobs(userId, limit = 50) {
  const rows = await supabaseRequest("GET", "broadcast_jobs", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc",
      limit: limitValue(limit, 50, 100)
    }
  });
  return Array.isArray(rows) ? rows.map(mapBroadcastJob) : [];
}

async function supabaseGetBroadcastJob(userId, jobId) {
  const rows = await supabaseRequest("GET", "broadcast_jobs", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(jobId, 96)}`,
      limit: 1
    }
  });
  const row = firstSupabaseRow(rows);
  return row ? mapBroadcastJob(row) : null;
}

async function supabasePatchBroadcastJob(userId, jobId, patch = {}) {
  const current = await supabaseGetBroadcastJob(userId, jobId);
  if (!current) return null;
  return supabaseUpsertBroadcastJob(userId, { ...current, ...patch, id: current.id });
}

async function supabaseDeleteBroadcastJob(userId, jobId) {
  const rows = await supabaseRequest("DELETE", "broadcast_jobs", {
    query: {
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(jobId, 96)}`
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

async function createBroadcastJob(userId, payload = {}) {
  const initialPayload = {
    status: "queued",
    progressMessage: "Queued for AI Broadcast studio generation",
    progressPercent: 4,
    ...payload
  };
  if (!supabaseStorageEnabled()) return mysqlUpsertBroadcastJob(userId, initialPayload);

  let supabaseItem = null;
  let supabaseError = null;
  try {
    supabaseItem = await supabaseUpsertBroadcastJob(userId, initialPayload);
  } catch (error) {
    supabaseError = error;
    console.warn(`[storage] Supabase broadcast job create failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(
    () => mysqlUpsertBroadcastJob(userId, initialPayload),
    "broadcast job create"
  );
  if (supabaseItem) return supabaseItem;
  if (mysqlItem) return mysqlItem;
  throw supabaseError || new Error("Could not persist broadcast job.");
}

async function listBroadcastJobs(userId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListBroadcastJobs(userId, limit);
    } catch (error) {
      console.warn(`[storage] Supabase broadcast job list failed: ${error.message}`);
    }
  }
  return mysqlListBroadcastJobs(userId, limit);
}

async function getBroadcastJob(userId, jobId) {
  if (supabaseStorageEnabled()) {
    try {
      const item = await supabaseGetBroadcastJob(userId, jobId);
      if (item) return item;
    } catch (error) {
      console.warn(`[storage] Supabase broadcast job get failed: ${error.message}`);
    }
  }
  return mysqlGetBroadcastJob(userId, jobId);
}

async function patchBroadcastJob(userId, jobId, patch = {}) {
  if (!supabaseStorageEnabled()) return mysqlPatchBroadcastJob(userId, jobId, patch);

  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchBroadcastJob(userId, jobId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase broadcast job patch failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(
    () => mysqlPatchBroadcastJob(userId, jobId, patch),
    "broadcast job patch"
  );
  return supabaseItem || mysqlItem || getBroadcastJob(userId, jobId);
}

async function cancelBroadcastJob(userId, jobId) {
  return patchBroadcastJob(userId, jobId, {
    status: "cancelled",
    progressMessage: "Broadcast generation cancelled",
    cancelledAt: new Date().toISOString()
  });
}

async function retryBroadcastJob(userId, jobId) {
  return patchBroadcastJob(userId, jobId, {
    status: "queued",
    progressMessage: "Queued for retry",
    progressPercent: 4,
    errorMessage: "",
    cancelledAt: null,
    completedAt: null
  });
}

async function deleteBroadcastJob(userId, jobId) {
  if (!supabaseStorageEnabled()) return mysqlDeleteBroadcastJob(userId, jobId);

  let deleted = false;
  try {
    deleted = await supabaseDeleteBroadcastJob(userId, jobId);
  } catch (error) {
    console.warn(`[storage] Supabase broadcast job delete failed: ${error.message}`);
  }
  const mysqlDeleted = await mirrorMysql(
    () => mysqlDeleteBroadcastJob(userId, jobId),
    "broadcast job delete"
  );
  return deleted || Boolean(mysqlDeleted);
}

export {
  BROADCAST_SCRIPT_MODEL,
  BROADCAST_STATUSES,
  BROADCAST_TTS_MODEL,
  BROADCAST_TTS_PROVIDER,
  cancelBroadcastJob,
  createBroadcastJob,
  deleteBroadcastJob,
  getBroadcastJob,
  listBroadcastJobs,
  mapBroadcastJob,
  patchBroadcastJob,
  retryBroadcastJob
};
