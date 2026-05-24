import { Router } from "express";
import { supabase } from "../config/supabase.js";
import {
  assertSameUser,
  verifySupabaseUser,
} from "../middleware/auth.js";

const router = Router();

router.get("/diet-plans/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = req.authUser.id;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data, error } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "No se pudieron cargar las dietas",
        detail: error.message,
      });
    }

    return res.json({ diet_plans: data || [] });
  } catch (error) {
    return res.status(500).json({
      error: "Error cargando dietas",
      detail: error.message,
    });
  }
});

export default router;
