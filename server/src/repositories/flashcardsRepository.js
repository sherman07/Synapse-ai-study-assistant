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

function mapDeck(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    generatedContentId: row.generated_content_id || "",
    studyRoomId: row.study_room_id || "",
    title: row.title || "Flashcards",
    language: row.language || "",
    settings: jsonValue(row.settings_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCard(row = {}) {
  return {
    id: row.id,
    deckId: row.deck_id,
    front: row.front || "",
    back: row.back || "",
    hint: row.hint || "",
    sourceReference: row.source_reference || "",
    difficulty: row.difficulty || "",
    tags: jsonValue(row.tags_json, []),
    cardOrder: row.card_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function mysqlCreateDeck(userId, payload = {}) {
  const id = cleanString(payload.id, 96) || randomId("deck");
  if (payload.id) {
    const [existing] = await createPool().execute(
      "SELECT user_id FROM flashcard_decks WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing[0] && existing[0].user_id !== userId) {
      const error = new Error("Flashcard deck id is not available.");
      error.status = 403;
      throw error;
    }
  }
  await createPool().execute(
    `INSERT INTO flashcard_decks (id, user_id, generated_content_id, study_room_id, title, language, settings_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      generated_content_id = VALUES(generated_content_id),
      study_room_id = VALUES(study_room_id),
      title = VALUES(title),
      language = VALUES(language),
      settings_json = VALUES(settings_json)`,
    [
      id,
      userId,
      nullableString(firstValue(payload, ["generated_content_id", "generatedContentId"]), 96),
      nullableString(firstValue(payload, ["study_room_id", "studyRoomId"]), 96),
      cleanString(payload.title || "Flashcards", 500) || "Flashcards",
      nullableString(payload.language || payload.preferred_language, 80),
      jsonString(payload.settings || payload.settings_json || {}, {})
    ]
  );
  if (Array.isArray(payload.cards)) {
    for (let index = 0; index < payload.cards.length; index += 1) {
      await mysqlCreateCard(userId, { ...payload.cards[index], deckId: id, cardOrder: index });
    }
  }
  return mysqlGetDeck(userId, id, { includeCards: true });
}

async function mysqlListDecks(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const [rows] = await createPool().execute(
    `SELECT * FROM flashcard_decks WHERE user_id = ? ORDER BY updated_at DESC LIMIT ${safeLimit}`,
    [userId]
  );
  return rows.map(mapDeck);
}

async function mysqlGetDeck(userId, deckId, { includeCards = false } = {}) {
  const [rows] = await createPool().execute(
    "SELECT * FROM flashcard_decks WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(deckId, 96)]
  );
  if (!rows[0]) return null;
  const deck = mapDeck(rows[0]);
  if (includeCards) {
    deck.cards = await mysqlListCards(userId, deck.id, 500);
  }
  return deck;
}

async function mysqlPatchDeck(userId, deckId, patch = {}) {
  const current = await mysqlGetDeck(userId, deckId);
  if (!current) return null;
  return mysqlCreateDeck(userId, { ...current.settings, ...current, ...patch, id: current.id });
}

async function mysqlDeleteDeck(userId, deckId) {
  const [result] = await createPool().execute(
    "DELETE FROM flashcard_decks WHERE user_id = ? AND id = ?",
    [userId, cleanString(deckId, 96)]
  );
  return result.affectedRows > 0;
}

async function mysqlUserOwnsDeck(userId, deckId) {
  const [rows] = await createPool().execute(
    "SELECT id FROM flashcard_decks WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(deckId, 96)]
  );
  return Boolean(rows[0]);
}

async function mysqlCreateCard(userId, payload = {}) {
  const deckId = cleanString(firstValue(payload, ["deck_id", "deckId"]), 96);
  if (!deckId || !(await mysqlUserOwnsDeck(userId, deckId))) return null;
  const id = cleanString(payload.id, 96) || randomId("card");
  const values = [
    cleanString(payload.front || payload.term || payload.question, 8000),
    cleanString(payload.back || payload.answer || payload.definition, 8000),
    nullableString(payload.hint, 2000),
    nullableString(firstValue(payload, ["source_reference", "sourceReference"]), 4000),
    payload.difficulty ? allowedValue(payload.difficulty, ["easy", "medium", "hard"], "medium") : null,
    jsonString(payload.tags || payload.tags_json || [], []),
    intValue(firstValue(payload, ["card_order", "cardOrder"]), 0)
  ];
  const [existing] = await createPool().execute(
    `SELECT c.deck_id, d.user_id FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE c.id = ?
     LIMIT 1`,
    [id]
  );
  if (existing[0] && existing[0].user_id !== userId) {
    const error = new Error("Flashcard id is not available.");
    error.status = 403;
    throw error;
  }
  if (existing[0]) {
    await createPool().execute(
      `UPDATE flashcards
       SET deck_id = ?, front = ?, back = ?, hint = ?, source_reference = ?,
           difficulty = ?, tags_json = ?, card_order = ?
       WHERE id = ?`,
      [deckId, ...values, id]
    );
    return mysqlGetCard(userId, id);
  }
  await createPool().execute(
    `INSERT INTO flashcards (id, deck_id, front, back, hint, source_reference, difficulty, tags_json, card_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [id, deckId, ...values]
  );
  return mysqlGetCard(userId, id);
}

async function mysqlListCards(userId, deckId = "", limit = 200) {
  const safeLimit = limitValue(limit, 200, 500);
  const params = [userId];
  let where = "d.user_id = ?";
  if (deckId) {
    where += " AND c.deck_id = ?";
    params.push(cleanString(deckId, 96));
  }
  const [rows] = await createPool().execute(
    `SELECT c.* FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE ${where}
     ORDER BY c.card_order ASC, c.created_at ASC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map(mapCard);
}

async function mysqlGetCard(userId, cardId) {
  const [rows] = await createPool().execute(
    `SELECT c.* FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE d.user_id = ? AND c.id = ?
     LIMIT 1`,
    [userId, cleanString(cardId, 96)]
  );
  return rows[0] ? mapCard(rows[0]) : null;
}

async function mysqlPatchCard(userId, cardId, patch = {}) {
  const current = await mysqlGetCard(userId, cardId);
  if (!current) return null;
  return mysqlCreateCard(userId, { ...current, ...patch, id: current.id, deckId: current.deckId });
}

async function mysqlDeleteCard(userId, cardId) {
  const [result] = await createPool().execute(
    `DELETE c FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE d.user_id = ? AND c.id = ?`,
    [userId, cleanString(cardId, 96)]
  );
  return result.affectedRows > 0;
}

function supabaseDeckRow(userId, payload = {}, id = "") {
  return {
    id,
    user_id: userId,
    generated_content_id: nullableString(firstValue(payload, ["generated_content_id", "generatedContentId"]), 96),
    study_room_id: nullableString(firstValue(payload, ["study_room_id", "studyRoomId"]), 96),
    title: cleanString(payload.title || "Flashcards", 500) || "Flashcards",
    language: nullableString(payload.language || payload.preferred_language, 80),
    settings_json: payload.settings || payload.settings_json || {}
  };
}

function supabaseCardRow(payload = {}, id = "", deckId = "") {
  return {
    id,
    deck_id: deckId,
    front: cleanString(payload.front || payload.term || payload.question, 8000),
    back: cleanString(payload.back || payload.answer || payload.definition, 8000),
    hint: nullableString(payload.hint, 2000),
    source_reference: nullableString(firstValue(payload, ["source_reference", "sourceReference"]), 4000),
    difficulty: payload.difficulty ? allowedValue(payload.difficulty, ["easy", "medium", "hard"], "medium") : null,
    tags_json: payload.tags || payload.tags_json || [],
    card_order: intValue(firstValue(payload, ["card_order", "cardOrder"]), 0)
  };
}

async function supabaseDeckRowById(deckId) {
  const rows = await supabaseRequest("GET", "flashcard_decks", {
    query: {
      select: "*",
      id: `eq.${cleanString(deckId, 96)}`,
      limit: 1
    }
  });
  return firstSupabaseRow(rows);
}

async function supabaseUserOwnsDeck(userId, deckId) {
  const row = await supabaseDeckRowById(deckId);
  return Boolean(row && row.user_id === userId);
}

async function supabaseCreateDeck(userId, payload = {}) {
  const id = cleanString(payload.id, 96) || randomId("deck");
  const existing = payload.id ? await supabaseDeckRowById(id) : null;
  if (existing && existing.user_id !== userId) {
    const error = new Error("Flashcard deck id is not available.");
    error.status = 403;
    throw error;
  }
  const saved = await supabaseRequest("POST", "flashcard_decks", {
    query: { on_conflict: "id" },
    body: [supabaseDeckRow(userId, payload, id)],
    prefer: "resolution=merge-duplicates,return=representation"
  });
  if (Array.isArray(payload.cards)) {
    for (let index = 0; index < payload.cards.length; index += 1) {
      await supabaseCreateCard(userId, { ...payload.cards[index], deckId: id, cardOrder: index });
    }
  }
  const savedRow = firstSupabaseRow(saved);
  if (!savedRow) return supabaseGetDeck(userId, id, { includeCards: true });
  const deck = mapDeck(savedRow);
  deck.cards = await supabaseListCards(userId, id, 500);
  return deck;
}

async function supabaseListDecks(userId, limit = 50) {
  const safeLimit = limitValue(limit);
  const rows = await supabaseRequest("GET", "flashcard_decks", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      order: "updated_at.desc",
      limit: safeLimit
    }
  });
  return Array.isArray(rows) ? rows.map(mapDeck) : [];
}

async function supabaseGetDeck(userId, deckId, { includeCards = false } = {}) {
  const rows = await supabaseRequest("GET", "flashcard_decks", {
    query: {
      select: "*",
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(deckId, 96)}`,
      limit: 1
    }
  });
  const row = firstSupabaseRow(rows);
  if (!row) return null;
  const deck = mapDeck(row);
  if (includeCards) deck.cards = await supabaseListCards(userId, deck.id, 500);
  return deck;
}

async function supabasePatchDeck(userId, deckId, patch = {}) {
  const current = await supabaseGetDeck(userId, deckId);
  if (!current) return null;
  return supabaseCreateDeck(userId, { ...current.settings, ...current, ...patch, id: current.id });
}

async function supabaseDeleteDeck(userId, deckId) {
  const rows = await supabaseRequest("DELETE", "flashcard_decks", {
    query: {
      user_id: `eq.${cleanString(userId, 80)}`,
      id: `eq.${cleanString(deckId, 96)}`
    },
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows.length > 0 : Boolean(rows);
}

async function supabaseCardRowById(cardId) {
  const rows = await supabaseRequest("GET", "flashcards", {
    query: {
      select: "*",
      id: `eq.${cleanString(cardId, 96)}`,
      limit: 1
    }
  });
  return firstSupabaseRow(rows);
}

async function supabaseCreateCard(userId, payload = {}) {
  const deckId = cleanString(firstValue(payload, ["deck_id", "deckId"]), 96);
  if (!deckId || !(await supabaseUserOwnsDeck(userId, deckId))) return null;
  const id = cleanString(payload.id, 96) || randomId("card");
  const existing = await supabaseCardRowById(id);
  if (existing) {
    const existingDeck = await supabaseDeckRowById(existing.deck_id);
    if (!existingDeck || existingDeck.user_id !== userId) {
      const error = new Error("Flashcard id is not available.");
      error.status = 403;
      throw error;
    }
  }
  const saved = await supabaseRequest("POST", "flashcards", {
    query: { on_conflict: "id" },
    body: [supabaseCardRow(payload, id, deckId)],
    prefer: "resolution=merge-duplicates,return=representation"
  });
  const savedRow = firstSupabaseRow(saved);
  return savedRow ? mapCard(savedRow) : supabaseGetCard(userId, id);
}

async function supabaseDeckIdsForUser(userId, deckId = "") {
  if (deckId) return (await supabaseUserOwnsDeck(userId, deckId)) ? [cleanString(deckId, 96)] : [];
  const decks = await supabaseRequest("GET", "flashcard_decks", {
    query: {
      select: "id",
      user_id: `eq.${cleanString(userId, 80)}`,
      limit: 500
    }
  });
  return (Array.isArray(decks) ? decks : []).map(row => cleanString(row.id, 96)).filter(Boolean);
}

async function supabaseListCards(userId, deckId = "", limit = 200) {
  const safeLimit = limitValue(limit, 200, 500);
  const deckIds = await supabaseDeckIdsForUser(userId, deckId);
  if (!deckIds.length) return [];
  const rows = await supabaseRequest("GET", "flashcards", {
    query: {
      select: "*",
      deck_id: `in.(${deckIds.join(",")})`,
      order: "card_order.asc,created_at.asc",
      limit: safeLimit
    }
  });
  return Array.isArray(rows) ? rows.map(mapCard) : [];
}

async function supabaseGetCard(userId, cardId) {
  const row = await supabaseCardRowById(cardId);
  if (!row || !(await supabaseUserOwnsDeck(userId, row.deck_id))) return null;
  return mapCard(row);
}

async function supabasePatchCard(userId, cardId, patch = {}) {
  const current = await supabaseGetCard(userId, cardId);
  if (!current) return null;
  return supabaseCreateCard(userId, { ...current, ...patch, id: current.id, deckId: current.deckId });
}

async function supabaseDeleteCard(userId, cardId) {
  const row = await supabaseCardRowById(cardId);
  if (!row || !(await supabaseUserOwnsDeck(userId, row.deck_id))) return false;
  const rows = await supabaseRequest("DELETE", "flashcards", {
    query: { id: `eq.${cleanString(cardId, 96)}` },
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

async function createDeck(userId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateDeck(userId, payload);
  const supabaseItem = await supabaseCreateDeck(userId, payload);
  await mirrorMysql(() => mysqlCreateDeck(userId, payload), "flashcard-deck upsert");
  return supabaseItem;
}

async function listDecks(userId, limit = 50) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListDecks(userId, limit);
    } catch (error) {
      console.warn(`[storage] Supabase flashcard-deck list failed: ${error.message}`);
    }
  }
  return mysqlListDecks(userId, limit);
}

async function getDeck(userId, deckId, { includeCards = false } = {}) {
  if (supabaseStorageEnabled()) {
    try {
      const deck = await supabaseGetDeck(userId, deckId, { includeCards });
      if (deck) return deck;
    } catch (error) {
      console.warn(`[storage] Supabase flashcard-deck get failed: ${error.message}`);
    }
  }
  return mysqlGetDeck(userId, deckId, { includeCards });
}

async function patchDeck(userId, deckId, patch = {}) {
  if (!supabaseStorageEnabled()) return mysqlPatchDeck(userId, deckId, patch);
  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchDeck(userId, deckId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase flashcard-deck patch failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(() => mysqlPatchDeck(userId, deckId, patch), "flashcard-deck patch");
  return supabaseItem || mysqlItem || getDeck(userId, deckId);
}

async function deleteDeck(userId, deckId) {
  if (!supabaseStorageEnabled()) return mysqlDeleteDeck(userId, deckId);
  let deleted = false;
  try {
    deleted = await supabaseDeleteDeck(userId, deckId);
  } catch (error) {
    console.warn(`[storage] Supabase flashcard-deck delete failed: ${error.message}`);
  }
  const mysqlDeleted = await mirrorMysql(() => mysqlDeleteDeck(userId, deckId), "flashcard-deck delete");
  return deleted || Boolean(mysqlDeleted);
}

async function createCard(userId, payload = {}) {
  if (!supabaseStorageEnabled()) return mysqlCreateCard(userId, payload);
  const supabaseItem = await supabaseCreateCard(userId, payload);
  await mirrorMysql(() => mysqlCreateCard(userId, payload), "flashcard upsert");
  return supabaseItem;
}

async function listCards(userId, deckId = "", limit = 200) {
  if (supabaseStorageEnabled()) {
    try {
      return await supabaseListCards(userId, deckId, limit);
    } catch (error) {
      console.warn(`[storage] Supabase flashcard list failed: ${error.message}`);
    }
  }
  return mysqlListCards(userId, deckId, limit);
}

async function getCard(userId, cardId) {
  if (supabaseStorageEnabled()) {
    try {
      const card = await supabaseGetCard(userId, cardId);
      if (card) return card;
    } catch (error) {
      console.warn(`[storage] Supabase flashcard get failed: ${error.message}`);
    }
  }
  return mysqlGetCard(userId, cardId);
}

async function patchCard(userId, cardId, patch = {}) {
  if (!supabaseStorageEnabled()) return mysqlPatchCard(userId, cardId, patch);
  let supabaseItem = null;
  try {
    supabaseItem = await supabasePatchCard(userId, cardId, patch);
  } catch (error) {
    console.warn(`[storage] Supabase flashcard patch failed: ${error.message}`);
  }
  const mysqlItem = await mirrorMysql(() => mysqlPatchCard(userId, cardId, patch), "flashcard patch");
  return supabaseItem || mysqlItem || getCard(userId, cardId);
}

async function deleteCard(userId, cardId) {
  if (!supabaseStorageEnabled()) return mysqlDeleteCard(userId, cardId);
  let deleted = false;
  try {
    deleted = await supabaseDeleteCard(userId, cardId);
  } catch (error) {
    console.warn(`[storage] Supabase flashcard delete failed: ${error.message}`);
  }
  const mysqlDeleted = await mirrorMysql(() => mysqlDeleteCard(userId, cardId), "flashcard delete");
  return deleted || Boolean(mysqlDeleted);
}

export {
  createCard,
  createDeck,
  deleteCard,
  deleteDeck,
  getCard,
  getDeck,
  listCards,
  listDecks,
  patchCard,
  patchDeck
};
