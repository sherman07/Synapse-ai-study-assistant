import { createPool } from "../db/pool.js";
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

async function createDeck(userId, payload = {}) {
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
      await createCard(userId, { ...payload.cards[index], deckId: id, cardOrder: index });
    }
  }
  return getDeck(userId, id, { includeCards: true });
}

async function listDecks(userId, limit = 50) {
  const [rows] = await createPool().execute(
    "SELECT * FROM flashcard_decks WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?",
    [userId, limitValue(limit)]
  );
  return rows.map(mapDeck);
}

async function getDeck(userId, deckId, { includeCards = false } = {}) {
  const [rows] = await createPool().execute(
    "SELECT * FROM flashcard_decks WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(deckId, 96)]
  );
  if (!rows[0]) return null;
  const deck = mapDeck(rows[0]);
  if (includeCards) {
    deck.cards = await listCards(userId, deck.id, 500);
  }
  return deck;
}

async function patchDeck(userId, deckId, patch = {}) {
  const current = await getDeck(userId, deckId);
  if (!current) return null;
  return createDeck(userId, { ...current.settings, ...current, ...patch, id: current.id });
}

async function deleteDeck(userId, deckId) {
  const [result] = await createPool().execute(
    "DELETE FROM flashcard_decks WHERE user_id = ? AND id = ?",
    [userId, cleanString(deckId, 96)]
  );
  return result.affectedRows > 0;
}

async function userOwnsDeck(userId, deckId) {
  const [rows] = await createPool().execute(
    "SELECT id FROM flashcard_decks WHERE user_id = ? AND id = ? LIMIT 1",
    [userId, cleanString(deckId, 96)]
  );
  return Boolean(rows[0]);
}

async function createCard(userId, payload = {}) {
  const deckId = cleanString(firstValue(payload, ["deck_id", "deckId"]), 96);
  if (!deckId || !(await userOwnsDeck(userId, deckId))) return null;
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
    return getCard(userId, id);
  }
  await createPool().execute(
    `INSERT INTO flashcards (id, deck_id, front, back, hint, source_reference, difficulty, tags_json, card_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [id, deckId, ...values]
  );
  return getCard(userId, id);
}

async function listCards(userId, deckId = "", limit = 200) {
  const params = [userId];
  let where = "d.user_id = ?";
  if (deckId) {
    where += " AND c.deck_id = ?";
    params.push(cleanString(deckId, 96));
  }
  params.push(limitValue(limit, 200, 500));
  const [rows] = await createPool().execute(
    `SELECT c.* FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE ${where}
     ORDER BY c.card_order ASC, c.created_at ASC
     LIMIT ?`,
    params
  );
  return rows.map(mapCard);
}

async function getCard(userId, cardId) {
  const [rows] = await createPool().execute(
    `SELECT c.* FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE d.user_id = ? AND c.id = ?
     LIMIT 1`,
    [userId, cleanString(cardId, 96)]
  );
  return rows[0] ? mapCard(rows[0]) : null;
}

async function patchCard(userId, cardId, patch = {}) {
  const current = await getCard(userId, cardId);
  if (!current) return null;
  return createCard(userId, { ...current, ...patch, id: current.id, deckId: current.deckId });
}

async function deleteCard(userId, cardId) {
  const [result] = await createPool().execute(
    `DELETE c FROM flashcards c
     JOIN flashcard_decks d ON d.id = c.deck_id
     WHERE d.user_id = ? AND c.id = ?`,
    [userId, cleanString(cardId, 96)]
  );
  return result.affectedRows > 0;
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
