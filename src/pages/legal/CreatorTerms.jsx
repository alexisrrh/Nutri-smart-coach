import { LegalLayout, LegalList, LegalSection } from "./LegalLayout";

const contactEmail = "info@nutrismartcoach.com";

export function CreatorTerms() {
  return (
    <LegalLayout
      eyebrow="Programa de Creadores"
      title="Términos del Programa de Creadores"
      updatedAt="5 de junio de 2026"
    >
      <LegalSection title="Comisión">
        <p>
          Los creadores aprobados pueden recibir una comisión del 30% por cada
          suscripción Premium válida atribuida a su código de creador.
        </p>
      </LegalSection>

      <LegalSection title="Trial de 15 días">
        <p>
          Los usuarios invitados con un código de creador pueden recibir 15 días
          de acceso Premium promocional. El trial gratuito no genera comisión por
          sí mismo.
        </p>
      </LegalSection>

      <LegalSection title="Referido válido">
        <LegalList
          items={[
            "El usuario debe registrarse usando el código o enlace del creador.",
            "La atribución debe producirse antes de la contratación Premium.",
            "La comisión solo se genera tras el primer pago real confirmado.",
            "Los pagos rechazados, devueltos, reembolsados o cancelados no generan comisión.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Límite de pagos">
        <p>
          Cada usuario referido puede generar comisión durante un máximo de 12
          pagos Premium válidos. Superado ese límite, el usuario puede seguir
          usando NutriSmart Coach, pero deja de generar comisión para el creador.
        </p>
      </LegalSection>

      <LegalSection title="Fraude y autorreferidos">
        <LegalList
          items={[
            "No se permiten cuentas falsas, automatizadas, duplicadas o creadas para simular actividad.",
            "No se permiten autorreferidos ni compras realizadas por el propio creador para generar comisión.",
            "No se permite incentivar usos engañosos, abuso de trials o manipulación de atribuciones.",
            "NutriSmart Coach puede retener, cancelar o ajustar comisiones si detecta actividad fraudulenta.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Suspensión del programa">
        <p>
          NutriSmart Coach puede rechazar solicitudes, pausar códigos, suspender
          la participación o cerrar el acceso al programa si el creador incumple
          estos términos, publica contenido engañoso o genera riesgo para la
          plataforma, los usuarios o la marca.
        </p>
      </LegalSection>

      <LegalSection title="Cancelaciones">
        <p>
          Si un usuario cancela su suscripción, solicita un reembolso, no
          completa el pago o deja de estar en estado Premium válido, ese periodo
          no genera comisión. Las comisiones pendientes pueden revisarse antes de
          confirmarse.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilidades del creador">
        <LegalList
          items={[
            "Comunicar la promoción de forma clara, honesta y no engañosa.",
            "No prometer resultados físicos, médicos, nutricionales o económicos no garantizados.",
            "Cumplir las normas de cada plataforma social y la normativa publicitaria aplicable.",
            "Mantener un perfil público, contenido original y una relación transparente con su audiencia.",
            `Contactar con soporte en ${contactEmail} si necesita aclaraciones sobre el programa.`,
          ]}
        />
      </LegalSection>
    </LegalLayout>
  );
}

export default CreatorTerms;
