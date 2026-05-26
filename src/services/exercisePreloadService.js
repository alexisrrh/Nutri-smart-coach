import { EXERCISE_LIBRARY } from "../data/exerciseLibrary";
import { preloadExerciseMedia as preloadExerciseMediaInternal } from "./exerciseMediaService";

const CRITICAL_MEDIA_KEYS = [
  "press-banca",
  "sentadilla",
  "hip-thrust",
  "jalon-pecho",
  "remo-barra",
  "curl-biceps",
];

export function preloadExerciseMedia(exercises) {
  return preloadExerciseMediaInternal(exercises);
}

export function preloadCriticalExerciseMedia() {
  const criticalExercises = CRITICAL_MEDIA_KEYS.flatMap((mediaKey) =>
    EXERCISE_LIBRARY.filter((exercise) => exercise.mediaKey === mediaKey || exercise.id === mediaKey)
  );

  return preloadExerciseMediaInternal(criticalExercises);
}

export function preloadRoutineExerciseMedia(routine) {
  return preloadExerciseMediaInternal(routine);
}
