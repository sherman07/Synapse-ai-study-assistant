import { createPool } from "../db/pool.js";
import { randomId, shortHash } from "../utils/ids.js";
import {
  boolValue,
  cleanString,
  firstValue,
  intValue,
  jsonString,
  jsonValue,
  limitValue,
  nullableString
} from "../utils/validators.js";

function generatedId(userId, sourceFingerprint) {
  return `content_${shortHash(`${userId}:${sourceFingerprint || randomId("source")}`)}`;
}

function resultFromPayload(payload = {}) {
  return payload.result && typeof payload.result === "object" ? payload.result : payload;
}

function mapGeneratedContent(row = {}, { includeFull = false } = {}) {
  const full = jsonValue(row.full_result_json, {});
  const item = includeFull && full && typeof full === "object" ? { ...full } : {};
  item.id = row.id;
  item.title = item.title || row.title || "Generated Study Notes";
  item.summary = item.summary || row.summary || "";
  item.language = item.language || row.language || "";
  item.output_language = item.output_language || row.language || "";
  item.detail_level = item.detail_level || row.detail_level || "";
  item.prompt_mode = item.prompt_mode || row.prompt_mode || "";
  item.source_count = item.source_count || row.source_count || 0;
  item.source_fingerprint = item.source_fingerprint || row.source_fingerprint || "";
  item.client_fingerprint = item.client_fingerprint || row.client_fingerprint || "";
  item.sections = item.sections || jsonValue(row.sections_json, {});
  item.connections = item.connections || jsonValue(row.connections_json, []);
  item.mind_map = item.mind_map || jsonValue(row.mind_map_json, {});
  item.visual_gallery = item.visual_gallery || jsonValue(row.visual_gallery_json, []);
  item.visuals = item.visuals || item.visual_gallery || [];
  item.sources = item.sources || jsonValue(row.sources_json, []);
  item.cached = Boolean(row.cached);
  item.created_at = row.created_at;
  item.updated_at = row.updated_at;
  item.database_record = {
    id: row.id,
    user_id: row.user_id,
    source_fingerprint: row.source_fingerprint,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
  return item;
}

function rowFromGeneratedResult(userId, payload = {}) {
  const result = resultFromPayload(payload);
  const sourceFingerprint = cleanString(
    firstValue(result, ["source_fingerprint", "sourceFingerprint"]) ||
    firstValue(payload, ["source_fingerprint", "sourceFingerprint", "client_fingerprint", "clientFingerprint"]),
    191
  ) || shortHash(jsonString({
    title: result.title,
    summary: result.summary,
    sources: result.sources
  }, {}), 64);
  const visualGallery = result.visual_gallery || result.visuals || result.visualGallery || [];
  return {
    id: generatedId(userId, sourceFingerprint),
    user_id: userId,
    source_fingerprint: sourceFingerprint,
    client_fingerprint: nullableString(firstValue(result, ["client_fingerprint", "clientFingerprint"]) || firstValue(payload, ["client_fingerprint", "clientFingerprint"]), 191),
    title: nullableString(result.title || payload.title || "Generated Study Notes", 500),
    summary: String(result.summary || payload.summary || ""),
    language: nullableString(result.output_language || result.language || payload.language, 80),
    detail_level: nullableString(result.generation_depth || result.detail_level || result.detailLevel, 80),
    prompt_mode: nullableString(result.prompt_mode || result.promptMode, 120),
    source_count: intValue(result.source_count || result.sourceCount || (Array.isArray(result.sources) ? result.sources.length : 0), 0),
    cached: boolValue(result.cached),
    sections_json: result.sections || {},
    connections_json: result.connections || [],
    mind_map_json: result.mind_map || result.mindMap || {},
    visual_gallery_json: visualGallery,
    sources_json: result.sources || [],
    full_result_json: result
  };
}

async function upsertGeneratedContent(userId, payload = {}) {
  const row = rowFromGeneratedResult(userId, payload);
  await createPool().execute(
    `INSERT INTO generated_contents (
      id, user_id, source_fingerprint, client_fingerprint, title, summary, language,
      detail_level, prompt_mode, source_count, cached, sections_json, connections_json,
      mind_map_json, visual_gallery_json, sources_json, full_result_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      client_fingerprint = VALUES(client_fingerprint),
      title = VALUES(title),
      summary = VALUES(summary),
      language = VALUES(language),
      detail_level = VALUES(detail_level),
      prompt_mode = VALUES(prompt_mode),
      source_count = VALUES(source_count),
      cached = VALUES(cached),
      sections_json = VALUES(sections_json),
      connections_json = VALUES(connections_json),
      mind_map_json = VALUES(mind_map_json),
      visual_gallery_json = VALUES(visual_gallery_json),
      sources_json = VALUES(sources_json),
      full_result_json = VALUES(full_result_json)`,
    [
      row.id,
      row.user_id,
      row.source_fingerprint,
      row.client_fingerprint,
      row.title,
      row.summary,
      row.language,
      row.detail_level,
      row.prompt_mode,
      row.source_count,
      row.cached ? 1 : 0,
      jsonString(row.sections_json, {}),
      jsonString(row.connections_json, []),
      jsonString(row.mind_map_json, {}),
      jsonString(row.visual_gallery_json, []),
      jsonString(row.sources_json, []),
      jsonString(row.full_result_json, {})
    ]
  );
  return getGeneratedContent(userId, row.id);
}

async function listGeneratedContent(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const [rows] = await createPool().execute(
    `SELECT id, user_id, source_fingerprint, client_fingerprint, title, summary, language,
      detail_level, prompt_mode, source_count, cached, sections_json, connections_json,
      mind_map_json, visual_gallery_json, sources_json, full_result_json, created_at, updated_at
    FROM generated_contents
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT ${safeLimit}`,
    [userId]
  );
  return rows.map(row => mapGeneratedContent(row));
}

async function getGeneratedContent(userId, contentId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM generated_contents WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(contentId, 96)]
  );
  return rows[0] ? mapGeneratedContent(rows[0], { includeFull: true }) : null;
}

async function patchGeneratedContent(userId, contentId, patch = {}) {
  const current = await getGeneratedContent(userId, contentId);
  if (!current) return null;
  return upsertGeneratedContent(userId, { ...current, ...patch, id: current.id });
}

async function deleteGeneratedContent(userId, contentId) {
  const [result] = await createPool().execute(
    "DELETE FROM generated_contents WHERE user_id = ? AND id = ?",
    [userId, cleanString(contentId, 96)]
  );
  return result.affectedRows > 0;
}

async function exportGeneratedContent(userId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM generated_contents WHERE user_id = ? ORDER BY updated_at DESC",
    [userId]
  );
  return rows.map(row => mapGeneratedContent(row, { includeFull: true }));
}

async function deleteGeneratedContentForUser(userId) {
  const [result] = await createPool().execute("DELETE FROM generated_contents WHERE user_id = ?", [userId]);
  return result.affectedRows || 0;
}

export {
  deleteGeneratedContent,
  deleteGeneratedContentForUser,
  exportGeneratedContent,
  getGeneratedContent,
  listGeneratedContent,
  mapGeneratedContent,
  patchGeneratedContent,
  upsertGeneratedContent
};
