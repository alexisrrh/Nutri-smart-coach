import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const TARGET_SIZE = 1.2 * 1024 * 1024;
const MAX_IMAGE_SIDE = 900;
const COMPRESSION_QUALITIES = [0.7, 0.62, 0.55, 0.48];

export function useCheckInUpload({ setError, setMessage = () => {} }) {
  const { t } = useTranslation();
  const previewRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  async function handlePhoto(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError(t("checkin.errors.mustBeImage"));
      return;
    }

    setError("");
    setMessage("");

    try {
      const preparedFile = await prepareCheckInImage(selectedFile);

      if (previewRef.current) URL.revokeObjectURL(previewRef.current);

      setFile(preparedFile);

      const nextPreview = URL.createObjectURL(preparedFile);
      previewRef.current = nextPreview;
      setPreview(nextPreview);
    } catch (error) {
      console.error("Error preparando imagen de check-in:", error);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setFile(null);
      setPreview(null);
      setError(t("checkin.errors.optimizeFailed"));
    } finally {
      e.target.value = "";
    }
  }

  function clearUpload() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setFile(null);
    setPreview(null);
  }

  return {
    clearUpload,
    file,
    handlePhoto,
    preview,
    setFile,
    setPreview,
  };
}

async function prepareCheckInImage(file) {
  if (isHeicImage(file)) {
    if (file.size <= TARGET_SIZE) return file;
    throw new Error(i18n.t("checkin.errors.heicTooHeavy"));
  }

  for (const quality of COMPRESSION_QUALITIES) {
    const compressed = await compressImage(file, quality);

    if (compressed.size <= TARGET_SIZE) {
      return compressed;
    }
  }

  throw new Error(i18n.t("checkin.errors.imageStillTooHeavy"));
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
        reject(new Error(i18n.t("checkin.errors.processImageFailed")));
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(i18n.t("checkin.errors.compressImageFailed")));
            return;
          }

          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        },
        "image/jpeg",
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(i18n.t("checkin.errors.loadImageFailed")));
    };

    image.src = objectUrl;
  });
}
