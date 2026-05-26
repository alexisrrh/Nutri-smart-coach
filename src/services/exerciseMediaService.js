import { EXERCISE_LOCAL_MEDIA_FILES } from "../data/exerciseLocalMediaFiles";
import { EXERCISE_MEDIA_MAP } from "../data/exerciseMediaMap";

const PLACEHOLDER = {
  gif: "",
  image: "",
  placeholder: true,
  localGif: "",
  localGifCandidates: [],
  mediaKey: "",
  exerciseDbId: "",
  expectedName: "",
  target: "",
  equipment: "",
  source: "placeholder",
};

const mediaStatusByUrl = new Map();
const mediaPreloadPromises = new Map();
const mediaPreloadedUrls = new Set();

function getMediaKey(exercise) {
  return String(exercise?.mediaKey || exercise?.id || "").trim();
}

function getMediaMapping(exercise) {
  const mediaKey = getMediaKey(exercise);
  if (!mediaKey) return { mediaKey: "", mapping: null };

  return {
    mediaKey,
    mapping: EXERCISE_MEDIA_MAP[mediaKey] || null,
  };
}

function normalizeMediaUrl(url) {
  return String(url || "").trim();
}

function setMediaStatus(url, status) {
  const normalizedUrl = normalizeMediaUrl(url);
  if (!normalizedUrl) {
    return;
  }

  mediaStatusByUrl.set(normalizedUrl, status);

  if (status === "loaded" || status === "error") {
    mediaPreloadPromises.delete(normalizedUrl);
  }

  if (status === "loaded") {
    mediaPreloadedUrls.add(normalizedUrl);
  } else if (status === "error") {
    mediaPreloadedUrls.delete(normalizedUrl);
  }
}

export function getExerciseMediaStatus(url) {
  const normalizedUrl = normalizeMediaUrl(url);
  if (!normalizedUrl) {
    return "idle";
  }

  return mediaStatusByUrl.get(normalizedUrl) || "idle";
}

export function isExerciseMediaLoaded(url) {
  return getExerciseMediaStatus(url) === "loaded";
}

export function setExerciseMediaStatus(url, status) {
  setMediaStatus(url, status);
}

function isBrowser() {
  return typeof window !== "undefined" && typeof Image !== "undefined";
}

function getExerciseCandidatesFromSource(source) {
  if (!source) return [];

  if (typeof source === "string") {
    return [source];
  }

  if (Array.isArray(source)) {
    return source.flatMap((item) => getExerciseCandidatesFromSource(item));
  }

  if (Array.isArray(source.days)) {
    return source.days.flatMap((day) => getExerciseCandidatesFromSource(day));
  }

  if (Array.isArray(source.exercises)) {
    return source.exercises.flatMap((exercise) => getExerciseCandidatesFromSource(exercise));
  }

  if (source && typeof source === "object") {
    return getLocalExerciseCandidates(source);
  }

  return [];
}

function getKnownMediaCandidates(urlsOrExercises) {
  return Array.from(
    new Set(
      getExerciseCandidatesFromSource(urlsOrExercises)
        .map(normalizeMediaUrl)
        .filter(Boolean)
        .filter((candidate) => {
          const fileName = candidate.split("/").pop();
          if (!fileName) return false;

          if (!candidate.startsWith("/exercises/")) {
            return true;
          }

          return EXERCISE_LOCAL_MEDIA_FILES.has(fileName);
        })
    )
  );
}

function preloadMediaUrl(url) {
  const normalizedUrl = normalizeMediaUrl(url);
  if (!isBrowser() || !normalizedUrl) {
    return Promise.resolve("idle");
  }

  if (mediaPreloadedUrls.has(normalizedUrl)) {
    mediaStatusByUrl.set(normalizedUrl, "loaded");
    return Promise.resolve("loaded");
  }

  const currentStatus = getExerciseMediaStatus(normalizedUrl);
  if (currentStatus === "loaded") {
    mediaPreloadedUrls.add(normalizedUrl);
    return Promise.resolve("loaded");
  }

  if (currentStatus === "error") {
    return Promise.resolve("error");
  }

  const inFlight = mediaPreloadPromises.get(normalizedUrl);
  if (inFlight) {
    return inFlight;
  }

  setMediaStatus(normalizedUrl, "loading");

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      setMediaStatus(normalizedUrl, "loaded");
      resolve("loaded");
    };
    image.onerror = () => {
      setMediaStatus(normalizedUrl, "error");
      resolve("error");
    };
    image.src = normalizedUrl;
  });

  mediaPreloadPromises.set(normalizedUrl, promise);
  return promise;
}

export function preloadExerciseMedia(urlsOrExercises) {
  const mediaCandidates = getKnownMediaCandidates(urlsOrExercises);
  if (!mediaCandidates.length) {
    return Promise.resolve([]);
  }

  return Promise.allSettled(mediaCandidates.map((candidate) => preloadMediaUrl(candidate)));
}

export function preloadExercise(exercise) {
  return preloadExerciseMedia(exercise);
}

export function preloadExercises(exercises) {
  return preloadExerciseMedia(exercises);
}

export function getLocalExerciseCandidates(exercise) {
  const { mediaKey, mapping } = getMediaMapping(exercise);
  if (!mediaKey) return [];

  const configuredCandidates = [exercise?.gif, exercise?.image].filter(Boolean);
  const localCandidates = [
    ...configuredCandidates,
    mapping?.localGif || `/exercises/${mediaKey}.gif`,
    `/exercises/${mediaKey}.webp`,
  ];

  return Array.from(new Set(localCandidates.filter(Boolean)));
}

export function hasLocalExerciseMedia(exercise) {
  return getLocalExerciseCandidates(exercise).length > 0;
}

export function getExerciseMedia(exercise) {
  const { mediaKey, mapping } = getMediaMapping(exercise);
  if (!mediaKey) {
    return { ...PLACEHOLDER, mediaKey };
  }

  const localGifCandidates = getLocalExerciseCandidates(exercise);
  const localGif = localGifCandidates[0] || "";

  return {
    mediaKey,
    localGif,
    localGifCandidates,
    gif: localGif,
    image: "",
    placeholder: !localGif,
    exerciseDbId: mapping?.exerciseDbId || "",
    expectedName: mapping?.expectedName || exercise?.englishName || exercise?.name || "",
    target: mapping?.target || exercise?.muscle || "",
    equipment: mapping?.equipment || exercise?.equipment || "",
    source: localGif ? "localGif" : "placeholder",
  };
}

export function getLocalExerciseGif(exercise) {
  return getExerciseMedia(exercise).gif;
}

export function hasExerciseGif(exercise) {
  return Boolean(getLocalExerciseGif(exercise));
}
