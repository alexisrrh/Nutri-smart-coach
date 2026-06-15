import { Router } from "express";
import { requireAuthenticatedUser, verifySupabaseUser } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  getCreatorStatus,
  requestCreatorPayout,
  trackCreatorLinkClick,
  updateCreatorPanelCode,
  submitCreatorApplication,
} from "../services/creator.service.js";

const router = Router();
const trackClickRateLimiter = createRateLimiter({
  name: "creator_track_click",
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Demasiadas peticiones de tracking en poco tiempo. Inténtalo de nuevo más tarde.",
});

router.get("/routes", (req, res) => {
  return res.json({
    ok: true,
    routes: [
      "GET /creators/me",
      "POST /creators/apply",
      "PATCH /creators/code",
      "POST /creators/track-click",
      "POST /creators/payouts/request",
      "GET /creators/routes",
    ],
  });
});

router.post("/track-click", trackClickRateLimiter, async (req, res) => {
  try {
    const result = await trackCreatorLinkClick(
      {
        code: req.body?.code,
        visitorId: req.body?.visitorId || null,
        userAgent: req.get("user-agent") || null,
        ipHash: req.ip || req.headers["x-forwarded-for"] || null,
      },
      {
        logger: console,
      }
    );

    return res.status(200).json({
      ok: true,
      ...(result?.deduped ? { deduped: true } : {}),
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode || 500);
    return res.status(statusCode).json({
      error: error?.message || "No se pudo registrar el clic.",
    });
  }
});

router.get("/me", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const creator = await getCreatorStatus(userId);

    return res.json(creator);
  } catch (error) {
    return next(error);
  }
});

router.post("/apply", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const creator = await submitCreatorApplication(
      userId,
      {
        socialPlatform: req.body?.socialPlatform,
        socialHandle: req.body?.socialHandle,
        followersCount: req.body?.followersCount,
        proofUrl: req.body?.proofUrl,
      },
      {
        authUser: req.authUser,
      }
    );

    return res.status(201).json(creator);
  } catch (error) {
    return next(error);
  }
});

router.patch("/code", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const creator = await updateCreatorPanelCode(
      userId,
      req.body?.code,
      {
        authUser: req.authUser,
      }
    );

    return res.json(creator);
  } catch (error) {
    return next(error);
  }
});

router.post("/payouts/request", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const creator = await requestCreatorPayout(userId, {
      authUser: req.authUser,
    });

    return res.status(201).json(creator);
  } catch (error) {
    return next(error);
  }
});

export default router;
