import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, LogOut, ShieldCheck, Sparkles, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";
import { clearCachedProfile } from "../../services/profileService";
import { STORAGE_KEYS } from "../../config/storageKeys";
import { PrimaryButton, StatusBox } from "../../components/ui";
import { SettingsCard, SettingsMetric, SettingsRow, SettingsScreenShell } from "./SettingsShared";

export function SettingsSecurity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ email: user?.email || "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const providerLabel = getProviderLabel(user);
  const socialOnly = isSocialOnlyAccount(user);

  function openPasswordModal() {
    setPasswordForm({ email: user?.email || "" });
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordModalOpen(true);
  }

  function closePasswordModal() {
    if (passwordLoading) return;
    setPasswordModalOpen(false);
    setPasswordError("");
    setPasswordSuccess("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (socialOnly) {
      setPasswordError(
        "Tu cuenta usa inicio de sesión social. La contraseña se gestiona desde tu proveedor."
      );
      return;
    }

    if (!passwordForm.email?.trim()) {
      setPasswordError("Introduce un correo electrónico válido.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(passwordForm.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(getPasswordResetErrorMessage(error));
      return;
    }

    setPasswordSuccess("Te enviamos un enlace seguro para cambiar tu contraseña.");
    setPasswordForm((current) => ({ ...current, email: current.email.trim() }));
  }

  async function handleLogout() {
    setConfirmLogoutOpen(false);
    await supabase.auth.signOut();
    clearCachedProfile();
    localStorage.removeItem(STORAGE_KEYS.DIET_PLAN);
    localStorage.removeItem(STORAGE_KEYS.DIET_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    navigate("/");
  }

  return (
    <SettingsScreenShell
      badge="Seguridad"
      title="Security Center"
      subtitle="Acceso protegido, sesión sincronizada y control de tu cuenta."
      onBack={() => navigate("/perfil")}
    >
      <SettingsCard
        icon={<ShieldCheck size={16} />}
        title="Cuenta protegida"
        description="Estado actual de acceso y sincronización de sesión."
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
            Protegida
          </span>
        }
      >
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_72%,var(--app-card)),var(--app-card))] p-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--app-primary)_14%,transparent),transparent_40%),radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--app-primary)_8%,transparent),transparent_30%)]" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-primary)] shadow-[0_0_22px_var(--app-glow)]">
              <div className="absolute inset-2 rounded-[14px] border border-[var(--app-border)] bg-[var(--app-primary-soft)]/50" />
              <ShieldCheck size={17} className="relative z-10" />
              <div className="pointer-events-none absolute -inset-2 rounded-[22px] bg-[var(--app-primary-soft)] blur-2xl opacity-70" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                Sesión sincronizada
              </p>
              <h2 className="mt-1 text-[17px] font-bold leading-tight text-[var(--app-text)]">
                {socialOnly ? "Acceso social activo" : "Acceso local activo"}
              </h2>
              <p className="mt-1.5 max-w-[26rem] text-[12px] font-medium leading-5 text-[var(--app-muted)]">
                {socialOnly
                  ? "Tu cuenta usa un proveedor externo para iniciar sesión con seguridad."
                  : "Tu contraseña local controla el acceso principal a esta cuenta."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <SecurityChip icon={<Sparkles size={10} />} label="Sesión sincronizada" />
                <SecurityChip icon={<ShieldCheck size={10} />} label="Cuenta protegida" active />
                <SecurityChip icon={<KeyRound size={10} />} label={`Proveedor: ${providerLabel}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <SettingsMetric label="Proveedor" value={providerLabel} accent />
          <SettingsMetric label="Estado" value={socialOnly ? "Social" : "Local"} />
          <SettingsMetric label="Sesión" value="Activa" accent />
        </div>
      </SettingsCard>

      <SettingsCard
        icon={<KeyRound size={16} />}
        title="Contraseña y salida"
        description="Gestiona tu acceso local o cierra la sesión activa."
      >
        <div className="space-y-1.5">
          <SettingsRow
            icon={<KeyRound size={15} />}
            label="Cambiar contraseña"
            description={socialOnly ? "Gestionada por tu proveedor social." : "Actualizar contraseña local."}
            onClick={openPasswordModal}
          />
          <SettingsRow
            danger
            icon={<LogOut size={15} />}
            label="Cerrar sesión"
            description="Salir de este dispositivo."
            onClick={() => setConfirmLogoutOpen(true)}
          />
        </div>

        <div className="mt-3 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 shadow-[inset_0_0_0_1px_var(--app-border)]">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-muted)]">
            Control activo
          </p>
          <p className="mt-1 text-[12px] font-medium leading-5 text-[var(--app-muted)]">
            Puedes actualizar tu contraseña cuando quieras. Si usas un proveedor social, el
            acceso sigue gestionado por tu cuenta externa.
          </p>
        </div>
      </SettingsCard>

      {confirmLogoutOpen ? (
        <LogoutDialog
          onCancel={() => setConfirmLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      ) : null}

      {passwordModalOpen ? (
        <PasswordModal
          error={passwordError}
          form={passwordForm}
          loading={passwordLoading}
          onChange={setPasswordForm}
          onClose={closePasswordModal}
          onSubmit={handlePasswordSubmit}
          socialOnly={socialOnly}
          providerLabel={providerLabel}
          success={passwordSuccess}
        />
      ) : null}
    </SettingsScreenShell>
  );
}

function SecurityChip({ active = false, icon, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] transition ${
        active
          ? "border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
      }`}
    >
      <span className={active ? "text-[var(--app-primary)]" : "text-[var(--app-muted)]"}>
        {icon}
      </span>
      {label}
    </span>
  );
}

