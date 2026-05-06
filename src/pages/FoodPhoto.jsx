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

    if (savedProfile?.goal) {
      setGoal(savedProfile.goal);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo analizar la imagen.");
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
              <p className="text-lg font-black">AI Food Scan</p>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
                NutriCoach iA
              </p>
            </div>
          </div>
        </header>

        {!profile && (
          <div className="mb-6 border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur-xl [clip-path:polygon(0_0,100%_0,100%_82%,97%_100%,0_100%)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                  <UserRound />
                </div>

                <div>
                  <h2 className="text-lg font-black">Mejora tu análisis</h2>
                  <p className="text-sm text-white/60">
                    Completa tu perfil para adaptar recomendaciones, macros y
                    objetivo.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/perfil")}
                className="rounded-full bg-emerald-400 px-5 py-3 font-black text-[#03110a] shadow-[0_12px_40px_#34d39933] transition hover:bg-lime-300"
              >
                Configurar perfil
              </button>
            </div>
          </div>
        )}

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] p-7 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,0_100%)] md:p-9">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />

            <div className="relative">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_#86efac]" />
                Escaneo nutricional con IA
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
                Analiza tu comida con una foto.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
                Sube una imagen clara y NutriCoach estimará calorías, proteína,
                carbohidratos, grasas y una recomendación según tu objetivo.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <MetricLine
                  icon={<Sparkles />}
                  label="Objetivo"
                  value={formatGoal(goal)}
                  detail="activo"
                />

                <MetricLine
                  icon={<ShieldCheck />}
                  label="Análisis"
                  value="IA"
                  detail="aprox."
                />

                <MetricLine
                  icon={<Camera />}
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

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_90%,90%_100%,0_100%)]">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
            <Camera />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
              Nueva foto
            </p>
            <h2 className="text-3xl font-black">Food Scan</h2>
          </div>
        </div>

        <label className="group relative grid min-h-[430px] cursor-pointer place-items-center overflow-hidden border border-dashed border-emerald-300/30 bg-white/[0.035] text-center transition hover:border-emerald-300/60 hover:bg-emerald-300/5">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa de comida"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/92 via-[#02040a]/20 to-transparent" />

              <div className="relative z-10 self-end p-6">
                <p className="text-2xl font-black">Foto lista</p>
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

              <p className="text-3xl font-black">Sube tu comida</p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">
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
          <div className="mt-4 border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        <PrimaryButton onClick={analyzeFood} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={21} />
              Analizando con IA...
            </>
          ) : (
            <>
              <Sparkles size={21} />
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
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_88%,94%_100%,0_100%)]">
      <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-5 grid h-14 w-14 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
          <ShieldCheck />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
          Contexto activo
        </p>

        <h2 className="mt-2 text-3xl font-black">{formatGoal(goal)}</h2>

        <p className="mt-3 leading-7 text-white/58">
          Las recomendaciones se adaptan a tu objetivo actual. Puedes ajustar tu
          perfil para mejorar la precisión de calorías y macros.
        </p>

        <button
          onClick={() => navigate("/perfil")}
          className="mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-4 font-black text-emerald-300 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
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
      className="group relative mt-5 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 px-6 py-4 font-black text-[#03110a] shadow-[0_20px_60px_#22c55e33] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="border-l border-emerald-300/25 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center gap-3 text-emerald-300">
        {icon}
        <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">
          {label}
        </p>
      </div>

      <p className="text-2xl font-black">
        {value}
        <span className="text-sm text-white/40"> {detail}</span>
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