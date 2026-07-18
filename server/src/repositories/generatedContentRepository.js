import { createPool } from "../db/pool.js";
import { firstSupabaseRow, supabaseRequest, supabaseStorageEnabled } from "../supabase/rest.js";
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

function mapGeneratedContent(row = {}, {
  includeFull = false,
  includeSections = true,
  includeRelated = true,
  includeSummary = true
} = {}) {
  const full = includeFull ? jsonValue(row.full_result_json, {}) : {};
  const item = includeFull && full && typeof full === "object" ? { ...full } : {};
  item.id = row.id;
  item.title = item.title || row.title || "Generated Study Notes";
  if (includeSummary) item.summary = item.summary || row.summary || "";
  item.language = item.language || row.language || "";
  item.output_language = item.output_language || row.language || "";
  item.detail_level = item.detail_level || row.detail_level || "";
  item.prompt_mode = item.prompt_mode || row.prompt_mode || "";
  item.source_count = item.source_count || row.source_count || 0;
  item.source_fingerprint = item.source_fingerprint || row.source_fingerprint || "";
  item.client_fingerprint = item.client_fingerprint || row.client_fingerprint || "";
  if (includeSections) item.sections = item.sections || jsonValue(row.sections_json, {});
  if (includeRelated) {
    item.connections = item.connections || jsonValue(row.connections_json, []);
    item.mind_map = item.mind_map || jsonValue(row.mind_map_json, {});
    item.visual_gallery = item.visual_gallery || jsonValue(row.visual_gallery_json, []);
    item.visuals = item.visuals || item.visual_gallery || [];
    item.sources = item.sources || jsonValue(row.sources_json, []);
  }
  item.cached = row.cached === undefined ? Boolean(item.cached) : Boolean(row.cached);
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
    id: cleanString(payload.id || result.id || generatedId(userId, sourceFingerprint), 96),
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

function supabaseGeneratedContentRow(row = {}) {
  return {
    id: row.id,
    user_id: row.user_id,
    source_fingerprint: row.source_fingerprint,
    client_fingerprint: row.client_fingerprint,
    title: row.title,
    summary: row.summary,
    language: row.language,
    detail_level: row.detail_level,
    prompt_mode: row.prompt_mode,
    source_count: row.source_count,
    cached: Boolean(row.cached),
    sections_json: row.sections_json,
    connections_json: row.connections_json,
    mind_map_json: row.mind_map_json,
    visual_gallery_json: row.visual_gallery_json,
    sources_json: row.sources_json,
    full_result_json: row.full_result_json
  };
}

async function mysqlUpsertGeneratedContent(userId, payload = {}) {
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
  return mysqlGetGeneratedContent(userId, row.id);
}

async function mysqlListGeneratedContent(userId, limit = 50, options = {}) {
  const safeLimit = limitValue(limit);
  const columns = options.includeSummary === false
    ? "id, user_id, source_fingerprint, client_fingerprint, title, language, detail_level, prompt_mode, source_count, cached, created_at, updated_at"
    : "id, user_id, source_fingerprint, client_fingerprint, title, summary, language, detail_level, prompt_mode, source_count, cached, sections_json, connections_json, mind_map_json, visual_gallery_json, sources_json, created_at, updated_at";
  const [rows] = await createPool().execute(
    `SELECT ${columns}
    FROM generated_contents
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT ${safeLimit}`,
    [userId]
  );
  return rows.map(row => mapGeneratedContent(row, options));
}

async function mysqlGetGeneratedContent(userId, contentId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM generated_contents WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(contentId, 96)]
  );
  return rows[0] ? mapGeneratedContent(rows[0], { includeFull: true }) : null;
}

async function mysqlPatchGeneratedContent(userId, contentId, patch = {}) {
  const current = await mysqlGetGeneratedContent(userId, contentId);
  if (!current) return null;
  return mysqlUpsertGeneratedContent(userId, { ...current, ...patch, id: current.id });
}

async function mysqlDeleteGeneratedContent(userId, contentId) {
  const [result] = await createPool().execute(
    "DELETE FROM generated_contents WHERE user_id = ? AND id = ?",
    [userId, cleanString(contentId, 96)]
  );
  return result.affectedRows > 0;
}

