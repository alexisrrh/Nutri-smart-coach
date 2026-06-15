import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Scale,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AppShell,
  ConfirmDialog,
  StatusBox,
  SurfaceCard,
  PremiumEmptyState,
} from "../components/ui";
import { useProgressDeletion } from "../hooks/progress/useProgressDeletion";
import { useProgressData } from "../hooks/progress/useProgressData";
import { useProgressStats } from "../hooks/progress/useProgressStats";
import { getStrengthProgressSummary } from "../services/strengthProgressService";

export function Progress() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-US" : "es-ES";
  const [activeView, setActiveView] = useState("resumen");
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const {
    logs,
    checkins,
    setCheckins,
    workoutSessions,
    loadingLogs,
    loadingCheckins,
    errorMessage,
    setErrorMessage,
    usingCache,
  } = useProgressData();
  const {
    checkinToDelete,
    setCheckinToDelete,
    deletingId,
    handleDeleteCheckin,
  } = useProgressDeletion({
    setCheckins,
    setErrorMessage,
    selectedCheckin,
    setSelectedCheckin,
  });

  const { sortedCheckinsDesc, stats } = useProgressStats({
    logs,
    checkins,
  });
  const strengthSummary = useMemo(
    () => getStrengthProgressSummary(workoutSessions, 5),
    [workoutSessions]
  );

  const loadingHistory = loadingLogs || loadingCheckins;

  return (
    <AppShell contentClassName="px-2 pb-2 pt-1.5
     contentClassName="px-2 pt-2
  scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-col gap-2.5 overflow-hidden">
        <div className="shrink-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold transition hover:text-[var(--app-text)]"
            style={{
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-muted)",
            }}
          >
            <ArrowLeft size={11} />
            {t("progress.backToDashboard")}
          </button>

          <SurfaceCard
            className="relative overflow-hidden border p-3 shadow-[0_16px_45px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-card)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 0%, var(--app-primary-soft), transparent 42%)",
              }}
            />
          <div className="relative z-10">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]"
                style={{
                  backgroundColor: "var(--app-primary-soft)",
                  color: "var(--app-primary)",
                }}
              >
                <Sparkles size={10} />
                {t("progress.badge")}
              </div>
              <h1 className="text-[21px] font-black leading-[0.95] tracking-tight text-[var(--app-text)]">
                {t("progress.title")}
              </h1>
              <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-muted)]">
                {t("progress.subtitle")}
              </p>
            </div>

            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl"
              style={{
                backgroundColor: "var(--app-primary-soft)",
                color: "var(--app-primary)",
              }}
            >
              <Scale size={16} />
            </div>
          </div>

          <div
            className="grid grid-cols-[104px_1fr] items-center gap-3 rounded-[18px] border px-2.5 py-2"
            style={{
              borderColor: "var(--app-border)",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--app-primary) 22%, var(--app-surface)) 0%, color-mix(in srgb, var(--app-primary) 16%, var(--app-card)) 45%, var(--app-surface) 100%)",
            }}
          >
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                {t("progress.currentWeight")}
              </p>
              <p className="mt-1 text-[36px] font-black leading-none tracking-tight text-[var(--app-text)]">
                {stats.currentWeight || "--"}
                <span className="ml-1 text-xs font-bold text-[var(--app-muted)]">kg</span>
              </p>
            </div>

            <MiniWeightSparkline checkins={sortedCheckinsDesc} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <SnapshotChip label={t("progress.start")} value={stats.firstWeight || "--"} unit="kg" />
            <SnapshotChip label={t("progress.records")} value={stats.totalLogs} />
            <SnapshotChip label={t("progress.lastChange")} value={formatSignedKg(stats.weeklyChange)} />
          </div>
          </div>
        </SurfaceCard>
        <ProgressViewTabs activeView={activeView} setActiveView={setActiveView} />
        </div>

        <div className="flex-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-3">
            {errorMessage && (
              <StatusBox type="error">
                {errorMessage}
              </StatusBox>
            )}

            {usingCache && !errorMessage && (
              <StatusBox type="info">
                {t("progress.cacheNotice")}
              </StatusBox>
            )}

            {activeView === "resumen" && (
              <>
                <ProgressStatsGrid stats={stats} />
                <ProgressAIInsights
                  latestCheckin={stats.latestCheckin}
                  previousCheckin={stats.previousCheckin}
                />
                <StrengthProgressSection
                  summary={strengthSummary}
                  onAction={() => navigate("/rutinas")}
                  locale={locale}
                />
              </>
            )}

            {activeView === "fotos" && (
              <ProgressVisualCompare
                firstCheckin={stats.firstCheckin}
                latestCheckin={stats.latestCheckin}
                locale={locale}
              />
            )}

            {activeView === "grafica" && (
              <ProgressWeightChart checkins={sortedCheckinsDesc} />
            )}

            {activeView === "historial" && (
              <ProgressHistorySection
                loadingHistory={loadingHistory}
                sortedCheckinsDesc={sortedCheckinsDesc}
                deletingId={deletingId}
                onDelete={setCheckinToDelete}
                onSelect={setSelectedCheckin}
                onEmptyAction={() => navigate("/checkin")}
                locale={locale}
              />
            )}
          </div>
        </div>

        {selectedCheckin && (
          <CheckinDetailSheet
            checkin={selectedCheckin}
            onClose={() => setSelectedCheckin(null)}
            locale={locale}
          />
        )}

        <ConfirmDialog
          open={Boolean(checkinToDelete)}
          variant="danger"
          title={t("progress.deleteDialog.title")}
          description={t("progress.deleteDialog.description")}
          cancelLabel={t("common.cancel")}
          confirmLabel={t("progress.deleteDialog.confirm")}
          onCancel={() => setCheckinToDelete(null)}
          onConfirm={() => handleDeleteCheckin(checkinToDelete)}
        />
      </div>
    </AppShell>
  );
}

