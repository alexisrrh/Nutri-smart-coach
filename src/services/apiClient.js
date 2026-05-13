import { API_URL } from "../config/api";

export async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), options);
  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        data?.detail ||
        `Error del servidor: ${response.status}`
    );
  }

  return data;
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = String(path || "").replace(/^\/+/, "");

  return `${API_URL}/${cleanPath}`;
}
