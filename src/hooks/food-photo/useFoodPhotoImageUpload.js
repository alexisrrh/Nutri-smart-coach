import { useCallback, useEffect, useRef } from "react";

const TARGET_SIZE = 1 * 1024 * 1024;
const MAX_IMAGE_SIDE = 900;
const COMPRESSION_QUALITIES = [0.7, 0.62, 0.55];

export function useFoodPhotoImageUpload({
  preview,
  setPreview,
  setImage,
  setError,
  setResult,
}) {
  const previewRef = useRef(preview);

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleImage = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ];

      const isValid =
        allowedTypes.includes(file.type) ||
        /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file.name);

      if (!isValid) {
        setError("Formato no compatible. Usa JPG, PNG, WEBP o HEIC.");
        return;
      }

      try {
        setError("");
        setResult(null);

        const preparedImage = await prepareImageForUpload(file);

        if (previewRef.current) {
          URL.revokeObjectURL(previewRef.current);
        }

        setImage(preparedImage);
        const nextPreview = URL.createObjectURL(preparedImage);
        previewRef.current = nextPreview;
        setPreview(nextPreview);
      } catch (error) {
        console.error("Error preparando imagen:", error);
        setError("No se pudo preparar la imagen. Intenta con otra foto.");
      }
    },
    [setError, setImage, setPreview, setResult]
  );

  return {
    handleImage,
  };
}

async function prepareImageForUpload(file) {
  if (isHeicImage(file)) {
    return file;
  }

  for (const quality of COMPRESSION_QUALITIES) {
    const compressed = await compressImage(file, quality);

    if (compressed.size <= TARGET_SIZE) {
      return compressed;
    }
  }

  throw new Error("La imagen sigue siendo demasiado pesada.");
}

function isHeicImage(file) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

function compressImage(file, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      const longestSide = Math.max(image.width, image.height);
      const scale = Math.min(1, MAX_IMAGE_SIDE / longestSide);

      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo comprimir la imagen."));
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo cargar la imagen."));
    };

    image.src = objectUrl;
  });
}
