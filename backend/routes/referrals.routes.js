import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { requireAuthenticatedUser, verifySupabaseUser } from "../middleware/auth.js";
import {
  applyReferralCode,
  createUserReferralCode,
  claimReferralReward,
  getMyReferralStats,
  validateReferralCode,
} from "../services/referral.service.js";
import { serializePremiumProfile } from "../services/stripe.service.js";

const router = Router();

router.get("/referrals/me", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const stats = await getMyReferralStats(userId, {
      codeType: "user",
      referralType: "user",
    });
    return res.json(stats);
  } catch (error) {
    return next(error);
  }
});

router.post("/referrals/create-code", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const code = await createUserReferralCode(userId);

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

router.post("/referrals/claim-reward", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);
    if (!userId) return;

    const result = await claimReferralReward({ userId });
    const stats = await getMyReferralStats(userId, {
      codeType: "user",
      referralType: "user",
    });
    const premium = await getPremiumStatusSnapshot(userId);

    return res.status(201).json({
      reward: result.reward,
      premium,
      stats,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

async function getPremiumStatusSnapshot(userId) {
  const { data, error } = await getProfileQuery(userId);
  if (error) return null;
  return serializePremiumProfile(data);
}

async function getProfileQuery(userId) {
  return supabase
    .from("profiles")
    .select(
      [
        "id",
        "plan",
        "is_premium",
        "subscription_status",
        "premium_source",
        "premium_product_id",
        "premium_platform_transaction_id",
        "premium_expires_at",
        "premium_last_verified_at",
        "premium_started_at",
        "stripe_customer_id",
        "stripe_subscription_id",
        "stripe_current_period_end",
        "stripe_cancel_at_period_end",
      ].join(", ")
    )
    .eq("id", userId)
    .maybeSingle();
}
