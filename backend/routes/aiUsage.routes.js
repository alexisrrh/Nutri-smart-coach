import { Router } from "express";
import { assertSameUser, verifySupabaseUser } from "../middleware/auth.js";
import { getAllDailyAiUsageWithProfile, getAiUsageLimits } from "../utils/aiUsage.js";
import { supabase } from "../config/supabase.js";

const router = Router();

router.get("/ai-usage/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = req.authUser.id;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, is_premium")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({
        error: "No se pudo consultar el uso diario de IA",
        detail: profileError.message,
      });
    }

    const usage = await getAllDailyAiUsageWithProfile(userId, profile);

    return res.json({
      usage,
      limits: getAiUsageLimits(profile),
    });
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo consultar el uso diario de IA",
      detail: error.message,
    });
  }
});

export default router;
