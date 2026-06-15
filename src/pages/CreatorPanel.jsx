import { useEffect, useMemo, useState } from "react";
import { Clock3, LoaderCircle, Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell, MetaBadge, StatusBox } from "../components/ui";
import CreatorProgramCard from "../components/profile/CreatorProgramCard";
import { useAuth } from "../context/useAuth";
import {
  getCreatorPanelCache,
  loadCreatorStatus,
} from "../services/creatorService";
import "../i18n";

export function CreatorPanel() {
  const { user, loadingAuth } = useAuth();
  const userId = user?.id || null;
  const { t } = useTranslation();

  return (
    <CreatorPanelContent
      key={userId || "anonymous"}
      userId={userId}
      loadingAuth={loadingAuth}
      t={t}
    />
  );
}

function CreatorPanelContent({ userId, loadingAuth, t }) {
  const initialCachedStatus = useMemo(
    () => (userId ? getCreatorPanelCache(userId) : null),
    [userId]
  );
  const [panelData, setPanelData] = useState(initialCachedStatus);
  const [loadingStatus, setLoadingStatus] = useState(
    Boolean(userId) && !initialCachedStatus
  );
  const [refreshing, setRefreshing] = useState(Boolean(initialCachedStatus));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;

    void (async () => {
      try {
        const nextStatus = await loadCreatorStatus(userId, {
          forceRefresh: true,
        });
        if (!active) return;

        setPanelData(nextStatus);
      } catch (error) {
        if (!active) return;
        if (!initialCachedStatus) {
          setLoadError(error.message || t("creatorPanel.errors.load"));
        }
      } finally {
        if (active) {
          setLoadingStatus(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [initialCachedStatus, userId, t]);

  const isApproved = panelData?.status === "approved";
  const showInitialSkeleton = (loadingAuth || loadingStatus) && !panelData;

  return (
    <AppShell
      contentClassName="!px-2 !pt-2 !pb-0"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-27"
    >
      <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-2 overflow-x-hidden rounded-[32px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2 pb-8 pt-2 shadow-[0_18px_54px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 32%), radial-gradient(circle at 92% 24%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 26%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.12)_100%)]" />

        <div className="relative z-10 flex w-full flex-col gap-2.5">
          {showInitialSkeleton ? (
              <CreatorPanelSkeleton />
            ) : (
            <>
              {loadError && !panelData ? (
                <StatusBox type="error" className="px-2.5 py-1.5 text-[11px] leading-4">
                  {loadError}
                </StatusBox>
              ) : null}

              {isApproved ? (
                <ApprovedHeader refreshing={refreshing} t={t} />
              ) : (
                <MarketingHeader t={t} />
              )}

              {panelData ? (
                <CreatorProgramCard
                  key={`${panelData.status}-${panelData.creatorCode || "empty"}-${panelData.updatedAt || "cached"}`}
                  initialStatusData={panelData}
                  skipAutoLoad
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function MarketingHeader({ t }) {
  return (
    <header className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_94%,#07130f),color-mix(in_srgb,var(--app-surface)_88%,#101008))] p-2.5 shadow-[0_18px_54px_var(--app-glow)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, #D4AF37 10%, transparent), transparent 28%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border border-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
            <Megaphone size={18} />
          </div>
          <div className="min-w-0">
            <MetaBadge variant="neutral">{t("creatorPanel.marketing.badge")}</MetaBadge>
            <h1 className="mt-1.5 text-[17px] font-black leading-tight text-[var(--app-text)]">
              {t("creatorPanel.marketing.title")}
            </h1>
          </div>
        </div>

        <div className="w-full rounded-[1.05rem] border border-[color-mix(in_srgb,#D4AF37_26%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,#D4AF37_13%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_94%,transparent))] px-2.5 py-2 shadow-[0_0_28px_color-mix(in_srgb,#D4AF37_15%,transparent),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="grid grid-cols-[auto_1fr] items-center gap-2">
            <div className="min-w-0">
              <span className="block text-[46px] font-black leading-none tracking-tight text-[#D4AF37] sm:text-[52px]">
                30%
              </span>
            </div>
            <p className="min-w-0 text-left text-[11px] font-black leading-4 text-[var(--app-text)] sm:text-[12px]">
              {t("creatorPanel.marketing.commission")}
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,#38bdf8_18%,var(--app-border))] bg-[color-mix(in_srgb,#38bdf8_8%,var(--app-surface))] px-2 py-1 text-[9px] font-black uppercase tracking-[0.04em] text-[var(--app-muted)]">
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,#38bdf8_14%,transparent)] text-[#38bdf8]">
            <Clock3 size={10} />
          </span>
          {t("creatorPanel.marketing.reviewTime")}
        </div>
      </div>
    </header>
  );
}

function ApprovedHeader({ refreshing = false, t }) {
  return (
    <header className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_94%,#07130f),color-mix(in_srgb,var(--app-surface)_88%,#101008))] p-2.5 shadow-[0_18px_54px_var(--app-glow)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, #D4AF37 10%, transparent), transparent 28%)",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <MetaBadge variant="neutral">{t("creatorPanel.status.active")}</MetaBadge>
          <h1 className="mt-1.5 text-[17px] font-black leading-tight text-[var(--app-text)]">
            {t("creatorPanel.approved.title")}
          </h1>
          <p className="mt-0.5 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
            {t("creatorPanel.approved.subtitle")}
          </p>
          {refreshing ? (
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,#38bdf8_18%,var(--app-border))] bg-[color-mix(in_srgb,#38bdf8_8%,var(--app-surface))] px-2 py-1 text-[9px] font-black uppercase tracking-[0.04em] text-[var(--app-muted)]">
              <LoaderCircle size={10} className="animate-spin text-[#38bdf8]" />
              {t("creatorPanel.approved.refreshing")}
            </div>
          ) : null}
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border border-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
          <Clock3 size={18} />
        </div>
      </div>
    </header>
  );
}

function CreatorPanelSkeleton() {
  const { t } = useTranslation();
  return (
    <>
      <header className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_94%,#07130f),color-mix(in_srgb,var(--app-surface)_88%,#101008))] p-2.5 shadow-[0_18px_54px_var(--app-glow)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, #D4AF37 10%, transparent), transparent 28%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border border-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
            <Clock3 size={18} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <MetaBadge variant="neutral">{t("creatorPanel.loading.badge")}</MetaBadge>
            <h1 className="mt-1.5 text-[17px] font-black leading-tight text-[var(--app-text)]">
              {t("creatorPanel.loading.title")}
            </h1>
            <p className="mt-0.5 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
              {t("creatorPanel.loading.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-2">
        <div className="h-[168px] rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)]/80 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-[84px] rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)]/80 animate-pulse" />
          <div className="h-[84px] rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)]/80 animate-pulse" />
        </div>
      </div>
    </>
  );
}

export default CreatorPanel;
