import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.fn();

vi.mock("./apiClient", () => ({
  request: requestMock,
}));

const {
  clearCreatorPanelCache,
  buildCreatorJoinLink,
  buildCreatorShareText,
  copyCreatorCode,
  copyCreatorLink,
  getCreatorPanelCache,
  getCreatorStatus,
  loadCreatorStatus,
  shareCreatorCode,
  submitCreatorApplication,
  setCreatorPanelCache,
  updateCreatorCode,
} = await import("./creatorService");

describe("creatorService", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("stores and reads creator panel cache per user", () => {
    vi.stubGlobal("localStorage", createLocalStorageMock());

    const cached = setCreatorPanelCache("user-1", {
      status: "approved",
      creatorCode: "NUTRIALEXIS",
      stats: {
        registeredUsers: 12,
      },
      payouts: {
        availableCommissionAmount: 8.5,
      },
    });

    expect(cached.status).toBe("approved");
    expect(cached.creatorCode).toBe("NUTRIALEXIS");
    expect(cached.joinUrl).toContain("NUTRIALEXIS");
    expect(cached.payouts.availableCommissionAmount).toBe(8.5);
    expect(getCreatorPanelCache("user-1")).toMatchObject({
      status: "approved",
      creatorCode: "NUTRIALEXIS",
    });
  });

  it("loads creator status once and caches the normalized response", async () => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
    requestMock.mockResolvedValueOnce({
      application: null,
      status: "approved",
      creatorCode: "NUTRIALEXIS",
      stats: { registeredUsers: 1 },
    });

    const [first, second] = await Promise.all([
      loadCreatorStatus("user-1", { forceRefresh: true }),
      loadCreatorStatus("user-1", { forceRefresh: true }),
    ]);

    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(first.status).toBe("approved");
    expect(second.creatorCode).toBe("NUTRIALEXIS");
    expect(getCreatorPanelCache("user-1")).toMatchObject({
      status: "approved",
      creatorCode: "NUTRIALEXIS",
    });
  });

  it("clears creator panel cache for a specific user", () => {
    vi.stubGlobal("localStorage", createLocalStorageMock());

    setCreatorPanelCache("user-1", {
      status: "approved",
      creatorCode: "NUTRIALEXIS",
    });

    clearCreatorPanelCache("user-1");

    expect(getCreatorPanelCache("user-1")).toBeNull();
  });

  it("loads creator status from the backend", async () => {
    requestMock.mockResolvedValueOnce({
      application: null,
      status: "none",
      creatorCode: null,
      stats: null,
    });

    const result = await getCreatorStatus();

    expect(requestMock).toHaveBeenCalledWith(
      "/creators/me",
      {},
      { operation: "cargar tu panel de creadores" }
    );
    expect(result.status).toBe("none");
  });

  it("submits a creator application", async () => {
    requestMock.mockResolvedValueOnce({
      status: "pending",
      minimumFollowersMet: true,
      application: { id: "app-1" },
    });

    const result = await submitCreatorApplication({
      socialPlatform: "instagram",
      socialHandle: "@creator",
      followersCount: 6200,
      proofUrl: "https://example.com",
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/creators/apply",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialPlatform: "instagram",
          socialHandle: "@creator",
          followersCount: 6200,
          proofUrl: "https://example.com",
        }),
      }),
      { operation: "enviar tu solicitud de creador" }
    );
    expect(result.status).toBe("pending");
  });

  it("updates the creator code once", async () => {
    requestMock.mockResolvedValueOnce({
      status: "approved",
      creatorCode: "ALEXISFIT",
      creatorCodeCustomized: true,
      stats: {
        registeredUsers: 0,
      },
    });

    const result = await updateCreatorCode("alexisfit");

    expect(requestMock).toHaveBeenCalledWith(
      "/creators/code",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "ALEXISFIT",
        }),
      }),
      { operation: "actualizar tu código de creador" }
    );
    expect(result.creatorCode).toBe("ALEXISFIT");
    expect(result.creatorCodeCustomized).toBe(true);
  });

  it("builds the creator share text with 15 days premium free", () => {
    expect(buildCreatorShareText("CREATOR30")).toBe(
      "Únete a NutriSmart Coach con mi código CREATOR30 y consigue 15 días Premium gratis."
    );
  });

  it("builds the creator join link from the configured base url", () => {
    vi.stubEnv("VITE_CREATOR_JOIN_BASE_URL", "https://partner.example.com");

    expect(buildCreatorJoinLink("creator30")).toBe(
      "https://partner.example.com/join?creator=CREATOR30"
    );
  });

  it("copies the creator code to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValueOnce();
    vi.stubGlobal("navigator", {
      clipboard: { writeText },
    });

    await copyCreatorCode(" creator30 ");

    expect(writeText).toHaveBeenCalledWith("CREATOR30");
  });

  it("copies the creator join link to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValueOnce();
    vi.stubGlobal("navigator", {
      clipboard: { writeText },
    });
    vi.stubEnv("VITE_CREATOR_JOIN_BASE_URL", "https://partner.example.com");

    await copyCreatorLink(" creator30 ");

    expect(writeText).toHaveBeenCalledWith(
      "https://partner.example.com/join?creator=CREATOR30"
    );
  });

  it("shares the creator code with the premium invite message", async () => {
    const share = vi.fn().mockResolvedValueOnce();
    vi.stubGlobal("navigator", {
      share,
      clipboard: { writeText: vi.fn() },
    });
    vi.stubEnv("VITE_CREATOR_JOIN_BASE_URL", "https://partner.example.com");

    await shareCreatorCode("creator30");

    expect(share).toHaveBeenCalledWith({
      title: "NutriSmart Coach",
      text: "Únete a NutriSmart Coach con mi código CREATOR30 y consigue 15 días Premium gratis.",
      url: "https://partner.example.com/join?creator=CREATOR30",
    });
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
