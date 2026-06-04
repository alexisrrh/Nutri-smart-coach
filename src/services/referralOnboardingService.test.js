import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { applyReferralCodeMock } = vi.hoisted(() => ({
  applyReferralCodeMock: vi.fn(),
}));
const { validateReferralCodeMock } = vi.hoisted(() => ({
  validateReferralCodeMock: vi.fn(),
}));

vi.mock("./referralService", () => ({
  applyReferralCode: applyReferralCodeMock,
  validateReferralCode: validateReferralCodeMock,
}));

import {
  applyPendingOAuthReferralCode,
  clearOAuthReferralFlowPending,
  clearStoredReferralCode,
  validateAndStoreReferralCode,
  prepareOAuthReferralCode,
  finalizeReferralCodeApplication,
  getStoredReferralCode,
  getReferralApplyOutcome,
  isOAuthReferralFlowPending,
  normalizeReferralCode,
  markOAuthReferralFlowPending,
  setStoredReferralCode,
} from "./referralOnboardingService";

describe("referralOnboardingService", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: createLocalStorageMock(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    applyReferralCodeMock.mockReset();
    validateReferralCodeMock.mockReset();
    clearStoredReferralCode();
    clearOAuthReferralFlowPending();
  });

  it("normalizes invitation codes before applying them", () => {
    expect(normalizeReferralCode("  nsc 123  ")).toBe("NSC123");
  });

  it("returns the referral success message for a normal invite", async () => {
    const trackEventFn = vi.fn();
    const applyReferralCodeFn = vi.fn().mockResolvedValueOnce({
      referral: { type: "user" },
    });

    const result = await finalizeReferralCodeApplication("nsc-user", {
      applyReferralCodeFn,
      trackEventFn,
    });

    expect(result.applied).toBe(true);
    expect(result.message).toBe("Invitación aplicada correctamente");
    expect(trackEventFn).toHaveBeenCalledWith("referral_code_applied", {
      code: "NSC-USER",
    });
  });

  it("returns the influencer success message for an influencer code", async () => {
    const trackEventFn = vi.fn();
    const applyReferralCodeFn = vi.fn().mockResolvedValueOnce({
      referral: { type: "influencer" },
    });

    const result = await finalizeReferralCodeApplication("nsc-influencer", {
      applyReferralCodeFn,
      trackEventFn,
    });

    expect(result.applied).toBe(true);
    expect(result.message).toBe("🎉 Has desbloqueado 15 días Premium gratis");
    expect(trackEventFn).toHaveBeenCalledWith("influencer_code_applied", {
      code: "NSC-INFLUENCER",
    });
  });

  it("raises a clear error and tracks invalid referral codes", async () => {
    const trackEventFn = vi.fn();
    const applyReferralCodeFn = vi.fn().mockRejectedValueOnce(
      new Error("Código de invitación no válido.")
    );

    await expect(
      finalizeReferralCodeApplication("bad-code", {
        applyReferralCodeFn,
        trackEventFn,
      })
    ).rejects.toThrow("Código de invitación no válido.");

    expect(trackEventFn).toHaveBeenCalledWith("referral_code_invalid", {
      code: "BAD-CODE",
    });
  });

  it("returns the outcome metadata for referral types", () => {
    expect(getReferralApplyOutcome({ referral: { type: "influencer" } })).toEqual({
      eventName: "influencer_code_applied",
      message: "🎉 Has desbloqueado 15 días Premium gratis",
    });
    expect(getReferralApplyOutcome({ referral: { type: "user" } })).toEqual({
      eventName: "referral_code_applied",
      message: "Invitación aplicada correctamente",
    });
  });

  it("stores an OAuth referral code pending flag before redirect", () => {
    const normalized = prepareOAuthReferralCode(" nsc-abc ");

    expect(normalized).toBe("NSC-ABC");
    expect(getStoredReferralCode()).toBe("NSC-ABC");
    expect(isOAuthReferralFlowPending()).toBe(true);
  });

  it("clears OAuth referral storage when no code is provided before redirect", () => {
    const normalized = prepareOAuthReferralCode("   ");

    expect(normalized).toBe("");
    expect(getStoredReferralCode()).toBe("");
    expect(isOAuthReferralFlowPending()).toBe(false);
  });

  it("validates and stores a user invite only when the backend confirms it", async () => {
    validateReferralCodeMock.mockResolvedValueOnce({
      valid: true,
      type: "user",
      trialDays: 7,
    });

    const result = await validateAndStoreReferralCode("  friend1  ");

    expect(result.valid).toBe(true);
    expect(result.message).toBe("Código aplicado al crear tu cuenta.");
    expect(getStoredReferralCode()).toBe("FRIEND1");
  });

  it("shows the influencer benefit when the backend confirms an influencer code", async () => {
    validateReferralCodeMock.mockResolvedValueOnce({
      valid: true,
      type: "influencer",
      trialDays: 15,
    });

    const result = await validateAndStoreReferralCode("creator30");

    expect(result.valid).toBe(true);
    expect(result.message).toContain("15 días Premium gratis");
    expect(getStoredReferralCode()).toBe("CREATOR30");
  });

  it("rejects invalid codes without storing them", async () => {
    validateReferralCodeMock.mockResolvedValueOnce({
      valid: false,
      type: null,
      trialDays: 0,
    });

    const result = await validateAndStoreReferralCode("5555");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Código no válido o expirado.");
    expect(getStoredReferralCode()).toBe("");
  });

  it("applies a pending OAuth referral code and clears storage", async () => {
    setStoredReferralCode("nsc-oauth");
    markOAuthReferralFlowPending();
    applyReferralCodeMock.mockResolvedValueOnce({
      referral: { type: "user" },
    });

    const result = await applyPendingOAuthReferralCode();

    expect(result.applied).toBe(true);
    expect(applyReferralCodeMock).toHaveBeenCalledWith("NSC-OAUTH");
    expect(getStoredReferralCode()).toBe("");
    expect(isOAuthReferralFlowPending()).toBe(false);
  });

  it("clears pending OAuth referral storage when nothing is stored", async () => {
    markOAuthReferralFlowPending();

    const result = await applyPendingOAuthReferralCode();

    expect(result.applied).toBe(false);
    expect(getStoredReferralCode()).toBe("");
    expect(isOAuthReferralFlowPending()).toBe(false);
  });
});

function createLocalStorageMock() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(index) {
      return Array.from(store.keys())[index] || null;
    },
    get length() {
      return store.size;
    },
  };
}
