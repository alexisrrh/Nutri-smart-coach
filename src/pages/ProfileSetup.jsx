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
import { useTheme } from "../context/themeContext";
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
          <div
            className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-3xl shadow-[0_0_24px_var(--app-glow)]"
            style={{ backgroundColor: "var(--app-primary-soft)" }}
          />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
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
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                    Información básica
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--app-muted)]">
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
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                    Objetivo fitness
                  </p>
                  <h2 className="mt-0.5 text-sm font-black tracking-tight text-[var(--app-text)]">
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
              <div className="mt-2">
                <ThemeSelector />
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
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, var(--app-primary-soft), transparent 42%), radial-gradient(circle at 75% 15%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 30%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MetaBadge variant="neutral" icon={<Sparkles size={11} />}>
            AI Profile
          </MetaBadge>

          <div className="mt-3 flex items-center gap-3">
            <div
              className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[28px] shadow-[0_0_28px_var(--app-glow)]"
              style={{
                backgroundColor: "var(--app-primary-soft)",
                color: "var(--app-primary)",
              }}
            >
              <UserRound size={30} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                Perfil personal
              </p>
              <h1 className="truncate text-[24px] font-black leading-none text-[var(--app-text)]">
                {user?.email?.split("@")[0] || "Tu perfil"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <MetaBadge variant="neutral">{goalLabel(goal)}</MetaBadge>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--app-muted)]">
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
              ? "shadow-[inset_0_0_0_1px_var(--app-border)]"
              : ""
          }`}
          style={{
            backgroundColor: isOpen ? "var(--app-primary-soft)" : "var(--app-surface)",
            boxShadow: isOpen
              ? "inset 0 0 0 1px var(--app-border)"
              : "inset 0 0 0 1px var(--app-border)",
          }}
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[var(--app-text)]">
            <span className="text-[var(--app-primary)]">{icon}</span>
            <span className="truncate">{selectedOption?.label}</span>
          </span>

          <ChevronDown
            size={16}
            className={`text-[var(--app-primary)] transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_var(--app-border),0_20px_50px_var(--app-glow)] backdrop-blur-3xl"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            {options.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`block w-full px-5 py-4 text-left text-xs font-black uppercase tracking-wider transition hover:bg-[var(--app-primary)] hover:text-[var(--app-surface)] ${
                  value === opt.id
                    ? "bg-[var(--app-primary-soft)] text-[var(--app-text)]"
                    : "text-[var(--app-muted)]"
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
      <div
        className="flex items-center gap-3 rounded-2xl px-3 py-3 transition shadow-[inset_0_0_0_1px_var(--app-border)] focus-within:shadow-[inset_0_0_0_1px_var(--app-border)]"
        style={{ backgroundColor: "var(--app-surface)" }}
      >
        <span className="text-[var(--app-primary)]">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-xs font-bold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
        />

        {suffix && (
          <span className="text-xs font-black uppercase tracking-widest text-[var(--app-muted)]">
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
      className="rounded-2xl px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--app-border)]"
      style={{
        backgroundColor: accent ? "var(--app-primary-soft)" : "var(--app-surface)",
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-black text-[var(--app-text)]">
        {value || "—"}
        {unit && <span className="ml-1 text-[10px] text-[var(--app-primary)]/60">{unit}</span>}
      </p>
    </div>
  );
}
function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "emerald", label: "Emerald", color: "#10b981" },
    { id: "dark", label: "Dark", color: "#050505" },
    { id: "white", label: "White", color: "#d1d5db" },
    { id: "rose", label: "Rose", color: "#fb6fbd" },
    { id: "blue", label: "Blue", color: "#38bdf8" },
    { id: "purple", label: "Purple", color: "#a855f7" },
  ];

  return (
    <div
      className="rounded-3xl p-3 shadow-[inset_0_0_0_1px_var(--app-border)]"
      style={{ backgroundColor: "var(--app-card)" }}
    >
      <div className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
          Personalización
        </p>

        <h3 className="mt-1 text-sm font-black text-[var(--app-text)]">
          Color de la app
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {themes.map((item) => {
          const active = theme === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              className={`rounded-2xl p-2 transition ${
                active
                  ? "shadow-[inset_0_0_0_1px_var(--app-border)]"
                  : "hover:shadow-[inset_0_0_0_1px_var(--app-border)]"
              }`}
              style={{
                backgroundColor: active
                  ? "var(--app-primary-soft)"
                  : "var(--app-surface)",
              }}
            >
              <div
                className="mx-auto h-9 w-9 rounded-full"
                style={{
                  background: item.color,
                  boxShadow: `0 0 18px ${item.color}55`,
                }}
              />

              <p
                className={`mt-2 text-[10px] font-bold ${
                  theme === "white" ? "text-[var(--app-text)]" : "text-[var(--app-muted)]"
                }`}
                style={active ? { color: "var(--app-text)" } : undefined}
              >
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
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
