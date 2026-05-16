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
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  createProgressLog,
  listProgressLogs,
} from "../services/progressService";
import { listCheckins } from "../services/checkinService";
import {
  AppShell,
  FormField,
  MetaBadge,
  PageHeaderCard,
  PrimaryButton,
  StatCard,
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

  const stats = useMemo(() => {
    const latestCheckin = checkins[0] || null;
    const previousCheckin = checkins[1] || null;
    const firstCheckin = checkins[checkins.length - 1] || null;
    const totalCheckins = checkins.length;

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
  }, [checkins, logs]);

  const loadingHistory = loadingLogs || loadingCheckins;

  return (
    <AppShell contentClassName="px-2 pt-2">
      <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
        <div className="shrink-0">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/60 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>

        <PageHeaderCard
          badge="Evolución corporal"
          badgeIcon={<Sparkles size={14} />}
          icon={<Scale size={18} />}
          title="Progreso"
          description="Registra peso y medidas para ver tu evolución corporal."
        >
          <SurfaceCard variant="accent" radius="md" className="mt-4 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
              Peso actual
            </p>

            <p className="mt-1 text-4xl font-black tracking-tight text-[#86efac]">
              {stats.currentWeight || "--"}
              <span className="ml-1 text-sm font-bold text-white/45">kg</span>
            </p>
          </SurfaceCard>
        </PageHeaderCard>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Scale size={18} />}
            label="Actual"
            value={stats.currentWeight || "--"}
            unit="kg"
          />

          <StatCard
            icon={<Target size={18} />}
            label="Inicio"
            value={stats.firstWeight || "--"}
            unit="kg"
            tone="cyan"
          />

          <StatCard
            icon={
              stats.direction === "down" ? (
                <TrendingDown size={18} />
              ) : (
                <TrendingUp size={18} />
              )
            }
            label="Cambio"
            value={stats.change > 0 ? `+${stats.change}` : stats.change || "--"}
            unit="kg"
            tone={stats.direction === "down" ? "emerald" : "amber"}
          />

          <StatCard
            icon={<ChartNoAxesColumnIncreasing size={18} />}
            label="Registros"
            value={stats.totalLogs}
            unit=""
            tone="neutral"
          />
        </section>

        {saved && (
          <StatusBox type="success" className="mt-4">
            Progreso guardado correctamente.
          </StatusBox>
        )}

        {errorMessage && (
          <StatusBox type="error" className="mt-4">
            {errorMessage}
          </StatusBox>
        )}

        {usingCache && !errorMessage && (
          <StatusBox type="info" className="mt-4">
            Mostrando progreso guardado en este dispositivo.
          </StatusBox>
        )}

        <section className="mt-4 space-y-4">
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

          <ProgressVisualCompare
            firstCheckin={stats.firstCheckin}
            latestCheckin={stats.latestCheckin}
          />

          <ProgressWeightChart checkins={checkins} />

          <SurfaceCard className="p-4">
            <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <MetaBadge variant="neutral">
                  {logs.length} registro{logs.length !== 1 ? "s" : ""}
                </MetaBadge>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Historial
                </h2>
              </div>

              <CalendarDays size={22} className="text-emerald-300" />
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </div>
            ) : logs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
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
        </section>
        </div>
      </div>
    </AppShell>
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
    <SurfaceCard className="p-4">
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <MetaBadge variant="neutral">Check-ins</MetaBadge>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            Evolución de peso
          </h2>
        </div>

        <ChartNoAxesColumnIncreasing size={22} className="text-emerald-300" />
      </div>

      {canChart ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <WeightSummaryChip label="Inicial" value={`${firstWeight} kg`} />
            <WeightSummaryChip label="Actual" value={`${latestWeight} kg`} />
            <WeightSummaryChip label="Cambio" value={formatSignedKg(totalChange)} />
          </div>

          <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/20 p-3">
            <svg
              viewBox="0 0 320 150"
              className="h-[150px] w-full"
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
                strokeWidth="4"
              />

              {chartPoints.split(" ").map((point) => {
                const [x, y] = point.split(",");

                return (
                  <circle
                    key={point}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#07170f"
                    stroke="#86efac"
                    strokeWidth="2.5"
                  />
                );
              })}
            </svg>
          </div>
        </>
      ) : (
        <SurfaceCard variant="soft" radius="md" className="py-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <ChartNoAxesColumnIncreasing size={25} />
          </div>

          <p className="mx-auto max-w-sm text-sm font-bold leading-6 text-white/55">
            Necesitas al menos 2 check-ins con peso para ver la tendencia.
          </p>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function WeightSummaryChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-emerald-300">
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
    <SurfaceCard className="p-4">
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <MetaBadge variant="neutral">Check-ins</MetaBadge>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            Tu evolución
          </h2>
        </div>

        <Sparkles size={22} className="text-emerald-300" />
      </div>

      {canCompare ? (
        <div className="grid grid-cols-2 gap-3">
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
        <SurfaceCard variant="soft" radius="md" className="py-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Sparkles size={25} />
          </div>

          <p className="mx-auto max-w-sm text-sm font-bold leading-6 text-white/55">
            Necesitas más check-ins para comparar evolución.
          </p>
        </SurfaceCard>
      )}
    </SurfaceCard>
  );
}

function ProgressPhotoTile({ label, image, date, active = false }) {
  return (
    <div
      className={`overflow-hidden rounded-[22px] border bg-black/20 ${
        active ? "border-emerald-400/25" : "border-white/10"
      }`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
        <img
          src={image}
          alt={`Foto ${label.toLowerCase()} de progreso`}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/80 via-transparent to-black/10" />

        <div className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/80 backdrop-blur">
          {label}
        </div>

        <div className="absolute bottom-2 left-2 right-2 rounded-2xl border border-white/10 bg-black/55 px-2 py-1.5 backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
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

function formatSignedKg(value) {
  if (!value) return "0 kg";

  return `${value > 0 ? "+" : ""}${value} kg`;
}
