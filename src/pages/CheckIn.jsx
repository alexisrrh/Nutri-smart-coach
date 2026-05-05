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
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

const PROFILE_KEY = "nutricoach_profile";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

    if (uploadError) {
      throw uploadError;
    }

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

      if (error) {
        throw error;
      }

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
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 transition hover:bg-white/15"
        >
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-emerald-400">
              NutriCoach iA
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Check-in semanal
            </h1>

            <p className="mt-3 max-w-2xl text-white/60">
              Guarda una foto semanal, peso y estimación visual aproximada de
              grasa corporal para comparar tu progreso.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-5 text-yellow-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 shrink-0 text-yellow-300" />

            <p className="text-sm leading-6 text-white/70">
              La estimación de grasa corporal por foto es solo orientativa. No
              sustituye mediciones profesionales, bioimpedancia, plicómetro ni
              evaluación médica.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[2rem] border border-red-400/20 bg-red-500/10 p-5 font-bold text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-5 font-bold text-emerald-300">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                <Camera />
              </div>

              <div>
                <h2 className="text-xl font-black">Nuevo check-in</h2>
                <p className="text-sm text-white/50">
                  Foto frontal obligatoria + peso actual.
                </p>
              </div>
            </div>

            <label className="flex min-h-[380px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-emerald-400/30 bg-white/5 p-6 text-center transition hover:bg-white/10">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa check-in"
                  className="h-[380px] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="mb-4 text-emerald-300" size={50} />
                  <p className="text-lg font-black">Subir foto</p>
                  <p className="mt-2 max-w-sm text-sm text-white/50">
                    Usa una foto de cuerpo completo, misma luz, misma distancia
                    y postura similar cada semana.
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>

            <div className="mt-5 grid gap-4">
              <label>
                <p className="mb-2 font-bold text-white/80">
                  Peso actual (kg)
                </p>

                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#06130d] px-4 py-4 font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
                  placeholder="Ej: 72.5"
                />
              </label>

              <label>
                <p className="mb-2 font-bold text-white/80">Nota opcional</p>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#06130d] px-4 py-4 font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
                  placeholder="Ej: Entrené 4 días esta semana, me siento con más energía..."
                />
              </label>

              <button
                onClick={saveCheckIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={22} />
                {loading ? "Analizando y guardando..." : "Guardar check-in"}
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            <SummaryPanel
              lastCheckin={lastCheckin}
              previousCheckin={previousCheckin}
              weightDiff={weightDiff}
            />

            <HistoryPanel history={history} />
          </div>
        </div>
      </div>

      <BottomNav />
    </section>
  );
}

function SummaryPanel({ lastCheckin, previousCheckin, weightDiff }) {
  if (!lastCheckin) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <h2 className="text-2xl font-black">Último progreso</h2>

        <p className="mt-3 text-white/50">
          Aún no tienes check-ins guardados. Guarda el primero para empezar a
          comparar tu evolución.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
          <Sparkles />
        </div>

        <div>
          <h2 className="text-2xl font-black">Último progreso</h2>
          <p className="text-sm text-white/50">
            Comparación con el check-in anterior.
          </p>
        </div>
      </div>

      {lastCheckin.photo_url && (
        <img
          src={lastCheckin.photo_url}
          alt="Último check-in"
          className="mb-5 h-[360px] w-full rounded-[2rem] object-cover"
        />
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <InfoCard
          icon={<Scale />}
          label="Peso actual"
          value={`${lastCheckin.weight || lastCheckin.peso || "-"} kg`}
        />

        <InfoCard
          icon={
            weightDiff !== null && weightDiff <= 0 ? (
              <TrendingDown />
            ) : (
              <TrendingUp />
            )
          }
          label="Cambio de peso"
          value={
            weightDiff === null
              ? "Sin comparación"
              : `${weightDiff > 0 ? "+" : ""}${weightDiff} kg`
          }
        />

        <InfoCard
          icon={<Sparkles />}
          label="Grasa corporal aprox."
          value={lastCheckin.body_fat_range || "No estimable"}
        />

        <InfoCard
          icon={<AlertCircle />}
          label="Confianza"
          value={lastCheckin.confidence || "baja"}
        />
      </div>

      <div className="mt-5 rounded-3xl bg-white/5 p-5">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
          Cambios visuales
        </p>

        <p className="mt-2 text-white/70">
          {lastCheckin.visual_changes ||
            "No hay cambios visuales registrados."}
        </p>
      </div>

      <div className="mt-4 rounded-3xl bg-emerald-400/10 p-5">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
          Recomendación
        </p>

        <p className="mt-2 text-white/70">
          {lastCheckin.recommendation ||
            "Mantén constancia con dieta y entrenamiento."}
        </p>
      </div>
    </div>
  );
}

function HistoryPanel({ history }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
      <div className="mb-5">
        <h2 className="text-2xl font-black">Historial semanal</h2>

        <p className="mt-1 text-sm text-white/50">
          Compara tus fotos, peso y estimaciones anteriores.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl bg-white/5 p-5 text-white/50">
          No hay registros todavía.
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-3xl bg-white/5 p-4 md:grid-cols-[120px_1fr]"
            >
              {item.photo_url ? (
                <img
                  src={item.photo_url}
                  alt="Check-in semanal"
                  className="h-32 w-full rounded-2xl object-cover md:w-32"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-white/10 text-white/40 md:w-32">
                  Sin foto
                </div>
              )}

              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                  {new Date(item.created_at).toLocaleDateString("es-ES")}
                </p>

                <h3 className="mt-1 text-xl font-black">
                  {item.weight || item.peso || "-"} kg ·{" "}
                  {item.body_fat_range || "No estimable"}
                </h3>

                <p className="mt-2 text-sm text-white/60">
                  {item.visual_changes ||
                    item.note ||
                    "Sin descripción registrada."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="mb-2 text-emerald-300">{icon}</div>

      <p className="text-xs font-black uppercase tracking-[0.15em] text-white/40">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}