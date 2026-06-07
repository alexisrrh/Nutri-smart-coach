import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Copy,
  CreditCard,
  ExternalLink,
  LineChart,
  LoaderCircle,
  Megaphone,
  Rocket,
  Share2,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "../../services/analytics";
import {
  buildCreatorShareText,
  copyCreatorCode,
  getCreatorStatus,
  loadCreatorStatus,
  shareCreatorCode,
  submitCreatorApplication,
} from "../../services/creatorService";
import {
  fieldControlClass,
  MetaBadge,
  PrimaryButton,
  SecondaryButton,
  StatusBox,
  SurfaceCard,
  useToast,
} from "../ui";

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Otro" },
];

const INITIAL_FORM = {
  socialPlatform: "instagram",
  socialHandle: "",
  followersCount: "",
  proofUrl: "",
};

const CREATOR_CODE_RETRY_DELAY_MS = 500;

export function CreatorProgramCardView({
  loading = false,
  status = "none",
  application = null,
  creatorCode = "",
  stats = null,
  profileRequired = false,
  formVisible = false,
  formState = INITIAL_FORM,
  formError = "",
  submitting = false,
  notice = "",
  termsAccepted = false,
  onStartRequest,
  onCancelRequest,
  onSubmitApplication,
  onCopyCode,
  onShareCode,
  onRetryRequest,
  onRetryCodeActivation,
  onChangeFormState,
  onToggleTermsAccepted,
}) {
  const isApproved = status === "approved";
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isEmpty = status === "none";
  const hasCreatorCode = Boolean(creatorCode);
  const linkClicks = stats?.linkClicks ?? stats?.linkClicksCount ?? stats?.clicks ?? null;
  const registeredUsers = Number(stats?.registeredUsers ?? 0);
  const premiumUsers = Number(stats?.premiumUsers ?? 0);
  const pendingCommissionAmount = Number(
    stats?.pendingCommissionAmount ??
      stats?.pendingCommissionsAmount ??
      stats?.pendingAmount ??
      0
  );
  const availableCommissionAmount = Number(
    stats?.availableCommissionAmount ??
      stats?.withdrawableCommissionAmount ??
      stats?.commissionBalance ??
      stats?.availableAmount ??
      0
  );
  const totalCommissionAmount = Number(
    stats?.totalCommissionAmount ??
      stats?.commissionAccumulated ??
      stats?.totalEarnings ??
      stats?.totalCommission ??
      0
  );
  const paymentHistory = Array.isArray(stats?.paymentHistory)
    ? stats.paymentHistory
    : Array.isArray(stats?.recentPayments)
      ? stats.recentPayments
      : Array.isArray(stats?.history)
        ? stats.history
        : [];
  const nextWithdrawalThreshold = 25;
  const canRequestWithdrawal = availableCommissionAmount >= nextWithdrawalThreshold;
  const creatorJoinLinkPreview = buildCreatorJoinLinkPreview(creatorCode);
  const minimumFollowersMet = Number(formState.followersCount || 0) >= 5000;
  const requiresTerms = (isEmpty || isRejected || formVisible) && !isApproved && !isPending;
  const visibleFormError =
    formError && formError !== "No se pudo completar la solicitud." ? formError : "";

  return (
    <SurfaceCard
      className="relative overflow-hidden p-3"
      radius="lg"
      variant="soft"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 10%, color-mix(in srgb, var(--app-primary) 15%, transparent), transparent 30%), radial-gradient(circle at 88% 18%, color-mix(in srgb, #D4AF37 8%, transparent), transparent 26%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 6%, transparent), transparent 28%)",
        }}
      />
      <div className="relative z-10 flex min-w-0 flex-col gap-2">
        {notice && !isPending ? (
          <StatusBox type="success" className="px-2.5 py-1.5 text-[11px] leading-4 break-words">
            {notice}
          </StatusBox>
        ) : null}

        {visibleFormError ? (
          <StatusBox type="error" className="px-2.5 py-1.5 text-[11px] leading-4 break-words">
            {visibleFormError}
          </StatusBox>
        ) : null}

        {loading ? (
          <div className="rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--app-muted)]">
              <LoaderCircle size={12} className="animate-spin text-[var(--app-primary)]" />
              <span>Cargando panel de creadores...</span>
            </div>
          </div>
        ) : null}

        {!loading ? (
          <>
            {isPending ? (
              <ReviewStatus />
            ) : null}

            {!isApproved && !isPending ? (
              <ProgramGuide
                showTerms={requiresTerms}
                termsAccepted={termsAccepted}
                onToggleTermsAccepted={onToggleTermsAccepted}
              />
            ) : null}

            {isEmpty && !formVisible ? (
              <div className="grid gap-1.5">
                <PrimaryButton
                  icon={<IconCapsule icon={TrendingUp} tone="gold" size="xs" />}
                  className="px-3 py-2.5 text-[10px] normal-case tracking-[0.02em] shadow-[0_0_34px_color-mix(in_srgb,#D4AF37_30%,transparent),0_0_28px_color-mix(in_srgb,var(--app-primary)_30%,transparent),0_12px_28px_var(--app-glow)] disabled:opacity-75 disabled:saturate-75"
                  onClick={onStartRequest}
                >
                  <span className="flex min-w-0 flex-col items-start leading-tight">
                    <span className="whitespace-nowrap">Unirme al programa</span>
                    <span className="mt-0.5 text-[8px] font-bold normal-case tracking-normal opacity-80">
                      Respuesta en 24-72 horas
                    </span>
                  </span>
                </PrimaryButton>
              </div>
            ) : null}
          </>
        ) : null}

        {formVisible && !isApproved && !isPending ? (
          <form
            className="grid gap-2 rounded-[1.1rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!termsAccepted) return;
              onSubmitApplication?.(formState);
            }}
          >
            <div className="grid min-w-0 gap-0.5">
              <h2 className="text-[13px] font-black leading-tight text-[var(--app-text)]">
                Solicitud de acceso
              </h2>
              <p className="min-w-0 break-words text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                Revisaremos tu perfil antes de activar tu código.
              </p>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <FormField label="Plataforma">
                <select
                  value={formState.socialPlatform}
                  onChange={(event) =>
                    onChangeFormState?.({
                      ...formState,
                      socialPlatform: event.target.value,
                    })
                  }
                  className={fieldControlClass(
                    "h-11 py-0 text-[12px] font-semibold placeholder:text-[var(--app-muted)]"
                  )}
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Perfil">
                <input
                  value={formState.socialHandle}
                  onChange={(event) =>
                    onChangeFormState?.({
                      ...formState,
                      socialHandle: event.target.value,
                    })
                  }
                  className={fieldControlClass(
                    "h-11 py-0 text-[12px] font-semibold placeholder:text-[var(--app-muted)]"
                  )}
                  placeholder="@tu_usuario o enlace"
                />
              </FormField>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <FormField label="Seguidores">
                <input
                  type="number"
                  min="0"
                  value={formState.followersCount}
                  onChange={(event) =>
                    onChangeFormState?.({
                      ...formState,
                      followersCount: event.target.value,
                    })
                  }
                  className={fieldControlClass(
                    "h-11 py-0 text-[12px] font-semibold placeholder:text-[var(--app-muted)]"
                  )}
                  placeholder="5000"
                />
              </FormField>

              <FormField label="Prueba opcional">
                <input
                  value={formState.proofUrl}
                  onChange={(event) =>
                    onChangeFormState?.({
                      ...formState,
                      proofUrl: event.target.value,
                    })
                  }
                  className={fieldControlClass(
                    "h-11 py-0 text-[12px] font-semibold placeholder:text-[var(--app-muted)]"
                  )}
                  placeholder="Enlace o media kit"
                />
              </FormField>
            </div>

            {!minimumFollowersMet ? (
              <StatusBox type="info" className="px-2 py-1.5 text-[10px] leading-4 break-words">
                Puedes enviar tu solicitud aunque aún no superes los 5.000 seguidores.
              </StatusBox>
            ) : null}

            <div className="grid grid-cols-2 gap-1.5">
              <SecondaryButton
                type="button"
                onClick={onCancelRequest}
                className="h-10 px-2.5 py-0 text-[10px] normal-case tracking-[0.02em] whitespace-nowrap"
              >
                Cancelar
              </SecondaryButton>

              <PrimaryButton
                type="submit"
                disabled={submitting || !termsAccepted}
                icon={submitting ? <LoaderCircle size={14} className="animate-spin" /> : <IconCapsule icon={TrendingUp} tone="gold" size="xs" />}
                className="h-10 px-3 py-0 text-[10px] normal-case tracking-[0.02em] whitespace-nowrap shadow-[0_0_30px_color-mix(in_srgb,#D4AF37_24%,transparent),0_0_24px_color-mix(in_srgb,var(--app-primary)_24%,transparent),0_10px_22px_var(--app-glow)] disabled:opacity-75 disabled:saturate-75"
              >
                {submitting ? "Enviando..." : "Enviar"}
              </PrimaryButton>
            </div>
          </form>
        ) : null}

        {isRejected ? (
          <div className="grid gap-2 rounded-[1.05rem] border border-[color-mix(in_srgb,#D4AF37_16%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-2.5">
            <div className="flex items-start gap-2 text-[11px] font-semibold text-[var(--app-muted)]">
              <IconCapsule icon={AlertCircle} tone="gold" size="sm" />
              <div>
                <h2 className="text-[14px] font-black leading-tight text-[var(--app-text)]">
                  Solicitud no aprobada
                </h2>
                <p className="mt-1 leading-5">
                  Puedes corregir el motivo indicado y volver a solicitar acceso al programa.
                </p>
              </div>
            </div>

            {application?.rejectionReason ? (
              <StatusBox type="error" className="px-2.5 py-1.5 text-[11px] leading-4 break-words">
                {application.rejectionReason}
              </StatusBox>
            ) : null}

            <SecondaryButton
              type="button"
              onClick={onRetryRequest}
              className="py-2 text-[10px]"
            >
              Volver a solicitar
            </SecondaryButton>
          </div>
        ) : null}

        {isApproved ? (
          <div className="grid gap-2 rounded-[1.05rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_82%,transparent),color-mix(in_srgb,var(--app-card)_97%,transparent))] p-2.5">
            {profileRequired && !hasCreatorCode ? (
              <div className="grid gap-2 rounded-[1rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#D4AF37_9%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_97%,transparent))] p-3">
                <div className="flex items-start gap-2">
                  <IconCapsule icon={Users} tone="gold" size="md" />
                  <div className="min-w-0 flex-1">
                    <MetaBadge
                      variant="neutral"
                      className="border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] px-2 py-1 text-[8px] text-[#D4AF37]"
                    >
                      ACTIVO
                    </MetaBadge>
                    <h2 className="mt-1.5 min-w-0 text-[16px] font-black leading-tight text-[var(--app-text)]">
                      Completa tu perfil
                    </h2>
                    <p className="mt-0.5 min-w-0 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                      Necesitamos tu nombre para generar un código de creador fácil de recordar.
                    </p>
                  </div>
                </div>

                <Link
                  to="/settings/profile"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,#D4AF37_28%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_92%,black),color-mix(in_srgb,var(--app-primary)_82%,black))] px-3 py-0 text-[10px] font-black normal-case tracking-normal text-[var(--app-surface)] shadow-[0_0_16px_color-mix(in_srgb,var(--app-primary)_18%,transparent),0_0_18px_color-mix(in_srgb,#D4AF37_12%,transparent)] transition active:scale-[0.98]"
                >
                  Completar perfil
                </Link>
              </div>
            ) : null}

            {hasCreatorCode ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="min-w-0 text-[16px] font-black leading-tight text-[var(--app-text)]">
                      Partner activo
                    </h2>
                    <p className="mt-0.5 min-w-0 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                      Tu código está listo para compartir y generar ingresos.
                    </p>
                  </div>
                  <MetaBadge
                    variant="neutral"
                    className="border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] px-2 py-1 text-[8px] text-[#D4AF37]"
                  >
                    ACTIVO
                  </MetaBadge>
                </div>

                <section className="grid gap-1.5 rounded-[1rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#D4AF37_8%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-black leading-tight text-[var(--app-text)]">
                      Ganancias acumuladas
                    </h3>
                    <IconCapsule icon={Coins} tone="gold" size="xs" />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
                          Total
                        </p>
                        <p className="mt-0.5 text-[28px] font-black leading-none tracking-[-0.02em] text-[#D4AF37] sm:text-[30px]">
                          {formatCurrency(totalCommissionAmount)}
                        </p>
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
                          Disponible
                        </p>
                        <p className="mt-0.5 text-[15px] font-black leading-none tracking-[-0.01em] text-[#22c55e]">
                          {formatCurrency(availableCommissionAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-surface)_85%,transparent)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,#22c55e)]"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, (availableCommissionAmount / nextWithdrawalThreshold) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-semibold leading-4 text-[var(--app-muted)]">
                      <span>{formatCurrency(availableCommissionAmount)} / {formatCurrency(nextWithdrawalThreshold)}</span>
                      <span>Necesitas {formatCurrency(nextWithdrawalThreshold)} para solicitar retiro.</span>
                    </div>
                  </div>
                </section>

                <section className="grid gap-2 rounded-[1.05rem] border border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_84%,black),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-3 shadow-[0_0_18px_color-mix(in_srgb,#D4AF37_12%,transparent)]">
                  <div className="grid gap-2">
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#D4AF37]">
                        Código de creador
                      </p>
                      <div className="mt-1 rounded-[1rem] border border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <p className="min-w-0 truncate whitespace-nowrap text-[18px] font-black leading-tight tracking-[0.22em] text-[var(--app-text)] text-ellipsis sm:text-[19px]">
                          {creatorCode}
                        </p>
                      </div>
                      <p
                        className="mt-1 block min-w-0 truncate whitespace-nowrap text-[10px] font-medium leading-4 text-[var(--app-muted)] text-ellipsis"
                        title={creatorJoinLinkPreview}
                      >
                        {creatorJoinLinkPreview}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1.5">
                      <MetaBadge variant="neutral" className="px-2 py-1 text-[8px]">
                        15 días
                      </MetaBadge>
                      <MetaBadge
                        variant="neutral"
                        className="border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] px-2 py-1 text-[8px] text-[#D4AF37]"
                      >
                        30%
                      </MetaBadge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2">
                    <SecondaryButton
                      type="button"
                      onClick={onCopyCode}
                      icon={<IconCapsule icon={Copy} tone="blue" size="xs" />}
                      className="min-w-0 rounded-full px-2.5 py-1 text-[10px] normal-case tracking-normal min-h-[38px] border-[color-mix(in_srgb,#D4AF37_22%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_84%,black)] text-[var(--app-text)] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    >
                      Copiar
                    </SecondaryButton>

                    <PrimaryButton
                      type="button"
                      onClick={onShareCode}
                      icon={<IconCapsule icon={Share2} tone="purple" size="xs" />}
                      className="min-w-0 rounded-full px-2.5 py-1 text-[10px] normal-case tracking-normal min-h-[38px] border-[color-mix(in_srgb,#D4AF37_28%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_92%,black),color-mix(in_srgb,var(--app-primary)_82%,black))] text-[var(--app-surface)] backdrop-blur-md shadow-[0_0_16px_color-mix(in_srgb,var(--app-primary)_18%,transparent),0_0_18px_color-mix(in_srgb,#D4AF37_12%,transparent)]"
                    >
                      Compartir
                    </PrimaryButton>
                  </div>
                </section>

                <div className="grid gap-1.25 sm:grid-cols-2">
                  <CreatorStat icon={Users} tone="blue" label="Usuarios con código" value={registeredUsers} />
                  <CreatorStat icon={LineChart} tone="blue" label="Premium activos" value={premiumUsers} />
                  <CreatorStat icon={Coins} tone="gold" label="Comisión acumulada" value={formatCurrency(totalCommissionAmount)} raw />
                  <CreatorStat icon={Wallet} tone="green" label="Disponible para retirar" value={formatCurrency(availableCommissionAmount)} raw />
                </div>

                <section className="grid gap-2 rounded-[1rem] border border-[color-mix(in_srgb,#22c55e_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#22c55e_7%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-[11px] font-black leading-tight text-[var(--app-text)]">Pagos</h3>
                      <p className="mt-0.5 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
                        Estado: Esperando mínimo
                      </p>
                    </div>
                    <MetaBadge
                      variant="neutral"
                      className="border-[color-mix(in_srgb,#22c55e_24%,var(--app-border))] px-2 py-1 text-[8px] text-[#22c55e]"
                    >
                      {canRequestWithdrawal ? "DISPONIBLE" : "ESPERANDO"}
                    </MetaBadge>
                  </div>

                  <div className="grid gap-1.5 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    <div className="flex items-center justify-between gap-2">
                      <span>Pendiente de confirmar</span>
                      <span className="font-black text-[var(--app-text)]">{formatCurrency(pendingCommissionAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>Disponible</span>
                      <span className="font-black text-[var(--app-text)]">{formatCurrency(availableCommissionAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>Mínimo de retiro</span>
                      <span className="font-black text-[var(--app-text)]">{formatCurrency(nextWithdrawalThreshold)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-surface)_85%,transparent)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,#22c55e)]"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, (availableCommissionAmount / nextWithdrawalThreshold) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <PrimaryButton
                      type="button"
                      disabled={!canRequestWithdrawal}
                      className="mt-1 h-10 py-0 text-[10px] opacity-70 disabled:opacity-60"
                    >
                      Solicitar retiro
                    </PrimaryButton>
                  </div>
                </section>

                {paymentHistory.length > 0 ? (
                  <section className="grid gap-1.5 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[11px] font-black leading-tight text-[var(--app-text)]">Historial de pagos</h3>
                      <IconCapsule icon={Clock3} tone="purple" size="xs" />
                    </div>
                    <div className="grid gap-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                      {paymentHistory.map((payment) => (
                        <div
                          key={payment?.id || `${payment?.date || "payment"}-${payment?.amount || ""}`}
                          className="flex items-center justify-between gap-2 rounded-[0.75rem] bg-[var(--app-surface)] px-2 py-1.5"
                        >
                          <span className="min-w-0 truncate text-[var(--app-text)]">
                            {payment?.label || payment?.status || "Pago"}
                          </span>
                          <span className="shrink-0 font-black text-[var(--app-text)]">
                            {formatCurrency(Number(payment?.amount ?? 0))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="grid gap-1.5 rounded-[1rem] border border-[color-mix(in_srgb,#38bdf8_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#38bdf8_7%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-black leading-tight text-[var(--app-text)]">Rendimiento</h3>
                    <IconCapsule icon={TrendingUp} tone="blue" size="xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    <div className="flex items-center justify-between gap-2 rounded-[0.75rem] bg-[var(--app-surface)] px-2 py-1.5">
                      <span>Clicks del enlace</span>
                      <span className="font-black text-[var(--app-text)]">{formatCount(linkClicks ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-[0.75rem] bg-[var(--app-surface)] px-2 py-1.5">
                      <span>Registros</span>
                      <span className="font-black text-[var(--app-text)]">{formatCount(registeredUsers)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-[0.75rem] bg-[var(--app-surface)] px-2 py-1.5">
                      <span>Premium</span>
                      <span className="font-black text-[var(--app-text)]">{formatCount(premiumUsers)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-[0.75rem] bg-[var(--app-surface)] px-2 py-1.5">
                      <span>Conversión</span>
                      <span className="font-black text-[var(--app-text)]">
                        {registeredUsers > 0 ? `${Math.min(100, Math.round((premiumUsers / registeredUsers) * 100))}%` : "0%"}
                      </span>
                    </div>
                  </div>
                </section>

                <p className="text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  Tus seguidores reciben 15 días Premium gratis. Tú ganas 30% por cada suscripción Premium válida, hasta 12 pagos por usuario referido.
                </p>
              </>
            ) : !profileRequired ? (
              <div className="grid gap-2 rounded-[1rem] border border-[color-mix(in_srgb,#D4AF37_20%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_86%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-3 py-3">
                <div className="flex items-start gap-2">
                  <IconCapsule icon={Megaphone} tone="gold" size="md" />
                  <div className="min-w-0 flex-1">
                    <MetaBadge
                      variant="neutral"
                      className="border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] px-2 py-1 text-[8px] text-[#D4AF37]"
                    >
                      ACTIVO
                    </MetaBadge>
                    <h2 className="mt-1.5 min-w-0 text-[16px] font-black leading-tight text-[var(--app-text)]">
                      Estamos activando tu código de creador
                    </h2>
                    <p className="mt-0.5 min-w-0 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                      Si ya está listo, pulsa reintentar para refrescar el panel.
                    </p>
                  </div>
                </div>
                <SecondaryButton
                  type="button"
                  onClick={onRetryCodeActivation}
                  className="h-10 px-3 py-0 text-[10px] normal-case tracking-normal"
                >
                  Reintentar
                </SecondaryButton>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

const DEFAULT_STATUS_DATA = {
  application: null,
  status: "none",
  creatorCode: "",
  stats: null,
  joinUrl: "",
  payouts: null,
  updatedAt: null,
  userId: null,
};

export default function CreatorProgramCard({
  initialStatusData = null,
  skipAutoLoad = false,
} = {}) {
  const toast = useToast();
  const hasInitialStatusData = Boolean(initialStatusData);
  const [loading, setLoading] = useState(!hasInitialStatusData && !skipAutoLoad);
  const [statusData, setStatusData] = useState({
    ...DEFAULT_STATUS_DATA,
    ...(initialStatusData || {}),
  });
  const [formVisible, setFormVisible] = useState(false);
  const [formState, setFormState] = useState(() =>
    initialStatusData?.status === "rejected" && initialStatusData?.application
      ? {
          socialPlatform: initialStatusData.application.socialPlatform || "instagram",
          socialHandle: initialStatusData.application.socialHandle || "",
          followersCount: String(initialStatusData.application.followersCount || ""),
          proofUrl: initialStatusData.application.proofUrl || "",
        }
      : INITIAL_FORM
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (skipAutoLoad || initialStatusData) return;

    let active = true;
    let retryTimer = null;

    async function loadCreatorStatus() {
      setLoading(true);
      setError("");
      let shouldKeepLoading = false;

      try {
        const nextStatus = await getCreatorStatus();
        if (!active) return;

        if (
          nextStatus.status === "approved" &&
          !nextStatus.creatorCode &&
          !nextStatus.profileRequired
        ) {
          shouldKeepLoading = true;
          setStatusData(nextStatus);
          retryTimer = window.setTimeout(() => {
            if (!active) return;

            void (async () => {
              try {
                const refreshedStatus = await getCreatorStatus();
                if (!active) return;
                setStatusData(refreshedStatus);
              } catch (refreshError) {
                if (!active) return;
                setError(refreshError.message || "No se pudo cargar el panel de creadores.");
              } finally {
                if (active) setLoading(false);
              }
            })();
          }, CREATOR_CODE_RETRY_DELAY_MS);
          return;
        }

        setStatusData(nextStatus);
        if (nextStatus.status === "rejected" && nextStatus.application) {
          setFormState({
            socialPlatform: nextStatus.application.socialPlatform || "instagram",
            socialHandle: nextStatus.application.socialHandle || "",
            followersCount: String(nextStatus.application.followersCount || ""),
            proofUrl: nextStatus.application.proofUrl || "",
          });
        }
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || "No se pudo cargar el panel de creadores.");
      } finally {
        if (active && !shouldKeepLoading) setLoading(false);
      }
    }

    void loadCreatorStatus();

    return () => {
      active = false;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [initialStatusData, skipAutoLoad]);

  const viewState = useMemo(
    () => ({
      ...statusData,
      loading,
      formVisible,
      formState,
      formError: error,
      submitting,
      notice,
      termsAccepted,
    }),
    [error, formState, formVisible, loading, notice, statusData, submitting, termsAccepted]
  );

  async function handleStartRequest() {
    setError("");
    setNotice("");
    if (!termsAccepted) {
      setError("Debes aceptar los términos del programa para continuar.");
      return;
    }
    setFormVisible(true);
    trackEvent("creator_apply_started");
  }

  async function handleSubmitApplication(nextFormState) {
    if (!termsAccepted) {
      setError("Debes aceptar los términos del programa para continuar.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const result = await submitCreatorApplication(nextFormState);
      setStatusData((current) => ({
        ...current,
        application: result?.application || current.application,
        status: result?.status || "pending",
        creatorCode: result?.creatorCode || current.creatorCode,
        stats: result?.stats || current.stats,
      }));
      setFormVisible(false);
      trackEvent("creator_application_submitted", {
        minimumFollowersMet: Boolean(result?.minimumFollowersMet),
      });
      setNotice("");
      toast.success("Solicitud enviada para revisión manual.");
    } catch (submitError) {
      setError(submitError.message || "No se pudo enviar tu solicitud.");
      toast.error(submitError.message || "No se pudo enviar tu solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyCode() {
    if (!statusData.creatorCode) return;

    try {
      await copyCreatorCode(statusData.creatorCode);
      trackEvent("creator_code_copied", {
        code: statusData.creatorCode,
      });
      toast.success("Código copiado al portapapeles.");
    } catch (copyError) {
      setError(copyError.message || "No se pudo copiar el código.");
      toast.error(copyError.message || "No se pudo copiar el código.");
    }
  }

  async function handleShareCode() {
    if (!statusData.creatorCode) return;

    try {
      await shareCreatorCode(statusData.creatorCode);
      trackEvent("creator_share_clicked", {
        code: statusData.creatorCode,
        shareText: buildCreatorShareText(statusData.creatorCode),
      });
    } catch (shareError) {
      setError(shareError.message || "No se pudo compartir el código.");
      toast.error(shareError.message || "No se pudo compartir el código.");
    }
  }

  async function handleRetryCodeActivation() {
    const retryUserId = statusData.userId || initialStatusData?.userId || null;
    if (!retryUserId) return;

    setLoading(true);
    setError("");

    try {
      const refreshedStatus = await loadCreatorStatus(retryUserId, {
        forceRefresh: true,
      });
      setStatusData((current) => ({
        ...current,
        ...refreshedStatus,
      }));
    } catch (refreshError) {
      setError(refreshError.message || "No se pudo cargar el panel de creadores.");
      toast.error(refreshError.message || "No se pudo cargar el panel de creadores.");
    } finally {
      setLoading(false);
    }
  }

  function handleRetryRequest() {
    setNotice("");
    setFormVisible(true);
    trackEvent("creator_apply_started");
  }

  return (
    <CreatorProgramCardView
      loading={viewState.loading}
      status={viewState.status}
      application={viewState.application}
      creatorCode={viewState.creatorCode}
      stats={viewState.stats}
      profileRequired={viewState.profileRequired}
      formVisible={viewState.formVisible}
      formState={viewState.formState}
      formError={viewState.formError}
      submitting={viewState.submitting}
      notice={viewState.notice}
      termsAccepted={viewState.termsAccepted}
      onStartRequest={handleStartRequest}
      onCancelRequest={() => setFormVisible(false)}
      onSubmitApplication={handleSubmitApplication}
      onCopyCode={handleCopyCode}
      onShareCode={handleShareCode}
      onRetryRequest={handleRetryRequest}
      onRetryCodeActivation={handleRetryCodeActivation}
      onChangeFormState={setFormState}
      onToggleTermsAccepted={setTermsAccepted}
    />
  );
}

function ReviewStatus() {
  return (
    <section className="grid gap-2 rounded-[1.15rem] border border-[color-mix(in_srgb,#D4AF37_22%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#D4AF37_9%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_97%,transparent))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-start gap-2.5">
        <IconCapsule icon={Clock3} tone="gold" size="lg" />
        <div className="min-w-0">
          <h2 className="text-[16px] font-black leading-tight tracking-tight text-[var(--app-text)]">
            Solicitud en revisión
          </h2>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[var(--app-muted)]">
            Estamos revisando tu perfil. Tiempo estimado: 24-72 horas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <ReviewStep icon={ShieldCheck} state="done" label="Solicitud recibida" />
        <ReviewStep icon={Clock3} state="active" label="Perfil en revisión" />
        <ReviewStep icon={BadgeCheck} state="next" label="Aprobación" />
      </div>

      <Link
        to="/perfil"
        className="inline-flex w-full items-center justify-center rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)] transition active:scale-[0.98] hover:text-[var(--app-text)]"
      >
        Volver al perfil
      </Link>
    </section>
  );
}

function ProgramGuide({ showTerms, termsAccepted, onToggleTermsAccepted }) {
  return (
    <div className="grid gap-1.5">
      <EarningsPotential />
      <WhatYouGetCard />
      <HowItWorksCompact />

      <section className="grid gap-1.5 rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-black leading-tight text-[var(--app-text)]">
            ¿Eres elegible?
          </h2>
          <IconCapsule icon={ShieldCheck} tone="green" size="sm" />
        </div>
        <CompactList
          items={[
            "Más de 5.000 seguidores",
            "Perfil público",
            "Contenido original",
            "Cumplimiento de las normas",
          ]}
        />
      </section>

      <VerificationCard />

      <LegalCard
        showTerms={showTerms}
        termsAccepted={termsAccepted}
        onToggleTermsAccepted={onToggleTermsAccepted}
      />
    </div>
  );
}

function ReviewStep({ icon: Icon, label, state }) {
  const isDone = state === "done";
  const isActive = state === "active";
  const tone = isDone ? "green" : isActive ? "gold" : "blue";

  return (
    <div
      className={`rounded-[0.9rem] border px-1.5 py-2 text-center ${
        isActive
          ? "border-[color-mix(in_srgb,#D4AF37_30%,var(--app-border))] bg-[color-mix(in_srgb,#D4AF37_10%,var(--app-surface))]"
          : "border-[var(--app-border)] bg-[var(--app-card)]"
      }`}
    >
      <IconCapsule icon={Icon} tone={tone} size="sm" className="mx-auto" />
      <span className="mt-1 block text-[8px] font-black uppercase leading-tight tracking-[0.06em] text-[var(--app-muted)]">
        {label}
      </span>
    </div>
  );
}

function HowItWorksCompact() {
  return (
    <section className="rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-1.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h2 className="min-w-0 break-words text-[13px] font-black leading-tight text-[var(--app-text)]">
          Cómo funciona
        </h2>
        <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[#D4AF37]">
          5 pasos
        </span>
      </div>
      <ol className="grid grid-cols-5 gap-1">
        {[
          ["Solicita", BadgeCheck, "gold"],
          ["Revisamos", ShieldCheck, "green"],
          ["Activamos", Rocket, "purple"],
          ["Compartes", Megaphone, "purple"],
          ["Ganas", Wallet, "gold"],
        ].map(([text, Icon, tone], index) => (
          <li
            key={text}
            className="rounded-[0.75rem] border border-[color-mix(in_srgb,var(--app-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-0.5 py-1 text-center"
          >
            <IconCapsule icon={Icon} tone={tone} size="xs" className="mx-auto mb-0.5" />
            <span className="block text-[8px] font-black leading-tight text-[var(--app-text)]">
              {index + 1}. {text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EarningsPotential() {
  const audienceSteps = [5, 10, 25, 50, 100];
  const [audienceIndex, setAudienceIndex] = useState(2);
  const audience = audienceSteps[audienceIndex];
  const estimatedPremium = Math.max(1, audience);
  const estimatedIncome = estimatedPremium * 1.497;

  return (
    <section className="relative overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,#D4AF37_28%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#D4AF37_13%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-2.5 shadow-[0_0_38px_color-mix(in_srgb,#D4AF37_18%,transparent),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 10%, color-mix(in srgb, #D4AF37 16%, transparent), transparent 30%), radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--app-primary) 9%, transparent), transparent 28%)",
        }}
      />
      <div className="relative z-10 grid gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#D4AF37]">
              <IconCapsule icon={Wallet} tone="gold" size="xs" />
              Potencial de ingresos
            </div>
            <p className="mt-0.5 break-words text-[9px] font-semibold leading-3 text-[var(--app-muted)]">
              Basado en suscripciones Premium válidas.
            </p>
          </div>
        </div>
        <div className="rounded-[0.95rem] border border-[color-mix(in_srgb,#D4AF37_20%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_86%,transparent)] px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                Premium generados
              </p>
              <p className="mt-0.5 text-[16px] font-black leading-none text-[var(--app-text)] sm:text-[17px]">
                {formatCount(audience)}
              </p>
            </div>
            <div className="grid shrink-0 place-items-center text-[10px] font-black uppercase tracking-[0.08em] text-[var(--app-muted)]">
              <span>↓</span>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                Comisión estimada
              </p>
              <p className="mt-0.5 break-words text-[18px] font-black leading-none text-[#D4AF37] sm:text-[20px]">
                ≈ {estimatedIncome.toFixed(2)}€/mes
              </p>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={audienceSteps.length - 1}
            step="1"
            value={audienceIndex}
            onChange={(event) => setAudienceIndex(Number(event.target.value))}
            aria-label="Premium generados"
            className="mt-1.5 h-1.5 w-full accent-[#D4AF37]"
          />
          <div className="mt-1 flex justify-between text-[10px] font-black text-[var(--app-muted)]">
            {audienceSteps.map((step) => (
              <span key={step}>{formatCompactNumber(step)}</span>
            ))}
          </div>
        </div>

        <p className="text-[9px] font-semibold leading-3 text-[var(--app-muted)]">
          Las comisiones dependen de suscripciones Premium válidas.
        </p>
      </div>
    </section>
  );
}

function WhatYouGetCard() {
  const benefits = [
    ["30% por cada Premium válido", Wallet, "gold"],
    ["Código exclusivo para tu comunidad", Megaphone, "purple"],
    ["Dashboard de conversiones", BarChart3, "blue"],
    ["Seguimiento de comisiones", CreditCard, "blue"],
  ];

  return (
    <section className="rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-2">
      <h2 className="mb-1.5 min-w-0 break-words text-[13px] font-black leading-tight text-[var(--app-text)]">
        Lo que obtienes
      </h2>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {benefits.map(([label, Icon, tone]) => (
          <div
            key={label}
            className="flex min-h-[34px] min-w-0 items-center gap-1.5 rounded-[0.8rem] border border-[color-mix(in_srgb,var(--app-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-1.5 py-1"
          >
            <IconCapsule icon={Icon} tone={tone} size="xs" />
            <span className="min-w-0 break-words text-[9px] font-black leading-3 text-[var(--app-text)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function VerificationCard() {
  return (
    <section className="grid gap-2 rounded-[1rem] border border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#D4AF37_9%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-2.5 shadow-[0_0_22px_color-mix(in_srgb,#D4AF37_10%,transparent),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#D4AF37]">
        <IconCapsule icon={BadgeCheck} tone="gold" size="xs" />
        <span className="min-w-0 break-words">Programa verificado</span>
      </div>
      <CompactList
        items={[
          "Revisión manual",
          "Sistema antifraude",
          "Pagos confirmados",
          "Seguimiento de conversiones",
        ]}
      />
    </section>
  );
}

function LegalCard({ showTerms, termsAccepted, onToggleTermsAccepted }) {
  return (
    <section className="grid gap-2 rounded-[1rem] border border-[color-mix(in_srgb,#22c55e_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,#22c55e_7%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_96%,transparent))] p-2.5">
      <div className="flex items-center gap-2">
        <IconCapsule icon={ShieldCheck} tone="green" size="md" />
        <h2 className="min-w-0 break-words text-[13px] font-black leading-tight text-[var(--app-text)]">
          Legal
        </h2>
      </div>
      <CompactList
        items={[
          "Aceptación obligatoria",
          "Términos del programa",
          "Suspensión por fraude",
          "Responsabilidades del creador",
        ]}
      />

      {showTerms ? (
        <div className="rounded-[0.95rem] border border-[color-mix(in_srgb,#D4AF37_22%,var(--app-border))] bg-[color-mix(in_srgb,#D4AF37_8%,var(--app-surface))] p-2">
          <label className="flex cursor-pointer items-start gap-2 text-[11px] font-bold leading-5 text-[var(--app-text)]">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => onToggleTermsAccepted?.(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--app-primary)]"
            />
            <span className="break-words">Acepto términos</span>
          </label>
          <Link
            to="/creator-terms"
            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.06em] text-[#D4AF37] transition hover:text-[var(--app-text)]"
          >
            Ver condiciones completas
            <IconCapsule icon={ExternalLink} tone="gold" size="xs" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function CompactList({ items }) {
  return (
    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold leading-4 text-[var(--app-muted)]">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[0.55rem] border border-[color-mix(in_srgb,#22c55e_22%,var(--app-border))] bg-[color-mix(in_srgb,#22c55e_12%,transparent)] text-[#22c55e]">
            <CheckCircle2 size={11} />
          </span>
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CreatorStat({ icon: Icon, label, raw = false, tone = "blue", value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_88%,transparent),color-mix(in_srgb,var(--app-card)_96%,transparent))] px-2 py-1.5">
      <IconCapsule icon={Icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <span className="block text-[7px] font-black uppercase leading-tight tracking-[0.08em] text-[var(--app-muted)]">
          {label}
        </span>
        <span className="mt-0.5 block text-[12px] font-black leading-tight text-[var(--app-text)]">
          {raw ? value : formatCount(value)}
        </span>
      </div>
    </div>
  );
}

function IconCapsule({ className = "", icon: Icon, size = "md", tone = "gold" }) {
  const toneClass =
    {
      blue: "border-[color-mix(in_srgb,#38bdf8_24%,var(--app-border))] bg-[color-mix(in_srgb,#38bdf8_13%,transparent)] text-[#38bdf8]",
      gold: "border-[color-mix(in_srgb,#D4AF37_26%,var(--app-border))] bg-[color-mix(in_srgb,#D4AF37_13%,transparent)] text-[#D4AF37]",
      green: "border-[color-mix(in_srgb,#22c55e_24%,var(--app-border))] bg-[color-mix(in_srgb,#22c55e_13%,transparent)] text-[#22c55e]",
      purple: "border-[color-mix(in_srgb,var(--app-primary)_26%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-primary)_13%,transparent)] text-[var(--app-primary)]",
    }[tone] || "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]";
  const sizeClass =
    {
      xs: "h-5 w-5 rounded-[0.55rem] [&>svg]:h-3 [&>svg]:w-3",
      sm: "h-7 w-7 rounded-[0.75rem] [&>svg]:h-3.5 [&>svg]:w-3.5",
      md: "h-8 w-8 rounded-[0.85rem] [&>svg]:h-4 [&>svg]:w-4",
      lg: "h-10 w-10 rounded-[0.95rem] [&>svg]:h-5 [&>svg]:w-5",
    }[size] || "h-8 w-8 rounded-[0.85rem] [&>svg]:h-4 [&>svg]:w-4";

  return (
    <span className={`grid shrink-0 place-items-center border ${toneClass} ${sizeClass} ${className}`}>
      <Icon aria-hidden="true" />
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.01em] text-[var(--app-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatCount(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("es-ES").format(numeric);
}

function formatCurrency(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "0,00 €";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)} €`;
}

function formatCompactNumber(value) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function buildCreatorJoinLinkPreview(code) {
  const safeCode = String(code || "").trim();
  const baseUrl = String(
    import.meta.env.VITE_CREATOR_JOIN_BASE_URL ||
      import.meta.env.VITE_APP_URL ||
      import.meta.env.VITE_SITE_URL ||
      "https://nutrismartcoach.com"
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  if (!safeCode) return `${baseUrl}/join`;

  return `${baseUrl}/join?creator=...`;
}
