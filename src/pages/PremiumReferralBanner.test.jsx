import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PremiumReferralBanner } from "./premiumReferralBanner";
import { getPremiumReferralBannerCopy } from "./premiumReferralBannerCopy";

describe("PremiumReferralBanner", () => {
  it("builds the normal referral copy with 7 days", () => {
    const copy = getPremiumReferralBannerCopy({
      is_premium: false,
      acquisition_source: "referral",
      referral_code_id: "code-1",
      trial_source: "standard_trial",
    });

    expect(copy?.trialDays).toBe(7);
    expect(copy?.headline).toContain("7 días Premium gratis");
  });

  it("builds the creator copy with 15 days", () => {
    const copy = getPremiumReferralBannerCopy({
      is_premium: false,
      acquisition_source: "creator",
      referral_code_id: "code-2",
      trial_source: "creator_trial",
      trial_days: 15,
    });

    expect(copy?.trialDays).toBe(15);
    expect(copy?.headline).toContain("15 días Premium gratis");
  });

  it("renders the banner when a referral code is applied", () => {
    const html = renderToStaticMarkup(
      <PremiumReferralBanner
        premiumStatus={{
          is_premium: false,
          acquisition_source: "referral",
          referral_code_id: "code-1",
          trial_source: "standard_trial",
        }}
      />
    );

    expect(html).toContain("CÓDIGO APLICADO");
    expect(html).toContain("7 días Premium gratis");
    expect(html).toContain("Se requiere método de pago");
  });
});
