import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Save,
  ImagePlus,
  Scale,
  TrendingDown,
  TrendingUp,
  Sparkles,
  AlertCircle,
  ScanLine,
  Activity,
  ChevronRight,
  History,
  ShieldCheck,
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
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
      setProfile(savedProfile);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Necesitas iniciar sesión para guardar tu progreso.");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("progress_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("No se pudo cargar tu historial de progreso.");
        return;
      }

      setHistory(data || []);
    };

    loadData();
  }, []);

  const lastCheckin = history[0];
  const previousCheckin = history[1];

  const weightDiff = useMemo(() => {
    if (!lastCheckin || !previousCheckin) return null;

    const current = Number(lastCheckin.weight || lastCheckin.peso || 0);
    const previous = Number(previousCheckin.weight || previousCheckin.peso || 0);

    if (!current || !previous) return null;

    return Number((current - previous).toFixed(1));
  }, [lastCheckin, previousCheckin]);

  const handlePhoto = (e) => {
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
  };

  const uploadPhotoToSupabase = async () => {
    if (!file || !user) {
      throw new Error("Falta la foto o el usuario.");
    }

    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("checkins")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("checkins").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const analyzeBody = async () => {
    const formData = new FormData();

    formData.append("image", file);
    formData.append("weight", weight);
    formData.append("height", profile?.height || "");
    formData.append("gender", profile?.gender || "");
    formData.append("goal", profile?.goal || "");

    const response = await fetch(`${API_URL}/analyze-body`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo analizar la foto.");
    }

    return data;
  };

  const saveCheckIn = async () => {
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

    if (!weight) {
      setError("Introduce tu peso actual.");
      return;
    }

    try {
      setLoading(true);

      const photoUrl = await uploadPhotoToSupabase();
      const analysis = await analyzeBody();

      const newLog = {
        user_id: user.id,
        peso: Number(weight),
        note,
        photo_url: photoUrl,
        body_fat_range: analysis.body_fat_range,
        confidence: analysis.confidence,
        visual_changes: analysis.visual_changes,
        recommendation: analysis.recommendation,
      };

      const { data, error } = await supabase
        .from("progress_logs")
        .insert(newLog)
        .select()
        .single();

      if (error) throw error;

      setHistory([data, ...history]);
      setFile(null);
      setPreview(null);
      setWeight("");
      setNote("");
      setMessage("Check-in semanal guardado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar el check-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#02040a] px-4 py-6 pb-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#22c55e2c,transparent_28%),radial-gradient(circle_at_80%_20%,#bef26416,transparent_24%),radial-gradient(circle_at_50%_100%,#14b8a61a,transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-emerald-500/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="group rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 font-black text-white/80 backdrop-blur-xl transition hover:border-emerald-300/40 hover:text-emerald-200"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Dashboard
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center bg-emerald-400 text-[#02040a] shadow-[0_0_45px_#34d39955] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
              <ScanLine size={23} />
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-lg font-black">Body Scan</p>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
                Weekly progress
              </p>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] p-7 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,0_100%)] md:p-9">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />

            <div className="relative">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_#86efac]" />
                Análisis visual con IA
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
                Tu progreso físico, semana a semana.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
                Sube una foto corporal, registra tu peso y deja que NutriCoach
                estime tu progreso visual con IA.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <MetricLine
                  icon={<Scale />}
                  label="Peso"
                  value={lastCheckin?.peso || lastCheckin?.weight || "-"}
                  detail="kg"
                />

                <MetricLine
                  icon={
                    weightDiff !== null && weightDiff <= 0 ? (
                      <TrendingDown />
                    ) : (
                      <TrendingUp />
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

                <MetricLine
                  icon={<Sparkles />}
                  label="Grasa"
                  value={lastCheckin?.body_fat_range || "-"}
                  detail="aprox."
                />
              </div>
            </div>
          </div>

          <LatestPanel lastCheckin={lastCheckin} weightDiff={weightDiff} />
        </section>

        <Notice />

        {error && <Alert type="error" text={error} />}
        {message && <Alert type="success" text={message} />}

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <BodyScanForm
            preview={preview}
            handlePhoto={handlePhoto}
            weight={weight}
            setWeight={setWeight}
            note={note}
            setNote={setNote}
            saveCheckIn={saveCheckIn}
            loading={loading}
          />

          <HistoryPanel history={history} />
        </section>
      </div>

      <BottomNav />
    </section>
  );
}

function BodyScanForm({
  preview,
  handlePhoto,
  weight,
  setWeight,
  note,
  setNote,
  saveCheckIn,
  loading,
}) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_94%,94%_100%,0_100%)]">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
            <Camera />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
              Nuevo registro
            </p>
            <h2 className="text-3xl font-black">Body Scan</h2>
          </div>
        </div>

        <label className="group relative grid min-h-[470px] cursor-pointer place-items-center overflow-hidden border border-dashed border-emerald-300/30 bg-white/[0.035] text-center transition hover:border-emerald-300/60 hover:bg-emerald-300/5">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa check-in"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/92 via-[#02040a]/20 to-transparent" />
              <div className="relative z-10 self-end p-6">
                <p className="text-2xl font-black">Foto lista para analizar</p>
                <p className="mt-2 text-sm text-white/60">
                  Toca aquí para cambiar la imagen.
                </p>
              </div>
            </>
          ) : (
            <div className="p-6">
              <div className="mx-auto mb-5 grid h-24 w-24 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                <ImagePlus size={48} />
              </div>

              <p className="text-3xl font-black">Sube tu foto semanal</p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">
                Foto frontal de cuerpo completo, buena luz y misma distancia
                cada semana.
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

        <div className="mt-5 grid gap-4">
          <LuxuryInput
            label="Peso actual"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ej: 72.5 kg"
          />

          <label>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-white/45">
              Nota de la semana
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] w-full border border-white/10 bg-white/[0.04] px-5 py-4 font-semibold text-white outline-none placeholder:text-white/25 focus:border-emerald-300/50"
              placeholder="Ej: Entrené 4 días, dormí mejor, me siento con más energía..."
            />
          </label>

          <PrimaryButton onClick={saveCheckIn} disabled={loading}>
            <Save size={21} />
            {loading ? "Analizando con IA..." : "Guardar y analizar"}
            <ChevronRight size={18} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function LatestPanel({ lastCheckin, weightDiff }) {
  if (!lastCheckin) {
    return (
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] p-7 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_88%,90%_100%,0_100%)]">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <div className="grid h-14 w-14 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
            <Activity size={28} />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            Último progreso
          </p>

          <h2 className="mt-2 text-4xl font-black">Sin registros todavía</h2>

          <p className="mt-4 leading-7 text-white/58">
            Guarda tu primer check-in para crear tu línea de progreso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_88%,90%_100%,0_100%)]">
      {lastCheckin.photo_url && (
        <img
          src={lastCheckin.photo_url}
          alt="Último check-in"
          className="h-[560px] w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/45 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
          Último resultado
        </p>

        <h2 className="mt-2 text-5xl font-black">
          {lastCheckin.peso || lastCheckin.weight || "-"} kg
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MiniStat
            label="Cambio"
            value={
              weightDiff === null
                ? "Sin comparación"
                : `${weightDiff > 0 ? "+" : ""}${weightDiff} kg`
            }
          />

          <MiniStat
            label="Grasa aprox."
            value={lastCheckin.body_fat_range || "No estimable"}
          />
        </div>

        {lastCheckin.visual_changes && (
          <p className="mt-4 border-l border-emerald-300/30 pl-4 text-sm leading-6 text-white/70">
            {lastCheckin.visual_changes}
          </p>
        )}
      </div>
    </div>
  );
}

