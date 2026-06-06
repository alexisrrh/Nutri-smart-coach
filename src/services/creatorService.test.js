import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.fn();

vi.mock("./apiClient", () => ({
  request: requestMock,
}));

const {
  buildCreatorShareText,
  copyCreatorCode,
  getCreatorStatus,
  shareCreatorCode,
  submitCreatorApplication,
} = await import("./creatorService");

describe("creatorService", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("builds the creator share text with 15 days premium free", () => {
    expect(buildCreatorShareText("CREATOR30")).toBe(
      "Únete a NutriSmart Coach con mi código CREATOR30 y consigue 15 días Premium gratis."
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

  it("shares the creator code with the premium invite message", async () => {
    const share = vi.fn().mockResolvedValueOnce();
    vi.stubGlobal("window", {
      location: { origin: "https://app.example.com" },
    });
    vi.stubGlobal("navigator", {
      share,
      clipboard: { writeText: vi.fn() },
    });

    await shareCreatorCode("creator30");

    expect(share).toHaveBeenCalledWith({
      title: "NutriSmart Coach",
      text: "Únete a NutriSmart Coach con mi código CREATOR30 y consigue 15 días Premium gratis.",
      url: "https://app.example.com",
    });
  });
});
