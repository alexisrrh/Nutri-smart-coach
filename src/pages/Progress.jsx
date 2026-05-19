import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  NotebookPen,
  Plus,
  Save,
  Scale,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  createProgressLog,
  listProgressLogs,
} from "../services/progressService";
import { deleteCheckin, listCheckins } from "../services/checkinService";
import {
  AppShell,
  FormField,
  MetaBadge,
  PrimaryButton,
  StatusBox,
  SurfaceCard,
} from "../components/ui";

export function Progress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [peso, setPeso] = useState("");
  const [nota, setNota] = useState("");
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [usingCache, setUsingCache] = useState(false);
  const [activeView, setActiveView] = useState("resumen");
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getLogs = useCallback(async () => {
    if (!userId) return;

    setLoadingLogs(true);

    try {
      const result = await listProgressLogs(userId, { includeMeta: true });

      setLogs(result.logs);
      setUsingCache(result.fromCache && Boolean(result.error));
    } catch (error) {
      console.error("Error cargando progreso:", error);
      setErrorMessage("No se pudo cargar tu progreso.");
    } finally {
      setLoadingLogs(false);
    }
  }, [userId]);

  const getCheckins = useCallback(async () => {
    if (!userId) return;

    setLoadingCheckins(true);

    try {
      const checkinLogs = await listCheckins(userId);

      setCheckins(checkinLogs);
    } catch (error) {
      console.error("Error cargando check-ins:", error);
      setErrorMessage("No se pudieron cargar tus check-ins.");
    } finally {
      setLoadingCheckins(false);
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      Promise.resolve().then(getLogs);
      Promise.resolve().then(getCheckins);
    }
  }, [getCheckins, getLogs, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setSaved(false);
    setErrorMessage("");

    try {
      await createProgressLog({
        userId: user.id,
        weight: peso,
        note: nota,
      });

      setPeso("");
      setNota("");
      setSaved(true);
      getLogs();

      setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      console.error("Error guardando progreso:", error);
      setErrorMessage(error.message || "No se pudo guardar tu progreso.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCheckin(checkin) {
    if (!checkin?.id || !userId || deletingId) return;

    const confirmed = window.confirm("¿Eliminar este check-in?");
    if (!confirmed) return;

    try {
      setDeletingId(checkin.id);
      setErrorMessage("");

      await deleteCheckin(checkin.id, userId);

      setCheckins((prev) =>
        prev.filter((item) => String(item.id) !== String(checkin.id))
      );

      if (String(selectedCheckin?.id) === String(checkin.id)) {
        setSelectedCheckin(null);
      }
    } catch (error) {
      console.error("Error borrando check-in:", error);
      setErrorMessage(error.message || "No se pudo borrar el check-in.");
    } finally {
      setDeletingId(null);
    }
  }

  const sortedCheckinsDesc = useMemo(
    () => sortCheckinsByDate(checkins, "desc"),
    [checkins]
  );
  const sortedCheckinsAsc = useMemo(
    () => sortCheckinsByDate(checkins, "asc"),
    [checkins]
  );

  const stats = useMemo(() => {
    const latestCheckin = sortedCheckinsDesc[0] || null;
    const previousCheckin = sortedCheckinsDesc[1] || null;
    const firstCheckin = sortedCheckinsAsc[0] || null;
    const totalCheckins = sortedCheckinsDesc.length;

    if (latestCheckin) {
      const currentWeight = Number(latestCheckin.weight) || 0;
      const firstWeight = Number(firstCheckin?.weight) || 0;
      const previousWeight = Number(previousCheckin?.weight) || 0;
      const weeklyChange = previousWeight
        ? Number((currentWeight - previousWeight).toFixed(1))
        : 0;
      const change = firstWeight
        ? Number((currentWeight - firstWeight).toFixed(1))
        : 0;

      return {
        currentWeight,
        firstWeight,
        change,
        weeklyChange,
        direction: change < 0 ? "down" : change > 0 ? "up" : "neutral",
        totalLogs: totalCheckins,
        latestCheckin,
        previousCheckin,
        firstCheckin,
        totalCheckins,
      };
    }

    if (!logs.length) {
      return {
        currentWeight: 0,
        firstWeight: 0,
        change: 0,
        weeklyChange: 0,
        direction: "neutral",
        totalLogs: 0,
        latestCheckin: null,
        previousCheckin: null,
        firstCheckin: null,
        totalCheckins: 0,
      };
    }

    const newest = logs[0];
    const oldest = logs[logs.length - 1];

    const currentWeight = Number(newest.peso) || 0;
    const firstWeight = Number(oldest.peso) || 0;
    const change = Number((currentWeight - firstWeight).toFixed(1));

    return {
      currentWeight,
      firstWeight,
      change,
      weeklyChange: 0,
      direction: change < 0 ? "down" : change > 0 ? "up" : "neutral",
      totalLogs: logs.length,
      latestCheckin: null,
      previousCheckin: null,
      firstCheckin: null,
      totalCheckins: 0,
    };
  }, [logs, sortedCheckinsAsc, sortedCheckinsDesc]);

  const loadingHistory = loadingLogs || loadingCheckins;

  return (
    <AppShell contentClassName="px-2 pb-2 pt-1.5">
      <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
        <div className="shrink-0">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/[0.035] px-2.5 py-1 text-[9px] font-semibold text-white/48 transition hover:text-white/80"
        >
          <ArrowLeft size={11} />
          Dashboard
        </button>

        <SurfaceCard className="relative overflow-hidden border border-[#10b981]/15 bg-[#07170f]/95 p-3 shadow-[0_16px_45px_rgba(16,185,129,0.08)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,#10b9811f,transparent_42%)]" />
          <div className="relative z-10">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#10b981]">
                <Sparkles size={10} />
                Evolución IA
              </div>
              <h1 className="text-[21px] font-black uppercase italic leading-[0.95] tracking-tight text-white">
                Progreso
              </h1>
              <p className="mt-0.5 text-[10px] leading-4 text-white/60">
                Peso, fotos y tendencia corporal.
              </p>
            </div>

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#10b981]/10 text-[#10b981]">
              <Scale size={16} />
            </div>
          </div>

          <div className="grid grid-cols-[104px_1fr] items-end gap-3 rounded-[18px] border border-[#10b981]/15 bg-gradient-to-br from-[#063d2d]/60 via-[#07523b]/45 to-[#07170f] px-2.5 py-2">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
                Peso actual
              </p>
              <p className="mt-1 text-[36px] font-black leading-none tracking-tight text-white">
                {stats.currentWeight || "--"}
                <span className="ml-1 text-xs font-bold text-emerald-100/55">kg</span>
              </p>
            </div>

            <MiniWeightSparkline checkins={sortedCheckinsDesc} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <SnapshotChip label="Inicio" value={stats.firstWeight || "--"} unit="kg" />
            <SnapshotChip label="Registros" value={stats.totalLogs} />
            <SnapshotChip label="Últ. cambio" value={formatSignedKg(stats.weeklyChange)} />
          </div>
          </div>
        </SurfaceCard>
        <ProgressViewTabs activeView={activeView} setActiveView={setActiveView} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-3">
            {saved && (
              <StatusBox type="success">
                Progreso guardado correctamente.
              </StatusBox>
            )}

            {errorMessage && (
              <StatusBox type="error">
                {errorMessage}
              </StatusBox>
            )}

            {usingCache && !errorMessage && (
              <StatusBox type="info">
                Mostrando progreso guardado en este dispositivo.
              </StatusBox>
            )}

            {activeView === "resumen" && (
              <>
                <ProgressStatsGrid stats={stats} />
                <ProgressAIInsights
                  latestCheckin={stats.latestCheckin}
                  previousCheckin={stats.previousCheckin}
                />
              </>
            )}

            {activeView === "fotos" && (
              <ProgressVisualCompare
                firstCheckin={stats.firstCheckin}
                latestCheckin={stats.latestCheckin}
              />
            )}

            {activeView === "grafica" && (
              <ProgressWeightChart checkins={sortedCheckinsDesc} />
            )}

            {activeView === "historial" && (
              <>
                <button
                  type="button"
                  onClick={() => setShowManualForm((prev) => !prev)}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[1.15rem] border border-emerald-300/25 bg-gradient-to-br from-[#063d2d] via-[#07523b] to-[#0a6b4c] px-3 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_38px_rgba(16,185,129,0.20)] transition active:scale-[0.98]"
                >
                  <span className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-white/15 blur-2xl" />
                  <Plus size={13} />
                  Registro manual
                </button>

                {showManualForm && (
                  <ManualProgressForm
                    peso={peso}
                    setPeso={setPeso}
                    nota={nota}
                    setNota={setNota}
                    loading={loading}
                    handleSubmit={handleSubmit}
                  />
                )}

                <ProgressHistorySection
                  loadingHistory={loadingHistory}
                  logs={logs}
                  sortedCheckinsDesc={sortedCheckinsDesc}
                  deletingId={deletingId}
                  onDelete={handleDeleteCheckin}
                  onSelect={setSelectedCheckin}
                />
              </>
            )}
          </div>
        </div>

        {selectedCheckin && (
          <CheckinDetailSheet
            checkin={selectedCheckin}
            onClose={() => setSelectedCheckin(null)}
          />
        )}
      </div>
    </AppShell>
  );
}

function ProgressViewTabs({ activeView, setActiveView }) {
  const views = [
    { id: "resumen", label: "Resumen", icon: Sparkles },
    { id: "fotos", label: "Fotos", icon: Scale },
    { id: "grafica", label: "Gráfica", icon: ChartNoAxesColumnIncreasing },
    { id: "historial", label: "Hist.", icon: CalendarDays },
  ];

  return (
    <div className="mt-1.5 grid grid-cols-4 gap-0.5 rounded-full border border-[#10b981]/15 bg-[#07170f]/95 p-0.5 shadow-[0_12px_34px_rgba(16,185,129,0.06)]">
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
                ? "bg-[#10b981] text-[#06110c] shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                : "text-emerald-100/50 hover:bg-[#10b981]/10 hover:text-emerald-100"
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
    <div className="rounded-xl border border-[#10b981]/10 bg-[#10b981]/[0.055] px-2 py-1.5">
      <p className="truncate text-[8px] font-black uppercase tracking-wide text-emerald-100/45">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[12px] font-black text-white">
        {value}
        {unit && <span className="ml-0.5 text-[9px] text-white/35">{unit}</span>}
      </p>
    </div>
  );
}

function ProgressStatsGrid({ stats }) {
  const compactStats = [
    {
      icon: Scale,
      label: "Actual",
      value: stats.currentWeight || "--",
      unit: "kg",
      tone: "text-[#10b981]",
    },
    {
      icon: Target,
      label: "Inicio",
      value: stats.firstWeight || "--",
      unit: "kg",
      tone: "text-white/72",
    },
    {
      icon: stats.direction === "down" ? TrendingDown : TrendingUp,
      label: "Cambio",
      value: stats.change > 0 ? `+${stats.change}` : stats.change || "--",
      unit: "kg",
      tone: stats.direction === "down" ? "text-[#10b981]" : "text-[#d9c7a4]",
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      label: "Registros",
      value: stats.totalLogs,
      unit: "",
      tone: "text-white/75",
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-1.5">
      {compactStats.map((item) => {
        const Icon = item.icon;

        return (
          <SurfaceCard key={item.label} radius="md" className="border border-[#10b981]/10 bg-[#07170f]/95 p-1.5 shadow-[0_12px_34px_rgba(16,185,129,0.05)]">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[8px] font-black uppercase tracking-wide text-emerald-100/45">
                {item.label}
              </p>
              <Icon size={10} className={item.tone} />
            </div>

            <p className={`mt-1 truncate text-[13px] font-black leading-none ${item.tone}`}>
              {item.value}
              {item.unit && (
                <span className="ml-0.5 text-[8px] font-medium text-white/35">
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
  const weightLogs = checkins
    .filter((checkin) => Number(checkin.weight) > 0)
    .slice(0, 8)
    .reverse();
  const canChart = weightLogs.length >= 2;
  const points = canChart ? buildMiniWeightChartPoints(weightLogs) : "";

  return (
    <div className="h-10 min-w-0 overflow-hidden rounded-lg bg-black/20 px-1.5 py-1 ring-1 ring-[#10b981]/10">
      {canChart ? (
        <svg
          viewBox="0 0 150 40"
          className="h-full w-full"
          role="img"
          aria-label="Mini gráfica de peso"
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
            stroke="#10b981"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </svg>
      ) : (
        <div className="grid h-full place-items-center text-[9px] font-medium text-white/28">
          Sin tendencia
        </div>
      )}
    </div>
  );
}

function ManualProgressForm({
  peso,
  setPeso,
  nota,
  setNota,
  loading,
  handleSubmit,
}) {
  return (
    <SurfaceCard as="form" onSubmit={handleSubmit} className="p-4">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#06110e]">
          <Plus size={22} />
        </div>

        <div>
          <MetaBadge variant="neutral">Nuevo registro</MetaBadge>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            Nuevo registro
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/55">
            Añade tu peso y una nota de medidas.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <FormField label="Peso actual" icon={<Scale size={15} />}>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 focus-within:border-emerald-400/50">
            <Scale size={17} className="text-emerald-300" />
            <input
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/20"
              placeholder="Ej. 72.5"
              type="number"
              step="0.1"
              required
            />
            <span className="text-xs font-black uppercase tracking-widest text-white/45">
              kg
            </span>
          </div>
        </FormField>

        <FormField label="Nota opcional" icon={<NotebookPen size={15} />}>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 focus-within:border-emerald-400/50">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <NotebookPen size={16} />
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
                Cómo te sentiste
              </span>
            </div>

            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="min-h-28 w-full resize-none bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/20"
              placeholder="Ej. Me sentí con más energía, bajé abdomen, entrené piernas..."
            />
          </div>
        </FormField>

        <PrimaryButton
          type="submit"
          disabled={loading}
          icon={<Save size={17} />}
        >
          {loading ? "Guardando..." : "Guardar peso"}
        </PrimaryButton>
      </div>
    </SurfaceCard>
  );
}

function ProgressHistorySection({
  loadingHistory,
  logs,
  sortedCheckinsDesc,
  deletingId,
  onDelete,
  onSelect,
}) {
  return (
    <SurfaceCard className="border border-[#10b981]/15 bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_rgba(16,185,129,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
            {sortedCheckinsDesc.length || logs.length} registro
            {(sortedCheckinsDesc.length || logs.length) !== 1 ? "s" : ""}
          </p>
          <h2 className="mt-0.5 text-[15px] font-black uppercase italic tracking-tight text-white">
            Historial
          </h2>
        </div>

        <CalendarDays size={14} className="text-white/45" />
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
            />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {logs.map((log, index) => (
            <ProgressCard
              key={log.id}
              log={log}
              previous={logs[index + 1]}
            />
          ))}
        </div>
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
}) {
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
      className="cursor-pointer overflow-hidden border border-[#10b981]/10 bg-[#07170f]/95 p-0 shadow-[0_10px_28px_rgba(16,185,129,0.05)] transition hover:border-emerald-300/25 hover:bg-[#0a1d15]"
    >
      <div className="grid grid-cols-[52px_1fr] gap-2 rounded-2xl px-1 py-1.5">
        <div className="relative h-[58px] overflow-hidden rounded-xl border border-[#10b981]/10 bg-black/25">
          {image ? (
            <img
              src={image}
              alt="Check-in de progreso"
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <div className="grid h-full place-items-center text-emerald-100/70">
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
            aria-label="Eliminar check-in"
            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/40 text-white/38 backdrop-blur transition hover:text-red-100 disabled:opacity-50"
          >
            <Trash2 size={10} />
          </button>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-wide text-[#10b981]">
                {formatCheckinDate(checkin.created_at || checkin.createdAt)}
              </p>
              <h3 className="mt-0.5 truncate text-[18px] font-black text-white">
                {weight ? `${weight} kg` : "Peso pendiente"}
              </h3>
            </div>

            {weightDiff !== null && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  weightDiff < 0
                    ? "bg-[#10b981] text-[#06110c]"
                    : weightDiff > 0
                    ? "bg-[#d9c7a4] text-[#171105]"
                    : "bg-white/5 text-white/45"
                }`}
              >
                {formatSignedKg(weightDiff)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {bodyFatRange && (
              <CheckinMetricPill label="Grasa" value={bodyFatRange} />
            )}
            {checkin.confidence ? (
              <CheckinMetricPill label="Conf." value={`${checkin.confidence}%`} />
            ) : null}
          </div>

          {visualChanges && (
            <p className="mt-1 line-clamp-1 text-[10px] font-normal leading-4 text-white/42">
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
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#10b981]/10 bg-[#10b981]/[0.055] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide">
      <span className="text-emerald-100/45">{label}</span>
      <span className="truncate text-white/78">{value}</span>
    </span>
  );
}

function CheckinDetailSheet({ checkin, onClose }) {
  const image = getCheckinImage(checkin);

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/52 backdrop-blur-[6px]"
        role="presentation"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Análisis completo del check-in"
        className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[9999] mx-auto w-full max-w-[430px] px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-[70vh] overflow-y-auto rounded-t-[28px] border border-[#10b981]/15 bg-[#07170f]/98 p-2.5 pb-3 shadow-[0_-16px_48px_rgba(16,185,129,0.14)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#10b981]">
                {formatCheckinDate(checkin.created_at || checkin.createdAt)}
              </p>
              <h3 className="mt-1 text-base font-black uppercase italic leading-none text-white">
                Detalle corporal
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar análisis"
              className="grid h-7 w-7 place-items-center rounded-full border border-[#10b981]/15 bg-[#10b981]/10 text-[#10b981] transition hover:bg-[#10b981]/15"
            >
              <X size={13} />
            </button>
          </div>

          <div className="mb-2 flex gap-2">
            {image ? (
              <div className="relative h-[124px] w-[112px] shrink-0 overflow-hidden rounded-[18px] border border-[#10b981]/15 bg-[#06110e]">
                <img
                  src={image}
                  alt="Check-in seleccionado"
                  className="h-full w-full object-contain p-2"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="grid h-[124px] w-[112px] shrink-0 place-items-center rounded-[18px] border border-[#10b981]/15 bg-[#10b981]/[0.055] text-center">
                <div className="grid place-items-center">
                  <Scale size={16} className="text-[#10b981]" />
                  <p className="mt-1 text-[8px] font-black uppercase text-emerald-100/70">
                    Sin foto
                  </p>
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <SheetStatRow label="Peso" value={checkin.weight ? `${checkin.weight} kg` : "—"} />
              <SheetStatRow label="Grasa" value={checkin.body_fat_range || "—"} />
              <SheetStatRow
                label="Confianza"
                value={checkin.confidence ? `${checkin.confidence}%` : "—"}
              />
              <SheetStatRow label="Estado" value={checkin.visual_changes ? "Con insight" : "Sin insight"} />
            </div>
          </div>

          <div className="space-y-1.5">
            {checkin.visual_changes && (
              <div className="rounded-2xl border border-[#10b981]/10 bg-[#10b981]/[0.055] px-2.5 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#10b981]">
                  Cambios visuales
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] font-medium leading-4 text-white/68">
                  {checkin.visual_changes}
                </p>
              </div>
            )}

            {checkin.recommendation && (
              <div className="rounded-2xl border border-[#10b981]/10 bg-[#10b981]/[0.055] px-2.5 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#10b981]">
                  Recomendación
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] font-medium leading-4 text-white/68">
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
  const visualChanges = latestCheckin?.visual_changes || "";
  const recommendation = latestCheckin?.recommendation || "";
  const bodyFatRange = latestCheckin?.body_fat_range || "";
  const confidence = latestCheckin?.confidence || "";
  const hasAnalysis = Boolean(
    latestCheckin && (visualChanges || recommendation || bodyFatRange || confidence)
  );

  return (
    <SurfaceCard className="border border-[#10b981]/15 bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_rgba(16,185,129,0.08)]">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
          <Sparkles size={13} />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
            {previousCheckin ? "Comparación IA" : "Análisis IA"}
          </p>
          <h2 className="mt-0.5 text-sm font-black uppercase italic tracking-tight text-white">
            Insight de progreso
          </h2>

          {hasAnalysis ? (
            <p className="mt-1 line-clamp-3 text-[11px] font-medium leading-4 text-white/65">
              {visualChanges || recommendation || "Análisis disponible para tu último check-in."}
            </p>
          ) : (
            <p className="mt-1 text-[11px] font-medium leading-4 text-white/55">
              Haz un check-in con foto para ver un resumen IA de tu evolución.
            </p>
          )}

          {(bodyFatRange || confidence) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bodyFatRange && (
                <AIInsightChip label="Grasa estimada" value={bodyFatRange} />
              )}
              {confidence && (
                <AIInsightChip label="Confianza" value={`${confidence}%`} />
              )}
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}

function SheetStatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-[#10b981]/10 bg-black/18 px-2.5 py-1.5">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-emerald-100/40">
        {label}
      </p>

      <p className="truncate text-[10px] font-black text-white">
        {value}
      </p>
    </div>
  );
}

function AIInsightChip({ label, value }) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#10b981]/10 bg-[#10b981]/[0.055] px-2 py-1">
      <p className="text-[8px] font-black uppercase tracking-wide text-emerald-100/45">
        {label}
      </p>

      <p className="truncate text-[9px] font-black text-white">{value}</p>
    </div>
  );
}

function ProgressWeightChart({ checkins }) {
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
    <SurfaceCard className="border border-[#10b981]/15 bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_rgba(16,185,129,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
            Check-ins
          </p>
          <h2 className="mt-0.5 text-sm font-black uppercase italic tracking-tight text-white">
            Evolución de peso
          </h2>
        </div>

        <ChartNoAxesColumnIncreasing size={14} className="text-[#10b981]" />
      </div>

      {canChart ? (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            <WeightSummaryChip label="Inicial" value={`${firstWeight} kg`} />
            <WeightSummaryChip label="Actual" value={`${latestWeight} kg`} />
            <WeightSummaryChip label="Cambio" value={formatSignedKg(totalChange)} />
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-[#10b981]/15 bg-black/20 p-2">
            <svg
              viewBox="0 0 320 150"
              className="h-[112px] w-full"
              role="img"
              aria-label="Gráfico de evolución de peso"
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
                stroke="#10b981"
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
        <SurfaceCard variant="soft" radius="md" className="border-white/10 bg-white/[0.035] px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-emerald-100/80">
              <ChartNoAxesColumnIncreasing size={14} />
            </div>
            <p className="text-[11px] font-bold leading-4 text-white/55">
              Necesitas al menos 2 check-ins con peso para ver la tendencia.
            </p>
          </div>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function WeightSummaryChip({ label, value }) {
  return (
    <div className="rounded-xl border border-[#10b981]/10 bg-[#10b981]/[0.055] px-2 py-1.5">
      <p className="text-[8px] font-black uppercase tracking-wide text-emerald-100/45">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[11px] font-black text-white">
        {value}
      </p>
    </div>
  );
}

function ProgressVisualCompare({ firstCheckin, latestCheckin }) {
  const firstImage = getCheckinImage(firstCheckin);
  const latestImage = getCheckinImage(latestCheckin);
  const canCompare =
    firstCheckin &&
    latestCheckin &&
    String(firstCheckin.id) !== String(latestCheckin.id) &&
    firstImage &&
    latestImage;

  return (
    <SurfaceCard className="border border-[#10b981]/15 bg-[#07170f]/95 p-2.5 shadow-[0_16px_45px_rgba(16,185,129,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
            Check-ins
          </p>
          <h2 className="mt-0.5 text-sm font-black uppercase italic tracking-tight text-white">
            Tu evolución
          </h2>
        </div>

        <Sparkles size={14} className="text-[#10b981]" />
      </div>

      {canCompare ? (
        <div className="grid grid-cols-2 gap-1.5">
          <ProgressPhotoTile
            label="Inicial"
            image={firstImage}
            date={firstCheckin.created_at || firstCheckin.createdAt}
          />

          <ProgressPhotoTile
            label="Actual"
            image={latestImage}
            date={latestCheckin.created_at || latestCheckin.createdAt}
            active
          />
        </div>
      ) : (
        <SurfaceCard variant="soft" radius="md" className="border-white/10 bg-white/[0.035] px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-emerald-100/80">
              <Sparkles size={14} />
            </div>
            <p className="text-[11px] font-bold leading-4 text-white/55">
              Necesitas más check-ins para comparar evolución.
            </p>
          </div>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function ProgressPhotoTile({ label, image, date, active = false }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-black/20 ${
        active ? "border-[#10b981]/35" : "border-[#10b981]/15"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black/30">
        <img
          src={image}
          alt={`Foto ${label.toLowerCase()} de progreso`}
          className="h-full w-full object-contain p-2"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/80 via-transparent to-black/10" />

        <div className="absolute left-1.5 top-1.5 rounded-full border border-[#10b981]/20 bg-black/55 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-emerald-100 backdrop-blur">
          {label}
        </div>

        <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-lg border border-[#10b981]/15 bg-black/55 px-2 py-1 backdrop-blur">
          <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#10b981]">
            {formatCheckinDate(date)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ log, previous }) {
  const current = Number(log.peso) || 0;
  const prev = Number(previous?.peso) || null;
  const diff = prev ? Number((current - prev).toFixed(1)) : null;

  return (
    <SurfaceCard radius="md" className="p-4 transition hover:border-emerald-400/25 hover:bg-[#0b1d18]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black italic text-emerald-300">
            {current}
            <span className="ml-1 text-sm text-white/35">kg</span>
          </h3>

          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            {new Date(log.created_at).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {diff !== null && (
          <div
            className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
              diff < 0
                ? "bg-emerald-400/10 text-emerald-300"
                : diff > 0
                ? "bg-amber-400/10 text-amber-200"
                : "bg-white/5 text-white/40"
            }`}
          >
            {diff > 0 ? `+${diff}` : diff} kg
          </div>
        )}
      </div>

      {log.nota && (
        <SurfaceCard variant="soft" radius="sm" className="mt-4 p-3">
          <p className="text-sm leading-relaxed text-white/60">
            {log.nota}
          </p>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function EmptyState() {
  return (
    <SurfaceCard variant="soft" radius="md" className="py-14 text-center">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
        <Scale size={30} />
      </div>

      <h3 className="text-xl font-black uppercase tracking-tight text-white">
        Sin registros todavía
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
        Añade tu primer peso para empezar a medir tu evolución de peso y medidas.
      </p>
    </SurfaceCard>
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

function formatCheckinDate(date) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-ES", {
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

function sortCheckinsByDate(checkins, direction = "desc") {
  return [...checkins]
    .map((checkin, index) => ({
      checkin,
      index,
      time: getCheckinTime(checkin),
    }))
    .sort((a, b) => {
      if (a.time !== null && b.time !== null && a.time !== b.time) {
        return direction === "asc" ? a.time - b.time : b.time - a.time;
      }

      return direction === "asc" ? b.index - a.index : a.index - b.index;
    })
    .map(({ checkin }) => checkin);
}

function getCheckinTime(checkin) {
  const date = checkin?.created_at || checkin?.createdAt;
  const time = date ? new Date(date).getTime() : Number.NaN;

  return Number.isNaN(time) ? null : time;
}
