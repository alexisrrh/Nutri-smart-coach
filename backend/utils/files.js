import crypto from "crypto";

export function getFileExtension(mimeType = "") {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("jpg")) return "jpg";
  return "jpg";
}

export function createImageHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
