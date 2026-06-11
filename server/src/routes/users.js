import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { patchUser } from "../repositories/usersRepository.js";
import { asyncRoute } from "./helpers.js";

const router = Router();

router.get("/me", requireUser, (req, res) => {
  res.json({ ok: true, user: req.user });
});

router.patch("/me", requireUser, asyncRoute(async (req, res) => {
  const user = await patchUser(req.user.id, req.body || {});
  res.json({ ok: true, user });
}));

export { router as usersRouter };
