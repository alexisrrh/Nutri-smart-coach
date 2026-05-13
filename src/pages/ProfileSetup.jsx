import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Sparkles,
  Ruler,
  Weight,
  Calendar,
  Activity,
  Target,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import BottomNav from "../components/BottomNav";

const PROFILE_KEY = "nutricoach_profile";

export function ProfileSetup() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity: "moderate",
    goal: "perder_grasa",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoadingProfile(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        localStorage.removeItem(PROFILE_KEY);
        navigate("/login");
        return;
      }

      setUser(user);

      const localProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error cargando perfil:", profileError);
        setError("No se pudo cargar el perfil.");
      }

      const profile = profileData || localProfile;

      setForm({
        name: profile?.name || "",
        age: profile?.age || profile?.edad || "",
        weight: profile?.weight || profile?.peso || "",
        height: profile?.height || profile?.altura || "",
        gender: profile?.gender || "male",
        activity:
          profile?.activity_level ||
          profile?.activity ||
          profile?.actividad ||
          "moderate",
        goal: profile?.goal || profile?.objetivo || "perder_grasa",
      });

      if (profileData) {
        localStorage.setItem(
          PROFILE_KEY,
          JSON.stringify({
            ...profileData,
            user_id: user.id,
            id: user.id,
            activity: profileData.activity_level,
            objetivo: profileData.goal,
            peso: profileData.weight,
            altura: profileData.height,
            edad: profileData.age,
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleLogout() {
    if (!window.confirm("¿Cerrar sesión?")) return;

    await supabase.auth.signOut();

    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem("smart_diet_plan");
    localStorage.removeItem("smart_diet_progress");
    localStorage.removeItem("nutricoach_meals");

    navigate("/");
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;

      if (!currentUser) {
        setError("No hay usuario conectado.");
        return;
      }

      if (!form.name || !form.age || !form.weight || !form.height) {
        setError("Completa nombre, edad, peso y altura.");
        return;
      }

      const profileToSave = {
        id: currentUser.id,
        email: currentUser.email,
        name: form.name.trim(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        gender: form.gender,
        activity_level: form.activity,
        goal: form.goal,
        preferences: {
          gender: form.gender,
          activity: form.activity,
          goal: form.goal,
        },
        updated_at: new Date().toISOString(),
      };

      const { data, error: saveError } = await supabase
        .from("profiles")
        .upsert(profileToSave, { onConflict: "id" })
        .select()
        .single();

      if (saveError) {
        console.error("Error guardando perfil:", saveError);
        setError(saveError.message || "No se pudo guardar el perfil.");
        return;
      }

      const localProfile = {
        ...data,
        id: currentUser.id,
        user_id: currentUser.id,
        activity: data.activity_level,
        objetivo: data.goal,
        peso: data.weight,
        altura: data.height,
        edad: data.age,
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(localProfile));

      setSaved(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex justify-center items-center p-0">
        <section className="w-full max-w-md h-screen bg-[#06110e] text-white flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="text-center px-6">
            <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-full border-2 border-emerald-400/30 bg-emerald-400/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-300">
              Sincronizando Perfil...
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center items-center p-0">
      <section className="w-full max-w-md h-screen md:h-[92vh] md:rounded-3xl md:border md:border-zinc-800/80 bg-[#06110e] text-white font-sans flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Header Superior Móvil */}
        <div className="sticky top-0 bg-[#06110e]/95 backdrop-blur-md z-40 px-4 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/70 transition active:scale-95"
          >
            <ArrowLeft size={12} />
            Atrás
          </button>

          <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">NutriSmartCoach</span>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/10 bg-red-400/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-300/70 transition active:scale-95"
          >
            <LogOut size={12} />
            Salir
          </button>
        </div>

        {/* Zona de contenido con scroll vertical (Sin pb forzados) */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-none">
          
          {/* Ficha informativa superior */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-emerald-300">
                  <Sparkles size={11} />
                  Configuración inteligente
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                  Perfil personal
                </h1>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  Ajusta tus datos para calcular mejor tus metas, macros y recomendaciones.
                </p>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-[#06110e] shadow-[0_0_15px_#10b98144]">
                  <UserRound size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/35">
                    Usuario conectado
                  </p>
                  <p className="truncate text-xs font-bold text-white">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <AlertBox type="error" icon={<AlertCircle size={15} />}>
              {error}
            </AlertBox>
          )}

          {saved && (
            <AlertBox type="success" icon={<CheckCircle2 size={15} />}>
              Perfil actualizado con éxito.
            </AlertBox>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input
              icon={<UserRound size={16} />}
              label="Nombre y apellido"
              name="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej. Alexis Rodríguez"
            />

            {/* FILA 1: Género y Edad juntos */}
            <div className="grid grid-cols-2 gap-3">
              <CustomSelect
                icon={<UserRound size={16} />}
                label="Género"
                value={form.gender}
                options={[
                  { id: "male", label: "Hombre" },
                  { id: "female", label: "Mujer" },
                ]}
                onChange={(val) => handleChange("gender", val)}
              />

              <Input
                icon={<Calendar size={16} />}
                label="Edad"
                name="age"
                type="number"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                required
              />
            </div>

            {/* FILA 2: Peso y Altura juntos */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                icon={<Weight size={16} />}
                label="Peso"
                name="weight"
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                required
                suffix="kg"
              />

              <Input
                icon={<Ruler size={16} />}
                label="Altura"
                name="height"
                type="number"
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                required
                suffix="cm"
              />
            </div>

            {/* Nivel de actividad y Objetivo Fitness */}
            <CustomSelect
              icon={<Activity size={16} />}
              label="Nivel de actividad"
              value={form.activity}
              options={[
                { id: "low", label: "Sedentario" },
                { id: "moderate", label: "Moderada · 3-5 días" },
                { id: "high", label: "Alta · atleta" },
              ]}
              onChange={(val) => handleChange("activity", val)}
            />

            <CustomSelect
              icon={<Target size={16} />}
              label="Objetivo fitness"
              value={form.goal}
              options={[
                { id: "perder_grasa", label: "Perder grasa" },
                { id: "ganar_musculo", label: "Ganar músculo" },
                { id: "mantener_peso", label: "Mantener peso" },
              ]}
              onChange={(val) => handleChange("goal", val)}
            />

            {/* Botón de guardar cambios */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#06110e] shadow-[0_15px_35px_#10b98115] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Save size={15} />
                {loading ? "Guardando..." : "Guardar cambios"}
              </div>
            </button>
          </form>
        </div>

        {/* Zona Inferior Estática para el Menú (Actúa como marco fijo de la app) */}
        <div className="shrink-0 w-full bg-[#06110e] border-t border-white/5 py-4 px-4 min-h-[80px] flex items-center justify-center relative">
          <BottomNav />
        </div>
        
      </section>
    </div>
  );
}


// SUB-COMPONENTES AUXILIARES INTEGRADOS

function AlertBox({ type, icon, children }) {
  const styles =
    type === "error"
      ? "border-red-400/20 bg-red-400/10 text-red-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-bold ${styles}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p>{children}</p>
    </div>
  );
}

function CustomSelect({ icon, label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
          isOpen
            ? "border-emerald-400/50 bg-emerald-400/10"
            : "border-white/10 bg-black/20"
        }`}
      >
        <span className="flex items-center gap-3 text-xs font-bold text-white">
          <span className="text-emerald-300">{icon}</span>
          {selectedOption?.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-emerald-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b1713] shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-wider transition ${
                value === opt.id
                  ? "bg-emerald-400 text-[#06110e]"
                  : "text-white/60 hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, icon, suffix, ...props }) {
  return (
    <div className="w-full">
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 transition focus-within:border-emerald-400/50">
        <span className="text-emerald-300">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-white/20"
        />

        {suffix && (
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
