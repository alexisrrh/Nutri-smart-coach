import multer from "multer";

export const MAX_IMAGE_FILE_SIZE = 1.5 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_FILE_SIZE },
});

export function uploadSingleImage(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "La imagen es demasiado grande. Intenta con una foto más ligera.",
        });
      }

      if (error) return next(error);

      return next();
    });
  };
}
