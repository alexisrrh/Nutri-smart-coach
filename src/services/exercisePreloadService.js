import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { EXERCISE_LOCAL_MEDIA_FILES } from "../data/exerciseLocalMediaFiles";
import { getLocalExerciseCandidates } from "./exerciseMediaService";

const attemptedPaths = new Set();
const inFlightRequests = new Map();

const CRITICAL_MEDIA_KEYS = [
  "press-banca",
  "sentadilla",
  "hip-thrust",
  "jalon-pecho",
  "remo-barra",
  "curl-biceps",
];

function isBrowser() {
  return typeof window !== "undefined" && typeof Image !== "undefined";
}

function getExercisesFromSource(source) {
  if (!source) return [];

  if (Array.isArray(source)) {
    if (!source.length) return [];

    const looksLikeWorkoutDayList = source.some(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        (Array.isArray(item.exercises) || Array.isArray(item.muscles) || "day" in item)
    );

    if (looksLikeWorkoutDayList) {
      return source.flatMap((item) => getExercisesFromSource(item));
    }

    return source.filter((item) => item && (item.mediaKey || item.id || item.name));
  }

  if (Array.isArray(source.exercises)) {
    return source.exercises;
  }

  if (Array.isArray(source.days)) {
    return source.days.flatMap((day) => getExercisesFromSource(day));
  }

  return [];
}

function preloadPath(path) {
  if (!isBrowser() || !path) {
    return Promise.resolve(false);
  }

  if (attemptedPaths.has(path)) {
    return inFlightRequests.get(path) || Promise.resolve(true);
  }

  attemptedPaths.add(path);

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      inFlightRequests.delete(path);
      resolve(true);
    };
    image.onerror = () => {
      inFlightRequests.delete(path);
      resolve(false);
    };
    image.src = path;
  });

  inFlightRequests.set(path, promise);
  return promise;
}

function preloadExerciseCandidatePaths(exercise) {
  const candidates = getLocalExerciseCandidates(exercise);
  return candidates
    .filter((candidate) => {
      const fileName = String(candidate || "").split("/").pop();
      return fileName && EXERCISE_LOCAL_MEDIA_FILES.has(fileName);
    })
    .map((candidate) => preloadPath(candidate));
}

export function preloadExerciseMedia(exercises) {
  const list = getExercisesFromSource(exercises);
  if (!list.length) {
    return Promise.resolve([]);
  }

  return Promise.allSettled(list.flatMap((exercise) => preloadExerciseCandidatePaths(exercise)));
}

export function preloadCriticalExerciseMedia() {
  const criticalExercises = CRITICAL_MEDIA_KEYS.flatMap((mediaKey) =>
    EXERCISE_LIBRARY.filter((exercise) => exercise.mediaKey === mediaKey || exercise.id === mediaKey)
  );

  return preloadExerciseMedia(criticalExercises);
}

export function preloadRoutineExerciseMedia(routine) {
  return preloadExerciseMedia(routine);
}
