import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveProfile } from "../services/profileService";
import {
  buildAcceptedLegalConsent,
  setPendingLegalConsent,
} from "../services/legalConsentService";
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
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  async function handleSocialLogin(provider) {
    if (!acceptedPolicies) {
      setError("Debes aceptar las políticas antes de continuar con OAuth.");
      return;
    }

    setPendingLegalConsent(buildAcceptedLegalConsent());

    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + "/perfil",
      },
    });

    if (socialError) setError("Error al conectar: " + socialError.message);
  }

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

    if (!acceptedPolicies) {
      setLoading(false);
      setError("Debes aceptar las políticas y condiciones de NutriSmartCoach.");
      return;
    }

    const legalConsent = buildAcceptedLegalConsent();

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          nombre: form.nombre.trim(),
          ...legalConsent,
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
          ...legalConsent,
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

              <LegalConsentCard
                checked={acceptedPolicies}
                onChange={setAcceptedPolicies}
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
                <br/>

              <div className="flex flex-col gap-3 mb-6">
                {/* Botón de Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  Continuar con Google
                </button>

                {/* Botón de Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("facebook")}
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-[#1877F2] text-white font-medium rounded-xl shadow-sm hover:bg-[#166fe5] active:scale-[0.98] transition-all duration-200 text-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continuar con Facebook
                </button>
              </div>

            </div>
          </div>
        </SurfaceCard>
        <div className="pt-2">
          <ActiveCore />
        </div>
        <p className="px-2 pt-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
          Privacidad segura · Datos protegidos · IA nutricional
        </p>
      </div>
   
    </AppShell>
  );
}

function LegalConsentCard({ checked, onChange }) {
  return (
    <div className="rounded-[22px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_92%,transparent),var(--app-card))] p-3 shadow-[inset_0_0_0_1px_var(--app-border)]">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
        Consentimiento legal
      </p>
      <p className="mt-1.5 text-[12px] font-medium leading-5 text-[var(--app-muted)]">
        Al crear tu cuenta aceptas la{" "}
        <Link className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]" to="/privacy">
          Política de privacidad
        </Link>
        , los{" "}
        <Link className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]" to="/terms">
          Términos del servicio
        </Link>
        {" "}y la{" "}
        <Link className="font-black text-[var(--app-primary)] transition hover:text-[var(--app-text)]" to="/delete-account">
          gestión de tus datos
        </Link>
        .
      </p>

      <label className="mt-3 flex items-start gap-3 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 transition active:scale-[0.99]">
        <span className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[7px] border border-[var(--app-border)] bg-[var(--app-card)]">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span className={`h-3.5 w-3.5 rounded-[5px] transition ${checked ? "bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]" : "bg-transparent"}`} />
        </span>

        <span className="min-w-0">
          <span className="block text-[12px] font-bold leading-5 text-[var(--app-text)]">
            Acepto las políticas y condiciones de NutriSmartCoach.
          </span>
          <span className="mt-0.5 block text-[10px] font-medium leading-4 text-[var(--app-muted)]">
            Necesario para crear tu cuenta y guardar tu consentimiento.
          </span>
        </span>
      </label>
    </div>
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
