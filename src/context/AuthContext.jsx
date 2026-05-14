import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { error: sessionError } = await supabase.auth.getSession();

        if (isInvalidRefreshTokenError(sessionError)) {
          await resetCorruptSupabaseSession();
          if (isMounted) setUser(null);
          return;
        }

        const { data, error: userError } = await supabase.auth.getUser();

        if (isInvalidRefreshTokenError(userError)) {
          await resetCorruptSupabaseSession();
          if (isMounted) setUser(null);
          return;
        }

        if (isMounted) setUser(data.user);
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          await resetCorruptSupabaseSession();
        } else {
          console.error("Error cargando sesión:", error);
        }

        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    }

    Promise.resolve().then(loadSession);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;

        setUser(session?.user ?? null);
        setLoadingAuth(false);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

function isInvalidRefreshTokenError(error) {
  if (!error) return false;

  const message = String(error.message || error).toLowerCase();

  return (
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found")
  );
}

async function resetCorruptSupabaseSession() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    if (!isInvalidRefreshTokenError(error)) {
      console.error("Error cerrando sesión corrupta:", error);
    }
  } finally {
    removeSupabaseAuthStorage();
  }
}

function removeSupabaseAuthStorage() {
  const authKey = getSupabaseAuthStorageKey();
  const keysToRemove = new Set([authKey]);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (isSupabaseAuthKey(key)) {
      keysToRemove.add(key);
    }
  }

  keysToRemove.forEach((key) => {
    if (key) localStorage.removeItem(key);
  });
}

function getSupabaseAuthStorageKey() {
  try {
    const projectRef = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split(
      "."
    )[0];

    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function isSupabaseAuthKey(key) {
  return /^sb-[a-z0-9-]+-auth-token$/i.test(key || "");
}