function LogoutDialog({ onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/65 px-3 py-6 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        className="relative w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,#08131b),var(--app-card))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

        <div className="relative z-10">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border border-red-400/15 bg-red-400/10 text-red-200 shadow-[0_0_18px_rgba(248,113,113,0.18)]">
              <LogOut size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-200/80">
                Acción crítica
              </p>
              <h2
                id="logout-dialog-title"
                className="mt-1 text-[18px] font-bold leading-tight text-[var(--app-text)]"
              >
                Cerrar sesión
              </h2>
              <p className="mt-2 text-[12px] font-medium leading-5 text-[var(--app-muted)]">
                Se cerrará tu sesión en este dispositivo. Podrás volver a entrar cuando quieras.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[11px] font-black uppercase tracking-wide text-[var(--app-muted)] transition hover:text-[var(--app-text)] active:scale-[0.98]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="h-11 rounded-2xl bg-red-400 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_0_22px_rgba(248,113,113,0.28)] transition hover:bg-red-300 active:scale-[0.98]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PasswordModal({
  error,
  form,
  loading,
  onChange,
  onClose,
  onSubmit,
  socialOnly,
  providerLabel,
  success,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/65 px-3 py-3 backdrop-blur-md sm:items-center sm:py-6">
      <section
        className="relative w-full max-w-[420px] max-h-[calc(100dvh-1.25rem)] overflow-y-auto overscroll-contain rounded-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,#08131b),var(--app-card))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:max-h-[calc(100dvh-3rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-title"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                <ShieldCheck size={10} />
                Acceso seguro
              </div>
              <h2
                id="password-title"
                className="mt-2 text-xl font-bold leading-tight text-[var(--app-text)]"
              >
                Cambiar contraseña
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--app-muted)]">
                Actualiza tu contraseña local de acceso.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition hover:text-[var(--app-text)] active:scale-[0.96] disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <SecurityBadge label="Sesión activa" value="Sí" />
            <SecurityBadge label="Proveedor" value={socialOnly ? providerLabel : "Email"} />
            <SecurityBadge label="Control" value="Local" />
          </div>

          {socialOnly ? (
            <StatusBox type="info" className="mb-3 p-3 text-[12px] leading-5">
              Tu cuenta usa inicio de sesión social. La contraseña se gestiona desde tu proveedor.
            </StatusBox>
          ) : null}

          {error ? (
            <StatusBox type="error" className="mb-3 p-3 text-[12px] leading-5">
              {error}
            </StatusBox>
          ) : null}

          {success ? (
            <StatusBox type="success" className="mb-3 p-3 text-[12px] leading-5">
              {success}
            </StatusBox>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-3">
            <PasswordField
              icon={<Lock size={14} />}
              label="Correo electrónico"
              placeholder="nombre@correo.com"
              type="email"
              value={form.email}
              disabled={socialOnly}
              onChange={(value) =>
                onChange((current) => ({ ...current, email: value }))
              }
            />
            <PrimaryButton
              type="submit"
              disabled={loading || socialOnly}
              icon={<KeyRound size={15} />}
              className="py-3 text-[11px]"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </PrimaryButton>
          </form>
        </div>
      </section>
    </div>
  );
}

function PasswordField({ disabled, icon, label, onChange, placeholder, type, value }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[var(--app-muted)]">
        <span className="text-[var(--app-primary)]">{icon}</span>
        {label}
      </span>
      <div className={`flex items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--app-border)] transition focus-within:border-[var(--app-primary)]/40 focus-within:bg-[var(--app-primary-soft)]/35 ${disabled ? "opacity-70" : ""}`}>
        <input
          disabled={disabled}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] font-medium text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] disabled:cursor-not-allowed"
        />
      </div>
    </label>
  );
}

function SecurityBadge({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--app-border)]">
      <p className="text-[8.5px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-bold leading-tight text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function isSocialOnlyAccount(user) {
  const provider = user?.app_metadata?.provider;
  if (provider === "google" || provider === "facebook") return true;
  return Boolean(
    user?.identities?.some((identity) =>
      ["google", "facebook"].includes(identity?.provider)
    )
  );
}

function getProviderLabel(user) {
  const provider = user?.app_metadata?.provider;
  if (provider === "google" || provider === "facebook") {
    return provider === "google" ? "Google" : "Facebook";
  }
  const identityProvider = user?.identities?.[0]?.provider;
  if (identityProvider === "google") return "Google";
  if (identityProvider === "facebook") return "Facebook";
  if (provider === "email") return "Email";
  return provider || "Local";
}

function getPasswordResetErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("session") || message.includes("jwt")) {
    return "Tu sesión ha caducado. Vuelve a iniciar sesión para solicitar el enlace.";
  }
  return "No pudimos enviar el enlace: " + error.message;
}