async function mysqlExportGeneratedContent(userId) {
  const [rows] = await createPool().execute(
    "SELECT * FROM generated_contents WHERE user_id = ? ORDER BY updated_at DESC",
    [userId]
  );
  return rows.map(row => mapGeneratedContent(row, { includeFull: true }));
}

async function mysqlDeleteGeneratedContentForUser(userId) {
  const [result] = await createPool().execute("DELETE FROM generated_contents WHERE user_id = ?", [userId]);
  return result.affectedRows || 0;
}

async function supabaseUpsertGeneratedContent(userId, payload = {}) {
  const row = rowFromGeneratedResult(userId, payload);
  const saved = await supabaseRequest("POST", "generated_contents", {
    query: { on_conflict: "user_id,source_fingerprint" },
    body: [supabaseGeneratedContentRow(row)],
    prefer: "resolution=merge-duplicates,return=representation"
  });
  const savedRow = firstSupabaseRow(saved);
  return savedRow ? mapGeneratedContent(savedRow, { includeFull: true }) : null;
}

async function supabaseListGeneratedContent(userId, limit = 50, options = {}) {
  const safeLimit = limitValue(limit);
  const select = options.includeSummary === false
    ? "id,user_id,source_fingerprint,client_fingerprint,title,language,detail_level,prompt_mode,source_count,cached,created_at,updated_at"
    : "*";
  const rows = await supabaseRequest("GET", "generated_contents", {
    query: {
      select,
      user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc",
      limit: safeLimit
    }
  });
  return Array.isArray(rows) ? rows.map(row => mapGeneratedContent(row, options)) : [];
}

function generatedContentSectionPage(item, page = 1, pageSize = 3) {
  const entries = Object.entries(item?.sections || {}).map(([title, markdown], index) => ({
    index,
    title,
    markdown: String(markdown || "")
  }));
  const safePage = Math.max(1, intValue(page, 1));
  const safePageSize = limitValue(pageSize, 3, 10);
  const totalSections = entries.length;
  const totalPages = Math.max(1, Math.ceil(totalSections / safePageSize));
  const start = (safePage - 1) * safePageSize;

  return {
    content_id: item.id,
    title: item.title,
    language: item.language,
    output_language: item.output_language,
    detail_level: item.detail_level,
    prompt_mode: item.prompt_mode,
    source_count: item.source_count,
    source_fingerprint: item.source_fingerprint,
    page: safePage,
    page_size: safePageSize,
    total_sections: totalSections,
    total_pages: totalPages,
    has_next: safePage < totalPages,
    items: entries.slice(start, start + safePageSize),
    ...(safePage === 1 ? {
      connections: item.connections || [],
      mind_map: item.mind_map || {},
      visual_gallery: item.visual_gallery || [],
      visuals: item.visuals || item.visual_gallery || [],
      sources: item.sources || []
    } : {})
  };
}

async function getGeneratedContentSections(userId, contentId, page = 1, pageSize = 3) {
  const item = await getGeneratedContent(userId, contentId);
  return item ? generatedContentSectionPage(item, page, pageSize) : null;
}

async function supabaseGetGeneratedContent(userId, contentId) {
  const rows = await supabaseRequest("GET", "generated_contents", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(contentId, 96)}`,
      limit: 1
    }
  });
  const row = firstSupabaseRow(rows);
  return row ? mapGeneratedContent(row, { includeFull: true }) : null;
}

async function supabasePatchGeneratedContent(userId, contentId, patch = {}) {
  const current = await supabaseGetGeneratedContent(userId, contentId);
  if (!current) return null;
  return supabaseUpsertGeneratedContent(userId, { ...current, ...patch, id: current.id });
}

async function supabaseDeleteGeneratedContent(userId, contentId) {
  const rows = await supabaseRequest("DELETE", "generated_contents", {
    query: {
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(contentId, 96)}`
    },
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows.length > 0 : Boolean(rows);
}

async function supabaseExportGeneratedContent(userId) {
  const rows = await supabaseRequest("GET", "generated_contents", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc"
    }
  });
  return Array.isArray(rows) ? rows.map(row => mapGeneratedContent(row, { includeFull: true })) : [];
}

