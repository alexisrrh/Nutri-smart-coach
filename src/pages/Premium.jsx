import {
  ArrowLeft,
  ArrowLeftRight,
  BarChart3,
  Bolt,
  Crown,
  Layers3,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AppShell,
  MetaBadge,
  PrimaryButton,
  SurfaceCard,
} from "../components/ui";
import { PremiumReferralBanner } from "./premiumReferralBanner";
import { useAuth } from "../context/useAuth";
import { getFriendlyErrorMessage } from "../services/apiClient";
import {
  createCustomerPortalSession,
  createPremiumCheckoutSession,
  getPremiumStatus,
} from "../services/premiumService";
import { trackEvent } from "../services/analytics";
import { getRuntimePlatform } from "../services/platform";
import { getPremiumReferralBannerCopy } from "./premiumReferralBannerCopy";

const comparisonRows = [
  { label: "Análisis IA", free: "3/día", premium: "20/día" },
  { label: "Dietas IA", free: "1/semana", premium: "5/día" },
  { label: "Check-ins IA", free: "1/semana", premium: "1/día" },
  { label: "Cambiar comidas", free: "❌", premium: "✅" },
  { label: "Personalización", free: "Básica", premium: "Avanzada" },
  { label: "Seguimiento", free: "Básico", premium: "Avanzado" },
  { label: "Recomendaciones IA", free: "Básicas", premium: "Avanzadas" },
  { label: "Historial", free: "Limitado", premium: "Completo" },
];

