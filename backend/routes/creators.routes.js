import { Router } from "express";
import { requireAuthenticatedUser, verifySupabaseUser } from "../middleware/auth.js";
import {
  getCreatorStatus,
  updateCreatorPanelCode,
  submitCreatorApplication,
} from "../services/creator.service.js";

const router = Router();

router.get("/creators/me", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const creator = await getCreatorStatus(userId);

    return res.json(creator);
  } catch (error) {
    return next(error);
  }
});

router.post("/creators/apply", verifySupabaseUser, async (req, res, next) => {
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

router.patch("/creators/code", verifySupabaseUser, async (req, res, next) => {
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

export default router;
