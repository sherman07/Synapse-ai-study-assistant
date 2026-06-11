import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { cleanString, limitValue } from "../utils/validators.js";
import { asyncRoute, sendNotFound } from "./helpers.js";
import {
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
} from "../repositories/flashcardsRepository.js";

const decksRouter = Router();
const cardsRouter = Router();

decksRouter.get("/", requireUser, asyncRoute(async (req, res) => {
  res.json({ ok: true, items: await listDecks(req.user.id, limitValue(req.query.limit, 50, 100)) });
}));

decksRouter.post("/", requireUser, asyncRoute(async (req, res) => {
  res.status(201).json({ ok: true, item: await createDeck(req.user.id, req.body || {}) });
}));

decksRouter.get("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await getDeck(req.user.id, req.params.id, { includeCards: true });
  if (!item) return sendNotFound(res, "Flashcard deck not found.");
  res.json({ ok: true, item });
}));

decksRouter.patch("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await patchDeck(req.user.id, req.params.id, req.body || {});
  if (!item) return sendNotFound(res, "Flashcard deck not found.");
  res.json({ ok: true, item });
}));

decksRouter.delete("/:id", requireUser, asyncRoute(async (req, res) => {
  const deleted = await deleteDeck(req.user.id, req.params.id);
  if (!deleted) return sendNotFound(res, "Flashcard deck not found.");
  res.json({ ok: true, deleted: true, id: req.params.id });
}));

decksRouter.get("/:id/cards", requireUser, asyncRoute(async (req, res) => {
  const deck = await getDeck(req.user.id, req.params.id);
  if (!deck) return sendNotFound(res, "Flashcard deck not found.");
  res.json({ ok: true, items: await listCards(req.user.id, req.params.id, limitValue(req.query.limit, 200, 500)) });
}));

cardsRouter.get("/", requireUser, asyncRoute(async (req, res) => {
  res.json({
    ok: true,
    items: await listCards(
      req.user.id,
      cleanString(req.query.deckId || req.query.deck_id || "", 96),
      limitValue(req.query.limit, 200, 500)
    )
  });
}));

cardsRouter.post("/", requireUser, asyncRoute(async (req, res) => {
  const item = await createCard(req.user.id, req.body || {});
  if (!item) return sendNotFound(res, "Flashcard deck not found.");
  res.status(201).json({ ok: true, item });
}));

cardsRouter.get("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await getCard(req.user.id, req.params.id);
  if (!item) return sendNotFound(res, "Flashcard not found.");
  res.json({ ok: true, item });
}));

cardsRouter.patch("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await patchCard(req.user.id, req.params.id, req.body || {});
  if (!item) return sendNotFound(res, "Flashcard not found.");
  res.json({ ok: true, item });
}));

cardsRouter.delete("/:id", requireUser, asyncRoute(async (req, res) => {
  const deleted = await deleteCard(req.user.id, req.params.id);
  if (!deleted) return sendNotFound(res, "Flashcard not found.");
  res.json({ ok: true, deleted: true, id: req.params.id });
}));

export { cardsRouter, decksRouter };
