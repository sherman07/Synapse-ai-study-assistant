import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { createProgress, deleteProgress, getProgress, listProgress, patchProgress } from "../repositories/progressRepository.js";
import { limitValue, validateProgressPayload } from "../utils/validators.js";
import { asyncRoute, sendNotFound } from "./helpers.js";

const router = Router();

router.get("/", requireUser, asyncRoute(async (req, res) => {
  res.json({ ok: true, items: await listProgress(req.user.id, limitValue(req.query.limit, 50, 100)) });
}));

router.post("/", requireUser, asyncRoute(async (req, res) => {
  const validation = validateProgressPayload(req.body);
  if (!validation.ok) return res.status(400).json({ ok: false, error: validation.error });
  res.status(201).json({ ok: true, item: await createProgress(req.user.id, validation.value) });
}));

router.get("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await getProgress(req.user.id, req.params.id);
  if (!item) return sendNotFound(res, "Progress record not found.");
  res.json({ ok: true, item });
}));

router.patch("/:id", requireUser, asyncRoute(async (req, res) => {
  const validation = validateProgressPayload(req.body);
  if (!validation.ok) return res.status(400).json({ ok: false, error: validation.error });
  const item = await patchProgress(req.user.id, req.params.id, validation.value);
  if (!item) return sendNotFound(res, "Progress record not found.");
  res.json({ ok: true, item });
}));

router.delete("/:id", requireUser, asyncRoute(async (req, res) => {
  const deleted = await deleteProgress(req.user.id, req.params.id);
  if (!deleted) return sendNotFound(res, "Progress record not found.");
  res.json({ ok: true, deleted: true, id: req.params.id });
}));

export { router as progressRouter };
