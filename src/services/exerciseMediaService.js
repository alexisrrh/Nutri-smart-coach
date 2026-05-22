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

export function getLocalExerciseCandidates(exercise) {
  const { mediaKey, mapping } = getMediaMapping(exercise);
  if (!mediaKey) return [];

  const firstCandidate = mapping?.localGif || `/exercises/${mediaKey}.webp`;
  const secondCandidate = `/exercises/${mediaKey}.gif`;

  return Array.from(new Set([firstCandidate, secondCandidate].filter(Boolean)));
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
