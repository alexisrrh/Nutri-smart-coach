import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/profile/CreatorProgramCard", () => ({
  default: () => <div>CreatorPanelBody</div>,
}));

import { CreatorPanel } from "./CreatorPanel";

describe("CreatorPanel", () => {
  it("renders the creator panel wrapper and the dedicated content area", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CreatorPanel />
      </MemoryRouter>
    );

    expect(html).toContain("PROGRAMA DE PARTNERS");
    expect(html).toContain("Gana dinero recomendando NutriSmart Coach");
    expect(html).toContain("CreatorPanelBody");
  });
});
