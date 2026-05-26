import { Dumbbell } from "lucide-react";
import { memo, useMemo, useState } from "react";
import {
  getExerciseMedia,
  getExerciseMediaStatus,
  getLocalExerciseCandidates,
  isExerciseMediaLoaded,
  setExerciseMediaStatus,
} from "../../services/exerciseMediaService";

function ExerciseMediaFrame({
  exercise,
  className = "",
  showLabels = false,
  variant = "default",
}) {
  const media = useMemo(() => getExerciseMedia(exercise), [exercise]);
  const localCandidates = useMemo(
    () => getLocalExerciseCandidates(exercise),
    [exercise]
  );
  const initialCandidateIndex = useMemo(() => {
    if (!localCandidates.length) return -1;

    const loadedIndex = localCandidates.findIndex((candidate) => isExerciseMediaLoaded(candidate));
    if (loadedIndex >= 0) {
      return loadedIndex;
    }

    const availableIndex = localCandidates.findIndex(
      (candidate) => getExerciseMediaStatus(candidate) !== "error"
    );
    return availableIndex >= 0 ? availableIndex : -1;
  }, [localCandidates]);
  const [candidateIndex, setCandidateIndex] = useState(() =>
    initialCandidateIndex >= 0 ? initialCandidateIndex : 0
  );
  const currentSrc = localCandidates[candidateIndex] || "";
  const currentStatus = currentSrc ? getExerciseMediaStatus(currentSrc) : "idle";
  const [imageState, setImageState] = useState(() => {
    if (!currentSrc) {
      return initialCandidateIndex < 0 ? "error" : "loading";
    }

    if (currentStatus === "loaded") {
      return "loaded";
    }

    if (currentStatus === "error") {
      return "error";
    }

    return "loading";
  });
  const failed = imageState === "error" || currentStatus === "error" || (initialCandidateIndex < 0 && !currentSrc);
  const loading = !failed && imageState !== "loaded" && currentStatus !== "loaded";

  function handleError() {
    setExerciseMediaStatus(currentSrc, "error");
    const nextIndex = candidateIndex + 1;
    if (nextIndex < localCandidates.length) {
      setCandidateIndex(nextIndex);
      const nextSrc = localCandidates[nextIndex] || "";
      const nextStatus = nextSrc ? getExerciseMediaStatus(nextSrc) : "idle";
      setImageState(
        nextSrc ? (nextStatus === "loaded" ? "loaded" : nextStatus === "error" ? "error" : "loading") : "error"
      );
      return;
    }

    setImageState("error");
  }

  return (
    <figure
      data-variant={variant}
      className={[
        "relative overflow-hidden rounded-[1.05rem] border border-[var(--app-border)] bg-[var(--app-card)]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_34px_var(--app-glow),0_0_42px_var(--app-glow)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,color-mix(in_srgb,var(--app-primary)_20%,transparent),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.16),rgba(0,0,0,0.02))]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

      <div
        className={[
          "relative flex h-full min-h-0 items-center justify-center overflow-hidden",
          currentSrc && !failed
            ? "bg-white"
            : "bg-[linear-gradient(180deg,rgba(7,10,18,0.95),rgba(13,18,30,0.96))]",
        ].join(" ")}
      >
        {currentSrc && !failed ? (
          <>
              <img
  key={`${media.mediaKey}-${currentSrc}`}
  src={currentSrc}
  alt={exercise?.name || "Exercise media"}
  loading="eager"
  decoding="async"
  onLoad={() => {
    setExerciseMediaStatus(currentSrc, "loaded");
    setImageState("loaded");
  }}
  onError={handleError}
              className={[
                "block h-full w-full object-contain object-center transition-[opacity,transform,filter] duration-500 ease-out",
                loading ? "scale-[0.985] opacity-0 blur-[1px]" : "scale-100 opacity-100",
              ].join(" ")}
            />
            {loading ? <LoadingOverlay /> : null}
          </>
        ) : (
          <>
            <PlaceholderState exercise={exercise} media={media} />
            {loading ? <LoadingOverlay /> : null}
          </>
        )}
      </div>

      {showLabels ? (
        <figcaption className="relative border-t border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] px-2.5 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label="Músculo principal" value={exercise?.muscle || "—"} />
            <Badge
              label="Músculos secundarios"
              value={Array.isArray(exercise?.secondaryMuscles) && exercise.secondaryMuscles.length
                ? exercise.secondaryMuscles.join(" · ")
                : "Sin secundarios"}
            />
          </div>
        </figcaption>
      ) : null}
    </figure>
  );
}

function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 animate-pulse bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.04)_100%)] bg-[length:200%_100%] opacity-70" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_0_20px_var(--app-glow)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-primary)] border-t-transparent" />
        </div>
      </div>
    </div>
  );
}

function PlaceholderState({ exercise, media }) {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,var(--app-primary-soft),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.02),transparent_32%)]" />
      <div className="relative z-10 grid place-items-center gap-2 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
          <Dumbbell size={24} />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Sin media
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-[var(--app-muted)]">
            {exercise?.name || media?.expectedName || "Ejercicio"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="min-w-0 flex-1 rounded-[0.8rem] border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5">
      <p className="text-[7px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[10px] font-black text-[var(--app-text)]">{value}</p>
    </div>
  );
}

export default memo(ExerciseMediaFrame);
