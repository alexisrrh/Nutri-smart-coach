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
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error cargando perfil:", profileError);
        setError("No se pudo cargar el perfil.");
        return;
      }

      const localProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};

      const profile = profileData || localProfile;

      setForm({
        name: profile?.name || "",
        age: profile?.age || "",
        weight: profile?.weight || "",
        height: profile?.height || "",
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
          })
        );
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleLogout() {
    if (!window.confirm("¿CONFIRMAR CIERRE DE SESIÓN?")) return;

    await supabase.auth.signOut();

    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem("smart_diet_plan");
    localStorage.removeItem("smart_diet_progress");
    localStorage.removeItem("nutricoach_meals");

    navigate("/");
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
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
      setTimeout(() => navigate("/dashboard"), 900);
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#060b13] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse border border-emerald-500/30 bg-emerald-500/10" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
            Cargando perfil...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#060b13] px-4 py-6 pb-32 text-slate-200 tracking-tight font-sans">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/70 transition hover:text-emerald-400"
          >
            <ArrowLeft size={15} /> Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/60 transition hover:text-red-400"
          >
            <LogOut size={14} />
            Salir
          </button>
        </div>

        <div className="relative border border-white/10 bg-[#ffffff03] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute left-0 top-0 h-[2px] w-24 bg-gradient-to-r from-emerald-500 to-transparent" />

          <div className="mb-8">
            <div className="mb-5 inline-flex h-13 w-13 items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <UserRound size={26} />
            </div>

            <h1 className="bg-gradient-to-br from-white via-white to-emerald-500/50 bg-clip-text text-3xl font-black uppercase tracking-tighter text-transparent sm:text-4xl">
              Perfil Personal
            </h1>

            <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Configuración de usuario_
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold normal-case text-red-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-6 flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-black uppercase tracking-widest text-emerald-400">
              <CheckCircle2 size={17} />
              Perfil actualizado con éxito_
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Nombre y Apellido"
              name="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="EJ. ALEXIS RODRÍGUEZ"
            />

            <div className="grid gap-6 md:grid-cols-3">
              <Input
                label="Edad"
                name="age"
                type="number"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                required
              />

              <Input
                label="Peso (kg)"
                name="weight"
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                required
              />

              <Input
                label="Altura (cm)"
                name="height"
                type="number"
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <CustomSelect
                label="Género"
                value={form.gender}
                options={[
                  { id: "male", label: "HOMBRE" },
                  { id: "female", label: "MUJER" },
                ]}
                onChange={(val) => handleChange("gender", val)}
              />

              <CustomSelect
                label="Nivel de Actividad"
                value={form.activity}
                options={[
                  { id: "low", label: "SEDENTARIO" },
                  { id: "moderate", label: "MODERADA (3-5 DÍAS)" },
                  { id: "high", label: "ALTA (ATLETA)" },
                ]}
                onChange={(val) => handleChange("activity", val)}
              />
            </div>

            <CustomSelect
              label="Objetivo Fitness"
              value={form.goal}
              options={[
                { id: "perder_grasa", label: "PERDER GRASA" },
                { id: "ganar_musculo", label: "GANAR MÚSCULO" },
                { id: "mantener_peso", label: "MANTENER PESO" },
              ]}
              onChange={(val) => handleChange("goal", val)}
            />

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden border border-emerald-500/50 bg-emerald-500/10 py-4 text-xs font-black uppercase tracking-[0.35em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Save size={17} />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </div>
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
    </section>
  );
}

function CustomSelect({ label, value, options, onChange }) {
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
    <div className="relative group" ref={containerRef}>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/30 transition-colors group-focus-within:text-emerald-500">
        {label}
      </p>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex cursor-pointer items-center justify-between border-b py-3 transition-all ${
          isOpen
            ? "border-emerald-500 bg-white/5"
            : "border-white/10 hover:border-white/30"
        }`}
      >
        <span className="text-sm font-bold uppercase text-white">
          {selectedOption?.label}
        </span>

        <ChevronDown
          size={16}
          className={`text-emerald-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full border border-white/10 bg-[#0d141f] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-5 py-4 text-xs font-bold uppercase tracking-wider transition-all hover:bg-emerald-500 hover:text-black ${
                value === opt.id
                  ? "bg-white/5 text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="group">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/30 transition-colors group-focus-within:text-emerald-500">
        {label}
      </p>

      <input
        {...props}
        className="w-full border-b border-white/10 bg-transparent py-3 text-sm font-bold text-white outline-none transition-all placeholder:text-white/5 focus:border-emerald-500"
      />
    </div>
  );
}