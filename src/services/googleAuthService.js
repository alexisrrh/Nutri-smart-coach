import { Capacitor } from "@capacitor/core";
import {
  ErrorCode as GoogleSignInErrorCode,
  GoogleSignIn,
} from "@capawesome/capacitor-google-sign-in";
import { supabase } from "../lib/supabase";

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;

let googleSignInInitialized = false;
let googleSignInInitializationPromise = null;

export async function signInWithGoogle({ redirectTo } = {}) {
  try {
    if (isAndroidNative()) {
      return await signInWithGoogleNative();
    }

    if (isIosNative()) {
      return await signInWithGoogleNative();
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