function ProgressViewTabs({ activeView, setActiveView }) {
  const { t } = useTranslation();
  const views = [
    { id: "resumen", label: t("progress.tabs.summary"), icon: Sparkles },
    { id: "fotos", label: t("progress.tabs.photos"), icon: Scale },
    { id: "grafica", label: t("progress.tabs.chart"), icon: ChartNoAxesColumnIncreasing },
    { id: "historial", label: t("progress.tabs.history"), icon: CalendarDays },
  ];

  return (
    <div
      className="mt-1.5 grid grid-cols-4 gap-0.5 rounded-full border p-0.5 shadow-[0_12px_34px_var(--app-glow)]"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      {views.map((view) => {
        const active = activeView === view.id;
        const Icon = view.icon;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => setActiveView(view.id)}
              className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-full px-1 py-1.5 text-[9px] font-medium transition ${
              active
                ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_18px_var(--app-glow)]"
                : "text-[var(--app-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
            }`}
          >
            <Icon size={10} />
            {view.label}
          </button>
        );
      })}
    </div>
  );
}

function SnapshotChip({ label, value, unit = "" }) {
  return (
    <div
      className="rounded-xl border px-2 py-1.5"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-primary-soft)",
      }}
    >
      <p className="truncate text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[12px] font-black text-[var(--app-text)]">
        {value}
        {unit && <span className="ml-0.5 text-[9px] text-[var(--app-muted)]">{unit}</span>}
      </p>
    </div>
  );
}

function ProgressStatsGrid({ stats }) {
  const { t } = useTranslation();
  const compactStats = [
    {
      icon: Scale,
      label: t("progress.stats.current"),
      value: stats.currentWeight || "--",
      unit: "kg",
      tone: "text-[var(--app-primary)]",
    },
    {
      icon: Target,
      label: t("progress.stats.start"),
      value: stats.firstWeight || "--",
      unit: "kg",
      tone: "text-[var(--app-muted)]",
    },
    {
      icon: stats.direction === "down" ? TrendingDown : TrendingUp,
      label: t("progress.stats.change"),
      value: stats.change > 0 ? `+${stats.change}` : stats.change || "--",
      unit: "kg",
      tone: stats.direction === "down" ? "text-[var(--app-primary)]" : "text-[#d9c7a4]",
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      label: t("progress.stats.records"),
      value: stats.totalLogs,
      unit: "",
      tone: "text-[var(--app-muted)]",
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-1.5">
      {compactStats.map((item) => {
        const Icon = item.icon;

        return (
          <SurfaceCard
            key={item.label}
            radius="md"
            className="border p-1.5 shadow-[0_12px_34px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-card)",
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <p className="text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
                {item.label}
              </p>
              <Icon size={10} className={item.tone} />
            </div>

            <p className={`mt-1 truncate text-[13px] font-black leading-none ${item.tone}`}>
              {item.value}
              {item.unit && (
                <span className="ml-0.5 text-[8px] font-medium text-[var(--app-muted)]">
                  {item.unit}
                </span>
              )}
            </p>
          </SurfaceCard>
        );
      })}
    </section>
  );
}

function MiniWeightSparkline({ checkins }) {
  const { t } = useTranslation();
  const weightLogs = checkins
    .filter((checkin) => Number(checkin.weight) > 0)
    .slice(0, 8)
    .reverse();
  const canChart = weightLogs.length >= 2;
  const points = canChart ? buildMiniWeightChartPoints(weightLogs) : "";

  return (
    <div
      className="h-10 min-w-0 overflow-hidden rounded-lg border px-1.5 py-1"
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      {canChart ? (
        <svg
          viewBox="0 0 150 40"
          className="h-full w-full"
          role="img"
          aria-label={t("progress.chart.miniWeightAria")}
        >
          <path
            d="M 4 10 H 146 M 4 28 H 146"
            fill="none"
            stroke="rgba(255,255,255,0.045)"
            strokeWidth="1"
          />
          <polyline
            points={points}
            fill="none"
            stroke="var(--app-primary)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </svg>
      ) : (
        <div className="grid h-full place-items-center text-[9px] font-medium text-[var(--app-muted)]">
          {t("progress.chart.noTrend")}
        </div>
      )}
    </div>
  );
}

function ProgressHistorySection({
  loadingHistory,
  sortedCheckinsDesc,
  deletingId,
  onEmptyAction,
  onDelete,
  onSelect,
  locale,
}) {
  const { t } = useTranslation();
  return (
    <SurfaceCard className="border border-[var(--app-border)] bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("progress.history.count", { count: sortedCheckinsDesc.length })}
          </p>
          <h2 className="mt-0.5 text-[15px] font-black uppercase italic tracking-tight text-[var(--app-text)]">
            {t("progress.history.title")}
          </h2>
        </div>

        <CalendarDays size={14} className="text-[var(--app-muted)]" />
      </div>

      {loadingHistory ? (
        <div className="space-y-2">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : sortedCheckinsDesc.length > 0 ? (
        <div className="space-y-2">
          {sortedCheckinsDesc.map((checkin, index) => (
            <CheckinHistoryCard
              key={checkin.id || `${checkin.created_at}-${index}`}
              checkin={checkin}
              previous={sortedCheckinsDesc[index + 1]}
              deleting={deletingId === checkin.id}
              onDelete={onDelete}
              onSelect={onSelect}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAction={onEmptyAction} />
      )}
    </SurfaceCard>
  );
}

function CheckinHistoryCard({
  checkin,
  previous,
  deleting = false,
  onDelete,
  onSelect,
  locale,
}) {
  const { t } = useTranslation();
  const image = getCheckinImage(checkin);
  const weight = Number(checkin.weight) || 0;
  const weightDiff = getCheckinWeightDiff(checkin, previous);
  const bodyFatRange = checkin.body_fat_range || "";
  const visualChanges = checkin.visual_changes || "";

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(checkin);
    }
  }

  return (
    <SurfaceCard
      as="div"
      radius="md"
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(checkin)}
      onKeyDown={handleKeyDown}
      className="cursor-pointer overflow-hidden border border-[var(--app-border)] bg-[#07170f]/95 p-0 shadow-[0_10px_28px_var(--app-glow)] transition hover:border-[var(--app-border)] hover:bg-[#0a1d15]"
    >
      <div className="grid grid-cols-[52px_1fr] gap-2 rounded-2xl px-1 py-1.5">
          <div className="relative h-[58px] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
          {image ? (
            <img
              src={image}
              alt={t("progress.history.checkinImageAlt")}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <div className="grid h-full place-items-center text-[var(--app-muted)]">
              <Scale size={18} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(checkin);
            }}
            disabled={deleting}
            aria-label={t("progress.history.deleteAria")}
            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--app-surface)] text-[var(--app-muted)] backdrop-blur transition hover:text-red-100 disabled:opacity-50"
          >
            <Trash2 size={10} />
          </button>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-wide text-[var(--app-primary)]">
                {formatCheckinDate(checkin.created_at || checkin.createdAt, locale)}
              </p>
              <h3 className="mt-0.5 truncate text-[18px] font-black text-[var(--app-text)]">
                {weight ? `${weight} kg` : t("progress.history.pendingWeight")}
              </h3>
            </div>

            {weightDiff !== null && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  weightDiff < 0
                    ? "bg-[var(--app-primary)] text-[var(--app-surface)]"
                    : weightDiff > 0
                    ? "bg-[#d9c7a4] text-[#171105]"
                    : "bg-[var(--app-surface)] text-[var(--app-muted)]"
                }`}
              >
                {formatSignedKg(weightDiff)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {bodyFatRange && (
              <CheckinMetricPill label={t("progress.history.fat")} value={bodyFatRange} />
            )}
            {checkin.confidence ? (
              <CheckinMetricPill label={t("progress.history.confidence")} value={`${checkin.confidence}%`} />
            ) : null}
          </div>

          {visualChanges && (
            <p className="mt-1 line-clamp-1 text-[10px] font-normal leading-4 text-[var(--app-muted)]">
              {visualChanges}
            </p>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}

function CheckinMetricPill({ label, value }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide">
      <span className="text-[var(--app-muted)]">{label}</span>
      <span className="truncate text-[var(--app-muted)]">{value}</span>
    </span>
  );
}

function CheckinDetailSheet({ checkin, onClose, locale }) {
  const { t } = useTranslation();
  const image = getCheckinImage(checkin);

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-[var(--app-surface)]2 backdrop-blur-[6px]"
        role="presentation"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("progress.detail.ariaLabel")}
        className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[9999] mx-auto w-full max-w-[430px] px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-[70vh] overflow-y-auto rounded-t-[28px] border border-[var(--app-border)] bg-[#07170f]/98 p-2.5 pb-3 shadow-[0_-16px_48px_var(--app-glow)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                {formatCheckinDate(checkin.created_at || checkin.createdAt, locale)}
              </p>
              <h3 className="mt-1 text-base font-black uppercase italic leading-none text-[var(--app-text)]">
                {t("progress.detail.title")}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t("progress.detail.closeAria")}
              className="grid h-7 w-7 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] transition hover:bg-[var(--app-primary-soft)]"
            >
              <X size={13} />
            </button>
          </div>

          <div className="mb-2 flex gap-2">
            {image ? (
              <div className="relative h-[124px] w-[112px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)]">
                <img
                  src={image}
                  alt={t("progress.detail.selectedImageAlt")}
                  className="h-full w-full object-contain p-2"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="grid h-[124px] w-[112px] shrink-0 place-items-center rounded-[18px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-center">
                <div className="grid place-items-center">
                  <Scale size={16} className="text-[var(--app-primary)]" />
                  <p className="mt-1 text-[8px] font-black uppercase text-[var(--app-muted)]">
                    {t("progress.detail.noPhoto")}
                  </p>
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <SheetStatRow label={t("progress.detail.weight")} value={checkin.weight ? `${checkin.weight} kg` : "—"} />
              <SheetStatRow label={t("progress.detail.fat")} value={checkin.body_fat_range || "—"} />
              <SheetStatRow
                label={t("progress.detail.confidence")}
                value={checkin.confidence ? `${checkin.confidence}%` : "—"}
              />
              <SheetStatRow label={t("progress.detail.status")} value={checkin.visual_changes ? t("progress.detail.withInsight") : t("progress.detail.withoutInsight")} />
            </div>
          </div>

          <div className="space-y-1.5">
            {checkin.visual_changes && (
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  {t("progress.detail.visualChanges")}
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] font-medium leading-4 text-[var(--app-muted)]">
                  {checkin.visual_changes}
                </p>
              </div>
            )}

            {checkin.recommendation && (
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  {t("progress.detail.recommendation")}
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] font-medium leading-4 text-[var(--app-muted)]">
                  {checkin.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProgressAIInsights({ latestCheckin, previousCheckin }) {
  const { t } = useTranslation();
  const visualChanges = latestCheckin?.visual_changes || "";
  const recommendation = latestCheckin?.recommendation || "";
  const bodyFatRange = latestCheckin?.body_fat_range || "";
  const confidence = latestCheckin?.confidence || "";
  const hasAnalysis = Boolean(
    latestCheckin && (visualChanges || recommendation || bodyFatRange || confidence)
  );

  return (
    <SurfaceCard className="border border-[var(--app-border)] bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
          <Sparkles size={13} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {previousCheckin ? t("progress.ai.comparison") : t("progress.ai.analysis")}
          </p>
          <h2 className="mt-0.5 break-words text-sm font-black uppercase italic tracking-tight text-[var(--app-text)]">
            {t("progress.ai.title")}
          </h2>

          {hasAnalysis ? (
            <p className="mt-1 break-words whitespace-normal text-[11px] font-medium leading-4 text-[var(--app-muted)]">
              {visualChanges || recommendation || t("progress.ai.available")}
            </p>
          ) : (
            <p className="mt-1 break-words whitespace-normal text-[11px] font-medium leading-4 text-[var(--app-muted)]">
              {t("progress.ai.empty")}
            </p>
          )}

          {(bodyFatRange || confidence) && (
            <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap">
              {bodyFatRange && (
                <AIInsightChip label={t("progress.ai.estimatedFat")} value={bodyFatRange} />
              )}
              {confidence && (
                <AIInsightChip label={t("progress.ai.confidence")} value={`${confidence}%`} />
              )}
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}

function StrengthProgressSection({ summary, onAction, locale }) {
  const { t } = useTranslation();
  if (!summary?.items?.length) {
    return (
      <PremiumEmptyState
        icon={ChartNoAxesColumnIncreasing}
        title={t("progress.strength.emptyTitle")}
        description={t("progress.strength.emptyDescription")}
        actionLabel={t("progress.strength.action")}
        onAction={onAction}
      />
    );
  }

  return (
    <SurfaceCard className="border border-[var(--app-border)] bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {t("progress.strength.badge")}
          </p>
          <h3 className="mt-1 text-[15px] font-black leading-none text-[var(--app-text)]">
            {t("progress.strength.title")}
          </h3>
          <p className="mt-1 text-[10px] leading-4 text-[var(--app-muted)]">
            {t("progress.strength.subtitle")}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-right">
          <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
            {t("progress.strength.exercises")}
          </p>
          <p className="text-[14px] font-black text-[var(--app-primary)]">
            {summary.totalExercises}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {summary.items.map((item) => (
          <div
            key={item.exerciseId || item.name}
            className="rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black text-[var(--app-text)]">
                  {item.name}
                </p>
              <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                  {item.muscle || t("progress.strength.defaultMuscle")}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
                {formatSignedKg(item.difference)}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <MetricRow label={t("progress.strength.start")} value={item.initialWeight || "--"} unit="kg" />
              <MetricRow label={t("progress.strength.current")} value={item.currentWeight || "--"} unit="kg" />
              <MetricRow label={t("progress.strength.best")} value={item.bestWeight || "--"} unit="kg" />
              <MetricRow label={t("progress.strength.volume")} value={item.totalVolume || 0} unit="kg" />
            </div>

            <p className="mt-1.5 text-[9px] font-medium text-[var(--app-muted)]">
              {t("progress.strength.lastDate")} {formatCheckinDate(item.lastCompletedAt, locale)}
            </p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function MetricRow({ label, value, unit = "" }) {
  return (
    <div className="rounded-[0.8rem] border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_82%,var(--app-surface))] px-2 py-1.5">
      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] font-black text-[var(--app-text)]">
        {value}
        {unit ? <span className="ml-0.5 text-[8px] font-semibold text-[var(--app-muted)]">{unit}</span> : null}
      </p>
    </div>
  );
}

function SheetStatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </p>

      <p className="truncate text-[10px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function AIInsightChip({ label, value }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-start gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1">
      <p className="min-w-0 break-words whitespace-normal text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>

      <p className="min-w-0 break-words whitespace-normal text-[9px] font-black text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function ProgressWeightChart({ checkins }) {
  const { t } = useTranslation();
  const weightLogs = checkins
    .filter((checkin) => Number(checkin.weight) > 0)
    .slice()
    .reverse();
  const firstWeight = Number(weightLogs[0]?.weight) || 0;
  const latestWeight = Number(weightLogs[weightLogs.length - 1]?.weight) || 0;
  const totalChange =
    firstWeight && latestWeight
      ? Number((latestWeight - firstWeight).toFixed(1))
      : 0;
  const chartPoints = buildWeightChartPoints(weightLogs);
  const canChart = weightLogs.length >= 2;

  return (
    <SurfaceCard className="border border-[var(--app-border)] bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("progress.chart.badge")}
          </p>
          <h2 className="mt-0.5 text-sm font-black uppercase italic tracking-tight text-[var(--app-text)]">
            {t("progress.chart.title")}
          </h2>
        </div>

        <ChartNoAxesColumnIncreasing size={14} className="text-[var(--app-primary)]" />
      </div>

      {canChart ? (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            <WeightSummaryChip label={t("progress.chart.start")} value={`${firstWeight} kg`} />
            <WeightSummaryChip label={t("progress.chart.current")} value={`${latestWeight} kg`} />
            <WeightSummaryChip label={t("progress.chart.change")} value={formatSignedKg(totalChange)} />
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
            <svg
              viewBox="0 0 320 150"
              className="h-[112px] w-full"
              role="img"
              aria-label={t("progress.chart.weightAria")}
            >
              <path
                d="M 16 24 H 304 M 16 75 H 304 M 16 126 H 304"
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />

              <polyline
                points={chartPoints}
                fill="none"
                stroke="var(--app-primary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />

              {chartPoints.split(" ").map((point) => {
                const [x, y] = point.split(",");

                return (
                  <circle
                    key={point}
                    cx={x}
                    cy={y}
                    r="3.8"
                    fill="#07170f"
                    stroke="#d1fae5"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        </>
      ) : (
        <SurfaceCard variant="soft" radius="md" className="border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]">
              <ChartNoAxesColumnIncreasing size={14} />
            </div>
            <p className="text-[11px] font-bold leading-4 text-[var(--app-muted)]">
              {t("progress.chart.empty")}
            </p>
          </div>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function WeightSummaryChip({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1.5">
      <p className="text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[11px] font-black text-[var(--app-text)]">
        {value}
      </p>
    </div>
  );
}

function ProgressVisualCompare({ firstCheckin, latestCheckin, locale }) {
  const { t } = useTranslation();
  const firstImage = getCheckinImage(firstCheckin);
  const latestImage = getCheckinImage(latestCheckin);
  const canCompare =
    firstCheckin &&
    latestCheckin &&
    String(firstCheckin.id) !== String(latestCheckin.id) &&
    firstImage &&
    latestImage;

  return (
    <SurfaceCard className="border border-[var(--app-border)] bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_var(--app-glow)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("progress.compare.badge")}
          </p>
          <h2 className="mt-0.5 text-sm font-black uppercase italic tracking-tight text-[var(--app-text)]">
            {t("progress.compare.title")}
          </h2>
        </div>

        <Sparkles size={14} className="text-[var(--app-primary)]" />
      </div>

      {canCompare ? (
        <div className="grid grid-cols-2 gap-1.5">
            <ProgressPhotoTile
              label={t("progress.compare.start")}
            image={firstImage}
            date={firstCheckin.created_at || firstCheckin.createdAt}
            locale={locale}
          />

          <ProgressPhotoTile
            label={t("progress.compare.current")}
            image={latestImage}
            date={latestCheckin.created_at || latestCheckin.createdAt}
            active
            locale={locale}
          />
        </div>
      ) : (
        <SurfaceCard variant="soft" radius="md" className="border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]">
              <Sparkles size={14} />
            </div>
            <p className="text-[11px] font-bold leading-4 text-[var(--app-muted)]">
              {t("progress.compare.empty")}
            </p>
          </div>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function ProgressPhotoTile({ label, image, date, locale, active = false }) {
  const { t } = useTranslation();
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-[var(--app-surface)] ${
        active ? "border-[var(--app-border)]" : "border-[var(--app-border)]"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--app-surface)]">
        <img
          src={image}
          alt={t("progress.compare.photoAlt", { label })}
          className="h-full w-full object-contain p-2"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/80 via-transparent to-black/10" />

        <div className="absolute left-1.5 top-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] backdrop-blur">
          {label}
        </div>

        <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 backdrop-blur">
          <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
            {formatCheckinDate(date, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAction }) {
  const { t } = useTranslation();
  return (
    <PremiumEmptyState
      icon={Scale}
      title={t("progress.empty.title")}
      description={t("progress.empty.description")}
      actionLabel={t("progress.empty.action")}
      onAction={onAction}
      className="py-8"
    />
  );
}

function Skeleton() {
  return (
    <SurfaceCard variant="soft" radius="md" className="h-28 animate-pulse" />
  );
}

function getCheckinImage(checkin) {
  return (
    checkin?.image_url ||
    checkin?.imageUrl ||
    checkin?.photo_url ||
    checkin?.photoUrl ||
    checkin?.image ||
    ""
  );
}

function formatCheckinDate(date, locale = "es-ES") {
  if (!date) return locale.startsWith("en") ? "No date" : "Sin fecha";
  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildWeightChartPoints(weightLogs) {
  const weights = weightLogs.map((checkin) => Number(checkin.weight));
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  const width = 288;
  const height = 102;
  const xOffset = 16;
  const yOffset = 24;
  const xStep = weightLogs.length > 1 ? width / (weightLogs.length - 1) : 0;

  return weights
    .map((weight, index) => {
      const x = xOffset + index * xStep;
      const y = yOffset + height - ((weight - minWeight) / range) * height;

      return `${Number(x.toFixed(1))},${Number(y.toFixed(1))}`;
    })
    .join(" ");
}

function buildMiniWeightChartPoints(weightLogs) {
  const weights = weightLogs.map((checkin) => Number(checkin.weight));
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  const width = 138;
  const height = 24;
  const xOffset = 6;
  const yOffset = 8;
  const xStep = weightLogs.length > 1 ? width / (weightLogs.length - 1) : 0;

  return weights
    .map((weight, index) => {
      const x = xOffset + index * xStep;
      const y = yOffset + height - ((weight - minWeight) / range) * height;

      return `${Number(x.toFixed(1))},${Number(y.toFixed(1))}`;
    })
    .join(" ");
}

function formatSignedKg(value) {
  if (!value) return "0 kg";

  return `${value > 0 ? "+" : ""}${value} kg`;
}

function getCheckinWeightDiff(checkin, previous) {
  const currentWeight = Number(checkin?.weight) || 0;
  const previousWeight = Number(previous?.weight) || 0;

  if (!currentWeight || !previousWeight) return null;

  return Number((currentWeight - previousWeight).toFixed(1));
}
