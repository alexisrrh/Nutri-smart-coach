import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCreatorPanelCacheMock } = vi.hoisted(() => ({
  getCreatorPanelCacheMock: vi.fn(),
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    loadingAuth: false,
  }),
}));

vi.mock("../services/creatorService", async () => {
  const actual = await vi.importActual("../services/creatorService");
  return {
    ...actual,
    getCreatorPanelCache: getCreatorPanelCacheMock,
    loadCreatorStatus: vi.fn(),
  };
});

vi.mock("../components/profile/CreatorProgramCard", () => ({
  default: () => <div>CreatorPanelBody</div>,
}));

import { CreatorPanel } from "./CreatorPanel";

describe("CreatorPanel", () => {
  beforeEach(() => {
    getCreatorPanelCacheMock.mockReset();
  });

  it("renders the creator panel wrapper and the loading skeleton before status is known", () => {
    getCreatorPanelCacheMock.mockReturnValue(null);

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CreatorPanel />
      </MemoryRouter>
    );

    expect(html).toContain("Preparando panel...");
    expect(html).toContain("Estamos comprobando tu acceso.");
    expect(html).not.toContain("PROGRAMA DE PARTNERS");
    expect(html).not.toContain("Gana dinero recomendando NutriSmart Coach");
    expect(html).not.toContain("CreatorPanelBody");
  });

  it("renders the approved dashboard immediately when there is cached data", () => {
    getCreatorPanelCacheMock.mockReturnValue({
      application: null,
      status: "approved",
      creatorCode: "NUTRIALEXIS",
      joinUrl: "https://nutrismartcoach.com/join?creator=NUTRIALEXIS",
      payouts: {
        availableCommissionAmount: 0,
        canRequestWithdrawal: false,
        pendingCommissionAmount: 0,
        withdrawalThreshold: 25,
      },
      stats: {
        registeredUsers: 0,
        premiumUsers: 0,
        totalCommissionAmount: 0,
        availableCommissionAmount: 0,
        pendingCommissionAmount: 0,
        linkClicks: 0,
      },
      updatedAt: "2026-06-07T08:00:00.000Z",
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CreatorPanel />
      </MemoryRouter>
    );

    expect(html).toContain("Panel de Partner");
    expect(html).toContain("ACTIVO");
    expect(html).toContain("CreatorPanelBody");
    expect(html).not.toContain("Cargando panel de creadores");
    expect(html).not.toContain("Generando código de creador...");
  });
});
