import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "alexisrrh123@gmail.com";

export function PrivacyPolicy() {
  return (
    <LegalLayout
      eyebrow="NutriSmartCoach"
      title="Privacy Policy"
      updatedAt="27 de mayo de 2026"
    >
      <LegalSection title="Responsable y contacto">
        <p>
          NutriSmartCoach es una aplicación de nutrición, fitness y seguimiento
          personal asistida por IA. Para consultas sobre privacidad o protección
          de datos puedes escribir a{" "}
          <a className="font-black text-[var(--app-primary)]" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Datos que podemos tratar">
        <LegalList
          items={[
            "Datos de cuenta, como email, nombre y proveedor de acceso social si usas Google, Meta/Facebook u otro proveedor configurado.",
            "Datos de perfil físico y nutricional, como peso, altura, edad, objetivo, nivel, preferencias y actividad.",
            "Fotos de comida, descripciones, comidas analizadas, resultados nutricionales y recomendaciones generadas.",
            "Fotos de check-in corporal, medidas, notas, análisis de evolución y datos de seguimiento físico.",
            "Dietas generadas, planes alimentarios, progreso de dieta y preferencias asociadas.",
            "Rutinas, entrenamientos, sesiones completadas, progreso, historial y rutinas compartidas cuando el usuario las publica.",
            "Datos técnicos necesarios para autenticación, seguridad, funcionamiento de la sesión, prevención de abuso y límites de uso.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Uso de IA">
        <p>
          NutriSmartCoach utiliza sistemas de inteligencia artificial para
          analizar comidas, generar recomendaciones, ayudar con dietas y aportar
          orientación sobre progreso. Los resultados pueden ser aproximados y
          deben revisarse con criterio. La app no sustituye asesoramiento médico,
          nutricional ni deportivo profesional.
        </p>
      </LegalSection>

      <LegalSection title="Finalidad del tratamiento">
        <LegalList
          items={[
            "Crear y mantener tu cuenta de usuario.",
            "Personalizar recomendaciones de nutrición, entrenamiento y progreso.",
            "Guardar historial para que puedas consultar tu evolución.",
            "Procesar fotos y datos introducidos para análisis asistidos por IA.",
            "Aplicar límites diarios, proteger la plataforma y prevenir abuso.",
            "Mejorar estabilidad, seguridad y experiencia de uso de la aplicación.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Servicios externos">
        <p>
          Para prestar el servicio podemos apoyarnos en proveedores externos. En
          particular, Supabase para autenticación, base de datos y almacenamiento;
          Google Gemini para funciones de IA; Meta/Facebook Login para inicio de
          sesión con Facebook; y Google OAuth para inicio de sesión con Google.
          Estos proveedores pueden tratar datos necesarios para ejecutar sus
          servicios conforme a sus propias condiciones y políticas.
        </p>
      </LegalSection>

      <LegalSection title="Conservación de datos">
        <p>
          Conservamos los datos mientras tu cuenta esté activa o mientras sean
          necesarios para prestar la funcionalidad solicitada, mantener seguridad,
          resolver incidencias o cumplir obligaciones aplicables. Puedes solicitar
          la eliminación de cuenta y datos mediante la página de eliminación.
        </p>
      </LegalSection>

      <LegalSection title="Eliminación de datos">
        <p>
          Puedes solicitar la eliminación escribiendo a{" "}
          <a className="font-black text-[var(--app-primary)]" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>{" "}
          con el asunto "Eliminar cuenta NutriSmartCoach". La eliminación puede
          incluir perfil, fotos, comidas, check-ins, dietas, rutinas, sesiones,
          progreso e historial, salvo datos que deban conservarse por seguridad,
          prevención de abuso o motivos legales.
        </p>
      </LegalSection>

      <LegalSection title="Seguridad">
        <p>
          Aplicamos medidas razonables para proteger la cuenta y los datos, como
          autenticación, controles de acceso, almacenamiento gestionado y reglas
          de acceso por usuario. Ningún sistema es completamente infalible, por
          lo que también recomendamos usar contraseñas seguras y proteger el
          acceso a tu dispositivo y correo.
        </p>
      </LegalSection>

      <LegalSection title="Derechos del usuario">
        <p>
          Puedes solicitar información, corrección, acceso o eliminación de tus
          datos escribiendo al contacto indicado. Para poder procesar solicitudes
          de cuenta puede ser necesario verificar que la petición corresponde al
          titular de la cuenta.
        </p>
      </LegalSection>

      <LegalSection title="Aviso médico y deportivo">
        <p>
          NutriSmartCoach ofrece herramientas de apoyo y recomendaciones
          aproximadas. No diagnostica enfermedades, no prescribe tratamientos y
          no sustituye a un médico, nutricionista, dietista o entrenador
          certificado. Antes de cambiar tu alimentación, iniciar entrenamientos
          intensos o tomar decisiones de salud, consulta con un profesional.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
