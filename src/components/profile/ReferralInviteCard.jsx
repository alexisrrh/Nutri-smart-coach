import { useEffect, useMemo, useState } from "react";
import { Copy, Eye, Gift, LoaderCircle, Share2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../../services/analytics";
import {
  claimReferralReward,
  createReferralCode,
  getMyReferralStats,
} from "../../services/referralService";
import { getPremiumStatus } from "../../services/premiumService";
import {
  PrimaryButton,
  SecondaryButton,
  StatusBox,
  SurfaceCard,
  useToast,
} from "../ui";
import {
  buildReferralInviteShareText,
  getReferralInviteCardViewModel,
} from "./referralInviteCardViewModel";
import "../../i18n";

export function ReferralInviteCardView({
  viewModel = getReferralInviteCardViewModel(),
  className = "",
  error = "",
  loading = false,
  actionLoading = false,
  actionMode = null,
  onCreateCode,
  onClaimReward,
  onCopyCode,
  onShareCode,
  onExpand,
  onCollapse,
}) {
  const { t } = useTranslation();
  const isLoading = Boolean(loading || viewModel.loading);
  const isCreateLoading = Boolean(actionLoading && actionMode === "create");
  const isClaimLoading = Boolean(actionLoading && actionMode === "claim");

  return (
    <SurfaceCard
      className={`relative overflow-hidden p-2.5 ${className}`}
      radius="lg"
      variant="accent"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 28%), radial-gradient(circle at 88% 18%, color-mix(in srgb, #D4AF37 7%, transparent), transparent 24%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="grid h-8 w-8 place-items-center rounded-[14px] border border-[color-mix(in_srgb,#D4AF37_42%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-primary)_14%,var(--app-surface))] text-[#D4AF37] shadow-[0_0_14px_color-mix(in_srgb,#D4AF37_22%,transparent)]">
            <Gift size={14} />
          </div>

          <div className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,#D4AF37_38%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-surface))] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#D4AF37] shadow-[0_0_12px_color-mix(in_srgb,#D4AF37_18%,transparent)]">
            {viewModel.badge}
          </div>
          <h2 className="text-[13px] font-black leading-tight text-[var(--app-text)]">
            {viewModel.title}
          </h2>
          <p className="max-w-[18rem] text-[10px] font-semibold leading-4 text-[var(--app-muted)]">
            {t("referralReward.card.heroHint")}
          </p>
        </div>

        {error ? (
          <StatusBox type="error" className="px-2 py-1.5 text-[11px] leading-4">
            {error}
          </StatusBox>
        ) : null}

        {isLoading ? (
          <div className="px-0.5 py-0.25">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[var(--app-muted)]">
              <LoaderCircle size={12} className="animate-spin text-[#D4AF37]" />
              <span>{t("referralReward.card.loading")}</span>
            </div>

            <div className="mt-1 h-3 rounded-full bg-[color-mix(in_srgb,var(--app-border)_30%,transparent)]" />

            <div className="mt-1.25 flex justify-center">
              <button
                type="button"
                disabled
                className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_78%,black)] px-3.5 py-1.5 text-[10px] font-semibold text-[var(--app-muted)] opacity-70"
              >
                <LoaderCircle size={12} className="animate-spin text-[#D4AF37]" />
                <span>{t("referralReward.card.generating")}</span>
              </button>
            </div>
          </div>
        ) : !viewModel.hasCode ? (
          <div className="px-0.5 py-0.25">
            <p className="text-[10px] font-semibold leading-4 text-[var(--app-muted)]">
              {viewModel.noCodeRule}
            </p>

            <div className="mt-0.75">
              <PrimaryButton
                onClick={onCreateCode}
                icon={
                  isCreateLoading ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )
                }
                className="w-full py-1.25 text-[10px]"
                disabled={loading || actionLoading}
              >
                {isCreateLoading ? t("referralReward.card.generating") : t("referralReward.card.createCode")}
              </PrimaryButton>
            </div>
          </div>
        ) : viewModel.expanded ? (
          <div className="flex flex-col items-center px-0.5 py-0.25 text-center">
            <div className="inline-flex max-w-full items-center rounded-2xl border border-[color-mix(in_srgb,#D4AF37_36%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_20%,transparent),var(--app-surface))] px-3 py-1.25 text-[12px] font-black tracking-[0.2em] text-[var(--app-text)] shadow-[0_0_14px_color-mix(in_srgb,#D4AF37_16%,transparent)]">
              {viewModel.referralCode}
            </div>

            <p className="mt-1 text-[9px] font-semibold leading-4 text-[#D4AF37]">
              {t("referralReward.card.invitedTrial")}
            </p>

            <div className="mt-1.25 grid w-full grid-cols-2 gap-1.25">
              <SecondaryButton
                onClick={onCopyCode}
                icon={<Copy size={13} />}
                className="rounded-full px-2.5 py-1 text-[10px] min-h-[38px] border-[color-mix(in_srgb,#D4AF37_22%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_84%,black)] text-[var(--app-text)] backdrop-blur-md"
                disabled={loading || actionLoading}
              >
                {t("referralReward.card.copy")}
              </SecondaryButton>

              <SecondaryButton
                onClick={onShareCode}
                icon={<Share2 size={13} />}
                className="rounded-full px-2.5 py-1 text-[10px] min-h-[38px] border-[color-mix(in_srgb,#D4AF37_28%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_92%,black),color-mix(in_srgb,var(--app-primary)_82%,black))] text-[var(--app-surface)] backdrop-blur-md"
                disabled={loading || actionLoading}
              >
                {t("referralReward.card.share")}
              </SecondaryButton>
            </div>

            <button
              type="button"
              onClick={onCollapse}
              className="mt-0.75 inline-flex items-center justify-center text-[10px] font-bold text-[#D4AF37] transition hover:opacity-80"
            >
              {t("referralReward.card.hideCode")}
            </button>
          </div>
        ) : (
          <div className="px-0.5 py-0.25">
            <p className="text-[10px] font-semibold leading-4 text-[var(--app-text)]">
              {t("referralReward.card.progress", {
                current: viewModel.progressValue,
                total: viewModel.maxReferralRewards,
              })}
            </p>
            <p className="mt-0.25 text-[9px] font-medium leading-4 text-[var(--app-muted)]">
              {viewModel.confirmedPaymentsText}
            </p>

            {viewModel.canClaimReward ? (
              <div className="mt-1 rounded-2xl border border-[color-mix(in_srgb,#D4AF37_24%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_16%,transparent),color-mix(in_srgb,var(--app-surface)_96%,black))] px-2.5 py-1 text-center shadow-[0_0_16px_color-mix(in_srgb,#D4AF37_10%,transparent)]">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#D4AF37]">
                  {t("referralReward.card.rewardUnlockedTitle")}
                </p>
                <p className="mt-0.25 text-[10px] font-semibold leading-4 text-[var(--app-text)]">
                  {t("referralReward.card.rewardUnlockedBody")}
                </p>
                <div className="mt-0.75">
                  <PrimaryButton
                    onClick={onClaimReward}
                    icon={
                      isClaimLoading ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )
                    }
                    className="w-full py-1.5 text-[10px]"
                    disabled={loading || actionLoading || !onClaimReward}
                  >
                    {isClaimLoading ? t("referralReward.card.claiming") : t("referralReward.card.claimReward")}
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <div className="mt-0.75 h-0.5 rounded-full bg-[color-mix(in_srgb,var(--app-border)_65%,transparent)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,color-mix(in_srgb,#D4AF37_66%,white))] shadow-[0_0_8px_color-mix(in_srgb,#D4AF37_20%,transparent)] transition-all"
                  style={{ width: `${viewModel.progressPercent}%` }}
                />
              </div>
            )}

            <div className="mt-1.25 flex justify-center">
              <button
                type="button"
                onClick={onExpand}
                disabled={loading}
                className="group relative inline-flex min-h-[38px] items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[color-mix(in_srgb,#D4AF37_22%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-surface)_82%,black)] px-3.5 py-1.5 text-[10px] font-semibold text-[var(--app-text)] shadow-[0_8px_18px_color-mix(in_srgb,var(--app-primary)_10%,transparent)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,#D4AF37_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--app-primary)_12%,var(--app-surface))] hover:shadow-[0_12px_24px_color-mix(in_srgb,#D4AF37_12%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                <Eye size={12} className="relative z-10 text-[#D4AF37]" />
                <span className="relative z-10">{t("referralReward.card.viewCode")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}

export function ReferralInviteCard({ className = "", initialStats = null }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [stats, setStats] = useState(() => initialStats);
  const [loading, setLoading] = useState(() => !initialStats);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMode, setActionMode] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const nextStats = await getMyReferralStats();
        if (!active) return;
        setStats(nextStats);
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || t("referralReward.errors.loadStats"));
      } finally {
        if (active) setLoading(false);
      }
    }

    if (!initialStats) {
      void loadStats();
    }

    return () => {
      active = false;
    };
  }, [initialStats, t]);

  const viewModel = useMemo(
    () => getReferralInviteCardViewModel({ stats, loading, expanded }),
    [expanded, loading, stats]
  );

  const sharePayload = useMemo(() => {
    if (!viewModel.referralCode) return null;

    const shareUrl =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "/perfil";
    return {
      title: t("referralReward.shareTitle"),
      text: buildReferralInviteShareText(viewModel.referralCode),
      url: shareUrl,
    };
  }, [t, viewModel.referralCode]);

  async function handleCreateCode({ expandAfterCreate = false } = {}) {
    setActionLoading(true);
    setActionMode("create");
    setError("");

    try {
      const result = await createReferralCode();
      const createdCode = result?.code || result;
      const nextCode = createdCode?.code || createdCode?.referral_code || "";

      setStats((current) => ({
        ...(current || {}),
        codes: [createdCode, ...(current?.codes || [])],
        summary: current?.summary || {
          premiumActiveReferrals: 0,
          rewardAvailableCount: 0,
        },
        referrals: current?.referrals || [],
        commissions: current?.commissions || [],
      }));

      trackEvent("referral_code_created", {
        code: nextCode,
      });

      toast.success(t("referralReward.success.codeCreated"));

      if (expandAfterCreate) {
        setExpanded(true);
      }

      return nextCode;
    } catch (createError) {
      setError(createError.message || t("referralReward.errors.createCode"));
      toast.error(t("referralReward.errors.createCode"));
      return null;
    } finally {
      setActionLoading(false);
      setActionMode(null);
    }
  }

  async function handleClaimReward() {
    setActionLoading(true);
    setActionMode("claim");
    setError("");
    trackEvent("referral_reward_claim_clicked", {
      rewardId: viewModel.latestReward?.id || null,
    });

    try {
      const result = await claimReferralReward();

      if (result?.stats) {
        setStats(result.stats);
      } else {
        const nextStats = await getMyReferralStats();
        setStats(nextStats);
      }

      if (typeof result?.premium === "object") {
        void getPremiumStatus().catch(() => null);
      }

      trackEvent("referral_reward_claimed", {
        rewardId: result?.reward?.id || null,
      });

      toast.success(t("referralReward.success.rewardClaimed"));

      return result;
    } catch (claimError) {
      trackEvent("referral_reward_claim_failed", {
        message: claimError?.message || t("referralReward.errors.claimReward"),
      });
      setError(claimError.message || t("referralReward.errors.claimReward"));
      toast.error(claimError.message || t("referralReward.errors.claimReward"));
      return null;
    } finally {
      setActionLoading(false);
      setActionMode(null);
    }
  }

  async function handleCopyCode() {
    if (!viewModel.referralCode) return;

    try {
      await copyTextToClipboard(viewModel.referralCode);
      trackEvent("referral_code_copied", {
        code: viewModel.referralCode,
      });
      toast.success(t("referralReward.success.codeCopied"));
    } catch {
      toast.error(t("referralReward.errors.copyCode"));
    }
  }

  async function handleShareCode() {
    if (!viewModel.referralCode || !sharePayload) return;

    trackEvent("referral_share_clicked", {
      code: viewModel.referralCode,
    });

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(sharePayload);
        return;
      } catch {
        // fallback below
      }
    }

    try {
      await copyTextToClipboard(`${sharePayload.text} ${sharePayload.url}`);
      toast.info(t("referralReward.success.copiedToShare"));
    } catch {
      toast.error(t("referralReward.errors.prepareShare"));
    }
  }

  return (
    <ReferralInviteCardView
      className={className}
      viewModel={viewModel}
      error={error}
      loading={loading}
      actionLoading={actionLoading}
      actionMode={actionMode}
      onCreateCode={() => handleCreateCode()}
      onClaimReward={() => handleClaimReward()}
      onCopyCode={handleCopyCode}
      onShareCode={handleShareCode}
      onExpand={() => {
        if (viewModel.hasCode) {
          setExpanded(true);
          return;
        }

        void handleCreateCode({ expandAfterCreate: true });
      }}
      onCollapse={() => setExpanded(false)}
    />
  );
}

async function copyTextToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard no disponible.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const success = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!success) {
    throw new Error("Clipboard no disponible.");
  }
}

export default ReferralInviteCard;
