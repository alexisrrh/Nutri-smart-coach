import { EXERCISE_MEDIA_MAP } from "../data/exerciseMediaMap";
import { getExerciseImageUrl } from "./exerciseDbService";

const PLACEHOLDER = {
  gif: "",
  image: "",
  placeholder: true,
  localGif: "",
  remoteGifUrl: "",
  mediaKey: "",
  exerciseDbId: "",
  expectedName: "",
  target: "",
  equipment: "",
  source: "placeholder",
};

export function getExerciseMedia(exercise) {
  const mediaKey = String(exercise?.mediaKey || exercise?.id || "");
  if (!mediaKey) return { ...PLACEHOLDER };

  const mapping = EXERCISE_MEDIA_MAP[mediaKey];
  if (!mapping) {
    return {
      ...PLACEHOLDER,
      mediaKey,
    };
  }

  const localGif = mapping.localGif || "";
  const remoteGifUrl = mapping.remoteGifUrl || getExerciseImageUrl(mapping.exerciseDbId) || "";
  const image = exercise?.image || "";
  const hasGif = Boolean(localGif || remoteGifUrl);
  const hasImage = Boolean(image);

  return {
    mediaKey,
    localGif,
    remoteGifUrl,
    gif: localGif || remoteGifUrl || "",
    image: hasImage ? image : "",
    placeholder: !hasGif && !hasImage,
    exerciseDbId: mapping.exerciseDbId || "",
    expectedName: mapping.expectedName || exercise?.name || "",
    target: mapping.target || exercise?.muscle || "",
    equipment: mapping.equipment || exercise?.equipment || "",
    source: localGif ? "localGif" : remoteGifUrl ? "remoteGif" : hasImage ? "image" : "placeholder",
  };
}

export function getLocalExerciseGif(exercise) {
  return getExerciseMedia(exercise).gif;
}

export function hasExerciseGif(exercise) {
  return Boolean(getLocalExerciseGif(exercise));
}
