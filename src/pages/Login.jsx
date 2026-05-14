import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { STORAGE_KEYS } from "../config/storageKeys";
import {
  clearCachedProfile,
  getProfile,
  saveProfile,
} from "../services/profileService";
import {
  LogIn,
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Target,
  ScanLine,
  Activity,
  Flame,
} from "lucide-react";
import {
  AppShell,
  FormField,
  MetaBadge,
  PrimaryButton,
  SecondaryButton,
  StatusBox,
  SurfaceCard,
} from "../components/ui";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      setLoading(false);
      setError("El correo o la contraseña no son válidos.");
      return;
    }

    const user = data.user;

    clearCachedProfile();
    localStorage.removeItem(STORAGE_KEYS.DIET_PLAN);
    localStorage.removeItem(STORAGE_KEYS.DIET_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);

    let profileData = null;

    try {
      profileData = await getProfile(user.id, { fallbackToCache: false });
    } catch (profileError) {
      console.error("Error cargando perfil:", profileError);
    }

    if (!profileData) {
      try {
        await saveProfile({
          id: user.id,
          user_id: user.id,
          email: user.email,
          name: "",
          age: null,
          weight: null,
          height: null,
          gender: "male",
          activity_level: "moderate",
          goal: "perder_grasa",
          preferences: {
            gender: "male",
            activity: "moderate",
            goal: "perder_grasa",
          },
          updated_at: new Date().toISOString(),
        });
      } catch (createError) {
        console.error("Error creando perfil:", createError);
        setLoading(false);
        setError("No se pudo crear el perfil del usuario.");
        return;
      }
    }

    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <AppShell withBottomNav={false} contentClassName="!px-3 !pb-3 !pt-2">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <SecondaryButton
            onClick={() => navigate("/")}
            icon={<ArrowLeft size={14} />}
            className="w-auto px-2.5 py-1.5 text-[10px]"
          >
            Inicio
          </SecondaryButton>

          <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
            App IA
          </MetaBadge>
        </div>

        <SurfaceCard className="relative overflow-hidden p-2.5">
          <div className="absolute -right-14 -top-16 h-40 w-36 rounded-full bg-[#10b981]/20 blur-3xl " />

          <div className="relative z-10 pt-2">
            <div className="mb-3 flex items-center gap-5 justify-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-[#10b981]/35 bg-[#06110c] p-1.5 shadow-[0_0_30px_rgba(16,185,129,0.34)]">
                <img
                  src="/favicon.png"
                  alt="NutriSmart Coach"
                  className="h-full w-full rounded-2xl object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#86efac]">
                  Nutri Smart Coach
                </p>
                <h1 className="mt-1 flex items-center gap-2 text-[30px] font-black uppercase italic leading-none tracking-tight text-white">
                  Entra
                  <LogIn size={21} className="text-[#86efac]" />
                </h1>
              </div>
            </div >
<div className="justify-center text-center">
            <p className="ml-10 mb-3 max-w-[18rem] text-sm leading-5 text-white/60 text-center flex justify-center">
              Continúa con tus calorías, dietas y progreso en un solo panel.
            </p></div>

            {error && (
              <StatusBox type="error" className="mb-3 p-3 text-xs leading-5">
                {error}
              </StatusBox>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <Input
                label="Correo"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                icon={<Mail size={16} />}
              />

              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={<Lock size={16} />}
              />

              <PrimaryButton
                disabled={loading}
                icon={!loading && <ArrowRight size={16} />}
                type="submit"
                className="mt-1 py-3"
              >
                {loading ? "Iniciando..." : "Iniciar sesión"}
              </PrimaryButton>
            </form>

            <div className="mt-3 rounded-[22px] border border-white/10 bg-black/20 p-2.5 text-center">
              <p className="text-sm text-white/52">
                ¿Nuevo aquí?{" "}
                <Link
                  to="/registro"
                  className="font-black text-[#86efac] transition hover:text-white"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </SurfaceCard>

        <div className="pt-2">
          <ActiveCore />
        </div>

        <div className="pt-2">
          <ProductPreview />
        </div>

        <p className="px-2 pt-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white/45">
          Privacidad segura · Datos protegidos · IA nutricional
        </p>
      </div>
    </AppShell>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <FormField label={label} icon={icon}>
      <input
        {...props}
        className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/24 focus:border-[#10b981]/55"
      />
    </FormField>
  );
}

function ActiveCore() {
  return (
    <SurfaceCard className="relative overflow-hidden p-2.5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#22d3ee22,transparent_32%),radial-gradient(circle_at_90%_20%,#10b98124,transparent_36%)]" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[#10b981]/25 to-transparent" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <div className="absolute inset-0 rounded-full bg-[#10b981]/15 blur-xl" />
          <div className="absolute inset-0 animate-[spin_3.6s_linear_infinite] rounded-full border border-[#10b981]/20 border-t-[#10b981]" />
          <div className="absolute inset-[8px] animate-[spin_5s_linear_infinite_reverse] rounded-full border border-cyan-300/10 border-b-cyan-300/45" />
          <div className="absolute inset-[18px] rounded-full border border-white/10 bg-black/35 backdrop-blur-xl" />
          <div className="relative h-5 w-5 rounded-full bg-[#10b981] shadow-[0_0_24px_rgba(16,185,129,0.8)]" />
          <span className="absolute left-3 top-4 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
          <span className="absolute bottom-4 right-3 h-1.5 w-1.5 animate-pulse rounded-full bg-[#86efac] shadow-[0_0_12px_#86efac]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981] shadow-[0_0_12px_#10b981]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86efac]">
              AI ACTIVE
            </p>
          </div>

          <p className="text-sm font-black uppercase italic leading-5 text-white">
            Nutrición inteligente en tiempo real
          </p>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <CoreHighlight
              icon={<Target size={12} />}
              label="planes inteligentes"
            />
            <CoreHighlight
              icon={<ScanLine size={12} />}
              label="análisis visual"
            />
            <CoreHighlight
              icon={<Activity size={12} />}
              label="progreso adaptativo"
            />
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function ProductPreview() {
  return (
    <SurfaceCard
      variant="soft"
      radius="md"
      className="relative overflow-hidden p-2"
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#86efac]">
              Tu próximo análisis
            </p>
            <p className="mt-0.5 text-sm font-bold text-white/58">
              Plan ajustado por IA
            </p>
          </div>

          <div className="rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1.5 text-right">
            <p className="text-xl font-black italic leading-none text-white">
              850
            </p>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#86efac]">
              kcal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[0.9fr_1.1fr] gap-2">
          <PreviewMetric
            icon={<Flame size={13} />}
            label="Energía"
            value="850 kcal"
            percent={76}
          />
          <PreviewMetric
            icon={<Activity size={13} />}
            label="Proteína"
            value="62g"
            percent={82}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}

function PreviewMetric({ icon, label, percent, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[#86efac]">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-wide text-white/45">
            {label}
          </span>
        </span>
        <span className="text-xs font-black text-white">{value}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-cyan-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CoreHighlight({ icon, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-1.5 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[#86efac]">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase leading-3 text-white/55">
        {label}
      </p>
    </div>
  );
}