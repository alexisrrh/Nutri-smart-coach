import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../ui";
import ReferralInviteCard, { ReferralInviteCardView } from "./ReferralInviteCard";
import {
  buildReferralInviteShareText,
  getReferralInviteCardViewModel,
} from "./referralInviteCardViewModel";

vi.mock("../../services/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("../../services/referralService", () => ({
  claimReferralReward: vi.fn(),
  createReferralCode: vi.fn(),
  getMyReferralStats: vi.fn(),
}));

describe("ReferralInviteCard", () => {
  it("shows a loading state before referral data resolves", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <ReferralInviteCardView
            loading
            viewModel={getReferralInviteCardViewModel({
              loading: true,
            })}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Cargando código...");
    expect(html).toContain("Generando...");
    expect(html).not.toContain("Crear mi código");
    expect(html).not.toContain("Ver código");
  });

  it("renders the create-code state when the user has no referral code", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <ReferralInviteCardView
            viewModel={getReferralInviteCardViewModel({
              stats: {
                codes: [],
                summary: {
                  premiumActiveReferrals: 0,
                  rewardAvailableCount: 0,
                },
              },
            })}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("RECOMPENSA PREMIUM");
    expect(html).toContain("Gana 1 mes Premium gratis");
    expect(html).toContain("3 amigos Premium = 1 mes gratis");
    expect(html).toContain("3 pagos Premium confirmados = 1 mes gratis");
    expect(html).toContain("Crear mi código");
    expect(html).not.toContain("0 / 3 pagos confirmados");
    expect(html).not.toContain("NSC1234");
  });

  it("renders the collapsed invite state when a code already exists", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <ReferralInviteCardView
            viewModel={getReferralInviteCardViewModel({
              stats: {
                codes: [{ code: "NSC1234" }],
                summary: {
                  premiumActiveReferrals: 0,
                  rewardAvailableCount: 0,
                },
              },
            })}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Gana 1 mes Premium gratis");
    expect(html).toContain("3 amigos Premium = 1 mes gratis");
    expect(html).toContain("0 de 3 amigos Premium");
    expect(html).toContain("Cuentan tras su primer pago confirmado.");
    expect(html).toContain("Ver código");
    expect(html).not.toContain("Compartir");
    expect(html).not.toContain("NSC1234");
    expect(html).not.toContain("Copiar");
  });

  it("renders the claim reward state when reward is available", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <ReferralInviteCardView
            viewModel={getReferralInviteCardViewModel({
              stats: {
                codes: [{ code: "NSC1234" }],
                premiumReferralsCount: 3,
                rewardsAvailable: 1,
                rewardsClaimed: 0,
                canClaimReward: true,
                latestReward: {
                  id: "reward-1",
                  milestone_number: 1,
                  status: "available",
                },
              },
            })}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Recompensa desbloqueada");
    expect(html).toContain("Has conseguido 1 mes Premium gratis.");
    expect(html).toContain("Reclamar recompensa");
  });

  it("exposes the expanded view when requested", () => {
    const viewModel = getReferralInviteCardViewModel({
      stats: {
        codes: [{ code: "NSC1234" }],
        summary: {
          premiumActiveReferrals: 3,
          rewardAvailableCount: 1,
        },
      },
      expanded: true,
    });

    expect(viewModel.expanded).toBe(true);
    expect(viewModel.referralCode).toBe("NSC1234");
    expect(viewModel.rewardAvailable).toBe(true);
    expect(viewModel.inviteeTrialDays).toBe(7);
  });

  it("builds a 7 day share message for normal referral codes", () => {
    expect(buildReferralInviteShareText("NSC1234", 7)).toBe(
      "Únete a NutriSmart Coach con mi código NSC1234 y consigue 7 días Premium gratis."
    );
  });

  it("renders the expanded invite state with the code visible", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <ReferralInviteCardView
            viewModel={getReferralInviteCardViewModel({
              stats: {
                codes: [{ code: "NSC1234" }],
                summary: {
                  premiumActiveReferrals: 0,
                  rewardAvailableCount: 0,
                },
              },
              expanded: true,
            })}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("NSC1234");
    expect(html).toContain("Invitado: 7 días Premium gratis.");
    expect(html).toContain("Copiar");
    expect(html).toContain("Compartir");
    expect(html).toContain("Ocultar código");
    expect(html).not.toContain("Ver código");
  });

  it("does not render referral card content outside /perfil", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ToastProvider>
          <Routes>
            <Route
              path="/perfil"
              element={
                <ReferralInviteCard
                  initialStats={{
                    codes: [{ code: "NSC1234" }],
                    summary: {
                      premiumActiveReferrals: 3,
                      rewardAvailableCount: 1,
                    },
                  }}
                />
              }
            />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Dashboard");
    expect(html).not.toContain("Gana 1 mes Premium gratis");
    expect(html).not.toContain("RECOMPENSA PREMIUM");
  });
});