export function Premium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loadingAuth } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const trackedCheckoutSuccessRef = useRef(false);

  const checkoutState = searchParams.get("checkout");
  const runtimePlatform = getRuntimePlatform();
  const isWebPlatform = runtimePlatform === "web";
  const isIosPlatform = runtimePlatform === "ios";
  const isAndroidPlatform = runtimePlatform === "android";
  const isNativePlatform = isIosPlatform || isAndroidPlatform;
  const isPremium = Boolean(premiumStatus?.is_premium);
  const premiumSource = premiumStatus?.premium_source || null;
  const acquisitionSource = premiumStatus?.acquisition_source || "normal";
  const referralBannerCopy = getPremiumReferralBannerCopy(premiumStatus);
  const showReferralBanner = Boolean(referralBannerCopy);
  const nativeStoreLabel = isIosPlatform
    ? "App Store"
    : isAndroidPlatform
    ? "Google Play"
    : "tu tienda";
  const premiumSourceLabel = useMemo(() => {
    if (premiumSource === "stripe") return "Gestionado por Stripe";
    if (premiumSource === "apple") return "Gestionado por App Store";
    if (premiumSource === "google") return "Gestionado por Google Play";
    if (premiumSource === "manual") return "Activado por el equipo";

    return "";
  }, [premiumSource]);
  const subscriptionTitle = isNativePlatform
    ? `Compra en ${nativeStoreLabel}`
    : "Activa Premium";
  const subscriptionDescription = isNativePlatform
    ? `En esta app, Premium se activa desde ${nativeStoreLabel}. No necesitas salir de NutriSmart Coach para completar la compra cuando esté disponible.`
    : "Desbloquea los nuevos límites oficiales y las funciones avanzadas de NutriCoach.";
  const hasCreatorReferral = Boolean(
    acquisitionSource === "creator" ||
      acquisitionSource === "influencer" ||
      premiumStatus?.trial_source === "creator_trial" ||
      premiumStatus?.trial_source === "influencer_trial"
  );
  const trialHeadline = hasCreatorReferral
    ? "Con código de creador: 15 días gratis"
    : "Prueba Premium gratis 7 días";
  const trialDisclaimer =
    "Se requiere método de pago. Cancela cuando quieras antes de que termine la prueba.";
  const nativeAvailabilityMessage = isNativePlatform
    ? `Estamos terminando la compra desde ${nativeStoreLabel}. Cuando esté lista podrás activar Premium desde esta misma pantalla.`
    : "";

  const heroTitle = isPremium ? "Premium activo" : "Consigue resultados más rápido";
  const heroSubtitle = isPremium
    ? "Tus nuevos límites oficiales y herramientas avanzadas ya están activos."
    : "Más capacidad diaria para analizar, ajustar y seguir tu progreso sin quedarte corto.";
  const heroChips = isPremium
    ? [
        { icon: Bolt, label: "20 análisis IA al día" },
        { icon: BarChart3, label: "5 dietas IA al día" },
        { icon: TimerReset, label: "1 check-in IA al día" },
        { icon: Layers3, label: "Seguimiento avanzado" },
      ]
    : [
        { icon: Sparkles, label: "3 análisis IA al día" },
        { icon: BarChart3, label: "1 dieta IA por semana" },
        { icon: TimerReset, label: "1 check-in IA por semana" },
        { icon: ArrowLeftRight, label: "Cambios ilimitados" },
      ];
  const billingBadge = "PAGO SEGURO";

  useEffect(() => {
    if (checkoutState === "success" && !trackedCheckoutSuccessRef.current) {
      trackedCheckoutSuccessRef.current = true;
      trackEvent("premium_subscription_created");
    }

    if (checkoutState !== "success") {
      trackedCheckoutSuccessRef.current = false;
    }
  }, [checkoutState]);

  useEffect(() => {
    let isMounted = true;

    async function loadPremiumStatus() {
      if (!user?.id) {
        if (isMounted) setLoadingStatus(false);
        return;
      }

      try {
        setLoadingStatus(true);
        const status = await getPremiumStatus();

        if (isMounted) setPremiumStatus(status);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getFriendlyErrorMessage(error, "consultar el estado premium"));
        }
      } finally {
        if (isMounted) setLoadingStatus(false);
      }
    }

    void loadPremiumStatus();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  async function handleCheckout(plan) {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setErrorMessage("");
      trackEvent("premium_checkout_started", { plan });
      setActionLoading(plan);
      const url = await createPremiumCheckoutSession(plan);

      if (!url) throw new Error("Stripe no devolvió una sesión de pago.");

      window.location.assign(url);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error, "crear la sesión de pago"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleCustomerPortal() {
    try {
      setErrorMessage("");
      setActionLoading("portal");
      const url = await createCustomerPortalSession();

      if (!url) throw new Error("Stripe no devolvió el portal de cliente.");

      window.location.assign(url);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error, "abrir el portal de cliente"));
    } finally {
      setActionLoading("");
    }
  }

  return (
      <AppShell
   className="overflow-hidden "
  contentClassName="px-2 pt-2"
  scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
      <div
        className="flex h-full min-h-0 flex-col gap-1"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
      <main className="flex ">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-2 rounded-[28px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2.5 py-2.5 shadow-[0_24px_60px_-18px_var(--app-glow)] md:my-6 md:rounded-[34px] md:border-8 md:px-3 md:py-3">
          <header className="shrink-0">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Volver"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[0.95rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] text-[var(--app-text)] shadow-[0_0_14px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_0_18px_var(--app-glow)] active:scale-[0.96] active:translate-y-[1px]"
              >
                <ArrowLeft size={14} />
              </button>

              <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
                {billingBadge}
              </MetaBadge>
            </div>

            <SurfaceCard className="relative overflow-hidden p-3" radius="xl">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 14%, transparent), transparent 28%), radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 26%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 5%, transparent), transparent 30%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_28%,rgba(0,0,0,0.1)_100%)]" />

              <div className="relative z-10 flex items-start gap-3">
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] text-[var(--app-primary)] shadow-[0_0_24px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--app-primary)_18%,transparent),transparent_58%)] opacity-80" />
                  <div className="absolute inset-2 rounded-full border border-[var(--app-primary)]/12 animate-[restOrbPulse_4.5s_ease-in-out_infinite]" />
                  <div className="absolute inset-3 rounded-full border border-[var(--app-primary)]/20 animate-[restOrbPulse_5.4s_ease-in-out_infinite]" />
                  <Crown size={24} className="relative z-10" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <MetaBadge variant="neutral">PREMIUM</MetaBadge>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
                      {billingBadge}
                    </span>
                  </div>

                  <h1 className="mt-2 text-[21px] font-semibold leading-tight tracking-tight text-[var(--app-text)] sm:text-[24px]">
                    {heroTitle}
                  </h1>
                  <p className="mt-1.5 max-w-[26rem] text-[12px] font-medium leading-5 text-[var(--app-muted)] sm:text-[13px]">
                    {heroSubtitle}
                  </p>

                  <div className="mt-2.5 grid grid-cols-1 gap-1.5 min-[390px]:grid-cols-2">
                    {heroChips.map((chip) => (
                      <PremiumChip key={chip.label} icon={chip.icon}>
                        {chip.label}
                      </PremiumChip>
                    ))}
                  </div>

                  {isPremium && premiumSourceLabel ? (
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      {premiumSourceLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </SurfaceCard>
          </header>

          {isPremium ? (
            <SurfaceCard className="p-3" radius="lg" variant="soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <MetaBadge variant="neutral">Estado</MetaBadge>
                  <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                    Premium activo
                  </h2>
                  <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                    Tus nuevos límites oficiales y herramientas avanzadas están activos.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                  <Sparkles size={15} />
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {[
                  { icon: Bolt, title: "20 análisis IA diarios" },
                  { icon: BarChart3, title: "5 dietas IA diarias" },
                  { icon: TimerReset, title: "1 check-in IA diario" },
                  { icon: Layers3, title: "Seguimiento avanzado" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex min-w-0 items-center gap-1.5 rounded-[0.95rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]">
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 text-[11px] font-semibold leading-tight text-[var(--app-text)]">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2">
                {premiumSource === "stripe" ? (
                  <PrimaryButton
                    disabled={Boolean(actionLoading)}
                    icon={<Sparkles size={14} />}
                    onClick={handleCustomerPortal}
                  >
                    {actionLoading === "portal" ? "Abriendo..." : "Gestionar suscripción"}
                  </PrimaryButton>
                ) : null}
                {premiumSource === "stripe" && premiumSourceLabel ? (
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    {premiumSourceLabel}
                  </p>
                ) : null}
                {premiumSource === "apple" ? (
                  <StatusNotice>Gestiona tu suscripción desde App Store.</StatusNotice>
                ) : null}
                {premiumSource === "google" ? (
                  <StatusNotice>Gestiona tu suscripción desde Google Play.</StatusNotice>
                ) : null}
                {premiumSource === "manual" ? (
                  <StatusNotice>Tu acceso Premium está activado por el equipo de NutriSmart Coach.</StatusNotice>
                ) : null}
              </div>
            </SurfaceCard>
          ) : (
            <>
              <SurfaceCard className="p-3" radius="lg" variant="soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <MetaBadge variant="neutral">Suscripción</MetaBadge>
                    <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                      {subscriptionTitle}
                    </h2>
                    <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                      {subscriptionDescription}
                    </p>
                  </div>
                </div>

                {isWebPlatform && checkoutState === "success" ? (
                  <StatusNotice>Pago recibido. Confirmamos la suscripción con Stripe.</StatusNotice>
                ) : null}

                {isWebPlatform && checkoutState === "cancelled" ? (
                  <StatusNotice>Pago cancelado. Puedes retomarlo cuando quieras.</StatusNotice>
                ) : null}

                {errorMessage ? <StatusNotice tone="error">{errorMessage}</StatusNotice> : null}

                {isWebPlatform ? (
                  <div className="mt-3 grid gap-2">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
                      {trialHeadline}
                    </p>
                    <p className="text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                      {trialDisclaimer}
                    </p>

                    <button
                      type="button"
                      disabled={loadingAuth || loadingStatus || Boolean(actionLoading)}
                      onClick={() => handleCheckout("monthly")}
                      className="group relative flex w-full items-center justify-between rounded-[1.1rem] border border-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_86%,transparent)_0%,color-mix(in_srgb,var(--app-card)_97%,transparent)_100%)] px-3 py-2 text-left transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_0_20px_var(--app-glow)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                          Premium mensual
                        </span>
                        <span className="mt-0.5 block text-[16px] font-black leading-none text-[var(--app-text)]">
                          7,99 €/mes
                        </span>
                      </span>
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                        Pago seguro
                      </span>
                    </button>

                    <div className="relative overflow-hidden rounded-[1.2rem] border border-[color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_97%,transparent)_100%)] p-3 shadow-[0_0_22px_var(--app-glow)]">
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                          Más popular
                        </span>
                      </div>
                      <div className="pt-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                              Premium anual
                            </span>
                            <span className="mt-0.5 block text-[18px] font-black leading-none text-[var(--app-text)]">
                              59,99 €/año
                            </span>
                            <span className="mt-1 block text-[10px] font-medium text-[var(--app-muted)]">
                              Equivale a 4,99€/mes
                            </span>
                          </div>
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--app-primary)_24%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_90%,transparent)_0%,color-mix(in_srgb,var(--app-primary-soft)_56%,transparent)_100%)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                            Ahorra 37%
                          </span>
                        </div>

                        <PrimaryButton
                          disabled={loadingAuth || loadingStatus || Boolean(actionLoading)}
                          icon={<Crown size={14} />}
                          onClick={() => handleCheckout("yearly")}
                          className="mt-3 transition-all duration-200 ease-out hover:shadow-[0_0_28px_var(--app-glow)] active:scale-[0.97] active:translate-y-[2px] active:brightness-95"
                        >
                          {actionLoading === "yearly" ? "Abriendo..." : "Activar Premium"}
                        </PrimaryButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                    <p className="text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                      {nativeAvailabilityMessage}
                    </p>
                    <button
                      type="button"
                      disabled
                      className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--app-muted)] opacity-70"
                    >
                      {isIosPlatform
                        ? "Compra en App Store próximamente"
                        : isAndroidPlatform
                        ? "Compra en Google Play próximamente"
                        : "Disponible próximamente"}
                    </button>
                  </div>
                )}
              </SurfaceCard>

              {showReferralBanner ? (
                <PremiumReferralBanner premiumStatus={premiumStatus} />
              ) : null}

              {!isPremium ? (
                <>
                  <SurfaceCard className="p-3" radius="lg" variant="soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <MetaBadge variant="neutral">Gratis vs Premium</MetaBadge>
                        <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                          Gratis vs Premium
                        </h2>
                        <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                          Compara los límites reales del plan Free frente al nuevo Premium oficial.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 grid gap-1.5">
                      <div className="grid grid-cols-[1.35fr_.8fr_.95fr] gap-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)] sm:grid-cols-[1.5fr_.75fr_.95fr]">
                        <span />
                        <span className="text-center">Gratis</span>
                        <span className="text-center text-[var(--app-primary)]">Premium</span>
                      </div>

                      {comparisonRows.map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[1.35fr_.8fr_.95fr] items-center gap-1.5 rounded-[0.9rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:grid-cols-[1.5fr_.75fr_.95fr]"
                        >
                          <span className="min-w-0 text-[10px] font-medium leading-tight text-[var(--app-text)] sm:text-[11px]">
                            {row.label}
                          </span>
                          <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-[3px] text-center text-[8px] font-semibold text-[var(--app-muted)] sm:text-[9px]">
                            {row.free}
                          </span>
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_72%,transparent)_0%,color-mix(in_srgb,var(--app-primary-soft)_42%,transparent)_100%)] px-2 py-[3px] text-center text-[8px] font-semibold text-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)] sm:text-[9px]">
                            {row.premium}
                          </span>
                        </div>
                      ))}
                    </div>
                  </SurfaceCard>

                </>
              ) : null}
            </>
          )}
        </div>
      </main>
      </div>
    </AppShell>
  );
}

function StatusNotice({ children, tone = "default" }) {
  const isError = tone === "error";

  return (
    <div
      className={`mt-3 rounded-2xl border px-3 py-2 text-[11px] font-semibold leading-5 ${
        isError
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
      }`}
    >
      {children}
    </div>
  );
}

function PremiumChip({ children, icon: Icon }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-[0.95rem] border border-[color-mix(in_srgb,var(--app-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_82%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2.5 py-2 text-[10px] font-semibold leading-tight tracking-[0.02em] text-[var(--app-text)] shadow-[0_0_10px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
      {Icon ? <Icon size={11} className="shrink-0 text-[var(--app-primary)]" /> : null}
      <span className="min-w-0">{children}</span>
    </span>
  );
}
