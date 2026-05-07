import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Camera,
  ChevronRight,
  ImagePlus,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import FoodResult from "../pages/FoodResult";

const PROFILE_KEY = "nutricoach_profile";
const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://nutricoach-backend-frlc.onrender.com";

export default function FoodPhoto() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [goal, setGoal] = useState("perder_grasa");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);
    setProfile(savedProfile);

    if (savedProfile?.goal || savedProfile?.objetivo) {
      setGoal(savedProfile.goal || savedProfile.objetivo);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Máximo 4MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const analyzeFood = async () => {
    if (!image) {
      setError("Primero sube una foto de comida.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", image);
      formData.append("goal", goal);

      const response = await fetch(`${API_URL}/analyze-food`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("El backend no devolvió una respuesta válida.");
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || "No se pudo analizar la imagen."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Error frontend:", err);
      setError(err.message || "Hubo un problema analizando la comida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#06110c] px-3 pb-28 pt-4 text-white font-sans uppercase tracking-tight sm:px-6 sm:pb-40 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98122,transparent_40%),radial-gradient(circle_at_bottom_left,#22c55e12,transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-3 sm:space-y-5">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black text-slate-300 transition hover:border-[#10b981]/60 hover:bg-[#10b981] hover:text-[#06110c]"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center bg-[#10b981] text-[#06110c] shadow-[0_0_24px_#10b98155]">
              <ScanLine size={19} />
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-base font-black uppercase italic leading-none">
                AI Food Scan
              </p>
              <p className="mt-1 text-[9px] font-black tracking-[0.35em] text-white/35">
                NutriSmart Coach
              </p>
            </div>
          </div>
        </header>

        {!profile && <ProfileNotice onClick={() => navigate("/perfil")} />}

        <section className="grid gap-3 xl:grid-cols-[0.82fr_1fr] sm:gap-4">
          <HeroPanel goal={goal} preview={preview} />

          <UploadPanel
            preview={preview}
            handleImageChange={handleImageChange}
            analyzeFood={analyzeFood}
            loading={loading}
            error={error}
          />
        </section>

        {loading && <FoodAnalysisLoader loading={loading} />}

        <section className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr] sm:gap-4">
          <InfoPanel goal={goal} navigate={navigate} />
          <FoodResult result={result} loading={loading} goal={goal} />
        </section>
      </div>

      <BottomNav />
    </section>
  );
}

function HeroPanel({ goal, preview }) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20 [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,0_100%)] sm:p-5">
      <div className="absolute -right-16 -top-16 h-44 w-44 bg-[#10b981]/12 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-[#10b981]/50 via-white/10 to-transparent" />

      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 border border-[#10b981]/25 bg-[#0d2218] px-3 py-1.5 text-[9px] font-black text-[#10b981]">
          <Activity size={12} />
          STATUS: ESCANEO IA
        </div>

        <h1 className="text-3xl font-black uppercase italic leading-[0.85] tracking-tight text-white sm:text-5xl">
          Analiza tu <br />
          <span className="text-[#10b981]">comida</span>
        </h1>

        <p className="mt-3 max-w-xl text-xs font-bold normal-case leading-5 text-slate-400 sm:text-sm sm:leading-6">
          Sube una foto clara y la IA estimará calorías, proteínas,
          carbohidratos, grasas y una recomendación según tu objetivo.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 ">
          <MetricLine
            icon={<Sparkles size={15} />}
            label="Objetivo"
            value={formatGoal(goal)}
            detail="activo"
          />

          <MetricLine
            icon={<ShieldCheck size={15} />}
            label="Análisis"
            value="IA"
            detail="aprox."
          />

          <MetricLine
            icon={<Camera size={15} />}
            label="Imagen"
            value={preview ? "Lista" : "Pendiente"}
            detail="scan"
          />
        </div>
      </div>
    </div>
  );
}

function UploadPanel({
  preview,
  handleImageChange,
  analyzeFood,
  loading,
  error,
}) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#091710] shadow-2xl shadow-black/20 [clip-path:polygon(0_0,100%_0,100%_94%,96%_100%,0_100%)]">
      <div className="absolute -right-14 -top-14 h-44 w-44 bg-[#10b981]/12 blur-3xl" />

      <div className="relative p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
              <Camera size={20} />
            </div>

            <div>
              <p className="text-[9px] font-black tracking-[0.3em] text-[#10b981]">
                NUEVA FOTO
              </p>
              <h2 className="text-xl font-black uppercase italic">Food Scan</h2>
            </div>
          </div>

          <span className="border border-white/10 bg-[#0d2218] px-3 py-1 text-[9px] font-black text-slate-400">
            Máx 4MB
          </span>
        </div>

        <label className="group relative grid min-h-[220px] cursor-pointer place-items-center overflow-hidden border border-dashed border-[#10b981]/35 bg-white/[0.035] text-center transition hover:border-[#10b981]/70 hover:bg-[#10b981]/5 sm:min-h-[310px]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa de comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/94 via-[#06110c]/24 to-transparent" />

              <div className="relative z-10 self-end p-4">
                <p className="text-xl font-black uppercase italic">
                  Foto lista
                </p>
                <p className="mt-1 text-xs normal-case text-white/60">
                  Toca aquí para cambiar la imagen.
                </p>
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
                <ImagePlus size={31} />
              </div>

              <p className="text-2xl font-black uppercase italic">
                Sube tu comida
              </p>

              <p className="mx-auto mt-2 max-w-xs text-xs normal-case leading-5 text-slate-400">
                Foto clara, buena luz y el plato completo.
              </p>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {error && <ErrorBox message={error} />}

        <PrimaryButton onClick={analyzeFood} disabled={loading}>
          {loading ? (
            <>
              <Sparkles size={18} />
              Procesando...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analizar comida
              <ChevronRight size={16} />
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}

function FoodAnalysisLoader({ loading }) {
  const [percent, setPercent] = useState(8);
  const steps = ["Imagen", "Alimentos", "Macros", "Consejo"];

  useEffect(() => {
    if (!loading) return;

    setPercent(8);

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return prev;
        if (prev < 45) return prev + 6;
        if (prev < 80) return prev + 3;
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <div className="overflow-hidden border border-[#10b981]/20 bg-[#07120d] p-3 shadow-2xl shadow-[#10b981]/5">
      <div className="relative overflow-hidden border border-white/10 bg-[#0d2218]/70 p-4">
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 bg-[#10b981]/20 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10b981]">
              Food Vision IA
            </p>

            <h3 className="mt-1 text-xl font-black uppercase italic leading-none text-white">
              Analizando comida
            </h3>

            <p className="mt-2 text-[11px] normal-case leading-4 text-slate-400">
              {percent < 90
                ? "Detectando alimentos, porciones y macros."
                : "Últimos ajustes. Ya casi está listo."}
            </p>
          </div>

          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <div className="absolute inset-0 border border-[#10b981]/25" />
            <div className="absolute inset-1 animate-spin border-2 border-transparent border-t-[#10b981]" />
            <span className="relative text-lg font-black text-[#10b981]">
              {percent}%
            </span>
          </div>
        </div>

        <div className="relative mt-4 h-2 overflow-hidden bg-white/5">
          <div
            className="h-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <div
                key={step}
                className={`border px-1 py-2 text-center transition-all ${
                  completed
                    ? "border-[#10b981]/25 bg-[#10b981]/10"
                    : active
                      ? "border-[#10b981]/40 bg-[#10b981]/5"
                      : "border-white/5 bg-black/10"
                }`}
              >
                <div
                  className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center border text-[9px] font-black ${
                    completed
                      ? "border-[#10b981] bg-[#10b981] text-[#06110c]"
                      : active
                        ? "animate-pulse border-[#10b981] text-[#10b981]"
                        : "border-white/10 text-slate-600"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <p
                  className={`truncate text-[8px] font-black uppercase tracking-tight ${
                    completed || active ? "text-white" : "text-slate-600"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold normal-case text-slate-500">
          <span>No cierres esta pantalla</span>
          <span className="text-[#10b981]">
            {percent < 96 ? "Procesando..." : "Finalizando..."}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfileNotice({ onClick }) {
  return (
    <div className="border border-[#10b981]/20 bg-[#10b981]/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="text-sm font-black uppercase">
              Mejora tu análisis
            </h2>
            <p className="text-[11px] normal-case leading-4 text-slate-400">
              Completa tu perfil para adaptar recomendaciones.
            </p>
          </div>
        </div>

        <button
          onClick={onClick}
          className="bg-[#10b981] px-3 py-2 text-[9px] font-black uppercase tracking-wide text-[#06110c]"
        >
          Perfil
        </button>
      </div>
    </div>
  );
}

function InfoPanel({ goal, navigate }) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20">
      <div className="absolute -right-12 -top-12 h-36 w-36 bg-[#10b981]/10 blur-3xl" />

      <div className="relative">
        <div className="mb-3 grid h-10 w-10 place-items-center border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
          <ShieldCheck size={20} />
        </div>

        <p className="text-[9px] font-black tracking-[0.3em] text-[#10b981]">
          CONTEXTO ACTIVO
        </p>

        <h2 className="mt-1 text-xl font-black uppercase italic">
          {formatGoal(goal)}
        </h2>

        <p className="mt-2 text-xs normal-case leading-5 text-slate-400">
          Las recomendaciones se adaptan a tu objetivo actual. Puedes ajustar tu
          perfil para mejorar calorías y macros.
        </p>

        <button
          onClick={() => navigate("/perfil")}
          className="mt-4 border border-white/10 bg-[#0d2218] px-4 py-2.5 text-[10px] font-black uppercase tracking-wide text-[#10b981] transition hover:bg-[#10b981] hover:text-[#06110c]"
        >
          Ajustar perfil
        </button>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative mt-3 w-full overflow-hidden bg-[#10b981] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#06110c] shadow-[0_20px_60px_#22c55e22] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function MetricLine({ icon, label, value, detail }) {
  return (
    <div className="min-w-0 border border-white/10 bg-[#0d2218]/70 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[#10b981]">
        {icon}
        <p className="truncate text-[7px] font-black tracking-[0.16em] text-slate-500">
          {label}
        </p>
      </div>

      <p className="truncate text-[11px] font-black text-white sm:text-sm">
        {value}
        <span className="text-[8px] text-slate-500"> {detail}</span>
      </p>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="mt-3 border border-red-400/20 bg-red-500/10 p-3 text-xs font-bold normal-case text-red-300">
      <div className="flex items-start gap-2">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "Perder grasa";
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}