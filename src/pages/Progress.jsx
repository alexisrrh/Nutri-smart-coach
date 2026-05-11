import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
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
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export function Progress() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [peso, setPeso] = useState("");
  const [nota, setNota] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [saved, setSaved] = useState(false);

  async function getLogs() {
    if (!user?.id) return;

    setLoadingLogs(true);

    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setLogs(data || []);

    setLoadingLogs(false);
  }

  useEffect(() => {
    if (user) getLogs();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setSaved(false);

    const { error } = await supabase.from("progress_logs").insert({
      user_id: user.id,
      peso: Number(peso),
      nota,
    });

    setLoading(false);

    if (!error) {
      setPeso("");
      setNota("");
      setSaved(true);
      getLogs();

      setTimeout(() => setSaved(false), 1800);
    }
  }

  const stats = useMemo(() => {
    if (!logs.length) {
      return {
        currentWeight: 0,
        firstWeight: 0,
        change: 0,
        direction: "neutral",
        totalLogs: 0,
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
      direction: change < 0 ? "down" : change > 0 ? "up" : "neutral",
      totalLogs: logs.length,
    };
  }, [logs]);

  return (
    <main className="min-h-screen bg-[#06110e] px-4 py-5 pb-32 text-white font-sans">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
                <Sparkles size={13} />
                Evolución corporal
              </div>

              <h1 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">
                Progreso
              </h1>

              <p className="mt-2 max-w-xl text-sm text-white/50">
                Registra tu peso, guarda notas y revisa cómo está cambiando tu cuerpo.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                Peso actual
              </p>

              <p className="mt-1 text-4xl font-black italic text-emerald-300">
                {stats.currentWeight || "--"}
                <span className="ml-1 text-sm text-white/35">kg</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard
            icon={<Scale size={18} />}
            title="Actual"
            value={stats.currentWeight || "--"}
            unit="kg"
          />

          <StatCard
            icon={<Target size={18} />}
            title="Inicio"
            value={stats.firstWeight || "--"}
            unit="kg"
          />

          <StatCard
            icon={
              stats.direction === "down" ? (
                <TrendingDown size={18} />
              ) : (
                <TrendingUp size={18} />
              )
            }
            title="Cambio"
            value={stats.change > 0 ? `+${stats.change}` : stats.change || "--"}
            unit="kg"
          />

          <StatCard
            icon={<ChartNoAxesColumnIncreasing size={18} />}
            title="Registros"
            value={stats.totalLogs}
            unit=""
          />
        </section>

        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200">
            <CheckCircle2 size={17} />
            Progreso guardado correctamente.
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-[#06110e]">
                <Plus size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">
                  Nuevo registro
                </h2>
                <p className="text-xs text-white/40">
                  Añade tu peso de hoy.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Peso actual">
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
                  <span className="text-xs font-black uppercase tracking-widest text-white/30">
                    kg
                  </span>
                </div>
              </Field>

              <Field label="Nota opcional">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 focus-within:border-emerald-400/50">
                  <div className="mb-2 flex items-center gap-2 text-emerald-300">
                    <NotebookPen size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
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
              </Field>

              <button
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#06110e] shadow-[0_20px_45px_#10b98122] transition hover:scale-[1.01] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-3">
                  <Save size={17} />
                  {loading ? "Guardando..." : "Guardar progreso"}
                </span>
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">
                  Historial
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {logs.length} registro{logs.length !== 1 ? "s" : ""}
                </p>
              </div>

              <CalendarDays size={22} className="text-emerald-300" />
            </div>

            {loadingLogs ? (
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
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function StatCard({ icon, title, value, unit }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-emerald-400/5 sm:p-5">
      <div className="mb-3 text-emerald-300">{icon}</div>

      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-white/35">
        {title}
      </p>

      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-black italic text-white">{value}</p>
        {unit && (
          <p className="text-[10px] font-bold uppercase text-emerald-300/50">
            {unit}
          </p>
        )}
      </div>
    </div>
  );
}

function ProgressCard({ log, previous }) {
  const current = Number(log.peso) || 0;
  const prev = Number(previous?.peso) || null;
  const diff = prev ? Number((current - prev).toFixed(1)) : null;

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#081713] p-4 transition hover:border-emerald-400/25 hover:bg-[#0b1d18]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black italic text-emerald-300">
            {current}
            <span className="ml-1 text-sm text-white/35">kg</span>
          </h3>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">
            {new Date(log.created_at).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {diff !== null && (
          <div
            className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
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
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm leading-relaxed text-white/55">
          {log.nota}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
        <Scale size={30} />
      </div>

      <h3 className="text-xl font-black uppercase tracking-tight text-white">
        Sin registros todavía
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
        Añade tu primer peso para empezar a medir tu evolución.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-28 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.04]" />
  );
}