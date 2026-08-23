import multer from "multer";
import {
  hasAllowedImageExtension,
  hasValidImageSignature,
  isAllowedImageMimeType,
} from "../utils/files.js";

export const MAX_IMAGE_FILE_SIZE = 1.5 * 1024 * 1024;
export const MAX_UPLOAD_FIELD_SIZE = 16 * 1024;
export const MAX_UPLOAD_FIELDS = 20;
export const MAX_UPLOAD_PARTS = MAX_UPLOAD_FIELDS + 1;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: MAX_UPLOAD_FIELD_SIZE,
    fields: MAX_UPLOAD_FIELDS,
    fileSize: MAX_IMAGE_FILE_SIZE,
    files: 1,
    parts: MAX_UPLOAD_PARTS,
  },
  fileFilter: (_req, file, callback) => {
    if (
      !isAllowedImageMimeType(file.mimetype) ||
      !hasAllowedImageExtension(file.originalname)
    ) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    }

    return callback(null, true);
  },
});

export function uploadSingleImage(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "La imagen es demasiado grande. Intenta con una foto más ligera.",
        });
      }

      if (
        error?.code === "LIMIT_FIELD_COUNT" ||
        error?.code === "LIMIT_FIELD_VALUE" ||
        error?.code === "LIMIT_FILE_COUNT" ||
        error?.code === "LIMIT_PART_COUNT"
      ) {
        return res.status(400).json({
          error: "La solicitud contiene demasiados datos.",
        });
      }

      if (error?.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "Formato de imagen no permitido.",
        });
      }

      if (error) return next(error);

      if (req.file && !hasValidImageSignature(req.file)) {
        return res.status(400).json({
          error: "El archivo no coincide con una imagen válida.",
        });
      }

      return next();
    });
  };
}
