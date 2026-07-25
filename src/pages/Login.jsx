import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../services/analytics";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { STORAGE_KEYS } from "../config/storageKeys";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  clearCachedProfile,
  getProfile,
  saveProfile,
} from "../services/profileService";
import {
  LogIn,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  X,
  Target,
  ScanLine,
  Activity,
} from "lucide-react";
import {
  AppShell,
  FormField,
  PrimaryButton,
  StatusBox,
  SurfaceCard,
} from "../components/ui";
import { AppleSignInButton } from "../components/Home/AppleSignInButton";
import { signInWithGoogle } from "../services/googleAuthService";


export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tl = useCallback((key, options) => t(`auth.login.${key}`, options), [t]);
  const tc = useCallback((key, options) => t(`auth.common.${key}`, options), [t]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const isAndroidNative =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

  useEffect(() => {
    if (!isAndroidNative) return undefined;

    let listener;

    const handleOAuthCallback = async (url) => {
      try {
        const callbackUrl = new URL(url);
        const authCode = callbackUrl.searchParams.get("code");

        if (!authCode) return;

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          authCode
        );

        if (exchangeError) {
          setError(tl("errors.callbackFailed") + exchangeError.message);
          return;
        }

        setError("");
        navigate("/dashboard", { replace: true });
      } catch (callbackError) {
        setError(
          tl("errors.callbackFailed") +
            (callbackError?.message || tl("errors.callbackInvalid"))
        );
      }
    };

    const registerListener = async () => {
      listener = await App.addListener("appUrlOpen", ({ url }) => {
        if (!url) return;
        void handleOAuthCallback(url);
      });
    };

    void registerListener();

    return () => {
      void listener?.remove?.();
    };
  }, [isAndroidNative, navigate, tl]);

  async function handleSocialLogin(provider) {
    setError("");

    trackEvent("login_started", {
      provider,
    });
    const redirectTo = isAndroidNative
      ? "com.nutrismartcoach.app://login-callback"
      : `${window.location.origin}/dashboard`;

    const { error: socialError } =
      provider === "google"
        ? await signInWithGoogle({ redirectTo })
        : await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo,
            },
          });

    if (socialError) {
      setError(tl("errors.connect") + socialError.message);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openPasswordReset() {
    setResetEmail(form.email);
    setResetError("");
    setResetMessage("");
    setResetOpen(true);
  }

  function closePasswordReset() {
    if (resetLoading) return;
    setResetOpen(false);
    setResetError("");
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    const email = resetEmail.trim();

    if (!email) {
      setResetError(tl("errors.resetRequired"));
      return;
    }

    setResetLoading(true);

    const { error: resetPasswordError } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    setResetLoading(false);

    if (resetPasswordError) {
      setResetError(tl("errors.resetFailed") + resetPasswordError.message);
      return;
    }

    setResetMessage(tl("errors.resetSuccess"));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      setLoading(false);
      setError(tl("errors.invalidCredentials"));
      return;
    }

    const user = data.user;
    trackEvent("login", {
      method: "email",
    });

    clearCachedProfile();
    localStorage.removeItem(STORAGE_KEYS.DIET_PLAN);
    localStorage.removeItem(STORAGE_KEYS.DIET_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);

    let profileData = null;

    try {
      profileData = await getProfile(user.id, { fallbackToCache: false });
    } catch (profileError) {
        console.error("Error cargando perfil:", profileError);
    }

    if (!profileData) {
      try {
        await saveProfile({
          id: user.id,
          user_id: user.id,
          email: user.email,
          name: "",
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
        });
      } catch (createError) {
        console.error("Error creando perfil:", createError);
        setLoading(false);
        setError(tl("errors.createProfileFailed"));
        return;
      }
    }

    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <AppShell
      withBottomNav={false}
      contentClassName="!px-3 !pb-3 !pt-[calc(env(safe-area-inset-top)+16px)]"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-4">
        <SurfaceCard className="relative overflow-hidden p-2.5">
          <div className="relative z-10 flex items-start justify-start">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] shadow-[0_0_20px_var(--app-glow)] transition hover:text-[var(--app-text)] active:scale-[0.96]"
              aria-label={tc("back")}
            >
              <ArrowLeft size={14} />
            </button>
          </div>

          <div className="absolute -right-14 -top-16 h-40 w-36 rounded-full bg-[var(--app-primary)]/20 blur-3xl " />

          <div className="relative z-10 pt-2">
            <div className="mb-3 flex items-center gap-5 justify-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-[var(--app-primary)]/35 bg-[var(--app-surface)] p-1.5 shadow-[0_0_30px_var(--app-glow)]">
              <img
                src="/favicon.png"
                alt={tl("brand")}
                className="h-full w-full rounded-2xl object-contain"
              />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  {tl("brand")}
                </p>
                <h1 className="mt-1 flex items-center gap-2 text-[30px] font-black uppercase italic leading-none tracking-tight text-[var(--app-text)]">
                  {tl("title")}
                  <LogIn size={21} className="text-[var(--app-primary)]" />
                </h1>
              </div>
            </div >
