import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  History,
  ImagePlus,
  LogOut,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";


const PROFILE_KEY = "nutricoach_profile";
const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://nutricoach-backend-frlc.onrender.com";

export function CheckIn() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    weight: "",
    waist: "",
    chest: "",
    hips: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingHistory(true);
    setError("");

    const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);
    setProfile(savedProfile);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Necesitas iniciar sesión para guardar tu progreso.");
      setLoadingHistory(false);
      return;
    }

    setUser(user);

    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando checkins:", error);
      setError("No se pudo cargar tu historial de progreso.");
      setLoadingHistory(false);
      return;
    }

    setHistory(data || []);
    setLoadingHistory(false);
  }

  const lastCheckin = history[0];
  const previousCheckin = history[1];

  const weightDiff = useMemo(() => {
    if (!lastCheckin || !previousCheckin) return null;

    const current = Number(lastCheckin.weight || 0);
    const previous = Number(previousCheckin.weight || 0);

    if (!current || !previous) return null;

    return Number((current - previous).toFixed(1));
  }, [lastCheckin, previousCheckin]);

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhoto(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Máximo 4MB.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function saveCheckIn() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Necesitas iniciar sesión.");
      return;
    }

    if (!file) {
      setError("Sube una foto frontal de cuerpo completo.");
      return;
    }

    if (!form.weight) {
      setError("Introduce tu peso actual.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("image", file);
      formData.append("weight", form.weight);
      formData.append("waist", form.waist);
      formData.append("chest", form.chest);
      formData.append("hips", form.hips);
      formData.append("notes", form.notes);

      const response = await fetch(`${API_URL}/checkins`, {
        method: "POST",
        body: formData,
      });
const data = await response.json();

console.log("RESPUESTA CHECKIN:", data);

if (!response.ok) {
  throw new Error(data.detail || data.error || "No se pudo guardar.");
}

      setHistory((prev) => [data.checkin, ...prev]);
      setFile(null);
      setPreview(null);
      setForm({
        weight: "",
        waist: "",
        chest: "",
        hips: "",
        notes: "",
      });
      setMessage("Check-in guardado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar el check-in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem(PROFILE_KEY);
    navigate("/");
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#06110c] px-3 pb-28 pt-4 text-white font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_38%),radial-gradient(circle_at_bottom_left,#22c55e12,transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-3">
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-300 transition hover:bg-[#10b981] hover:text-[#06110c]"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-red-400/70"
          >
            <LogOut size={14} />
            Salir
          </button>
        </header>

        <section className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <HeroCompact
            lastCheckin={lastCheckin}
            weightDiff={weightDiff}
            profile={profile}
          />

          <CheckInForm
            preview={preview}
            handlePhoto={handlePhoto}
            form={form}
            handleChange={handleChange}
            saveCheckIn={saveCheckIn}
            loading={loading}
          />
        </section>

        {loading && <SavingLoader loading={loading} />}

        {error && <Alert type="error" text={error} />}
        {message && <Alert type="success" text={message} />}

        <Notice />

        <HistoryPanel history={history} loading={loadingHistory} />
      </div>

      <BottomNav />
    </section>
  );
}

function HeroCompact({ lastCheckin, weightDiff, profile }) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20 [clip-path:polygon(0_0,100%_0,100%_94%,96%_100%,0_100%)]">
      <div className="absolute -right-14 -top-14 h-44 w-44 bg-[#10b981]/12 blur-3xl" />

      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 border border-[#10b981]/25 bg-[#0d2218] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-[#10b981]">
          <Sparkles size={12} />
          Weekly Body Check
        </div>

        <h1 className="text-3xl font-black uppercase italic leading-[0.9] tracking-tight sm:text-5xl">
          Controla tu <br />
          <span className="text-[#10b981]">progreso</span>
        </h1>

        <p className="mt-3 text-xs normal-case leading-5 text-slate-400">
          Sube una foto semanal, registra tu peso y guarda tu evolución real.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MetricBox
            icon={<Scale size={15} />}
            label="Peso"
            value={lastCheckin?.weight || profile?.weight || "-"}
            detail="kg"
          />

          <MetricBox
            icon={
              weightDiff !== null && weightDiff <= 0 ? (
                <TrendingDown size={15} />
              ) : (
                <TrendingUp size={15} />
              )
            }
            label="Cambio"
            value={
              weightDiff === null
                ? "-"
                : `${weightDiff > 0 ? "+" : ""}${weightDiff}`
            }
            detail="kg"
          />

          <MetricBox
            icon={<Camera size={15} />}
            label="Registros"
            value={lastCheckin ? "Activo" : "Nuevo"}
            detail="scan"
          />
        </div>
      </div>
    </div>
  );
}

function CheckInForm({
  preview,
  handlePhoto,
  form,
  handleChange,
  saveCheckIn,
  loading,
}) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#091710] shadow-2xl shadow-black/20 [clip-path:polygon(0_0,100%_0,100%_96%,96%_100%,0_100%)]">
      <div className="absolute -right-14 -top-14 h-44 w-44 bg-[#10b981]/12 blur-3xl" />

      <div className="relative p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
              <Camera size={20} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10b981]">
                Nuevo check-in
              </p>
              <h2 className="text-xl font-black uppercase italic">Body Scan</h2>
            </div>
          </div>

          <span className="border border-white/10 bg-[#0d2218] px-3 py-1 text-[9px] font-black text-slate-400">
            Máx 4MB
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <label className="group relative grid min-h-[220px] cursor-pointer place-items-center overflow-hidden border border-dashed border-[#10b981]/35 bg-white/[0.035] text-center transition hover:border-[#10b981]/70 hover:bg-[#10b981]/5">
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Vista previa check-in"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/92 via-[#06110c]/20 to-transparent" />
                <div className="relative z-10 self-end p-4">
                  <p className="text-lg font-black uppercase italic">
                    Foto lista
                  </p>
                  <p className="mt-1 text-xs normal-case text-white/60">
                    Toca para cambiar.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
                  <ImagePlus size={30} />
                </div>

                <p className="text-xl font-black uppercase italic">
                  Sube tu foto
                </p>

                <p className="mx-auto mt-2 max-w-xs text-xs normal-case leading-5 text-slate-400">
                  Frontal, buena luz y misma distancia semanal.
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Peso"
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="72.5"
                type="number"
                step="0.1"
              />

              <Field
                label="Cintura"
                value={form.waist}
                onChange={(e) => handleChange("waist", e.target.value)}
                placeholder="80"
                type="number"
                step="0.1"
              />

              <Field
                label="Pecho"
                value={form.chest}
                onChange={(e) => handleChange("chest", e.target.value)}
                placeholder="95"
                type="number"
                step="0.1"
              />

              <Field
                label="Cadera"
                value={form.hips}
                onChange={(e) => handleChange("hips", e.target.value)}
                placeholder="90"
                type="number"
                step="0.1"
              />
            </div>

            <label>
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                Nota
              </p>

              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="h-[74px] w-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold normal-case text-white outline-none placeholder:text-white/20 focus:border-[#10b981]/50"
                placeholder="Ej: entrené 4 días, mejor energía..."
              />
            </label>

            <PrimaryButton onClick={saveCheckIn} disabled={loading}>
              <Save size={17} />
              {loading ? "Guardando..." : "Guardar check-in"}
              <ChevronRight size={15} />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavingLoader({ loading }) {
  const [percent, setPercent] = useState(8);
  const steps = ["Foto", "Medidas", "Subida", "Guardado"];

  useEffect(() => {
    if (!loading) return;

    setPercent(8);

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return prev;
        if (prev < 45) return prev + 7;
        if (prev < 80) return prev + 4;
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [loading]);

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <div className="border border-[#10b981]/20 bg-[#07120d] p-3 shadow-2xl shadow-[#10b981]/5">
      <div className="relative overflow-hidden border border-white/10 bg-[#0d2218]/70 p-4">
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 bg-[#10b981]/20 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10b981]">
              Guardando progreso
            </p>
            <h3 className="mt-1 text-xl font-black uppercase italic">
              Check-in semanal
            </h3>
          </div>

          <div className="grid h-14 w-14 place-items-center border border-[#10b981]/25">
            <span className="text-lg font-black text-[#10b981]">
              {percent}%
            </span>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden bg-white/5">
          <div
            className="h-full bg-[#10b981] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <div
                key={step}
                className={`border px-1 py-2 text-center ${
                  completed
                    ? "border-[#10b981]/25 bg-[#10b981]/10"
                    : active
                      ? "border-[#10b981]/40 bg-[#10b981]/5"
                      : "border-white/5 bg-black/10"
                }`}
              >
                <p
                  className={`text-[8px] font-black uppercase ${
                    completed || active ? "text-white" : "text-slate-600"
                  }`}
                >
                  {completed ? "✓ " : ""}
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({ history, loading }) {
  return (
    <div className="border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#10b981]" />
          <h3 className="text-sm font-black uppercase italic">
            Historial semanal
          </h3>
        </div>

        <span className="text-[10px] font-black text-slate-500">
          {history.length} registros
        </span>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Cargando historial...</p>
      ) : history.length === 0 ? (
        <div className="border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">
          <Camera className="mx-auto mb-2 text-[#10b981]" size={28} />
          <p className="text-xs font-black uppercase">Sin historial</p>
          <p className="mt-1 text-xs normal-case text-slate-500">
            Guarda tu primer check-in.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {history.map((item, index) => (
            <HistoryCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item, index }) {
  return (
    <div className="w-[280px] shrink-0 overflow-hidden border border-white/10 bg-white/[0.04]">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt="Check-in"
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="grid h-40 place-items-center bg-white/5 text-xs text-slate-500">
          Sin foto
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-black uppercase tracking-wide text-[#10b981]">
            Registro {index + 1}
          </p>

          <p className="text-[9px] text-slate-500">
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString("es-ES")
              : "-"}
          </p>
        </div>

        <h4 className="mt-2 text-2xl font-black">
          {item.weight || "-"} kg
        </h4>

        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
          <div className="border border-white/10 bg-black/20 p-2">
            <p className="text-slate-500">Cintura</p>
            <p className="font-black text-white">{item.waist || "-"} cm</p>
          </div>

          <div className="border border-white/10 bg-black/20 p-2">
            <p className="text-slate-500">Pecho</p>
            <p className="font-black text-white">{item.chest || "-"} cm</p>
          </div>

          <div className="border border-white/10 bg-black/20 p-2">
            <p className="text-slate-500">Cadera</p>
            <p className="font-black text-white">{item.hips || "-"} cm</p>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-[11px] normal-case leading-4 text-slate-300">
          <p>
            <span className="font-black text-[#10b981]">Grasa aprox:</span>{" "}
            {item.body_fat_range || "No estimable"}
          </p>

          <p>
            <span className="font-black text-[#10b981]">Confianza:</span>{" "}
            {item.confidence ? `${item.confidence}%` : "-"}
          </p>

          <p>
            <span className="font-black text-[#10b981]">Cambios:</span>{" "}
            {item.visual_changes || "Sin análisis visual."}
          </p>

          <p>
            <span className="font-black text-[#10b981]">Recomendación:</span>{" "}
            {item.recommendation || "Sin recomendación."}
          </p>

          <p>
            <span className="font-black text-[#10b981]">Nota:</span>{" "}
            {item.notes || "Sin nota registrada."}
          </p>
        </div>
      </div>
    </div>
  );
}


function Notice() {
  return (
    <div className="border border-amber-400/20 bg-amber-500/10 p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 shrink-0 text-amber-300" size={16} />
        <p className="text-xs normal-case leading-5 text-amber-100/80">
          Usa una foto parecida cada semana: misma luz, distancia y postura. Así
          el progreso será más fácil de comparar.
        </p>
      </div>
    </div>
  );
}

function Alert({ type, text }) {
  const isError = type === "error";

  return (
    <div
      className={`border p-3 text-xs font-bold normal-case ${
        isError
          ? "border-red-400/20 bg-red-500/10 text-red-300"
          : "border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]"
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
        {text}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full overflow-hidden bg-[#10b981] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#06110c] shadow-[0_20px_60px_#22c55e22] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>

      <input
        {...props}
        className="h-10 w-full border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white outline-none placeholder:text-white/20 focus:border-[#10b981]/50"
      />
    </label>
  );
}

function MetricBox({ icon, label, value, detail }) {
  return (
    <div className="min-w-0 border border-white/10 bg-[#0d2218]/70 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[#10b981]">
        {icon}
        <p className="truncate text-[7px] font-black uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <p className="truncate text-sm font-black">
        {value}
        <span className="text-[9px] text-slate-500"> {detail}</span>
      </p>
    </div>
  );
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}