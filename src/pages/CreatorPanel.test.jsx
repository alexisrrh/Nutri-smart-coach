import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/profile/CreatorProgramCard", () => ({
  default: () => <div>CreatorPanelBody</div>,
}));

import { CreatorPanel } from "./CreatorPanel";

describe("CreatorPanel", () => {
  it("renders the creator panel wrapper and the loading state before status is known", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CreatorPanel />
      </MemoryRouter>
    );

    expect(html).toContain("Cargando panel de creadores");
    expect(html).toContain("Estamos comprobando tu acceso");
    expect(html).not.toContain("PROGRAMA DE PARTNERS");
    expect(html).not.toContain("Gana dinero recomendando NutriSmart Coach");
    expect(html).toContain("CreatorPanelBody");
  });
});
