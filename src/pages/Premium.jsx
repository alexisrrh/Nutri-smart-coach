import {
  ArrowLeft,
  ArrowRight,
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
  SecondaryButton,
  SurfaceCard,
} from "../components/ui";
import { useAuth } from "../context/useAuth";
import { getFriendlyErrorMessage } from "../services/apiClient";
import {
  createCustomerPortalSession,
  createPremiumCheckoutSession,
  getPremiumStatus,
} from "../services/premiumService";
import { trackEvent } from "../services/analytics";
import { getRuntimePlatform } from "../services/platform";

const comparisonRows = [
  { label: "Análisis IA", free: "4/día", premium: "100/día" },
  { label: "Dietas", free: "1/día", premium: "10/día" },
  { label: "Check-ins", free: "1/día", premium: "7/día" },
  { label: "Prioridad", free: "Normal", premium: "Prioritaria" },
];

const premiumHighlights = [
  {
    icon: Bolt,
    title: "Límites ampliados",
    copy: "Más capacidad diaria para IA.",
  },
  {
    icon: BarChart3,
    title: "Progreso avanzado",
    copy: "Lecturas más claras y útiles.",
  },
  {
    icon: TimerReset,
    title: "Prioridad operativa",
    copy: "Respuestas con menos espera.",
  },
  {
    icon: Layers3,
    title: "Futuras funciones",
    copy: "Acceso temprano a nuevas capas.",
  },
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
  const isPremium = Boolean(premiumStatus?.is_premium);
  const premiumSource = premiumStatus?.premium_source || null;
  const statusLabel = useMemo(() => {
    if (loadingAuth || loadingStatus) return "Sincronizando";
    if (!user) return "Inicia sesión";
    if (isPremium) return "Premium activo";
    if (!isWebPlatform) return "Compra preparada";

    return "Plan Free";
  }, [isPremium, isWebPlatform, loadingAuth, loadingStatus, user]);

  const heroTitle = isPremium ? "Premium activo" : "Desbloquea Premium";
  const heroSubtitle = isPremium
    ? "Tus límites ampliados están activos."
    : isWebPlatform
      ? "100 análisis IA/día · 10 dietas IA/día · 7 check-ins IA/día"
      : "Compra segura dentro de la app.";
  const heroChips = isPremium
    ? ["100 análisis", "10 dietas", "7 check-ins", "Prioridad IA"]
    : ["Límites ampliados", "100 análisis", "10 dietas", "7 check-ins"];
  const billingBadge = isWebPlatform
    ? "Pago seguro"
    : "Compra segura dentro de la app";
  const billingDetail = isWebPlatform
    ? premiumSource === "stripe"
      ? "Gestionado por Stripe"
      : "Pago seguro gestionado por el backend"
    : "TODO: Apple IAP / Google Play Billing";

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
    <AppShell wide contentClassName="!px-2 !pt-2 !pb-28">
      <main className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-2.5 rounded-[28px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2.5 py-2.5 shadow-[0_24px_60px_-18px_var(--app-glow)] md:my-6 md:min-h-[720px] md:rounded-[34px] md:border-8 md:px-3 md:py-3">
          <header className="shrink-0">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <SecondaryButton
                onClick={() => navigate(-1)}
                icon={<ArrowLeft size={14} />}
                className="w-auto px-2.5 py-1.5 text-[10px]"
              >
                Volver
              </SecondaryButton>

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
                    <MetaBadge variant="neutral">{statusLabel}</MetaBadge>
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

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {heroChips.map((chip) => (
                      <PremiumChip key={chip}>{chip}</PremiumChip>
                    ))}
                  </div>

                  {isPremium && premiumSource === "stripe" ? (
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      Gestionado por Stripe
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
                    Beneficios activos
                  </h2>
                  <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                    100 análisis IA/día · 10 dietas IA/día · 7 check-ins IA/día
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                  <Sparkles size={15} />
                </span>
              </div>
            </SurfaceCard>
          ) : null}

          <SurfaceCard className="p-3" radius="lg" variant="soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <MetaBadge variant="neutral">Suscripción</MetaBadge>
                <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                  {isPremium ? "Gestiona tu suscripción" : isWebPlatform ? "Activa Premium" : "Compras dentro de la app"}
                </h2>
                <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                  {isPremium
                    ? "Administra el plan desde Stripe."
                    : isWebPlatform
                      ? "Checkout seguro con Stripe. El acceso premium se activa cuando el webhook confirma la suscripción."
                      : "TODO: Apple IAP / Google Play Billing. La compra dentro de la app se conectará en una siguiente fase."}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                  {billingDetail}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]">
                <ArrowRight size={15} />
              </span>
            </div>

            {checkoutState === "success" ? (
              <StatusNotice>Pago recibido. Confirmamos la suscripción con Stripe.</StatusNotice>
            ) : null}

            {checkoutState === "cancelled" ? (
              <StatusNotice>Pago cancelado. Puedes retomarlo cuando quieras.</StatusNotice>
            ) : null}

            {errorMessage ? <StatusNotice tone="error">{errorMessage}</StatusNotice> : null}

            {isWebPlatform ? (
              <div className="mt-3 grid gap-2">
                {isPremium ? (
                  <PrimaryButton
                    disabled={Boolean(actionLoading)}
                    icon={<Sparkles size={14} />}
                    onClick={handleCustomerPortal}
                  >
                    {actionLoading === "portal" ? "Abriendo..." : "Gestionar suscripción"}
                  </PrimaryButton>
                ) : (
                  <>
                    <PrimaryButton
                      disabled={loadingAuth || loadingStatus || Boolean(actionLoading)}
                      icon={<Sparkles size={14} />}
                      onClick={() => handleCheckout("monthly")}
                    >
                      {actionLoading === "monthly" ? "Abriendo..." : "Premium mensual"}
                    </PrimaryButton>
                    <SecondaryButton
                      disabled={loadingAuth || loadingStatus || Boolean(actionLoading)}
                      icon={<Crown size={14} />}
                      onClick={() => handleCheckout("yearly")}
                    >
                      {actionLoading === "yearly" ? "Abriendo..." : "Premium anual"}
                    </SecondaryButton>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                Compra segura dentro de la app.
                <br />
                TODO: Apple IAP / Google Play Billing.
              </div>
            )}
          </SurfaceCard>

          {!isPremium && isWebPlatform ? (
            <>
              <SurfaceCard className="p-3" radius="lg" variant="soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <MetaBadge variant="neutral">Comparación</MetaBadge>
                    <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                      Free vs Premium
                    </h2>
                    <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--app-muted)]">
                      Capacidad diaria y prioridad.
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                    Vista previa
                  </span>
                </div>

                <div className="mt-2.5 grid gap-1.5">
                  <div className="grid grid-cols-[1.2fr_.8fr_.9fr] gap-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    <span />
                    <span className="text-center">Free</span>
                    <span className="text-center text-[var(--app-primary)]">Premium</span>
                  </div>

                  {comparisonRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[1.2fr_.8fr_.9fr] items-center gap-1.5 rounded-[0.9rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    >
                      <span className="min-w-0 truncate text-[11px] font-medium text-[var(--app-text)]">
                        {row.label}
                      </span>
                      <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-[3px] text-center text-[8px] font-semibold text-[var(--app-muted)]">
                        {row.free}
                      </span>
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_72%,transparent)_0%,color-mix(in_srgb,var(--app-primary-soft)_42%,transparent)_100%)] px-2 py-[3px] text-center text-[8px] font-semibold text-[var(--app-text)] shadow-[0_0_14px_var(--app-glow)]">
                        {row.premium}
                      </span>
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-3" radius="lg" variant="soft">
                <MetaBadge variant="neutral">Ventajas</MetaBadge>
                <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                  Lo que desbloquea
                </h2>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {premiumHighlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-2.5 rounded-[0.95rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]">
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[12px] font-semibold leading-tight text-[var(--app-text)]">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                            {item.copy}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </SurfaceCard>
            </>
          ) : null}
        </div>
      </main>
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

function PremiumChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--app-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_84%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2 py-[3px] text-[8px] font-medium tracking-[0.12em] text-[var(--app-text)] shadow-[0_0_12px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
      {children}
    </span>
  );
}
