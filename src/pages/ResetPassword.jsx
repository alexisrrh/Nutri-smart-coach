import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
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
import { supabase } from "../lib/supabase";

export function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: form.password,
    });

    setLoading(false);

    if (updateError) {
      setError(getResetPasswordErrorMessage(updateError));
      return;
    }

    await supabase.auth.signOut({ scope: "local" });
    setForm({ password: "", confirmPassword: "" });
    setSuccess("Contraseña actualizada correctamente.");
  }

  return (
    <AppShell withBottomNav={false} contentClassName="!px-3 !pb-6 !pt-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <SecondaryButton
            onClick={() => navigate("/login")}
            icon={<ArrowLeft size={14} />}
            className="w-auto px-2.5 py-1.5 text-[10px]"
          >
            Login
          </SecondaryButton>

          <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
            Acceso seguro
          </MetaBadge>
        </div>

        <SurfaceCard className="relative overflow-hidden p-3">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-40 rounded-full bg-[var(--app-primary)]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,color-mix(in_srgb,var(--app-primary)_16%,transparent),transparent_34%)]" />

          <div className="relative z-10 pt-2">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-[var(--app-primary)]/35 bg-[var(--app-surface)] shadow-[0_0_30px_var(--app-glow)]">
                <KeyRound size={22} className="text-[var(--app-primary)]" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  Nutri Smart Coach
                </p>
                <h1 className="mt-1 text-[26px] font-black uppercase italic leading-none tracking-tight text-[var(--app-text)]">
                  Nueva contraseña
                </h1>
              </div>
            </div>

            <p className="mx-auto mb-4 max-w-[20rem] text-center text-sm font-medium leading-5 text-[var(--app-muted)]">
              Crea una contraseña segura para volver a entrar en tu cuenta.
            </p>

            {error ? (
              <StatusBox type="error" className="mb-3 p-3 text-xs leading-5">
                {error}
              </StatusBox>
            ) : null}

            {success ? (
              <StatusBox type="success" className="mb-3 p-3 text-xs leading-5">
                {success}
              </StatusBox>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Nueva contraseña"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                icon={<Lock size={16} />}
              />

              <Input
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                icon={<ShieldCheck size={16} />}
              />

              <PrimaryButton
                disabled={loading}
                icon={!loading && <ArrowRight size={16} />}
                type="submit"
                className="py-3"
              >
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </PrimaryButton>
            </form>

            <Link
              to="/login"
              className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--app-muted)] transition hover:text-[var(--app-text)] active:scale-[0.98]"
            >
              Ir al login
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

function getResetPasswordErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("session") || message.includes("jwt")) {
    return "El enlace ha caducado o no es válido. Solicita uno nuevo desde Login.";
  }

  return "No pudimos actualizar tu contraseña: " + error.message;
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
