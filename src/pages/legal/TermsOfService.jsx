import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";

export function TermsOfService() {
  return (
    <LegalLayout
      eyebrow="NutriSmartCoach"
      title="Terms of Service"
      updatedAt="27 de mayo de 2026"
    >
      <LegalSection title="Aceptación del servicio">
        <p>
          Al usar NutriSmartCoach aceptas estas condiciones. Si no estás de
          acuerdo, no debes utilizar la aplicación. Estas condiciones se aplican
          al uso de funciones de nutrición, análisis de comidas, check-ins,
          rutinas, progreso, historial y herramientas asistidas por IA.
        </p>
      </LegalSection>

      <LegalSection title="Uso permitido">
        <LegalList
          items={[
            "Usar la app para seguimiento personal de nutrición, entrenamiento y progreso.",
            "Introducir datos reales o razonables para obtener recomendaciones más útiles.",
            "No intentar abusar de límites, automatizar peticiones, sobrecargar sistemas o acceder a cuentas ajenas.",
            "No subir contenido ilegal, ofensivo, engañoso o que vulnere derechos de terceros.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Responsabilidad del usuario">
        <p>
          Eres responsable de la información que introduces, de revisar los
          resultados antes de actuar sobre ellos y de mantener la seguridad de tu
          cuenta. También eres responsable de consultar a profesionales
          cualificados si tienes dudas médicas, nutricionales o deportivas.
        </p>
      </LegalSection>

      <LegalSection title="Recomendaciones e IA">
        <p>
          Las calorías, macros, dietas, rutinas, análisis corporales y
          recomendaciones generadas por NutriSmartCoach son aproximadas. La IA
          puede cometer errores, interpretar mal imágenes o generar sugerencias
          incompletas. No debes considerar la app como sustituto de un médico,
          nutricionista, dietista o entrenador certificado.
        </p>
      </LegalSection>

      <LegalSection title="Límites diarios de IA">
        <p>
          Para proteger la estabilidad y controlar costes, algunas funciones de
          IA pueden tener límites diarios o rate limits. Estos límites pueden
          aplicarse a análisis de comida, generación de dietas o check-ins. Las
          rutinas y otras funciones no limitadas pueden mantenerse disponibles
          según la configuración actual de la app.
        </p>
      </LegalSection>

      <LegalSection title="Cuentas y seguridad">
        <LegalList
          items={[
            "Debes usar un email o proveedor social válido para acceder cuando la app lo requiera.",
            "No compartas credenciales ni enlaces privados de recuperación.",
            "Si detectas acceso no autorizado, contacta con soporte lo antes posible.",
            "Podemos bloquear o suspender accesos si detectamos abuso, automatización maliciosa o riesgo para la plataforma.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Contenido generado por usuario">
        <p>
          Puedes subir fotos, medidas, notas, comidas, rutinas y otros datos. Al
          hacerlo confirmas que tienes derecho a usar ese contenido y autorizas
          su tratamiento para prestar las funciones solicitadas. Si compartes una
          rutina como pública, cualquier persona con el enlace podrá acceder a
          esa rutina compartida.
        </p>
      </LegalSection>

      <LegalSection title="Funciones premium futuras">
        <p>
          NutriSmartCoach puede incorporar funciones premium, planes de pago o
          límites diferenciados en el futuro. Si se activan pagos, se mostrarán
          condiciones específicas antes de contratar cualquier servicio de pago.
        </p>
      </LegalSection>

      <LegalSection title="Disponibilidad y cambios">
        <p>
          Intentamos mantener la app estable, pero pueden existir interrupciones,
          mantenimiento, errores o cambios de funcionalidad. Podemos actualizar
          estas condiciones cuando sea necesario para reflejar cambios del
          producto, seguridad o requisitos aplicables.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Para dudas sobre estas condiciones puedes escribir a{" "}
          <a className="font-black text-[var(--app-primary)]" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
