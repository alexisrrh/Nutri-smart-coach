import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { getFileExtension } from "../utils/files.js";

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
    console.error("ERROR STORAGE SUPABASE:", uploadError);

    throw new Error(
      `No se pudo subir imagen al bucket ${bucket}: ${uploadError.message}`
    );
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!publicData?.publicUrl) {
    throw new Error("Supabase no devolvió publicUrl");
  }

  console.log("Imagen subida correctamente:", publicData.publicUrl);

  return publicData.publicUrl;
}

export function getSupabaseStoragePath({ publicUrl, bucket }) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}
