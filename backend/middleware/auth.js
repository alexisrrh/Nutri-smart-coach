import { supabase } from "../config/supabase.js";

export async function verifySupabaseUser(req, res, next) {
  try {
    const authorization = req.get("Authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    req.authUser = data.user;

    return next();
  } catch (error) {
    console.error("Error verificando usuario Supabase:", error);

    return res.status(401).json({ error: "No autorizado" });
  }
}

export function assertSameUser(authUserId, requestedUserId) {
  return Boolean(authUserId && requestedUserId && authUserId === requestedUserId);
}
