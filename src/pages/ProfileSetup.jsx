import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  ChevronDown,
  LogOut,
  Sparkles,
  Ruler,
  Weight,
  Calendar,
  Activity,
  Target,
} from "lucide-react";
import { STORAGE_KEYS } from "../config/storageKeys";
import { supabase } from "../lib/supabase";
import {
  clearCachedProfile,
  getProfile,
  saveProfile,
} from "../services/profileService";
import {
  AppShell,
  FormField,
  MetaBadge,
  PageHeaderCard,
  PrimaryButton,
  SecondaryButton,
  StatusBox,
  SurfaceCard,
} from "../components/ui";

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
    localStorage.removeItem(STORAGE_KEYS.DIET_PLAN);
    localStorage.removeItem(STORAGE_KEYS.DIET_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);

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
      <AppShell withBottomNav={false}>
        <SurfaceCard className="mt-40 p-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-3xl border border-emerald-400/30 bg-emerald-400/10" />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Cargando perfil...
          </p>
        </SurfaceCard>
      </AppShell>
    );
  }

  return (
    <AppShell>
        <div className="mb-4 flex items-center justify-between gap-3">
          <SecondaryButton
            type="button"
            onClick={() => navigate("/dashboard")}
            icon={<ArrowLeft size={14} />}
            className="w-auto px-3 py-2 text-[10px]"
          >
            Dashboard
          </SecondaryButton>

          <SecondaryButton
            type="button"
            onClick={handleLogout}
            icon={<LogOut size={14} />}
            className="w-auto border-red-400/15 bg-red-400/10 px-3 py-2 text-[10px] text-red-300 hover:border-red-300/30 hover:bg-red-400/15 hover:text-red-200"
          >
            Salir
          </SecondaryButton>
        </div>

        <PageHeaderCard
          badge="Configuración inteligente"
          badgeIcon={<Sparkles size={14} />}
          icon={<UserRound size={18} />}
          title="Perfil personal"
          description="Ajusta tus datos para que NutriCoach calcule mejor tus metas, macros y recomendaciones."
        >
          <SurfaceCard variant="soft" radius="md" className="mt-4 flex items-center gap-3 p-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#06110e] shadow-[0_0_25px_#10b98155]">
              <UserRound size={24} />
            </div>

            <div className="min-w-0">
              <MetaBadge variant="neutral">Usuario</MetaBadge>
              <p className="mt-2 truncate text-sm font-bold text-white">
                {user?.email}
              </p>
            </div>
          </SurfaceCard>
        </PageHeaderCard>

        {error && (
          <StatusBox type="error" className="mt-4">
            {error}
          </StatusBox>
        )}

        {saved && (
          <StatusBox type="success" className="mt-4">
            Perfil actualizado con éxito.
          </StatusBox>
        )}

        <SurfaceCard as="form" onSubmit={handleSubmit} className="mt-4 p-4">
          <div className="mb-5 grid gap-4">
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

          <div className="mb-5 grid gap-4">
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

          <div className="mb-6 grid gap-4">
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

          <PrimaryButton
            type="submit"
            disabled={loading}
            icon={<Save size={17} />}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </PrimaryButton>
        </SurfaceCard>
    </AppShell>
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
    <FormField label={label} className="relative" icon={icon}>
      <div ref={containerRef}>
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
    </FormField>
  );
}

function Input({ label, icon, suffix, ...props }) {
  return (
    <FormField label={label} icon={icon}>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition focus-within:border-emerald-400/50">
        <span className="text-emerald-300">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/20"
        />

        {suffix && (
          <span className="text-xs font-black uppercase tracking-widest text-white/45">
            {suffix}
          </span>
        )}
      </div>
    </FormField>
  );
}
