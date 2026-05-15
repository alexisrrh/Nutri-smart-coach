import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
      <AppShell withBottomNav={false} contentClassName="px-2 pt-2">
        <SurfaceCard className="mt-28 p-5 text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-3xl bg-emerald-400/10 shadow-[0_0_24px_rgba(16,185,129,0.16)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
            Cargando perfil...
          </p>
        </SurfaceCard>
      </AppShell>
    );
  }

  return (
    <AppShell contentClassName="px-2 pb-[88px] pt-2">
      <div className="flex h-[calc(100dvh-98px)] min-h-0 flex-col gap-2.5">
        <ProfileHero user={user} goal={form.goal} />

        {error && <StatusBox type="error">{error}</StatusBox>}
        {saved && <StatusBox type="success">Perfil actualizado con éxito.</StatusBox>}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2.5 pb-2">
            <SurfaceCard className="p-2.5" radius="lg" variant="soft">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#10b981]">
                    Información básica
                  </p>
                  <p className="mt-0.5 text-xs text-white/55">
                    Base para tus metas y macros.
                  </p>
                </div>
                <MetaBadge variant="neutral">AI Profile</MetaBadge>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                <StatPill label="Peso" value={form.weight} unit="kg" />
                <StatPill label="Altura" value={form.height} unit="cm" />
                <StatPill label="Edad" value={form.age} unit="años" />
                <StatPill label="Objetivo" value={goalLabel(form.goal)} />
                <StatPill label="Kcal" value={goalKcal(form.goal, form.weight)} unit="obj" accent />
                <StatPill label="Prot" value={goalProtein(form.weight)} unit="g" accent />
              </div>
            </SurfaceCard>

            <SurfaceCard as="form" onSubmit={handleSubmit} className="p-2.5" radius="lg">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#10b981]">
                    Objetivo fitness
                  </p>
                  <h2 className="mt-0.5 text-sm font-black uppercase italic tracking-tight">
                    Edita tus metas
                  </h2>
                </div>
                <MetaBadge variant="neutral">Editable</MetaBadge>
              </div>

              <div className="space-y-1.5">
                <SettingRow
                  icon={<UserRound size={15} />}
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ej. Alexis Rodríguez"
                />

                <SettingSelect
                  icon={<UserRound size={15} />}
                  label="Género"
                  value={form.gender}
                  options={[
                    { id: "male", label: "Hombre" },
                    { id: "female", label: "Mujer" },
                  ]}
                  onChange={(val) => handleChange("gender", val)}
                />

                <div className="grid grid-cols-3 gap-1.5">
                  <SettingRow
                    icon={<Calendar size={15} />}
                    label="Edad"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                  />
                  <SettingRow
                    icon={<Weight size={15} />}
                    label="Peso"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    suffix="kg"
                  />
                  <SettingRow
                    icon={<Ruler size={15} />}
                    label="Altura"
                    name="height"
                    type="number"
                    value={form.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    suffix="cm"
                  />
                </div>

                <SettingSelect
                  icon={<Activity size={15} />}
                  label="Actividad"
                  value={form.activity}
                  options={[
                    { id: "low", label: "Sedentario" },
                    { id: "moderate", label: "Moderada" },
                    { id: "high", label: "Alta" },
                  ]}
                  onChange={(val) => handleChange("activity", val)}
                />

                <SettingSelect
                  icon={<Target size={15} />}
                  label="Objetivo"
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
                className="mt-2.5 py-3.5 text-[11px]"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={handleLogout}
                icon={<LogOut size={14} />}
                className="mt-2 py-3 text-[10px] text-red-300 hover:border-red-300/30 hover:bg-red-400/15 hover:text-red-200"
              >
                Cerrar sesión
              </SecondaryButton>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileHero({ user, goal }) {
  return (
    <SurfaceCard className="relative overflow-hidden p-3" radius="lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#10b9811f,transparent_42%),radial-gradient(circle_at_75%_15%,#22d3ee14,transparent_30%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MetaBadge variant="neutral" icon={<Sparkles size={11} />}>
            AI Profile
          </MetaBadge>

          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[28px] bg-[#10b981]/10 text-[#10b981] shadow-[0_0_28px_rgba(16,185,129,0.16)]">
              <UserRound size={30} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#10b981]">
                Perfil personal
              </p>
              <h1 className="truncate text-[24px] font-black uppercase italic leading-none text-white">
                {user?.email?.split("@")[0] || "Tu perfil"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <MetaBadge variant="neutral">{goalLabel(goal)}</MetaBadge>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Objetivo actual
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function SettingSelect({ icon, label, value, options, onChange }) {
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
    <FormField label={label} icon={icon}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-11 w-full items-center justify-between rounded-2xl px-3 text-left transition shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] ${
            isOpen
              ? "bg-[#10b981]/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.45)]"
              : "bg-[#0b1d15]/90 hover:bg-[#0f241b]"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-white">
            <span className="text-[#10b981]">{icon}</span>
            <span className="truncate">{selectedOption?.label}</span>
          </span>

          <ChevronDown
            size={16}
            className={`text-[#10b981] transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-[#07170f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
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

function SettingRow({ label, icon, suffix, ...props }) {
  return (
    <FormField label={label} icon={icon}>
      <div className="flex items-center gap-3 rounded-2xl bg-[#0b1d15]/90 px-3 py-3 transition shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] focus-within:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.45)]">
        <span className="text-[#10b981]">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-white/20"
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

function StatPill({ label, value, unit = "", accent = false }) {
  return (
    <div
      className={`rounded-2xl px-2.5 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)] ${
        accent ? "bg-[#10b981]/10" : "bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-black ${accent ? "text-emerald-100" : "text-white"}`}>
        {value || "—"}
        {unit && <span className="ml-1 text-[10px] text-[#10b981]/60">{unit}</span>}
      </p>
    </div>
  );
}

function goalLabel(goal) {
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "Perder grasa";
}

function goalKcal(goal, weight) {
  const base = Number(weight) ? Math.round(Number(weight) * 28) : 0;

  if (!base) return "—";
  if (goal === "ganar_musculo") return `${base + 250}`;
  if (goal === "mantener_peso") return `${base}`;
  return `${base - 300}`;
}

function goalProtein(weight) {
  const base = Number(weight) ? Math.round(Number(weight) * 2) : 0;
  return base || "—";
}
