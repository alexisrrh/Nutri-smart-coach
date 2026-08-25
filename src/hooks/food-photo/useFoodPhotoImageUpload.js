import { useCallback, useEffect, useRef } from "react";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

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

  const processImageFile = useCallback(
    async (file) => {
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

  const handleImage = useCallback(
    async (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        event.target.value = "";
        return;
      }

      await processImageFile(file);
      event.target.value = "";
    },
    [processImageFile]
  );

  const captureFoodPhoto = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return false;

    try {
      const photo =
        Capacitor.getPlatform() === "ios"
          ? await Camera.takePhoto({
              cameraDirection: CameraDirection.Rear,
              includeMetadata: true,
              quality: 85,
              saveToGallery: false,
              targetHeight: 1280,
              targetWidth: 1280,
            })
          : await Camera.getPhoto({
              direction: CameraDirection.Rear,
              resultType: CameraResultType.Uri,
              quality: 85,
              saveToGallery: false,
              source: CameraSource.Camera,
              height: 1280,
              width: 1280,
            });

      const file = await cameraPhotoToFile(photo);
      await processImageFile(file);
      return true;
    } catch (error) {
      if (isCameraCancellation(error)) return true;

      console.error("Error capturando imagen:", error);
      setError(getCameraErrorMessage(error));
      return true;
    }
  }, [processImageFile, setError]);

  const isNativeCameraAvailable = Capacitor.isNativePlatform();

  const handleCameraCapture = useCallback(
    async (event) => {
      if (isNativeCameraAvailable) {
        await captureFoodPhoto();
        return;
      }

      await handleImage(event);
    },
    [captureFoodPhoto, handleImage, isNativeCameraAvailable]
  );

  return {
    captureFoodPhoto,
    handleImage,
    handleCameraCapture,
    isNativeCameraAvailable,
    processImageFile,
  };
}

async function cameraPhotoToFile(photo) {
  const sourcePath =
    photo.webPath || Capacitor.convertFileSrc(photo.path || photo.uri || "");

  if (!sourcePath) {
    throw new Error("La camara no devolvio una imagen valida.");
  }

  const blob = await readImageBlob(sourcePath);
  const extension = getCameraImageExtension(photo, blob);
  const type = blob.type || `image/${extension}`;

  return new File([blob], `food-photo-${Date.now()}.${extension}`, {
    type,
    lastModified: Date.now(),
  });
}

async function readImageBlob(sourcePath) {
  try {
    const response = await fetch(sourcePath);

    if (!response.ok) {
      throw new Error(`No se pudo leer la imagen (${response.status}).`);
    }

    return response.blob();
  } catch (error) {
    return readImageBlobWithRequest(sourcePath, error);
  }
}

function readImageBlobWithRequest(sourcePath, cause) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", sourcePath);
    request.responseType = "blob";

    request.onload = () => {
      if (request.status >= 200 && request.status < 300 && request.response) {
        resolve(request.response);
        return;
      }

      reject(cause || new Error("No se pudo leer la imagen capturada."));
    };

    request.onerror = () => {
      reject(cause || new Error("No se pudo leer la imagen capturada."));
    };

    request.send();
  });
}

function getCameraImageExtension(photo, blob) {
  const format = String(photo.format || photo.metadata?.format || "").toLowerCase();
  const type = String(blob.type || "").toLowerCase();

  if (format === "png" || type === "image/png") return "png";
  if (format === "webp" || type === "image/webp") return "webp";
  if (format === "heic" || type === "image/heic") return "heic";
  if (format === "heif" || type === "image/heif") return "heif";

  return "jpg";
}

function isCameraCancellation(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();

  return (
    code.includes("cancel") ||
    message.includes("cancel") ||
    message.includes("cancelado") ||
    message.includes("cancelada") ||
    message.includes("no image selected") ||
    message.includes("user closed")
  );
}

function getCameraErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();

  if (
    code.includes("permission") ||
    code.includes("denied") ||
    message.includes("permission") ||
    message.includes("denied") ||
    message.includes("permiso")
  ) {
    return "No se pudo acceder a la camara. Revisa los permisos e intentalo de nuevo.";
  }

  return "No se pudo tomar la foto. Intentalo de nuevo o elige una imagen de la galeria.";
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
