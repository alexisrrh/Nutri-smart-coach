import { Router } from "express";
import { requireAuthenticatedUser, verifySupabaseUser } from "../middleware/auth.js";
import {
  applyReferralCode,
  createInfluencerCode,
  createUserReferralCode,
  getMyReferralStats,
  validateReferralCode,
} from "../services/referral.service.js";

const router = Router();

router.get("/referrals/me", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const stats = await getMyReferralStats(userId);
    return res.json(stats);
  } catch (error) {
    return next(error);
  }
});

router.post("/referrals/create-code", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const type = req.body?.type === "influencer" ? "influencer" : "user";
    const code =
      type === "influencer"
        ? await createInfluencerCode(userId, req.body?.code || "", {
            authUser: req.authUser,
          })
        : await createUserReferralCode(userId);

    return res.status(201).json({ code });
  } catch (error) {
    return next(error);
  }
});

router.post("/referrals/validate-code", async (req, res, next) => {
  try {
    const result = await validateReferralCode(req.body?.code || "");
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.post("/referrals/apply-code", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const result = await applyReferralCode({
      userId,
      code: req.body?.code || "",
    }, {
      currentUserCreatedAt: req.authUser?.created_at || null,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
