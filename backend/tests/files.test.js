import { describe, expect, it } from "vitest";
import { createImageHash, getFileExtension } from "../utils/files.js";

describe("backend file utils", () => {
  it("returns the expected file extension for common mime types", () => {
    expect(getFileExtension("image/png")).toBe("png");
    expect(getFileExtension("image/webp")).toBe("webp");
    expect(getFileExtension("image/jpeg")).toBe("jpg");
    expect(getFileExtension("image/jpg")).toBe("jpg");
    expect(getFileExtension("application/octet-stream")).toBe("jpg");
  });

  it("creates a stable sha256 hash", () => {
    expect(createImageHash(Buffer.from("abc"))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});
