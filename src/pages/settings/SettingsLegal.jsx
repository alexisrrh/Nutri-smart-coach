import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, ShieldPlus, Trash2 } from "lucide-react";
import { SettingsCard, SettingsRow, SettingsScreenShell } from "./SettingsShared";

export function SettingsLegal() {
  const navigate = useNavigate();

  return (
    <SettingsScreenShell
    
      badge="Legal"
      title="Privacidad y legal"
      subtitle="Trust center para revisar políticas y gestionar tus datos con transparencia."
      onBack={() => navigate("/perfil")}
    >
        <div className="space-y-2.5 pb-2">
      <SettingsCard
        icon={<ShieldCheck size={16} />}
        title="Trust Center"
        description="Datos protegidos, políticas activas y control de tu información."
        right={
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--app-primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
            Protegido
          </span>
        }
      >
        <div className="grid gap-2">
          <div className="grid gap-1.5 rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <MiniTrustRow icon={<ShieldCheck size={13} />} label="Políticas activas" />
            <MiniTrustRow icon={<ShieldPlus size={13} />} label="Gestión de datos disponible" />
            <MiniTrustRow icon={<FileText size={13} />} label="Transparencia legal" />
          </div>

          <div className="grid gap-1.5">
            <SettingsRow
              icon={<ShieldCheck size={15} />}
              label="Política de privacidad"
              description="Cómo tratamos tus datos y fotos."
              to="/privacy"
            />
            <SettingsRow
              icon={<FileText size={15} />}
              label="Términos del servicio"
              description="Condiciones de uso de la plataforma."
              to="/terms"
            />
            <SettingsRow
              icon={<Trash2 size={15} />}
              label="Eliminar cuenta / datos"
              description="Solicitud de borrado de tu cuenta."
              to="/delete-account"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={<ShieldCheck size={16} />}
        title="Control y transparencia"
        description="Tus datos siguen bajo tu control y puedes revisarlos cuando quieras."
      >
        <div className="space-y-1.5 text-[12px] leading-5 text-[var(--app-muted)]">
          <p>Tus datos siguen bajo tu control.</p>
          <p>Puedes revisar políticas o solicitar eliminación cuando lo necesites.</p>
        </div>
      </SettingsCard>
      </div>
    </SettingsScreenShell>
  );
}

function MiniTrustRow({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]">
        {icon}
      </span>
      <span className="min-w-0 text-[12px] font-medium text-[var(--app-text)]">{label}</span>
    </div>
  );
}
