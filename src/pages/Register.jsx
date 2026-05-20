import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveProfile } from "../services/profileService";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Target,
  ScanLine,
  Activity,
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

export function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.nombre.trim() || !form.email.trim() || !form.password) {
      setLoading(false);
      setError("Completa todos los campos.");
      return;
    }

    if (form.password.length < 6) {
      setLoading(false);
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          nombre: form.nombre.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      setError("Error al crear la cuenta: " + error.message);
      return;
    }

    const user = data?.user;

    if (user) {
      try {
        await saveProfile({
          id: user.id,
          user_id: user.id,
          email: user.email,
          name: form.nombre.trim(),
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
            meals_per_day: 4,
          },
          updated_at: new Date().toISOString(),
        });
      } catch (profileError) {
        console.error("Error creando perfil:", profileError);
      }
    }

    setLoading(false);
    navigate("/perfil");
  }

  return (
    <AppShell withBottomNav={false} contentClassName="!px-3 !pb-6 !pt-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <SecondaryButton
            onClick={() => navigate("/")}
            icon={<ArrowLeft size={14} />}
            className="w-auto px-3 py-1.5 text-[10px]"
          >
            Inicio
          </SecondaryButton>

          <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
            Registro IA
          </MetaBadge>
        </div>

    

        

        <SurfaceCard className="relative overflow-hidden p-2">
          <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

          <div className="relative z-10 pt-2">
            <div className="ml-10 mb-3 flex items-center gap-5 justify-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-[0_0_30px_var(--app-glow)]">
                <img
                  src="/favicon.png"
                  alt="NutriSmart Coach"
                  className="h-full w-full rounded-2xl object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)] ml-5">
                  Nutri Smart Coach
                </p>
                <h1 className="mt-1 flex items-center gap-2 text-2xl font-black uppercase italic leading-none tracking-tight text-[var(--app-text)]">
                  Crea tu plan inteligente
                  <UserPlus size={21} className="shrink-0 text-[var(--app-primary)]" />
                </h1>
              </div>
            </div>

            <p className="mb-3 text-sm leading-5 text-[var(--app-muted)] text-center">
              Empieza con objetivos claros, análisis visual y progreso guiado por IA.
            </p>

            {error && (
              <StatusBox type="error" className="mb-4 p-3 text-xs leading-5">
                {error}
              </StatusBox>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <Input
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Alexis Rodríguez"
                icon={<User size={16} />}
              />

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
                placeholder="Mínimo 6 caracteres"
                icon={<Lock size={16} />}
              />

              <PrimaryButton
                disabled={loading}
                icon={!loading && <ArrowRight size={16} />}
                type="submit"
                className="mt-1 py-3"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </PrimaryButton>
            </form>

            <div className="mt-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5 text-center">
              <p className="text-sm text-[var(--app-muted)]">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </SurfaceCard>
         <div className="pt-2">   <ActiveCore /></div>
          <div className="pt-2"> 
<PlanPreview /> </div>
        <p className="px-2 pt-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
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
        className="h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-bold text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)]/55"
      />
    </FormField>
  );
}

function ActiveCore() {
  return (
    <SurfaceCard className="relative overflow-hidden p-2.5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#22d3ee22,transparent_32%),radial-gradient(circle_at_82%_20%,var(--app-primary)24,transparent_36%)]" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[var(--app-primary)]/25 to-transparent" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <div className="absolute inset-0 rounded-full bg-[var(--app-primary-soft)] blur-xl" />
          <div className="absolute inset-0 animate-[spin_3.6s_linear_infinite] rounded-full border border-[var(--app-border)] border-t-[var(--app-primary)]" />
          <div className="absolute inset-[8px] animate-[spin_5s_linear_infinite_reverse] rounded-full border border-cyan-300/10 border-b-cyan-300/45" />
          <div className="absolute inset-[18px] rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl" />
          <div className="relative h-5 w-5 rounded-full bg-[var(--app-primary)] shadow-[0_0_24px_var(--app-glow)]" />
          <span className="absolute left-3 top-4 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
          <span className="absolute bottom-4 right-3 h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-primary)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-primary)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--app-primary)]">
              AI ACTIVE
            </p>
          </div>

          <p className="text-sm font-black uppercase italic leading-5 text-[var(--app-text)]">
            Tu nutrición empieza en modo inteligente
          </p>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <CoreHighlight icon={<Target size={12} />} label="objetivos claros" />
            <CoreHighlight icon={<ScanLine size={12} />} label="análisis visual" />
            <CoreHighlight icon={<Activity size={12} />} label="progreso guiado" />
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function PlanPreview() {
  return (
    <SurfaceCard variant="soft" radius="md" className="relative overflow-hidden p-2.5">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--app-primary-soft)] blur-2xl" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              Tu primer plan
            </p>
            <p className="mt-0.5 text-sm font-bold text-[var(--app-muted)]">
              Base creada por IA
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-right">
            <p className="text-sm font-black uppercase italic leading-none text-[var(--app-text)]">
              Smart
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-cyan-200">
              setup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <PlanStep icon={<Target size={12} />} label="Objetivo definido" active />
          <PlanStep icon={<ScanLine size={12} />} label="Dieta inteligente" />
          <PlanStep icon={<Activity size={12} />} label="Progreso guiado" />
        </div>
      </div>
    </SurfaceCard>
  );
}

function PlanStep({ active = false, icon, label }) {
  return (
    <div
      className={`rounded-2xl border px-2 py-2 text-center ${
        active
          ? "border-[var(--app-border)] bg-[var(--app-primary-soft)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)]"
      }`}
    >
      <div className="mx-auto mb-1 flex justify-center text-[var(--app-primary)]">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase leading-3 text-[var(--app-muted)]">
        {label}
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--app-surface)]">
        <div
          className={`h-full rounded-full ${
            active ? "w-full bg-[var(--app-primary)]" : "w-2/3 bg-gradient-to-r from-[var(--app-primary)] to-cyan-300"
          }`}
        />
      </div>
    </div>
  );
}

function CoreHighlight({ icon, label }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-center">
      <div className="mx-auto mb-1 flex justify-center text-[var(--app-primary)]">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase leading-3 text-[var(--app-muted)]">
        {label}
      </p>
    </div>
  );
}
