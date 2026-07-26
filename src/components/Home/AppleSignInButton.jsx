import { Capacitor } from "@capacitor/core";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";

const APPLE_CLIENT_ID = "com.nutrismartcoach.nutrismart";

export function AppleSignInButton({ 
  supabase, 
  acceptedPolicies, 
  onError, 
  onSuccess, 
  onLoading, 
  label,
  policyError,
  connectionErrorPrefix,
  cancelledMessage,
  fallbackName,
  redirectTo,
  onBeforeSignIn,
}) {
  // Oculta el botón en Android y en entornos Web (Escritorio / Navegadores móviles)
  // Solo se mostrará en la aplicación nativa de iOS
  if (Capacitor.getPlatform() === "android" || !Capacitor.isNativePlatform()) {
    return null;
  }

  const handleAppleSignIn = async () => {
    if (!acceptedPolicies) {
      onError(policyError);
      return;
    }

    onError("");
    onBeforeSignIn?.();
    onLoading(true);

    try {
      if (!Capacitor.isNativePlatform()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo,
          },
        });

        if (error) {
          onError(`${connectionErrorPrefix}${error.message}`);
        }

        return;
      }

      if (Capacitor.getPlatform() !== "ios") {
        onError(cancelledMessage);
        return;
      }

      const nonce = crypto.randomUUID();
      const state = crypto.randomUUID();
      const options = {
        clientId: APPLE_CLIENT_ID,
        redirectURI: "",
        scopes: "name email",
        state,
        nonce,
      };

      const result = await SignInWithApple.authorize(options);

      if (result.response && result.response.identityToken) {
        const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: result.response.identityToken,
          nonce,
        });

        if (supabaseError) {
          onError(`${connectionErrorPrefix}${supabaseError.message}`);
          return;
        }

        const appleName = result.response.givenName 
          ? `${result.response.givenName} ${result.response.familyName || ""}`.trim()
          : fallbackName;

        onSuccess(data, appleName);
      }
    } catch (err) {
      console.error("Error en Apple Sign In:", err);
      onError(err?.message || cancelledMessage);
    } finally {
      onLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-black text-white font-medium rounded-xl shadow-sm hover:bg-zinc-900 active:scale-[0.98] transition-all duration-200 text-sm"
    >
      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
