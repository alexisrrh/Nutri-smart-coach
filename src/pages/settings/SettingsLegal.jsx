import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Trash2 } from "lucide-react";
import { SettingsCard, SettingsRow, SettingsScreenShell } from "./SettingsShared";

export function SettingsLegal() {
  const navigate = useNavigate();

  return (
    <SettingsScreenShell
      badge="Legal"
      title="Privacidad y legal"
      subtitle="Acceso rápido a las políticas y a la gestión de datos."
      onBack={() => navigate("/perfil")}
    >
      <SettingsCard
        icon={<ShieldCheck size={16} />}
        title="Documentos"
        description="Navega a las páginas legales oficiales de la app."
      >
        <div className="space-y-1.5">
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
      </SettingsCard>
    </SettingsScreenShell>
  );
}
