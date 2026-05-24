import { Router } from "express";
import { supabase } from "../config/supabase.js";
import {
  assertSameUser,
  verifySupabaseUser,
} from "../middleware/auth.js";
import { getSupabaseStoragePath } from "../services/storage.service.js";

const router = Router();

router.get("/checkins/:userId", verifySupabaseUser, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const userId = req.authUser.id;

    if (!assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "No se pudieron cargar los check-ins",
        detail: error.message,
      });
    }

    return res.json({ checkins: data || [] });
  } catch (error) {
    return res.status(500).json({
      error: "Error cargando check-ins",
      detail: error.message,
    });
  }
});

router.delete("/checkins/:checkinId", verifySupabaseUser, async (req, res) => {
  try {
    const { checkinId } = req.params;
    const requestedUserId = req.query.user_id;
    const userId = req.authUser.id;

    if (!checkinId) {
      return res.status(400).json({ error: "Falta checkinId" });
    }

    if (requestedUserId && !assertSameUser(userId, requestedUserId)) {
      return res.status(403).json({ error: "No autorizado para este usuario" });
    }

    const { data: checkin, error: fetchError } = await supabase
      .from("checkins")
      .select("id, image_url")
      .eq("id", checkinId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({
        error: "No se pudo cargar el check-in",
        detail: fetchError.message,
      });
    }

    if (!checkin) {
      return res.status(404).json({
        error: "Check-in no encontrado",
      });
    }

    if (checkin.image_url) {
      const imagePath = getSupabaseStoragePath({
        publicUrl: checkin.image_url,
        bucket: "checkins",
      });

      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from("checkins")
          .remove([imagePath]);

        if (storageError) {
          console.error("Error borrando imagen de check-in:", storageError);
        }
      }
    }

    const { data: deletedCheckins, error: deleteError } = await supabase
      .from("checkins")
      .delete()
      .eq("id", checkinId)
      .eq("user_id", userId)
      .select("id");

    if (deleteError) {
      return res.status(500).json({
        error: "No se pudo borrar el check-in",
        detail: deleteError.message,
      });
    }

    if (!deletedCheckins?.length) {
      return res.status(404).json({
        error: "Check-in no encontrado",
      });
    }

    return res.json({ ok: true, deleted_id: checkinId });
  } catch (error) {
    return res.status(500).json({
      error: "Error borrando check-in",
      detail: error.message,
    });
  }
});

export default router;
