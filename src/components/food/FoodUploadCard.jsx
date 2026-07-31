import { Camera, ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FoodUploadCard({
  preview,
  description,
  onDescriptionChange,
  captureFoodPhoto,
  handleCameraCapture,
  handleImage,
  isNativeCameraAvailable,
  analyzeFood,
  loading,
}) {
  const { t } = useTranslation();
  const canAnalyze = Boolean(preview || description?.trim());
  const scanContent = (
    <div className="relative h-[168px] max-h-[180px] overflow-hidden rounded-[20px] bg-[var(--app-surface)]">
      {preview ? (
        <>
          <img
            src={preview}
            alt={t("food.upload.previewAlt")}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)] via-[var(--app-surface)]/20 to-transparent" />

          <div className="absolute left-2 top-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--app-primary)] backdrop-blur-xl">
            {t("food.upload.photoReady")}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-base font-black uppercase italic text-[var(--app-text)]">
              {t("food.upload.readyToAnalyze")}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--app-primary)]">
                <Camera size={12} />
                {t("food.upload.retakeAction")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--app-primary)]">
                <ImagePlus size={12} />
                {t("food.upload.galleryAction")}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="grid h-full place-items-center text-center">
          <div>
            <div className="theme-icon-tile mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_30px_var(--app-glow)]">
              <Camera size={28} />
            </div>

            <p className="text-lg font-black uppercase italic text-[var(--app-text)]">
              {t("food.upload.cameraTitle")}
            </p>

            <p className="mx-auto mt-1.5 max-w-[220px] text-xs leading-4 text-[var(--app-muted)]">
              {t("food.upload.cameraSubtitle")}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="min-h-0">
      {isNativeCameraAvailable ? (
        <button
          type="button"
          onClick={captureFoodPhoto}
          className="group block w-full cursor-pointer overflow-hidden rounded-[24px] bg-[var(--app-surface)] p-1.5 text-left transition duration-200 active:scale-[1.02]"
        >
          {scanContent}
        </button>
      ) : (
        <label className="group block cursor-pointer overflow-hidden rounded-[24px] bg-[var(--app-surface)] p-1.5 transition duration-200 active:scale-[1.02]">
          {scanContent}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </label>
      )}

      <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 text-[10px] font-black uppercase leading-3 tracking-[0.12em] text-[var(--app-primary)] transition active:scale-[0.98]">
        <ImagePlus size={16} />
        {t("food.upload.galleryAction")}
        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleImage}
          className="hidden"
        />
      </label>

      <div className="mt-2 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-card)] p-3">
        <div className="mb-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {t("food.upload.optionalDescription")}
          </p>
          <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-muted)]">
            {t("food.upload.optionalDescriptionHelp")}
          </p>
        </div>

        <textarea
          value={description}
          onChange={(event) => onDescriptionChange?.(event.target.value)}
          placeholder={t("food.upload.placeholder")}
          rows={3}
          className="min-h-[84px] w-full resize-none rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-[12px] leading-5 text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)]"
        />
      </div>

      <button
        type="button"
        onClick={analyzeFood}
        disabled={!canAnalyze || loading}
        className="group relative mt-2 w-full overflow-hidden rounded-[1.15rem] border border-[var(--app-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--app-primary)_24%,var(--app-surface))] via-[color-mix(in_srgb,var(--app-primary)_40%,var(--app-surface))] to-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-card))] px-3 py-3 text-[var(--app-text)] shadow-[0_16px_36px_var(--app-glow)] transition duration-300 hover:border-[var(--app-border)] hover:shadow-[0_18px_42px_var(--app-glow)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
       <span className="relative z-10 flex min-h-[48px] items-center justify-center gap-9">
              <span className="theme-icon-tile-soft relative grid h-18 w-19 shrink-0 place-items-center overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_0_30px_var(--app-glow)]">
                <span className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,var(--app-primary)_72%,transparent_90%,transparent_100%)] opacity-70 animate-[spin_2.5s_linear_infinite]" />
                <span className="absolute inset-[2px] rounded-[0.9rem] bg-[var(--app-primary)] theme-icon-tile-inner" />
                <img
                  src="/icons/scan-comida-icon.png"
                  alt=""
                  aria-hidden="true"
                  className="relative z-10 h-18 w-25 object-contain"
                />
              </span>

          <span className="min-w-0 text-left">
            <span className="block text-[12px] font-black uppercase leading-tight tracking-[0.12em] text-[var(--app-text)]">
              {loading ? t("food.upload.analyzing") : t("food.upload.analyze")}
            </span>
            <span className="mt-0.5 block text-[10px] font-bold leading-tight text-[var(--app-text)]/82">
              {t("food.upload.subcta")}
            </span>
            <span className="mt-1 block text-[9px] font-medium leading-tight text-[var(--app-muted)]">
              {t("food.upload.helper")}
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}
