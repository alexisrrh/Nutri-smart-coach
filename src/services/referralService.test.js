import { describe, expect, it, vi, beforeEach } from "vitest";

const requestMock = vi.fn();

vi.mock("./apiClient", () => ({
  request: requestMock,
}));

const {
  applyReferralCode,
  createReferralCode,
  getMyReferralStats,
} = await import("./referralService");

describe("referralService", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it("loads referral stats from the backend", async () => {
    requestMock.mockResolvedValueOnce({ codes: [], summary: {} });

    const result = await getMyReferralStats();

    expect(requestMock).toHaveBeenCalledWith(
      "/referrals/me",
      {},
      { operation: "cargar tus referidos" }
    );
    expect(result).toEqual({ codes: [], summary: {} });
  });

  it("creates a normal referral code", async () => {
    requestMock.mockResolvedValueOnce({ code: { code: "NSC1234" } });

    const result = await createReferralCode();

    expect(requestMock).toHaveBeenCalledWith(
      "/referrals/create-code",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "user" }),
      }),
      { operation: "crear tu código de referido" }
    );
    expect(result).toEqual({ code: { code: "NSC1234" } });
  });

  it("applies a trimmed referral code", async () => {
    requestMock.mockResolvedValueOnce({ ok: true });

    await applyReferralCode("  nsc-abc  ");

    expect(requestMock).toHaveBeenCalledWith(
      "/referrals/apply-code",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "nsc-abc" }),
      }),
      { operation: "aplicar código de referido" }
    );
  });
});
