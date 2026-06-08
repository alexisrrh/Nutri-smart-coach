import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.fn();

vi.mock("./apiClient", () => ({
  request: requestMock,
}));

vi.mock("./referralOnboardingService", () => ({
  finalizeReferralCodeApplication: vi.fn(),
}));

import {
  clearStoredCreatorCode,
  getStoredCreatorCode,
  normalizeCreatorTrackingCode,
  setStoredCreatorCode,
  trackCreatorLinkClick,
} from "./creatorTrackingService";

describe("creatorTrackingService", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: createLocalStorageMock(),
    });
    requestMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes and stores pending creator codes", () => {
    expect(normalizeCreatorTrackingCode(" alexis fit ")).toBe("ALEXISFIT");

    setStoredCreatorCode(" alexis fit ");

    expect(getStoredCreatorCode()).toBe("ALEXISFIT");
  });

  it("tracks creator clicks without blocking on failure", async () => {
    requestMock.mockResolvedValueOnce({ ok: true, tracked: true });

    const result = await trackCreatorLinkClick("alexis fit");

    expect(requestMock).toHaveBeenCalledWith(
      "/creators/track-click",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "ALEXISFIT",
          visitorId: null,
        }),
      }),
      { operation: "registrar un clic de creador" }
    );
    expect(result.tracked).toBe(true);
  });

  it("returns a safe fallback if the tracking request fails", async () => {
    requestMock.mockRejectedValueOnce(new Error("network error"));

    const result = await trackCreatorLinkClick("alexis fit");

    expect(result).toEqual({ ok: true, tracked: false });
  });

  it("clears stored creator codes", () => {
    setStoredCreatorCode("alexis fit");
    clearStoredCreatorCode();

    expect(getStoredCreatorCode()).toBe("");
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
