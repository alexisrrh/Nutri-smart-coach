const RAPID_API_BASE_URL = "https://exercisedb.p.rapidapi.com";
const DEFAULT_RAPID_API_HOST = "exercisedb.p.rapidapi.com";

function getConfig() {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || "";
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST || DEFAULT_RAPID_API_HOST;

  return {
    apiKey,
    apiHost,
    apiBaseUrl: RAPID_API_BASE_URL,
    hasCredentials: Boolean(apiKey && apiHost),
  };
}

function buildHeaders() {
  const { apiKey, apiHost } = getConfig();

  if (!apiKey) {
    throw new Error("Falta VITE_RAPIDAPI_KEY");
  }

  return {
    "x-rapidapi-key": apiKey,
    "x-rapidapi-host": apiHost,
  };
}

async function requestJson(path, signal) {
  const { apiBaseUrl } = getConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: buildHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`RapidAPI respondió ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response.text();
  }

  return response.json();
}

function normalizeExercise(item = {}) {
  return {
    id: String(item.id || item.exerciseId || item._id || item.exercise_id || ""),
    name: item.name || item.title || "",
    target: item.target || item.bodyPart || item.targetMuscle || "",
    equipment: item.equipment || item.equipmentType || "",
    gifUrl:
      item.gifUrl ||
      item.gif ||
      item.media?.gifUrl ||
      item.media?.gif ||
      item.animationUrl ||
      "",
    imageUrl:
      item.imageUrl ||
      item.image ||
      item.thumbnail ||
      item.photo ||
      item.media?.imageUrl ||
      "",
    remoteGifUrl: item.remoteGifUrl || item.gifUrl || item.gif || "",
    description: item.description || item.instructions?.[0] || "",
    secondaryMuscles: Array.isArray(item.secondaryMuscles)
      ? item.secondaryMuscles
      : Array.isArray(item.secondary_muscles)
        ? item.secondary_muscles
        : [],
    raw: item,
  };
}

function toExerciseList(payload) {
  const items = Array.isArray(payload)
    ? payload
    : payload?.results || payload?.data || payload?.response || payload?.exercises || [];

  return items.map(normalizeExercise).filter((item) => item.name || item.id);
}

async function tryPaths(paths, signal) {
  let lastError = null;

  for (const path of paths) {
    try {
      const payload = await requestJson(path, signal);
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo cargar ExerciseDB");
}

export function hasExerciseDbCredentials() {
  return getConfig().hasCredentials;
}

export function getExerciseImageUrl(exerciseDbId) {
  if (!exerciseDbId) return "";
  return `http://localhost:3000/exercise-image/${encodeURIComponent(exerciseDbId)}`;
}

export async function fetchExerciseImageBlobUrl(exerciseDbId, signal) {
  const imageUrl = getExerciseImageUrl(exerciseDbId);
  if (!imageUrl) {
    throw new Error("Falta el ID del ejercicio");
  }

  const response = await fetch(imageUrl, {
    method: "GET",
    headers: buildHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`RapidAPI respondió ${response.status}`);
  }

  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
}

export async function searchExercisesByName(name, signal) {
  if (!name) {
    throw new Error("Falta el nombre de búsqueda");
  }

  const payload = await requestJson(`/exercises/name/${encodeURIComponent(name)}`, signal);
  return toExerciseList(payload);
}

export async function getExerciseById(exerciseId, signal) {
  if (!exerciseId) {
    throw new Error("Falta el ID del ejercicio");
  }

  const payload = await tryPaths(
    [
      `/exercises/exercise/${encodeURIComponent(exerciseId)}`,
      `/exercises/id/${encodeURIComponent(exerciseId)}`,
      `/exercises/${encodeURIComponent(exerciseId)}`,
    ],
    signal
  );

  console.log("exercise db response", payload);

  const list = toExerciseList(payload);
  return list[0] || normalizeExercise(Array.isArray(payload) ? payload[0] : payload);
}

export async function resolveExerciseDbMedia(exercise, signal) {
  const exerciseDbId = String(exercise?.exerciseDbId || "").trim();
  const mediaKey = String(exercise?.mediaKey || exercise?.id || exerciseDbId || "");

  if (!exerciseDbId) {
    return {
      mediaKey,
      exerciseDbId: "",
      remoteGifUrl: "",
      remoteImageUrl: "",
      remoteName: "",
      target: "",
      equipment: "",
      description: "",
      secondaryMuscles: [],
    };
  }

  const exerciseRecord = await getExerciseById(exerciseDbId, signal);
  const resolved = {
    mediaKey,
    exerciseDbId,
    remoteGifUrl: getExerciseImageUrl(exerciseDbId),
    remoteImageUrl: "",
    remoteName: exerciseRecord.name || "",
    target: exerciseRecord.target || "",
    equipment: exerciseRecord.equipment || "",
    description: exerciseRecord.description || "",
    secondaryMuscles: exerciseRecord.secondaryMuscles || [],
    raw: exerciseRecord.raw || exerciseRecord,
  };

  console.log("exercise db response", resolved);
  return resolved;
}

export async function downloadRemoteAsset(url, filename) {
  if (!url) {
    throw new Error("No hay media para descargar");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo descargar el archivo (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);

    return { success: true, method: "blob" };
  } catch (error) {
    window.open(url, "_blank", "noopener,noreferrer");
    return {
      success: false,
      method: "open",
      error: error instanceof Error ? error.message : "No se pudo descargar",
    };
  }
}
