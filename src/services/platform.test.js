import { afterEach, describe, expect, it, vi } from "vitest";
import { getRuntimePlatform } from "./platform";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getRuntimePlatform", () => {
  it("defaults to web", () => {
    expect(getRuntimePlatform()).toBe("web");
  });

  it("uses Capacitor when available", () => {
    vi.stubGlobal("window", {
      Capacitor: {
        getPlatform: () => "ios",
      },
      navigator: {
        userAgent: "Mozilla/5.0",
      },
    });

    expect(getRuntimePlatform()).toBe("ios");
  });

  it("falls back to user agent detection", () => {
    vi.stubGlobal("window", {
      navigator: {
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36",
      },
    });

    expect(getRuntimePlatform()).toBe("android");
  });
});
