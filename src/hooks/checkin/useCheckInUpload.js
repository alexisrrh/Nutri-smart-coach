import { useEffect, useRef, useState } from "react";

export function useCheckInUpload({ setError, setMessage }) {
  const previewRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function handlePhoto(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Máximo 4MB.");
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    setError("");
    setMessage("");
    setFile(selectedFile);

    const nextPreview = URL.createObjectURL(selectedFile);
    previewRef.current = nextPreview;
    setPreview(nextPreview);
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
