import {
  Camera,
  ChevronRight,
  ChevronDown,
  ImagePlus,
  ScanFace,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function CheckInForm({
  preview,
  handlePhoto,
  form,
  handleChange,
  saveCheckIn,
  loading,
}) {
  const { t } = useTranslation();
  const hasPreview = Boolean(preview);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--app-border)] bg-[#091710] shadow-2xl shadow-black/20">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10 p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Camera size={20} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--app-primary)]">
                {t("checkin.form.badge")}
              </p>

              <h2 className="text-lg font-black uppercase italic">
                {t("checkin.form.title")}
              </h2>
            </div>
          </div>

          <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-[10px] font-black text-slate-400">
            {t("checkin.form.photoType")}
          </span>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="checkin-photo"
            className="group relative grid min-h-[210px] cursor-pointer place-items-center overflow-hidden rounded-[28px] border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] text-center transition hover:border-[var(--app-primary)]/70 hover:bg-[var(--app-primary)]/5"
          >
            {hasPreview ? (
              <>
                <img
                  src={preview}
                  alt={t("checkin.form.previewAlt")}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/92 via-[var(--app-surface)]/25 to-transparent" />

                  <div className="relative z-10 self-end p-4">
                    <p className="text-base font-black uppercase italic">
                    {t("checkin.form.currentPhoto")}
                  </p>

                  <p className="mt-1 text-[10px] text-[var(--app-muted)]">
                    {t("checkin.form.changeHint")}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <ImagePlus size={30} />
                </div>

                <p className="text-base font-black uppercase italic">
                  {t("checkin.form.uploadTitle")}
                </p>

                <p className="mx-auto mt-2 max-w-xs text-[10px] leading-5 text-slate-400">
                  {t("checkin.form.uploadHint")}
                </p>
              </div>
            )}

            <input
              id="checkin-photo"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>

          {!hasPreview ? (
            <label
              htmlFor="checkin-photo"
              className="block rounded-2xl bg-[var(--app-primary)] px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-surface)] shadow-[0_20px_60px_var(--app-glow)] transition hover:bg-[var(--app-primary-soft)]"
            >
              {t("checkin.form.uploadButton")}
            </label>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <label
                htmlFor="checkin-photo"
                className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-200 transition hover:border-[var(--app-border)] hover:text-[var(--app-text)]"
              >
                {t("checkin.form.changeButton")}
              </label>

              <button
                type="button"
                onClick={saveCheckIn}
                disabled={loading}
                className="group relative overflow-hidden rounded-2xl bg-[var(--app-primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--app-surface)] shadow-[0_20px_60px_var(--app-glow)] transition hover:bg-[var(--app-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ScanFace size={16} />
                  {loading ? t("checkin.form.analyzing") : t("checkin.form.analyze")}
                  <ChevronRight size={15} />
                </span>
              </button>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Field
              label={t("checkin.form.weightSection")}
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="72.5"
              type="number"
              step="0.1"
              required
            />

            <div className="hidden sm:block" />
          </div>

          <details className="group rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {t("checkin.form.optionalMeasures")}
              <ChevronDown size={14} className="transition group-open:rotate-180" />
            </summary>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Field
                label={t("checkin.form.waist")}
                value={form.waist}
                onChange={(e) => handleChange("waist", e.target.value)}
                placeholder="80"
                type="number"
                step="0.1"
              />

              <Field
                label={t("checkin.form.chest")}
                value={form.chest}
                onChange={(e) => handleChange("chest", e.target.value)}
                placeholder="95"
                type="number"
                step="0.1"
              />

              <Field
                label={t("checkin.form.hips")}
                value={form.hips}
                onChange={(e) => handleChange("hips", e.target.value)}
                placeholder="90"
                type="number"
                step="0.1"
              />

              <label className="sm:col-span-2">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {t("checkin.form.note")}
                </p>

                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="h-[68px] w-full resize-none rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] font-semibold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)]/50"
                  placeholder={t("checkin.form.notePlaceholder")}
                />
              </label>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]">
        {label}
      </p>

      <input
        {...props}
        className="h-10 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[11px] font-bold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)]/50"
      />
    </label>
  );
}
