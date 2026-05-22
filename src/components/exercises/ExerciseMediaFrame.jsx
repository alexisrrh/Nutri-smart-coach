import { Download, Dumbbell } from "lucide-react";
import { memo, useState } from "react";
import { downloadRemoteAsset } from "../../services/exerciseDbService";
import { getExerciseMedia } from "../../services/exerciseMediaService";

function ExerciseMediaFrame({
  exercise,
  className = "",
  showLabels = false,
  allowDownload = false,
  downloadCompact = false,
}) {
  const media = getExerciseMedia(exercise);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(media.localGif || media.remoteGifUrl));
  const [sourceMode, setSourceMode] = useState(
    media.localGif ? "local" : media.remoteGifUrl ? "remote" : "placeholder"
  );

  const currentSrc =
    sourceMode === "local" ? media.localGif : sourceMode === "remote" ? media.remoteGifUrl : "";
  const hasGif = sourceMode === "local" || sourceMode === "remote";
  const hasRemoteDownload = sourceMode === "remote" && Boolean(media.remoteGifUrl);
  const shouldShowImage = Boolean(currentSrc) && !failed;
  const secondaryMuscles = Array.isArray(exercise?.secondaryMuscles)
    ? exercise.secondaryMuscles.slice(0, 3)
    : [];

  console.log("selected exercise", exercise);
  console.log("media", media);
  console.log("resolved media", media);

  const frameTone =
    sourceMode === "remote" || sourceMode === "local"
      ? "shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_34px_var(--app-glow),0_0_42px_var(--app-glow)]"
      : "shadow-[0_12px_28px_var(--app-glow)]";

  function handleLocalError() {
    console.log("local gif failed", media.localGif);

    if (media.remoteGifUrl && sourceMode !== "remote") {
      console.log("trying remote exercise db", media.exerciseDbId);
      setSourceMode("remote");
      setFailed(false);
      setLoading(true);
      return;
    }

    if (sourceMode === "remote") {
      console.log("remote fetch failed", new Error("Remote image could not be rendered"));
    }

    setFailed(true);
    setLoading(false);
  }

  async function handleDownload(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!media.remoteGifUrl) return;

    await downloadRemoteAsset(
      media.remoteGifUrl,
      `${exercise?.mediaKey || exercise?.id || "exercise"}.gif`
    );
  }

  function handleDownloadKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleDownload(event);
  }

  return (
    <figure
      className={[
        "relative overflow-hidden rounded-[1.05rem] border border-[var(--app-border)] bg-[var(--app-card)]",
        frameTone,
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,color-mix(in_srgb,var(--app-primary)_20%,transparent),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.16),rgba(0,0,0,0.02))]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

      <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(7,10,18,0.95),rgba(13,18,30,0.96))]">
        {shouldShowImage ? (
          <>
            <img
              key={currentSrc}
              src={currentSrc}
              alt={exercise?.name || "Exercise media"}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoading(false)}
              onLoadCapture={() => {
                if (sourceMode === "remote") {
                  console.log("remote gif resolved", currentSrc);
                }
              }}
              onError={handleLocalError}
              className={[
                "h-full w-full object-contain transition-[opacity,transform,filter] duration-500 ease-out",
                loading ? "scale-[0.985] opacity-0 blur-[1px]" : "scale-100 opacity-100",
              ].join(" ")}
            />
            {loading ? <LoadingOverlay /> : null}
          </>
        ) : (
          <>
            <PlaceholderState
              exercise={exercise}
              media={media}
              loading={loading}
            />
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
              value={secondaryMuscles.length ? secondaryMuscles.join(" · ") : "Sin secundarios"}
            />
          </div>
        </figcaption>
      ) : null}

      {hasGif ? (
        <div className="pointer-events-none absolute left-2 top-2">
          <span className="rounded-full border border-[color-mix(in_srgb,var(--app-primary)_55%,white_5%)] bg-[color-mix(in_srgb,var(--app-card)_78%,transparent)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)] backdrop-blur-md">
            GIF REAL
          </span>
        </div>
      ) : null}

      {allowDownload && hasRemoteDownload ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleDownload}
          onKeyDown={handleDownloadKeyDown}
          title="Descargar GIF"
          aria-label="Descargar GIF"
          className={[
            "absolute z-20 inline-flex cursor-pointer items-center border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_78%,transparent)] font-black uppercase tracking-[0.12em] text-[var(--app-text)] shadow-[0_10px_24px_var(--app-glow)] backdrop-blur-md transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/60",
            downloadCompact
              ? "right-1 top-1 h-7 w-7 justify-center rounded-full"
              : "right-2 top-2 h-8 gap-1 rounded-full px-2.5 text-[8px]",
          ].join(" ")}
        >
          <Download size={10} className="text-[var(--app-primary)]" />
          {downloadCompact ? null : "Descargar GIF"}
        </div>
      ) : null}

      {allowDownload && hasRemoteDownload && !downloadCompact ? (
        <p className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_72%,transparent)] px-2 py-0.5 text-[7px] font-semibold text-[var(--app-muted)] backdrop-blur-md">
          Revisa que coincida antes de guardar.
        </p>
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

function PlaceholderState({ exercise, media, loading }) {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,var(--app-primary-soft),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.02),transparent_32%)]" />
      <div className="relative z-10 grid place-items-center gap-2 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
          <Dumbbell size={24} />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {loading ? "Cargando media" : "Sin media"}
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
