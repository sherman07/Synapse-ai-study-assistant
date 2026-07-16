import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import {
  appendLearningMessage,
  createLearningSession,
  createLearningSubject,
  listLearningMessages,
  listLearningSessions,
  listLearningSubjects,
} from "../repositories/learningRepository.js";
import { limitValue } from "../utils/validators.js";
import { asyncRoute, sendNotFound } from "./helpers.js";

const router = Router();

function invalidRequest(res, error) {
  return res.status(400).json({ ok: false, error });
}

router.get("/subjects", requireUser, asyncRoute(async (req, res) => {
  res.json({ ok: true, items: await listLearningSubjects(req.user.id, limitValue(req.query.limit, 50, 100)) });
}));

router.post("/subjects", requireUser, asyncRoute(async (req, res) => {
  try {
    const item = await createLearningSubject(req.user.id, req.body || {});
    res.status(201).json({ ok: true, item });
  } catch (error) {
    invalidRequest(res, error.message);
  }
}));

router.post("/subjects/:subjectId/sessions", requireUser, asyncRoute(async (req, res) => {
  try {
    const item = await createLearningSession(req.user.id, req.params.subjectId, req.body || {});
    if (!item) return sendNotFound(res, "Learning subject not found.");
    return res.status(201).json({ ok: true, item });
  } catch (error) {
    return invalidRequest(res, error.message);
  }
}));

router.get("/subjects/:subjectId/sessions", requireUser, asyncRoute(async (req, res) => {
  res.json({ ok: true, items: await listLearningSessions(req.user.id, req.params.subjectId, limitValue(req.query.limit, 50, 100)) });
}));

router.get("/sessions/:sessionId/messages", requireUser, asyncRoute(async (req, res) => {
  res.json({ ok: true, items: await listLearningMessages(req.user.id, req.params.sessionId, limitValue(req.query.limit, 100, 200)) });
}));

router.post("/sessions/:sessionId/messages", requireUser, asyncRoute(async (req, res) => {
  try {
    const item = await appendLearningMessage(req.user.id, req.params.sessionId, req.body || {});
    if (!item) return sendNotFound(res, "Learning session not found.");
    return res.status(201).json({ ok: true, item });
  } catch (error) {
    return invalidRequest(res, error.message);
  }
}));

export { router as learningRouter };
