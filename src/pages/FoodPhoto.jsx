import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Loader2,
  UserRound,
  Sparkles,
  ChevronRight,
  ScanLine,
  ShieldCheck,
  Activity,
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
    const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
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
        throw new Error(data.error || data.detail || "No se pudo analizar la imagen.");
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
    <section className="relative min-h-screen overflow-hidden bg-[#08120f] px-3 pt-4 pb-32 text-white font-sans uppercase tracking-tight sm:px-6 sm:pt-6 sm:pb-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_42%),radial-gradient(circle_at_bottom_left,#4361ee12,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-4 flex items-center justify-between border-b border-white/10 pb-4 sm:mb-8 sm:pb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black text-white/80 transition-all hover:bg-emerald-500 hover:text-[#050a09] sm:px-5 sm:py-3 sm:text-xs"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={17} />
              Dashboard
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-emerald-500 text-[#050a09] shadow-[0_0_25px_#10b98155] sm:h-12 sm:w-12">
              <ScanLine size={22} />
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-lg font-black italic">AI Food Scan</p>
              <p className="text-[10px] font-black tracking-[0.35em] text-white/35">
                NutriSmart Coach
              </p>
            </div>
          </div>
        </header>

        {!profile && (
          <div className="mb-4 border border-emerald-300/20 bg-emerald-500/10 p-4 backdrop-blur-xl sm:mb-6 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center bg-emerald-400/15 text-emerald-300 sm:h-12 sm:w-12">
                  <UserRound size={22} />
                </div>

                <div>
                  <h2 className="text-base font-black sm:text-lg">
                    Mejora tu análisis
                  </h2>
                  <p className="text-xs normal-case leading-5 text-white/60 sm:text-sm">
                    Completa tu perfil para adaptar recomendaciones, macros y objetivo.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/perfil")}
                className="bg-emerald-500 px-5 py-3 text-[10px] font-black tracking-[0.2em] text-[#050a09] transition hover:bg-white"
              >
                Configurar perfil
              </button>
            </div>
          </div>
        )}

        <section className="mb-4 grid gap-4 xl:grid-cols-[1fr_0.95fr] sm:mb-6 sm:gap-6">
          <div className="relative overflow-hidden border border-white/10 bg-[#0d1714] p-4 shadow-2xl backdrop-blur-2xl sm:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 bg-emerald-500/10 blur-3xl sm:h-64 sm:w-64" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 border border-emerald-500/30 bg-[#08120f] px-3 py-1 text-[9px] font-black text-emerald-400 sm:mb-6 sm:text-[10px]">
                <Activity size={12} />
                STATUS: ESCANEO IA
              </div>

              <h1 className="max-w-4xl text-3xl font-black italic leading-[0.85] sm:text-5xl md:text-7xl">
                ANALIZA TU <br />
                <span className="text-emerald-500">COMIDA</span>
              </h1>

              <p className="mt-4 max-w-2xl text-xs font-bold normal-case leading-6 text-white/58 sm:mt-6 sm:text-lg sm:leading-8">
                Sube una imagen clara y NutriSmart Coach estimará calorías,
                proteína, carbohidratos, grasas y una recomendación según tu objetivo.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
                <MetricLine
                  icon={<Sparkles size={18} />}
                  label="Objetivo"
                  value={formatGoal(goal)}
                  detail="activo"
                />

                <MetricLine
                  icon={<ShieldCheck size={18} />}
                  label="Análisis"
                  value="IA"
                  detail="aprox."
                />

                <MetricLine
                  icon={<Camera size={18} />}
                  label="Imagen"
                  value={preview ? "Lista" : "Pendiente"}
                  detail="scan"
                />
              </div>
            </div>
          </div>

          <UploadPanel
            preview={preview}
            handleImageChange={handleImageChange}
            analyzeFood={analyzeFood}
            loading={loading}
            error={error}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] sm:gap-6">
          <InfoPanel goal={goal} navigate={navigate} />
          <FoodResult result={result} loading={loading} goal={goal} />
        </section>
      </div>

      <BottomNav />
    </section>
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
    <div className="relative overflow-hidden border border-white/10 bg-[#0d1714] shadow-2xl backdrop-blur-2xl">
      <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/10 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3 sm:mb-5">
          <div className="grid h-11 w-11 place-items-center bg-emerald-400/15 text-emerald-300 sm:h-12 sm:w-12">
            <Camera size={22} />
          </div>

          <div>
            <p className="text-[9px] font-black tracking-[0.3em] text-emerald-300 sm:text-xs">
              NUEVA FOTO
            </p>
            <h2 className="text-2xl font-black italic sm:text-3xl">
              Food Scan
            </h2>
          </div>
        </div>

        <label className="group relative grid min-h-[270px] cursor-pointer place-items-center overflow-hidden border border-dashed border-emerald-300/30 bg-white/[0.035] text-center transition hover:border-emerald-300/60 hover:bg-emerald-300/5 sm:min-h-[430px]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa de comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#08120f]/90 via-[#08120f]/20 to-transparent" />

              <div className="relative z-10 self-end p-5 sm:p-6">
                <p className="text-xl font-black italic sm:text-2xl">Foto lista</p>
                <p className="mt-2 text-xs normal-case text-white/60 sm:text-sm">
                  Toca aquí para cambiar la imagen.
                </p>
              </div>
            </>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center bg-emerald-400/15 text-emerald-300 sm:mb-5 sm:h-24 sm:w-24">
                <ImagePlus size={36} className="sm:h-12 sm:w-12" />
              </div>

              <p className="text-2xl font-black italic sm:text-3xl">
                Sube tu comida
              </p>

              <p className="mx-auto mt-3 max-w-sm text-xs normal-case leading-5 text-white/50 sm:text-sm sm:leading-6">
                Usa una foto clara, con buena luz y donde se vea todo el plato.
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

        {error && (
          <div className="mt-3 border border-red-400/20 bg-red-500/10 p-3 text-xs font-bold normal-case text-red-300 sm:mt-4 sm:p-4 sm:text-sm">
            {error}
          </div>
        )}

        <PrimaryButton onClick={analyzeFood} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analizando con IA...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Analizar comida
              <ChevronRight size={18} />
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}

