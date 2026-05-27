import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, LogOut, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";
import { clearCachedProfile } from "../../services/profileService";
import { STORAGE_KEYS } from "../../config/storageKeys";
import { ConfirmDialog, PrimaryButton, StatusBox } from "../../components/ui";
import { SettingsCard, SettingsMetric, SettingsRow, SettingsScreenShell } from "./SettingsShared";

export function SettingsSecurity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const providerLabel = getProviderLabel(user);
  const socialOnly = isSocialOnlyAccount(user);

  function openPasswordModal() {
    setPasswordForm({ password: "", confirmPassword: "" });
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

    if (passwordForm.password.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.password,
    });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(getPasswordUpdateErrorMessage(error));
      return;
    }

    setPasswordSuccess("Contraseña actualizada correctamente.");
    setPasswordForm({ password: "", confirmPassword: "" });
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
      title="Cuenta y seguridad"
      subtitle="Contraseña, proveedor actual y cierre de sesión."
      onBack={() => navigate("/perfil")}
    >
      <SettingsCard
        icon={<ShieldCheck size={16} />}
        title="Estado de cuenta"
        description="Visualiza cómo accede tu cuenta actualmente."
      >
        <div className="grid grid-cols-2 gap-1.5">
          <SettingsMetric label="Proveedor" value={providerLabel} />
          <SettingsMetric label="Estado" value={socialOnly ? "Social" : "Local"} accent />
        </div>
      </SettingsCard>

      <SettingsCard
        icon={<KeyRound size={16} />}
        title="Contraseña"
        description="Actualiza tu acceso local o revisa tu proveedor."
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
      </SettingsCard>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Cerrar sesión"
        description="Se cerrará tu sesión en este dispositivo. Podrás volver a entrar cuando quieras."
        cancelLabel="Cancelar"
        confirmLabel="Cerrar"
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
      />

      {passwordModalOpen ? (
        <PasswordModal
          error={passwordError}
          form={passwordForm}
          loading={passwordLoading}
          onChange={setPasswordForm}
          onClose={closePasswordModal}
          onSubmit={handlePasswordSubmit}
          socialOnly={socialOnly}
          success={passwordSuccess}
        />
      ) : null}
    </SettingsScreenShell>
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
  success,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 px-3 py-6 backdrop-blur-md">
      <section
        className="relative w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_96%,#08131b),var(--app-card))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-title"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                Seguridad
              </p>
              <h2
                id="password-title"
                className="mt-1 text-xl font-bold leading-tight text-[var(--app-text)]"
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
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              type="password"
              value={form.password}
              disabled={socialOnly}
              onChange={(value) =>
                onChange((current) => ({ ...current, password: value }))
              }
            />
            <PasswordField
              icon={<KeyRound size={14} />}
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              type="password"
              value={form.confirmPassword}
              disabled={socialOnly}
              onChange={(value) =>
                onChange((current) => ({ ...current, confirmPassword: value }))
              }
            />
            <PrimaryButton type="submit" disabled={loading || socialOnly} icon={<KeyRound size={15} />} className="py-3 text-[11px]">
              {loading ? "Actualizando..." : "Actualizar contraseña"}
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

function getPasswordUpdateErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("session") || message.includes("jwt")) {
    return "Tu sesión ha caducado. Vuelve a iniciar sesión para cambiar la contraseña.";
  }
  return "No pudimos actualizar tu contraseña: " + error.message;
}
