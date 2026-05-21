import { EXERCISE_LIBRARY } from "./exerciseLibrary";

const PRIORITY_MEDIA = {
  "press-banca": {
    exerciseDbId: "",
    expectedName: "Bench Press",
    target: "Pecho",
    equipment: "Barra y banco",
  },
  "press-inclinado-mancuernas": {
    exerciseDbId: "",
    expectedName: "Incline Dumbbell Press",
    target: "Pecho",
    equipment: "Mancuernas y banco",
  },
  "jalon-al-pecho": {
    exerciseDbId: "",
    expectedName: "Lat Pulldown",
    target: "Espalda",
    equipment: "Polea alta",
  },
  "remo-sentado": {
    exerciseDbId: "",
    expectedName: "Seated Cable Row",
    target: "Espalda",
    equipment: "Polea baja",
  },
  sentadilla: {
    exerciseDbId: "",
    expectedName: "Back Squat",
    target: "Piernas",
    equipment: "Barra",
  },
  "hip-thrust": {
    exerciseDbId: "",
    expectedName: "Hip Thrust",
    target: "Glúteos",
    equipment: "Barra y banco",
  },
  "peso-muerto-rumano": {
    exerciseDbId: "",
    expectedName: "Romanian Deadlift",
    target: "Piernas",
    equipment: "Barra o mancuernas",
  },
  zancadas: {
    exerciseDbId: "",
    expectedName: "Lunges",
    target: "Piernas",
    equipment: "Mancuernas o peso corporal",
  },
  "curl-biceps": {
    exerciseDbId: "",
    expectedName: "Biceps Curl",
    target: "Bíceps",
    equipment: "Mancuernas",
  },
  "extension-triceps": {
    exerciseDbId: "",
    expectedName: "Triceps Pushdown",
    target: "Tríceps",
    equipment: "Polea",
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
  };
}

export const EXERCISE_MEDIA_MAP = Object.fromEntries(
  EXERCISE_LIBRARY.map((exercise) => [exercise.mediaKey || exercise.id, buildMediaEntry(exercise)])
);

