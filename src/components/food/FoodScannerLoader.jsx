import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ScanLine, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FoodScannerLoader({ preview }) {
  const { t } = useTranslation();
  const [percent, setPercent] = useState(8);

  const steps = [
    t("scan.loader.steps.detecting"),
    t("scan.loader.steps.macros"),
    t("scan.loader.steps.quality"),
    t("scan.loader.steps.result"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return 96;
        if (prev < 45) return prev + 7;
        if (prev < 80) return prev + 4;
        return prev + 1;
      });
    }, 420);

    return () => clearInterval(interval);
  }, []);

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <section className="min-h-0 overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 shadow-[0_24px_70px_var(--app-glow)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            {t("scan.loader.title")}
          </p>

          <h3 className="mt-0.5 text-base font-black uppercase italic">
            {t("scan.loader.badge")}
          </h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)]">
          <ScanLine size={21} className="animate-spin text-[var(--app-primary)]" />
        </div>
      </div>

        <div className="relative h-[150px] overflow-hidden rounded-[18px] bg-[var(--app-surface)]">
        {preview && (
          <img
            src={preview}
            alt={t("scan.loader.previewAlt")}
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        )}

        <div className="absolute inset-0 bg-[var(--app-surface)]/50" />

        <div className="absolute left-0 right-0 top-0 h-20 animate-[scanner_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-[var(--app-primary-soft)] to-transparent" />

        <div className="relative z-10 grid h-full place-items-center text-center">
          <div>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] backdrop-blur-xl">
              <Loader2 size={28} className="animate-spin" />
            </div>

            <p className="text-3xl font-black italic leading-none text-[var(--app-primary)]">
              {percent}%
            </p>

            <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]">
              {t("scan.loader.processing")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface)]">
        <div
          className="h-full rounded-full bg-[var(--app-primary)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const active = index === activeStep;

          return (
            <div
              key={step}
              className={`rounded-xl px-1 py-1.5 text-center ${
                completed
                  ? "bg-[var(--app-primary-soft)]"
                  : active
                  ? "bg-[var(--app-surface)]"
                  : "bg-[var(--app-surface)]"
              }`}
            >
              <div className="mb-0.5 flex justify-center">
                {completed ? (
                  <CheckCircle2 size={11} className="text-[var(--app-primary)]" />
                ) : active ? (
                  <Sparkles size={11} className="text-[var(--app-primary)]" />
                ) : (
                  <ScanLine size={11} className="text-[var(--app-muted)]" />
                )}
              </div>

              <p
                className={`text-[10px] font-black uppercase leading-3 ${
                  completed || active ? "text-[var(--app-text)]" : "text-slate-600"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
