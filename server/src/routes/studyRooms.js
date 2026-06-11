import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { createStudyRoom, deleteStudyRoom, getStudyRoom, listStudyRooms, patchStudyRoom } from "../repositories/studyRoomsRepository.js";
import { limitValue } from "../utils/validators.js";
import { asyncRoute, sendNotFound } from "./helpers.js";

const router = Router();

router.get("/", requireUser, asyncRoute(async (req, res) => {
  res.json({ ok: true, items: await listStudyRooms(req.user.id, limitValue(req.query.limit, 50, 100)) });
}));

router.post("/", requireUser, asyncRoute(async (req, res) => {
  res.status(201).json({ ok: true, item: await createStudyRoom(req.user.id, req.body || {}) });
}));

router.get("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await getStudyRoom(req.user.id, req.params.id);
  if (!item) return sendNotFound(res, "Study room not found.");
  res.json({ ok: true, item });
}));

router.patch("/:id", requireUser, asyncRoute(async (req, res) => {
  const item = await patchStudyRoom(req.user.id, req.params.id, req.body || {});
  if (!item) return sendNotFound(res, "Study room not found.");
  res.json({ ok: true, item });
}));

router.delete("/:id", requireUser, asyncRoute(async (req, res) => {
  const deleted = await deleteStudyRoom(req.user.id, req.params.id);
  if (!deleted) return sendNotFound(res, "Study room not found.");
  res.json({ ok: true, deleted: true, id: req.params.id });
}));

export { router as studyRoomsRouter };
