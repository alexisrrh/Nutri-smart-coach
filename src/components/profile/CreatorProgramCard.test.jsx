import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../ui";
import CreatorProgramCard, { CreatorProgramCardView } from "./CreatorProgramCard";

vi.mock("../../services/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("../../services/creatorService", () => ({
  buildCreatorShareText: vi.fn(() => "share"),
  copyCreatorCode: vi.fn(),
  getCreatorStatus: vi.fn(),
  shareCreatorCode: vi.fn(),
  submitCreatorApplication: vi.fn(),
}));

describe("CreatorProgramCard", () => {
  it("shows the access CTA when there is no application", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView status="none" />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Cómo funciona");
    expect(html).toContain("Unirme al programa");
    expect(html).toContain("Respuesta en 24-72 horas");
    expect(html).toContain("Solicita");
    expect(html).toContain("Revisamos");
    expect(html).toContain("Activamos");
    expect(html).toContain("Compartes");
    expect(html).toContain("Ganas");
    expect(html).toContain("Lo que obtienes");
    expect(html).toContain("30% por cada Premium válido");
    expect(html).toContain("Código exclusivo para tu comunidad");
    expect(html).toContain("Dashboard de conversiones");
    expect(html).toContain("Seguimiento de comisiones");
    expect(html).toContain("Potencial de ingresos");
    expect(html).toContain("Premium generados");
    expect(html).toContain("25");
    expect(html).toContain("≈ 37.43€/mes");
    expect(html).toContain("Comisión estimada");
    expect(html).toContain("Basado en suscripciones Premium válidas.");
    expect(html).not.toContain("5 Premium");
    expect(html).not.toContain("10 Premium");
    expect(html).not.toContain("37.42€/mes");
    expect(html).not.toContain("Los resultados son ilustrativos.");
    expect(html).toContain("¿Eres elegible?");
    expect(html).toContain("Programa verificado");
    expect(html).toContain("Revisión manual");
    expect(html).toContain("Sistema antifraude");
    expect(html).toContain("Pagos confirmados");
    expect(html).toContain("Seguimiento de conversiones");
    expect(html).toContain("Acepto términos");
    expect(html).toContain("Ver condiciones completas");
    expect(html).not.toContain("Debes aceptar los términos del programa para continuar.");
    expect(html).not.toContain("No se pudo completar la solicitud");
    expect(html).not.toContain("influencer");
  });

  it("shows the application form when requested", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView
            status="none"
            formVisible
            termsAccepted
            formState={{
              socialPlatform: "instagram",
              socialHandle: "",
              followersCount: "",
              proofUrl: "",
            }}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Solicitud de acceso");
    expect(html).toContain("Revisaremos tu perfil antes de activar tu código.");
    expect(html).toContain("Plataforma");
    expect(html).toContain("Perfil");
    expect(html).toContain("Seguidores");
    expect(html).toContain("Prueba opcional");
    expect(html).toContain("Enviar");
  });

  it("shows the terms error only when there is a real attempt without acceptance", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView
            status="none"
            formError="Debes aceptar los términos del programa para continuar."
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Debes aceptar los términos del programa para continuar.");
    expect(html).not.toContain("No se pudo completar la solicitud");
  });

  it("shows the pending review status instead of the form", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView
            status="pending"
            application={{
              socialPlatform: "instagram",
              socialHandle: "@creator",
              followersCount: 6200,
            }}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Solicitud en revisión");
    expect(html).toContain("Estamos revisando tu perfil. Tiempo estimado: 24-72 horas.");
    expect(html).toContain("Solicitud recibida");
    expect(html).toContain("Perfil en revisión");
    expect(html).toContain("Aprobación");
    expect(html).toContain("Volver al perfil");
    expect(html).not.toContain("Unirme al programa");
    expect(html).not.toContain("Plataforma");
  });

  it("shows the approved state with code and metrics", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView
            status="approved"
            creatorCode="CREATOR30"
            stats={{
              registeredUsers: 8,
              trialUsers: 2,
              premiumUsers: 4,
              totalCommissions: 3,
              pendingCommissions: 2,
              paidCommissions: 1,
            }}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Ya formas parte del Programa de Partners");
    expect(html).toContain("CREATOR30");
    expect(html).toContain("15 días gratis");
    expect(html).toContain("30% comisión");
    expect(html).toContain("Usuarios registrados");
    expect(html).toContain("Premium generados");
    expect(html).toContain("Comisiones");
    expect(html).toContain("Compartir enlace");
  });

  it("shows the rejected state with the rejection reason", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView
            status="rejected"
            application={{
              rejectionReason: "Necesitamos un perfil más activo.",
            }}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Solicitud no aprobada");
    expect(html).toContain("Necesitamos un perfil más activo.");
    expect(html).toContain("Volver a solicitar");
  });

  it("does not show the creator code while the status is pending", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCardView status="pending" />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).not.toContain("CREATOR30");
    expect(html).not.toContain("Código de creador");
  });

  it("does not render influencer wording in the public copy", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <CreatorProgramCard />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).not.toContain("influencer");
    expect(html).not.toContain("15 días Premium gratis para tus seguidores");
  });
});
