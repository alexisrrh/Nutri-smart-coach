import { EXERCISE_LIBRARY } from "./exerciseLibrary";

// TODO: Completar IDs exactos manualmente desde ExerciseDB
const PRIORITY_MEDIA = {
  "press-banca": {
    exerciseDbId: "0025",
    expectedName: "Bench Press",
    target: "Pecho",
    equipment: "Barra y banco",
    remoteGifUrl: "",
  },
  "press-inclinado-mancuernas": {
    exerciseDbId: "",
    expectedName: "Incline Dumbbell Press",
    target: "Pecho",
    equipment: "Mancuernas y banco",
    remoteGifUrl: "",
  },
  "jalon-al-pecho": {
    exerciseDbId: "",
    expectedName: "Lat Pulldown",
    target: "Espalda",
    equipment: "Polea alta",
    remoteGifUrl: "",
  },
  "remo-sentado": {
    exerciseDbId: "",
    expectedName: "Seated Cable Row",
    target: "Espalda",
    equipment: "Polea baja",
    remoteGifUrl: "",
  },
  sentadilla: {
    exerciseDbId: "",
    expectedName: "Back Squat",
    target: "Piernas",
    equipment: "Barra",
    remoteGifUrl: "",
  },
  "hip-thrust": {
    exerciseDbId: "",
    expectedName: "Hip Thrust",
    target: "Glúteos",
    equipment: "Barra y banco",
    remoteGifUrl: "",
  },
  "peso-muerto-rumano": {
    exerciseDbId: "",
    expectedName: "Romanian Deadlift",
    target: "Piernas",
    equipment: "Barra o mancuernas",
    remoteGifUrl: "",
  },
  zancadas: {
    exerciseDbId: "",
    expectedName: "Lunges",
    target: "Piernas",
    equipment: "Mancuernas o peso corporal",
    remoteGifUrl: "",
  },
  "curl-biceps": {
    exerciseDbId: "",
    expectedName: "Biceps Curl",
    target: "Bíceps",
    equipment: "Mancuernas",
    remoteGifUrl: "",
  },
  "extension-triceps": {
    exerciseDbId: "",
    expectedName: "Triceps Pushdown",
    target: "Tríceps",
    equipment: "Polea",
    remoteGifUrl: "",
  },
};

function buildMediaEntry(exercise) {
  const mediaKey = exercise.mediaKey || exercise.id;
  const override = PRIORITY_MEDIA[mediaKey] || {};

  return {
    localGif: `/exercises/${mediaKey}.webp`,
    exerciseDbId: override.exerciseDbId || "",
    expectedName: override.expectedName || exercise.name,
    target: override.target || exercise.muscle,
    equipment: override.equipment || exercise.equipment,
    remoteGifUrl: override.remoteGifUrl || "",
  };
}

export const EXERCISE_MEDIA_MAP = Object.fromEntries(
  EXERCISE_LIBRARY.map((exercise) => [exercise.mediaKey || exercise.id, buildMediaEntry(exercise)])
);
