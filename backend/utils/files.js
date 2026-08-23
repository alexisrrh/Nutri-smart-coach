import crypto from "crypto";

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

export function getFileExtension(mimeType = "") {
  const normalizedMimeType = normalizeMimeType(mimeType);

  if (normalizedMimeType === "image/png") return "png";
  if (normalizedMimeType === "image/webp") return "webp";
  if (normalizedMimeType === "image/heic") return "heic";
  if (normalizedMimeType === "image/heif") return "heif";
  if (
    normalizedMimeType === "image/jpeg" ||
    normalizedMimeType === "image/jpg"
  ) {
    return "jpg";
  }

  throw new Error("Tipo de imagen no permitido");
}

export function createImageHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function isAllowedImageMimeType(mimeType = "") {
  return ALLOWED_IMAGE_MIME_TYPES.has(normalizeMimeType(mimeType));
}

export function hasAllowedImageExtension(fileName = "") {
  const extension = getOriginalFileExtension(fileName);

  return extension ? ALLOWED_IMAGE_EXTENSIONS.has(extension) : false;
}

export function hasValidImageSignature(file) {
  const buffer = file?.buffer;
  const mimeType = normalizeMimeType(file?.mimetype);

  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  if (mimeType === "image/heic" || mimeType === "image/heif") {
    if (buffer.toString("ascii", 4, 8) !== "ftyp") return false;

    const brand = buffer.toString("ascii", 8, 12);
    return ["heic", "heix", "hevc", "hevx", "heif", "mif1", "msf1"].includes(
      brand
    );
  }

  return false;
}

function getOriginalFileExtension(fileName = "") {
  const match = String(fileName).toLowerCase().match(/\.[a-z0-9]+$/);

  return match?.[0] || "";
}

function normalizeMimeType(mimeType = "") {
  return String(mimeType).split(";")[0].trim().toLowerCase();
}
