const DEV_API_URL =
  import.meta.env.VITE_API_URL_DEV ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:3000";

const PROD_API_URL = import.meta.env.VITE_API_URL || "";

export const API_URL = (
  import.meta.env.PROD ? PROD_API_URL : DEV_API_URL
)
  .trim()
  .replace(/\/$/, "");

if (!API_URL) {
  throw new Error(
    "Falta VITE_API_URL para producción o VITE_API_URL_DEV para desarrollo."
  );
}