<div className="justify-center text-center">
            <p className="ml-10 mb-3 max-w-[18rem] text-sm leading-5 text-[var(--app-muted)] text-center flex justify-center">
              {tl("subtitle")}
            </p></div>

            {error && (
              <StatusBox type="error" className="mb-3 p-3 text-xs leading-5">
                {error}
              </StatusBox>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <Input
                label={tl("emailLabel")}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={tl("emailPlaceholder")}
                icon={<Mail size={16} />}
              />

              <Input
                label={tl("passwordLabel")}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={tl("passwordPlaceholder")}
                icon={<Lock size={16} />}
              />

              <div className="-mt-1 flex justify-center">
                <button
                  type="button"
                  onClick={openPasswordReset}
                  className="text-[11px] font-black uppercase tracking-[0.1em] text-[var(--app-primary)] transition hover:text-[var(--app-text)]"
                >
                  {tl("forgotPassword")}
                </button>
              </div>

              <PrimaryButton
                disabled={loading}
                icon={!loading && <ArrowRight size={16} />}
                type="submit"
                className="mt-1 py-3"
              >
                {loading ? tl("loading") : tl("submit")}
              </PrimaryButton>
            </form>

            <SocialLoginButtons
              navigate={navigate}
              onSocialLogin={handleSocialLogin}
              setError={setError}
              setLoading={setLoading}
              supabase={supabase}
            />

            <div className="mt-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5 text-center">
              <p className="text-sm text-[var(--app-muted)]">
                {tl("newHere")}{" "}
                <Link
                  to="/registro"
                  className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]"
                >
                  {tl("createAccount")}
                </Link>
              </p>
            </div>
          </div>
        </SurfaceCard>

        <div className="pt-2">
          <ActiveCore />
        </div>

        <p className="px-2 pt-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
          {tl("privacyNote")}
        </p>
      </div>

      {resetOpen ? (
        <PasswordResetModal
          email={resetEmail}
          error={resetError}
          loading={resetLoading}
          message={resetMessage}
          onChangeEmail={setResetEmail}
          onClose={closePasswordReset}
          onSubmit={handlePasswordReset}
        />
      ) : null}
    </AppShell>
  );
}

