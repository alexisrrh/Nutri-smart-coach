import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  consumePendingLegalConsent,
  setPendingLegalConsent,
} from "../services/legalConsentService";
import {
  applyPendingOAuthReferralCode,
  isOAuthReferralFlowPending,
} from "../services/referralOnboardingService";
import { clearCreatorPanelCache } from "../services/creatorService";
import { getProfile, saveProfile } from "../services/profileService";
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

        if (isMounted) {
          setUser(data.user);
          if (!data.user) {
            clearCreatorPanelCache();
          }
          scheduleDashboardWarmup(data.user?.id);
          void syncPendingOnboardingArtifacts(data.user);
        }
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
      if (!session?.user) {
        clearCreatorPanelCache();
      }
      scheduleDashboardWarmup(session?.user?.id);
      void syncPendingOnboardingArtifacts(session?.user);
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

let lastDashboardWarmupUserId = null;

function scheduleDashboardWarmup(userId) {
  if (!userId || lastDashboardWarmupUserId === userId) return;

  lastDashboardWarmupUserId = userId;
  const isDashboardEntry = window.location.pathname === "/dashboard";

  const runWarmup = async () => {
    try {
      const { preloadDashboardChunk, prefetchDashboardData } = await import(
        "../services/dashboardPrefetchService"
      );

      void preloadDashboardChunk();
      void prefetchDashboardData(userId);
    } catch (error) {
      console.warn("No se pudo precargar Dashboard:", error);
    }
  };

  if (isDashboardEntry) {
    window.setTimeout(() => {
      void runWarmup();
    }, 0);
    return;
  }

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      void runWarmup();
    }, { timeout: 1200 });
    return;
  }

  window.setTimeout(() => {
    void runWarmup();
  }, 250);
}

async function syncPendingOnboardingArtifacts(user) {
  const consent = consumePendingLegalConsent();
  if (!user?.id || !consent) return;

  try {
    const currentProfile = await getProfile(user.id, { fallbackToCache: false }).catch(
      () => null
    );

    const profile = currentProfile || {
      id: user.id,
      user_id: user.id,
      email: user.email || "",
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "",
      age: null,
      weight: null,
      height: null,
      gender: "male",
      activity_level: "moderate",
      goal: "perder_grasa",
      preferences: {
        gender: "male",
        activity: "moderate",
        goal: "perder_grasa",
      },
      updated_at: new Date().toISOString(),
    };

    await saveProfile({
      ...profile,
      ...consent,
      email: profile.email || user.email || "",
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("No se pudo guardar el consentimiento legal:", error);
    setPendingLegalConsent(consent);
    return;
  }

  if (!isOAuthReferralFlowPending()) return;

  try {
    await applyPendingOAuthReferralCode();
  } catch (error) {
    console.error("No se pudo aplicar el código de invitación pendiente:", error);
  }
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
    clearCreatorPanelCache();
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
