import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveProfile } from "../services/profileService";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  clearStoredReferralCode,
  clearOAuthReferralFlowPending,
  validateAndStoreReferralCode,
  finalizeReferralCodeApplication,
  getStoredReferralCode,
  prepareOAuthReferralCode,
} from "../services/referralOnboardingService";
import {
  applyPendingCreatorCode,
  clearStoredCreatorCode,
  getStoredCreatorCode,
} from "../services/creatorTrackingService";
import {
  buildAcceptedLegalConsent,
  setPendingLegalConsent,
} from "../services/legalConsentService";
import {
  Mail,
  Lock,
  User,
  Gift,
  ArrowRight,
} from "lucide-react";
import {
  AppShell,
  FormField,
  PrimaryButton,
  SecondaryButton,
  StatusBox,
  SurfaceCard,
} from "../components/ui";
import { trackEvent } from "../services/analytics";
import { AppleSignInButton } from "../components/Home/AppleSignInButton";
import { signInWithGoogle } from "../services/googleAuthService";

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tr = useCallback((key, options) => t(`auth.register.${key}`, options), [t]);
  const tc = useCallback((key, options) => t(`auth.common.${key}`, options), [t]);
  const [creatorCode] = useState(() => getStoredCreatorCode());
  const [referralOpen, setReferralOpen] = useState(Boolean(getStoredReferralCode()));
  const isAndroidNative =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [referralCode, setReferralCode] = useState(() => getStoredReferralCode());
  const [referralNote, setReferralNote] = useState("");
  const [referralError, setReferralError] = useState("");
  const [referralSaving, setReferralSaving] = useState(false);
  const [referralValidating, setReferralValidating] = useState(false);

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
          setError(tr("errors.callbackFailed") + exchangeError.message);
          return;
        }

        setError("");
        setSuccess("");
        navigate("/dashboard", { replace: true });
      } catch (callbackError) {
        setError(
          tr("errors.callbackFailed") +
            (callbackError?.message || tr("errors.callbackInvalid"))
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
  }, [isAndroidNative, navigate, tr]);

  async function handleSocialLogin(provider) {
    if (!acceptedPolicies) {
      setError(tr("errors.policiesRequired"));
      return;
    }

    setPendingLegalConsent(buildAcceptedLegalConsent());
    prepareOAuthReferralCode(getStoredReferralCode());
    trackEvent("oauth_started", {
      provider,
    });

    const redirectTo = isAndroidNative
      ? "com.nutrismartcoach.app://login-callback"
      : `${window.location.origin}/perfil`;


    const { error: socialError } =
      provider === "google"
        ? await signInWithGoogle({ redirectTo })
        : await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo,
            },
          });

    if (socialError) setError(tr("errors.connect") + socialError.message);
    if (socialError) {
      clearStoredReferralCode();
      clearOAuthReferralFlowPending();
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleReferralCodeChange(event) {
    const nextValue = event.target.value;
    setReferralCode(nextValue);
    setReferralNote("");
    setReferralError("");
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
  }

  async function handleSaveReferralCode() {
    const normalized = String(referralCode || "").trim();

    if (!normalized) {
      clearStoredReferralCode();
      setReferralNote("");
      setReferralError("");
      return;
    }

    setReferralValidating(true);
    setReferralError("");
    setReferralNote(tr("invitationValidating"));

    try {
      const validation = await validateAndStoreReferralCode(normalized);

      if (!validation.valid) {
        setReferralNote("");
        setReferralError(validation.message || tr("errors.invalidReferral"));
        clearStoredReferralCode();
        return;
      }

      setReferralNote(validation.message || tr("referralApplied"));
      setReferralError("");
    } catch (validationError) {
      clearStoredReferralCode();
      setReferralNote("");
        setReferralError(
          validationError?.message || tr("errors.invalidReferral")
        );
    } finally {
      setReferralValidating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.nombre.trim() || !form.email.trim() || !form.password) {
      setLoading(false);
      setError(tr("errors.completeFields"));
      return;
    }

    if (form.password.length < 6) {
      setLoading(false);
      setError(tr("errors.passwordTooShort"));
      return;
    }

    if (!acceptedPolicies) {
      setLoading(false);
      setError(tr("errors.policiesRequired"));
      return;
    }

    const legalConsent = buildAcceptedLegalConsent();

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          nombre: form.nombre.trim(),
          ...legalConsent,
        },
      },
    });

    if (error) {
      setLoading(false);
      setError(tr("errors.signUpFailed") + error.message);
      return;
    }

    const user = data?.user;

    if (user) {
      try {
        await saveProfile({
          id: user.id,
          user_id: user.id,
          email: user.email,
          name: form.nombre.trim(),
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
            meals_per_day: 4,
          },
          ...legalConsent,
          updated_at: new Date().toISOString(),
          
        });
        trackEvent("sign_up", {
          method: "email",
        });
      } catch (profileError) {
        if (profileError?.message) {
          setError(profileError.message || tr("errors.profileFailed"));
        } else {
          setError(tr("errors.profileFailed"));
        }
        console.error("Error creando perfil:", profileError);
        setLoading(false);
        setReferralSaving(false);
        return;
      } finally {
        setReferralSaving(false);
      }

      const validatedReferralCode = getStoredReferralCode();
      const pendingCreatorCode = getStoredCreatorCode();
      let creatorApplied = false;

      if (pendingCreatorCode.trim()) {
        try {
          setReferralSaving(true);
          const creatorResult = await applyPendingCreatorCode();
          creatorApplied = Boolean(creatorResult?.applied);
          const creatorMessage = creatorResult?.message || "";
          if (creatorMessage) {
            setReferralNote(creatorMessage);
            setSuccess(creatorMessage);
          }
          setError("");
        } catch (referralError) {
          const referralMessage =
            referralError?.message ||
            tr("errors.invalidReferral");
          setReferralError(referralMessage);
          setSuccess("");
          setError(referralMessage);
        } finally {
          setReferralSaving(false);
        }
      }

      if (!creatorApplied && validatedReferralCode.trim()) {
        try {
          setReferralSaving(true);
          const referralResult = await finalizeReferralCodeApplication(
            validatedReferralCode
          );
          const referralMessage = referralResult.message || "";
          setReferralNote(referralMessage);
          setError("");
          if (referralMessage) {
            setSuccess(referralMessage);
          }
        } catch (referralError) {
          const referralMessage =
            referralError?.message ||
            tr("errors.invalidReferral");
          setReferralError(referralMessage);
          setSuccess("");
          setError(referralMessage);
        } finally {
          setReferralSaving(false);
        }
      }

      clearStoredReferralCode();
      setReferralCode("");
      clearStoredCreatorCode();
    }

    setLoading(false);
    await new Promise((resolve) => setTimeout(resolve, 900));
    navigate("/perfil");
  }

  return (
    <AppShell
      withBottomNav={false}
      contentClassName="!px-3 !pb-3 !pt-[calc(env(safe-area-inset-top)+16px)]"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-3">
        <SurfaceCard className="relative overflow-hidden p-2">
          <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

          <div className="relative z-10 pt-0.5">
            <div className="mb-2 flex items-center gap-4 justify-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-[0_0_30px_var(--app-glow)]">
                <img
                  src="/favicon.png"
                  alt={tr("title")}
                  className="h-full w-full rounded-2xl object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-2xl font-black uppercase italic leading-none tracking-tight text-[var(--app-text)]">
                  {tr("title")}
                </h1>
              </div>
            </div>

            <p className="mb-3 text-sm leading-5 text-[var(--app-muted)] text-center">
              {tr("subtitle")}
            </p>

            {error && (
              <StatusBox type="error" className="mb-4 p-3 text-xs leading-5">
                {error}
              </StatusBox>
            )}
            {success && (
              <StatusBox type="success" className="mb-4 p-3 text-xs leading-5">
                {success}
              </StatusBox>
            )}

            {creatorCode ? (
              <div className="mb-4 rounded-[22px] border border-[color-mix(in_srgb,#D4AF37_20%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#D4AF37_10%,var(--app-surface)),var(--app-card))] p-3 shadow-[0_0_0_1px_color-mix(in_srgb,#D4AF37_8%,transparent)]">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,#D4AF37_50%,transparent)] bg-[linear-gradient(180deg,#D4AF3720,#D4AF370d)] text-[#D4AF37]">
                    <Gift size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">
                      {tr("creatorCodeApplied")}
                    </p>
                    <div className="mt-2 inline-flex max-w-full items-center rounded-full border border-[color-mix(in_srgb,#D4AF37_22%,var(--app-border))] bg-[var(--app-surface)] px-3 py-2">
                      <span className="truncate whitespace-nowrap text-[12px] font-black tracking-[0.2em] text-[var(--app-text)]">
                        {creatorCode}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-[var(--app-muted)]">
                      {tr("creatorBonusLine1")}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold leading-4 text-[#D4AF37]">
                      {tr("creatorBonusLine2")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <Input
                label={tr("nameLabel")}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder={tr("namePlaceholder")}
                icon={<User size={16} />}
              />

              <Input
                label={tr("emailLabel")}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={tr("emailPlaceholder")}
                icon={<Mail size={16} />}
              />

              <Input
                label={tr("passwordLabel")}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={tr("passwordPlaceholder")}
                icon={<Lock size={16} />}
              />

              <div className="rounded-[22px] border border-[color-mix(in_srgb,var(--app-primary)_14%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,transparent),var(--app-surface))] p-3 shadow-[0_0_0_1px_color-mix(in_srgb,var(--app-primary)_8%,transparent)]">
                <button
                  type="button"
                  onClick={() => setReferralOpen((value) => !value)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">
                      {tr("invitationQuestion")}
                    </p>
                    <h2 className="mt-0.5 text-[12px] font-bold leading-4 text-[var(--app-text)]">
                      {tr("invitationSubtitle")}
                    </h2>
                  </div>

                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,#D4AF37_50%,transparent)] bg-[linear-gradient(180deg,#D4AF3720,#D4AF370d)] text-[#D4AF37]">
                    <Gift size={14} />
                  </div>
                </button>

                {referralOpen ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={handleReferralCodeChange}
                        placeholder={tr("invitationPlaceholder")}
                        className="h-11 w-full min-w-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--app-text)] outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <SecondaryButton
                        type="button"
                        onClick={handleSaveReferralCode}
                        disabled={referralSaving || referralValidating}
                        className="h-11 w-full shrink-0 px-4 text-[10px] sm:w-auto sm:px-4"
                      >
                        {referralValidating
                          ? tr("invitationValidating")
                          : tr("invitationApply")}
                      </SecondaryButton>
                    </div>

                    {referralNote ? (
                      <StatusBox type="success" className="p-2.5 text-[11px] leading-4">
                        {referralNote}
                      </StatusBox>
                    ) : null}
                    {referralError ? (
                      <StatusBox type="error" className="p-2.5 text-[11px] leading-4">
                        {referralError}
                      </StatusBox>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[22px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent),var(--app-card))] p-3 shadow-[inset_0_0_0_1px_var(--app-border)]">
                <label className="flex items-start gap-3">
                  <span className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[7px] border border-[var(--app-border)] bg-[var(--app-card)]">
                    <input
                      type="checkbox"
                      checked={acceptedPolicies}
                      onChange={(event) => setAcceptedPolicies(event.target.checked)}
                      className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span className={`h-3.5 w-3.5 rounded-[5px] transition ${acceptedPolicies ? "bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]" : "bg-transparent"}`} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[12px] font-bold leading-5 text-[var(--app-text)]">
                      {tr("policyCheckbox")}
                    </span>
                    <span className="mt-1 block text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                      <Link className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]" to="/privacy">
                        {tc("privacyPolicy")}
                      </Link>
                      {" "}•{" "}
                      <Link className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]" to="/terms">
                        {tc("termsOfService")}
                      </Link>
                    </span>
                  </span>
                </label>
              </div>

              <PrimaryButton
                disabled={loading || referralSaving}
                icon={!loading && !referralSaving && <ArrowRight size={16} />}
                type="submit"
                className="mt-1 py-3"
              >
                {loading || referralSaving
                  ? tr("loading")
                  : tr("submit")}
              </PrimaryButton>
            </form>

            <div className="mt-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5 text-center">
              <p className="text-sm text-[var(--app-muted)]">
                {tr("haveAccount")}{" "}
                <Link
                  to="/login"
                  className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]"
                >
                  {tr("signIn")}
                </Link>
            
                </p> 
                <br/>

              <div className="flex flex-col gap-3 mb-6">
                {/* Botón de Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  {tr("social.google")}
                </button>

                {/* Botón de Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("facebook")}
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-[#1877F2] text-white font-medium rounded-xl shadow-sm hover:bg-[#166fe5] active:scale-[0.98] transition-all duration-200 text-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  {tr("social.facebook")}
                </button>

                <AppleSignInButton
                  supabase={supabase}
                  acceptedPolicies={acceptedPolicies}
                  onError={setError}
                  onLoading={setLoading}
                  label={tr("social.apple")}
                  policyError={tr("errors.policiesRequired")}
                  connectionErrorPrefix={tr("errors.connect")}
                  cancelledMessage={tr("errors.appleUnavailable")}
                  fallbackName={tr("social.appleFallbackName")}
                  redirectTo={`${window.location.origin}/perfil`}
                  onBeforeSignIn={() => {
                    setPendingLegalConsent(buildAcceptedLegalConsent());
                    prepareOAuthReferralCode(getStoredReferralCode());
                  }}
                  onSuccess={async (data, appleName) => {
                    const user = data?.user;
                    if (user) {
                      try {
                        await saveProfile({
                          id: user.id,
                          user_id: user.id,
                          email: user.email,
                          name: appleName,
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
                            meals_per_day: 4,
                          },
                          ...buildAcceptedLegalConsent(),
                          updated_at: new Date().toISOString(),
                        });
                        trackEvent("sign_up", { method: "apple" });
                      } catch (profileError) {
                        console.error("Error creando perfil:", profileError);
                      }
                      
                      navigate("/dashboard", { replace: true });
                    }
                  }}
                />


              </div>

            </div>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
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