function HistoryPanel({ history }) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_94%,94%_100%,0_100%)]">
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
            <History />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
              Timeline
            </p>
            <h2 className="text-3xl font-black">Historial semanal</h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="grid min-h-[300px] place-items-center border border-white/10 bg-white/[0.035] p-6 text-center">
            <div>
              <Camera className="mx-auto mb-4 text-emerald-300" size={42} />
              <h3 className="text-xl font-black">Aún no hay historial</h3>
              <p className="mt-2 text-white/50">
                Guarda tu primer check-in para activar tu progreso visual.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[760px] space-y-4 overflow-y-auto pr-1">
            {history.map((item, index) => (
              <HistoryItem key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ item, index }) {
  return (
    <div className="grid gap-4 border border-white/10 bg-white/[0.04] p-4 transition hover:border-emerald-300/25 hover:bg-white/[0.07] md:grid-cols-[120px_1fr]">
      {item.photo_url ? (
        <img
          src={item.photo_url}
          alt="Check-in semanal"
          className="h-36 w-full object-cover md:w-32"
        />
      ) : (
        <div className="grid h-36 w-full place-items-center bg-white/10 text-white/40 md:w-32">
          Sin foto
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
            Registro {index + 1}
          </p>

          <p className="text-xs font-bold text-white/35">
            {new Date(item.created_at).toLocaleDateString("es-ES")}
          </p>
        </div>

        <h3 className="mt-2 text-2xl font-black">
          {item.peso || item.weight || "-"} kg ·{" "}
          {item.body_fat_range || "No estimable"}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/58">
          {item.visual_changes || item.note || "Sin descripción registrada."}
        </p>

        {item.recommendation && (
          <p className="mt-3 border-l border-emerald-300/30 pl-3 text-sm leading-6 text-emerald-100/70">
            {item.recommendation}
          </p>
        )}
      </div>
    </div>
  );
}

function Notice() {
  return (
    <div className="border border-yellow-300/20 bg-yellow-300/10 p-5 text-yellow-100 backdrop-blur-xl [clip-path:polygon(0_0,100%_0,100%_82%,97%_100%,0_100%)]">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 shrink-0 text-yellow-300" />
        <p className="text-sm leading-6 text-white/70">
          La estimación de grasa corporal por foto es orientativa. No sustituye
          mediciones profesionales, bioimpedancia, plicómetro ni evaluación
          médica.
        </p>
      </div>
    </div>
  );
}

function Alert({ type, text }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-5 border p-5 font-bold backdrop-blur-xl ${
        isError
          ? "border-red-400/20 bg-red-500/10 text-red-300"
          : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {text}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 px-6 py-4 font-black text-[#03110a] shadow-[0_20px_60px_#22c55e33] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function LuxuryInput({ label, ...props }) {
  return (
    <label>
      <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>

      <input
        {...props}
        className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 font-semibold text-white outline-none placeholder:text-white/25 focus:border-emerald-300/50"
      />
    </label>
  );
}

function MetricLine({ icon, label, value, detail }) {
  return (
    <div className="border-l border-emerald-300/25 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center gap-3 text-emerald-300">
        {icon}
        <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">
          {label}
        </p>
      </div>

      <p className="text-3xl font-black">
        {value}
        <span className="text-sm text-white/40"> {detail}</span>
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}