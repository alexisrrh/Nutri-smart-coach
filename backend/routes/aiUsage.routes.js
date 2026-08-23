import { Router } from "express";
import {
  assertSameUser,
  requireAuthenticatedUser,
  verifySupabaseUser,
} from "../middleware/auth.js";
import { getAllDailyAiUsageWithProfile, getAiUsageLimits, getAiUsagePlan } from "../utils/aiUsage.js";
import { supabase } from "../config/supabase.js";

const router = Router();

router.get("/ai-usage/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        [
          "plan",
          "is_premium",
          "subscription_status",
          "premium_source",
          "premium_product_id",
          "premium_platform_transaction_id",
          "premium_expires_at",
          "premium_last_verified_at",
        ].join(", ")
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({
        error: "No se pudo consultar el uso de IA",
      });
    }

    const usage = await getAllDailyAiUsageWithProfile(userId, profile);

    return res.json({
      usage,
      limits: getAiUsageLimits(profile),
      plan: getAiUsagePlan(profile),
    });
  } catch {
    return res.status(500).json({
      error: "No se pudo consultar el uso de IA",
    });
  }
});

export default router;
