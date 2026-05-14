import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  clearCachedProfile,
  getProfile,
  saveProfile,
} from "../services/profileService";

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

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        clearCachedProfile();
        navigate("/login");
        return;
      }

      setUser(user);

      const profile = await getProfile(user.id);

      setForm({
        name: profile?.name || "",
        age: profile?.age || "",
        weight: profile?.weight || "",
        height: profile?.height || "",
        gender: profile?.gender || "male",
        activity: profile?.activity_level || "moderate",
        goal: profile?.goal || "perder_grasa",
      });
    } catch (profileError) {
      console.error("Error cargando perfil:", profileError);
      setError("No se pudo cargar el perfil.");
    } finally {
      setLoadingProfile(false);
    }
  }, [navigate]);

  useEffect(() => {
    Promise.resolve().then(loadProfile);
  }, [loadProfile]);

  async function handleLogout() {
    if (!window.confirm("¿Cerrar sesión?")) return;

    await supabase.auth.signOut();

    clearCachedProfile();
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

      await saveProfile({
        id: currentUser.id,
        user_id: currentUser.id,
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
      });

      setSaved(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (saveError) {
      console.error("Error guardando perfil:", saveError);
      setError(saveError.message || "No se pudo guardar el perfil.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#06110e] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-3xl border border-emerald-400/30 bg-emerald-400/10" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            Cargando perfil...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#06110e] px-4 py-5 pb-32 text-white font-sans">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-emerald-400/40 hover:text-emerald-300"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/10 bg-red-400/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300/60 transition hover:border-red-400/30 hover:text-red-300"
          >
            <LogOut size={14} />
            Salir
          </button>
        </div>

        <div className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
                <Sparkles size={13} />
                Configuración inteligente
              </div>

              <h1 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">
                Perfil personal
              </h1>

              <p className="mt-2 max-w-xl text-sm text-white/50">
                Ajusta tus datos para que NutriCoach calcule mejor tus metas,
                macros y recomendaciones.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-[#06110e] shadow-[0_0_25px_#10b98155]">
                <UserRound size={26} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/35">
                  Usuario
                </p>
                <p className="max-w-[180px] truncate text-sm font-bold text-white">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <AlertBox type="error" icon={<AlertCircle size={17} />}>
            {error}
          </AlertBox>
        )}

        {saved && (
          <AlertBox type="success" icon={<CheckCircle2 size={17} />}>
            Perfil actualizado con éxito.
          </AlertBox>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-7"
        >
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Input
              icon={<UserRound size={16} />}
              label="Nombre y apellido"
              name="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej. Alexis Rodríguez"
            />

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
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Input
              icon={<Calendar size={16} />}
              label="Edad"
              name="age"
              type="number"
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              required
            />

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

          <div className="mb-7 grid gap-4 md:grid-cols-2">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-[0.24em] text-[#06110e] shadow-[0_20px_45px_#10b98122] transition hover:scale-[1.01] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Save size={17} />
              {loading ? "Guardando..." : "Guardar cambios"}
            </div>
          </button>
        </form>
      </div>

      <BottomNav />
    </section>
  );
}

function AlertBox({ type, icon, children }) {
  const styles =
    type === "error"
      ? "border-red-400/20 bg-red-400/10 text-red-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold ${styles}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      {children}
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
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
          isOpen
            ? "border-emerald-400/50 bg-emerald-400/10"
            : "border-white/10 bg-black/20 hover:border-white/20"
        }`}
      >
        <span className="flex items-center gap-3 text-sm font-bold text-white">
          <span className="text-emerald-300">{icon}</span>
          {selectedOption?.label}
        </span>

        <ChevronDown
          size={16}
          className={`text-emerald-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b1713] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`block w-full px-5 py-4 text-left text-xs font-black uppercase tracking-wider transition hover:bg-emerald-400 hover:text-[#06110e] ${
                value === opt.id
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "text-white/55"
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
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition focus-within:border-emerald-400/50">
        <span className="text-emerald-300">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/20"
        />

        {suffix && (
          <span className="text-xs font-black uppercase tracking-widest text-white/30">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
