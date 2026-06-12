import { hasActivePro, userEntitlements } from "../billing/plans.js";

function requireActivePro(req, res, next) {
  if (hasActivePro(req.user)) return next();
  return res.status(402).json({
    ok: false,
    error: "An active Pro subscription is required.",
    entitlements: userEntitlements(req.user || {})
  });
}

export { requireActivePro };
