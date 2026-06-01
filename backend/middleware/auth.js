import { supabase } from "../config/supabase.js";

export async function verifySupabaseUser(req, res, next) {
  const authHeader = req.get("Authorization") || "";

  try {
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    req.authUser = data.user;

    return next();
  } catch {
    return res.status(401).json({ error: "No autorizado" });
  }
}

export function assertSameUser(authUserId, requestedUserId) {
  return Boolean(authUserId && requestedUserId && authUserId === requestedUserId);
}

export function getAuthenticatedUserId(req) {
  return req?.authUser?.id || null;
}

export function requireAuthenticatedUser(req, res) {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    res.status(401).json({ error: "No autorizado" });
    return null;
  }

  return userId;
}
