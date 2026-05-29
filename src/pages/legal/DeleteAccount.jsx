import { Mail } from "lucide-react";
import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";
const subject = "Eliminar cuenta NutriSmartCoach";

export function DeleteAccount() {
  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;

  return (
    <LegalLayout
      eyebrow="Datos y cuenta"
      title="Delete Account"
      updatedAt="27 de mayo de 2026"
    >
      <LegalSection title="Cómo solicitar la eliminación">
        <p>
          Para solicitar la eliminación de tu cuenta y datos asociados, escribe
          desde el email vinculado a tu cuenta a{" "}
          <a className="font-black text-[var(--app-primary)]" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>{" "}
          con el asunto "Eliminar cuenta NutriSmartCoach".
        </p>

        <a
          href={mailtoHref}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--app-surface)] shadow-[0_14px_32px_var(--app-glow)] transition active:scale-[0.98]"
        >
          <Mail size={15} />
          Solicitar eliminación
        </a>
      </LegalSection>

      <LegalSection title="Datos que puedes solicitar eliminar">
        <LegalList
          items={[
            "Perfil de usuario y preferencias.",
            "Fotos de comida y análisis asociados.",
            "Comidas registradas e historial nutricional.",
            "Fotos de check-in corporal, medidas, notas y análisis asociados.",
            "Dietas generadas y progreso de dieta.",
            "Rutinas personalizadas, rutinas compartidas y datos de entrenamiento.",
            "Sesiones de entrenamiento, progreso, historial y datos relacionados.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Plazo orientativo">
        <p>
          Las solicitudes se revisan y procesan en un plazo orientativo de hasta
          30 días desde la recepción y verificación de la solicitud. Si se
          necesita información adicional para confirmar la titularidad de la
          cuenta, el plazo puede depender de la respuesta del usuario.
        </p>
      </LegalSection>

      <LegalSection title="Datos que podrían conservarse">
        <p>
          Algunos datos pueden conservarse de forma limitada si son necesarios
          por motivos legales, seguridad, prevención de abuso, resolución de
          incidencias o defensa de reclamaciones. Cuando sea posible, se
          eliminarán o desvincularán los datos personales que ya no sean
          necesarios.
        </p>
      </LegalSection>

      <LegalSection title="Opción desde perfil">
        <p>
          En el futuro podrá incorporarse una opción directa desde el perfil para
          gestionar la eliminación de cuenta. Hasta que esté disponible, el canal
          operativo para solicitarla es el email indicado en esta página.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
