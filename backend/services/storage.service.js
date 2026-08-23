import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { getFileExtension } from "../utils/files.js";

const SIGNED_URL_TTL_SECONDS = 10 * 60;

export async function uploadImageToSupabase({ bucket, userId, file }) {
  if (!process.env.SUPABASE_URL) {
    throw new Error("Falta SUPABASE_URL en Render");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en Render");
  }

  if (!file) {
    throw new Error("No se recibió archivo para subir");
  }

  const extension = getFileExtension(file.mimetype);
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error("ERROR STORAGE SUPABASE", {
      bucket,
      code: uploadError?.code || "STORAGE_UPLOAD_FAILED",
    });

    throw new Error(
      `No se pudo subir imagen al bucket ${bucket}: ${uploadError.message}`
    );
  }

  console.log("Imagen subida correctamente en Supabase Storage");

  return filePath;
}

export function getSupabaseStoragePath({ publicUrl, bucket }) {
  if (!publicUrl) return null;

  if (!/^https?:\/\//i.test(publicUrl)) {
    return publicUrl.replace(/^\/+/, "") || null;
  }

  try {
    const url = new URL(publicUrl);
    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
    ];
    const marker = markers.find((item) => url.pathname.includes(item));

    if (!marker) return null;

    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function createSignedImageUrl({ bucket, imageUrl }) {
  const imagePath = getSupabaseStoragePath({ publicUrl: imageUrl, bucket });

  if (!imagePath) return imageUrl || null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("Error creando signed URL de imagen:", {
      bucket,
      code: error?.code || "SIGNED_URL_FAILED",
    });
    return /^https?:\/\//i.test(imageUrl || "") ? imageUrl : null;
  }

  return data.signedUrl;
}

export async function signImageUrlFields(records, { bucket }) {
  if (!Array.isArray(records)) return [];

  return Promise.all(records.map((record) => signImageUrlField(record, { bucket })));
}

export async function signImageUrlField(record, { bucket }) {
  if (!record?.image_url) return record;

  return {
    ...record,
    image_url: await createSignedImageUrl({
      bucket,
      imageUrl: record.image_url,
    }),
  };
}