async function supabaseDeleteGeneratedContentForUser(userId) {
  const rows = await supabaseRequest("DELETE", "generated_contents", {
    query: {
      user_id: `eq.${cleanString(userId, 80)}`
    },
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows.length : 0;
}

async function mirrorMysql(operation, label) {
  try {
    return await operation();
  } catch (error) {
    console.warn(`[storage] MySQL ${label} mirror failed: ${error.message}`);
    return null;
  }
}

async function upsertGeneratedContent(userId, payload = {}) {
  if (!supabaseStorageEnabled()) {
    return mysqlUpsertGeneratedContent(userId, payload);
  }

  let supabaseItem = null;
  let supabaseError = null;
  try {
    supabaseItem = await supabaseUpsertGeneratedContent(userId, payload);
  } catch (error) {
    supabaseError = error;
    console.warn(`[storage] Supabase generated-content upsert failed: ${error.message}`);
  }

  const mysqlItem = await mirrorMysql(
    () => mysqlUpsertGeneratedContent(userId, payload),
    "generated-content upsert"
  );
  if (supabaseItem) return supabaseItem;
  if (mysqlItem) return mysqlItem;
  throw supabaseError || new Error("Could not persist generated content.");
}

async function listGeneratedContent(userId, limit = 50, options = {}) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListGeneratedContent(userId, limit, options);
    } catch (error) {
      console.warn(`[storage] Supabase generated-content list failed: ${error.message}`);
    }
  }
  return mysqlListGeneratedContent(userId, limit, options);
}

async function getGeneratedContent(userId, contentId) {
  if (supabaseStorageEnabled()) {
    try {
      const item = await supabaseGetGeneratedContent(userId, contentId);
      if (item) return item;
    } catch (error) {
      console.warn(`[storage] Supabase generated-content get failed: ${error.message}`);
    }
  }
  return mysqlGetGeneratedContent(userId, contentId);
}

async function patchGeneratedContent(userId, contentId, patch = {}) {
  if (!supabaseStorageEnabled()) {
    return mysqlPatchGeneratedContent(userId, contentId, patch);
  }

  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchGeneratedContent(userId, contentId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase generated-content patch failed: ${error.message}`);
  }

  const mysqlItem = await mirrorMysql(
    () => mysqlPatchGeneratedContent(userId, contentId, patch),
    "generated-content patch"
  );
  return supabaseItem || mysqlItem || getGeneratedContent(userId, contentId);
}

async function deleteGeneratedContent(userId, contentId) {
  if (!supabaseStorageEnabled()) {
    return mysqlDeleteGeneratedContent(userId, contentId);
  }

  let deleted = false;
  try {
    deleted = await supabaseDeleteGeneratedContent(userId, contentId);
  } catch (error) {
    console.warn(`[storage] Supabase generated-content delete failed: ${error.message}`);
  }

  const mysqlDeleted = await mirrorMysql(
    () => mysqlDeleteGeneratedContent(userId, contentId),
    "generated-content delete"
  );
  return deleted || Boolean(mysqlDeleted);
}

async function exportGeneratedContent(userId) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseExportGeneratedContent(userId);
    } catch (error) {
      console.warn(`[storage] Supabase generated-content export failed: ${error.message}`);
    }
  }
  return mysqlExportGeneratedContent(userId);
}

async function deleteGeneratedContentForUser(userId) {
  if (!supabaseStorageEnabled()) {
    return mysqlDeleteGeneratedContentForUser(userId);
  }

  let deletedCount = 0;
  try {
    deletedCount = await supabaseDeleteGeneratedContentForUser(userId);
  } catch (error) {
    console.warn(`[storage] Supabase generated-content delete-user failed: ${error.message}`);
  }

  const mysqlDeleted = await mirrorMysql(
    () => mysqlDeleteGeneratedContentForUser(userId),
    "generated-content delete-user"
  );
  return deletedCount || Number(mysqlDeleted || 0);
}

export {
  deleteGeneratedContent,
  deleteGeneratedContentForUser,
  exportGeneratedContent,
  generatedContentSectionPage,
  getGeneratedContentSections,
  getGeneratedContent,
  listGeneratedContent,
  mapGeneratedContent,
  patchGeneratedContent,
  upsertGeneratedContent
};
