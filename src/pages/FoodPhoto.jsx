import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Camera, ImagePlus, Loader2, UserRound } from "lucide-react";
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
    const file = e.target.files[0];

    if (!file) return;

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
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 transition hover:bg-white/15"
        >
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>

        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
            NutriCoach iA
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Analiza tu comida
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            Sube una foto y NutriCoach calculará calorías, macros y una
            recomendación adaptada a tu objetivo.
          </p>
        </div>

        {!profile && (
          <div className="mb-6 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                  <UserRound />
                </div>

                <div>
                  <h2 className="font-black">Mejora tu análisis</h2>
                  <p className="text-sm text-white/60">
                    Completa tu perfil para recibir recomendaciones más precisas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/perfil")}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white transition hover:bg-emerald-400"
              >
                Configurar perfil
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                <Camera size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black">Foto de tu comida</h2>
                <p className="text-sm text-white/50">
                  Usa una imagen clara y con buena luz.
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-3xl bg-white/10 p-4">
              <p className="text-sm text-white/50">Objetivo usado:</p>
              <p className="mt-1 font-black text-emerald-300">
                {formatGoal(goal)}
              </p>
            </div>

            <label className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-400/30 bg-white/5 p-6 text-center transition hover:bg-white/10">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa de comida"
                  className="h-[320px] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="mb-4 text-emerald-300" size={48} />
                  <p className="text-lg font-black">Subir imagen</p>
                  <p className="mt-2 text-sm text-white/50">
                    PNG, JPG o JPEG
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {error && (
              <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={analyzeFood}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Analizando...
                </>
              ) : (
                "Analizar comida"
              )}
            </button>
          </div>

          <FoodResult result={result} loading={loading} goal={goal} />
        </div>
      </div>
      <BottomNav />
    </section>
  );
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "Perder grasa";
}