function InfoPanel({ goal, navigate }) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#0d1714] p-4 shadow-2xl backdrop-blur-2xl sm:p-6">
      <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/10 blur-3xl sm:h-52 sm:w-52" />

      <div className="relative">
        <div className="mb-4 grid h-11 w-11 place-items-center bg-emerald-400/15 text-emerald-300 sm:mb-5 sm:h-14 sm:w-14">
          <ShieldCheck size={22} />
        </div>

        <p className="text-[9px] font-black tracking-[0.3em] text-emerald-300 sm:text-xs">
          CONTEXTO ACTIVO
        </p>

        <h2 className="mt-2 text-2xl font-black italic sm:text-3xl">
          {formatGoal(goal)}
        </h2>

        <p className="mt-3 text-xs normal-case leading-6 text-white/58 sm:text-base sm:leading-7">
          Las recomendaciones se adaptan a tu objetivo actual. Puedes ajustar tu
          perfil para mejorar la precisión de calorías y macros.
        </p>

        <button
          onClick={() => navigate("/perfil")}
          className="mt-5 border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black tracking-[0.2em] text-emerald-300 transition hover:bg-emerald-500 hover:text-[#050a09] sm:mt-6 sm:py-4"
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
      className="group relative mt-4 w-full overflow-hidden bg-emerald-500 px-6 py-3 text-xs font-black text-[#03110a] shadow-[0_20px_60px_#22c55e33] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5 sm:py-4 sm:text-sm"
    >
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function MetricLine({ icon, label, value, detail }) {
  return (
    <div className="border-l border-emerald-300/25 bg-white/[0.04] p-2.5 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-emerald-300 sm:mb-4 sm:gap-3">
        {icon}
        <p className="text-[7px] font-black tracking-[0.16em] text-white/40 sm:text-xs sm:tracking-[0.25em]">
          {label}
        </p>
      </div>

      <p className="text-sm font-black sm:text-2xl">
        {value}
        <span className="text-[8px] text-white/40 sm:text-sm"> {detail}</span>
      </p>
    </div>
  );
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "Perder grasa";
}