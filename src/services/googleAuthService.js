import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import {
  ErrorCode as GoogleSignInErrorCode,
  GoogleSignIn,
} from "@capawesome/capacitor-google-sign-in";
import { supabase } from "../lib/supabase";

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;
const IOS_GOOGLE_OAUTH_REDIRECT =
  "com.nutrismartcoach.app://login-callback";

let googleSignInInitialized = false;
let googleSignInInitializationPromise = null;

export async function signInWithGoogle({ redirectTo } = {}) {
  try {
    if (isAndroidNative()) {
      return await signInWithGoogleNative();
    }

    if (isIosNative()) {
      return await signInWithGoogleIosOAuth();
    }

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || `${window.location.origin}/dashboard`,
      },
    });
  } catch (error) {
    return {
      data: null,
      error,
    };
  }
}

async function signInWithGoogleIosOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: IOS_GOOGLE_OAUTH_REDIRECT,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) {
    throw new Error("Supabase no devolvió la URL de inicio de sesión.");
  }

  return openGoogleOAuthSession(data.url);
}

async function openGoogleOAuthSession(oauthUrl) {
  let appUrlListener;
  let browserFinishedListener;
  let settled = false;

  let resolveSession;
  let rejectSession;
  const sessionPromise = new Promise((resolve, reject) => {
    resolveSession = resolve;
    rejectSession = reject;
  });

  const removeListeners = async () => {
    await Promise.allSettled([
      appUrlListener?.remove?.(),
      browserFinishedListener?.remove?.(),
    ]);
  };

  const handleCallback = async (url) => {
    if (settled || !isIosGoogleOAuthCallback(url)) return;
    settled = true;
    await removeListeners();

    let sessionResult;
    let callbackError;

    try {
      const callbackUrl = new URL(url);
      const params = new URLSearchParams(callbackUrl.hash.slice(1));
      const oauthError =
        params.get("error_description") || params.get("error");

      if (oauthError) {
        throw new Error(oauthError);
      }

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        throw new Error("El callback de Google no contiene una sesión válida.");
      }

      sessionResult = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionResult.error) throw sessionResult.error;
    } catch (error) {
      callbackError = error;
    }

    await closeBrowserSafely();

    if (callbackError) {
      rejectSession(callbackError);
      return;
    }

    resolveSession(sessionResult);
  };

  try {
    appUrlListener = await App.addListener("appUrlOpen", ({ url }) => {
      if (!url) return;
      void handleCallback(url);
    });

    browserFinishedListener = await Browser.addListener(
      "browserFinished",
      () => {
        if (settled) return;
        settled = true;
        void removeListeners().then(() => {
          rejectSession(createGoogleSignInCanceledError());
        });
      }
    );

    await Browser.open({ url: oauthUrl });
  } catch (error) {
    if (!settled) {
      settled = true;
      await removeListeners();
      await closeBrowserSafely();
      rejectSession(error);
    }
  }

  return sessionPromise;
}

function isIosGoogleOAuthCallback(url) {
  try {
    const callbackUrl = new URL(url);
    return (
      callbackUrl.protocol === "com.nutrismartcoach.app:" &&
      callbackUrl.host === "login-callback"
    );
  } catch {
    return false;
  }
}

async function closeBrowserSafely() {
  try {
    await Browser.close();
  } catch {
    // The browser may already be closed after a user cancellation.
  }
}

function createGoogleSignInCanceledError() {
  const error = new Error("Inicio de sesión con Google cancelado.");
  error.code = GoogleSignInErrorCode.SignInCanceled;
  return error;
}

async function signInWithGoogleNative() {
  await initializeGoogleSignIn();

  try {
    const result = await GoogleSignIn.signIn();

    if (!result.idToken) {
      throw new Error("Google no devolvió un ID token.");
    }

    return supabase.auth.signInWithIdToken({
      provider: "google",
      token: result.idToken,
    });
  } catch (error) {
    if (isGoogleSignInCanceled(error)) {
      const canceledError = new Error("Inicio de sesión con Google cancelado.");
      canceledError.code = GoogleSignInErrorCode.SignInCanceled;
      throw canceledError;
    }

    throw error;
  }
}

async function initializeGoogleSignIn() {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error("Falta VITE_GOOGLE_WEB_CLIENT_ID.");
  }

  if (googleSignInInitialized) return;

  if (!googleSignInInitializationPromise) {
    googleSignInInitializationPromise = GoogleSignIn.initialize({
      clientId: GOOGLE_WEB_CLIENT_ID,
    }).then(() => {
      googleSignInInitialized = true;
    });
  }

  await googleSignInInitializationPromise;
}

function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

function isIosNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

function isGoogleSignInCanceled(error) {
  return (
    error?.code === GoogleSignInErrorCode.SignInCanceled ||
    error?.message === "The user canceled the sign-in flow."
  );
}