function PasswordResetModal({
  email,
  error,
  loading,
  message,
  onChangeEmail,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation();
  const tl = (key, options) => t(`auth.login.${key}`, options);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 px-3 py-6 backdrop-blur-md">
      <section
        className="relative w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,#08131b),var(--app-card))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-reset-title"
      >
        <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[var(--app-primary)]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                {tl("reset.eyebrow")}
              </p>
              <h2
                id="password-reset-title"
                className="mt-1 text-xl font-black uppercase italic leading-tight text-[var(--app-text)]"
              >
                {tl("reset.title")}
              </h2>
              <p className="mt-2 text-sm font-medium leading-5 text-[var(--app-muted)]">
                {tl("reset.subtitle")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition hover:text-[var(--app-text)] active:scale-[0.96] disabled:opacity-50"
              aria-label={tl("reset.close")}
            >
              <X size={16} />
            </button>
          </div>

          {error ? (
            <StatusBox type="error" className="mb-3 p-3 text-xs leading-5">
              {error}
            </StatusBox>
          ) : null}

          {message ? (
            <StatusBox type="success" className="mb-3 p-3 text-xs leading-5">
              {message}
            </StatusBox>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label={tl("reset.emailLabel")}
              name="resetEmail"
              type="email"
              value={email}
              onChange={(event) => onChangeEmail(event.target.value)}
              placeholder={tl("reset.emailPlaceholder")}
              icon={<Mail size={16} />}
            />

            <PrimaryButton
              type="submit"
              disabled={loading}
              icon={!loading && <ArrowRight size={16} />}
              className="py-3"
            >
              {loading ? tl("reset.loading") : tl("reset.submit")}
            </PrimaryButton>
          </form>
        </div>
      </section>
    </div>
  );
}

function SocialLoginButtons({ onSocialLogin, supabase, setError, setLoading, navigate }) {
  const { t } = useTranslation();
  const tl = (key, options) => t(`auth.login.${key}`, options);
  
  return (
    <div className="mt-3 flex flex-col gap-3">
      {/* Botón de Google */}
      <button
        type="button"
        onClick={() => onSocialLogin("google")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 active:scale-[0.98]"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        {tl("social.google")}
      </button>

      {/* Botón de Facebook */}
      <button
        type="button"
        onClick={() => onSocialLogin("facebook")}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#166fe5] active:scale-[0.98]"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        {tl("social.facebook")}
      </button>

      {/* Botón de Apple Seguro */}
      <AppleSignInButton
        supabase={supabase}
        acceptedPolicies={true}
        onError={setError}
        onLoading={setLoading}
        label={tl("social.apple")}
        policyError={tl("errors.policiesRequired")}
        connectionErrorPrefix={tl("errors.connect")}
        cancelledMessage={tl("errors.appleUnavailable")}
        fallbackName={tl("social.appleFallbackName")}
        redirectTo={`${window.location.origin}/dashboard`}
        onSuccess={async (data) => {
          const user = data?.user;
          if (user) {
            trackEvent("login", { method: "apple" });
            navigate("/dashboard", { replace: true });
          }
        }}
      />
    </div>
  );
}



function Input({ label, icon, ...props }) {
  return (
    <FormField label={label} icon={icon}>
      <input
        {...props}
        className="h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-bold text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)]/55"
      />
    </FormField>
  );
}

function ActiveCore() {
  const { t } = useTranslation();
  const tl = (key, options) => t(`auth.login.${key}`, options);
  return (
    <SurfaceCard className="relative overflow-hidden p-2.5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#22d3ee22,transparent_32%),radial-gradient(circle_at_90%_20%,var(--app-primary)24,transparent_36%)]" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[var(--app-primary)]/25 to-transparent" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <div className="absolute inset-0 rounded-full bg-[var(--app-primary)]/15 blur-xl" />
          <div className="absolute inset-0 animate-[spin_3.6s_linear_infinite] rounded-full border border-[var(--app-primary)]/20 border-t-[var(--app-primary)]" />
          <div className="absolute inset-[8px] animate-[spin_5s_linear_infinite_reverse] rounded-full border border-cyan-300/10 border-b-cyan-300/45" />
          <div className="absolute inset-[18px] rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl" />
          <div className="relative h-5 w-5 rounded-full bg-[var(--app-primary)] shadow-[0_0_24px_var(--app-glow)]" />
          <span className="absolute left-3 top-4 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
          <span className="absolute bottom-4 right-3 h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-primary)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--app-primary)]">
              {tl("hero.badge")}
            </p>
          </div>

          <p className="text-sm font-black uppercase italic leading-5 text-[var(--app-text)]">
            {tl("hero.title")}
          </p>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <CoreHighlight
              icon={<Target size={12} />}
              label={tl("hero.features.smartPlans")}
            />
            <CoreHighlight
              icon={<ScanLine size={12} />}
              label={tl("hero.features.visualAnalysis")}
            />
            <CoreHighlight
              icon={<Activity size={12} />}
              label={tl("hero.features.adaptiveProgress")}
            />
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function CoreHighlight({ icon, label }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[var(--app-primary)]">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase leading-3 text-[var(--app-muted)]">
        {label}
      </p>
    </div>
  );
}
