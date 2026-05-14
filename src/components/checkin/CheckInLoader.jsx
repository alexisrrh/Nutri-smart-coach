import { useEffect, useState } from "react";

export function CheckInLoader({ loading }) {
  const [percent, setPercent] = useState(8);
  const [seconds, setSeconds] = useState(0);

  const steps = ["Foto", "Medidas", "Subida", "IA"];

  useEffect(() => {
    if (!loading) return;

    const resetTimer = setTimeout(() => {
      setPercent(8);
      setSeconds(0);
    }, 0);

    const progressInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return prev;
        if (prev < 45) return prev + 7;
        if (prev < 80) return prev + 4;
        return prev + 1;
      });
    }, 450);

    const secondsInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(progressInterval);
      clearInterval(secondsInterval);
    };
  }, [loading]);

  if (!loading) return null;

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-[#10b981]/20 bg-[#07170f] p-4 shadow-[0_30px_90px_rgba(16,185,129,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98126,transparent_42%)]" />
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#10b981]/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[30px] border border-white/10 bg-black/25 p-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#10b981]">
              Check-in físico IA
            </p>

            <h3 className="mt-1 text-2xl font-black uppercase italic leading-none">
              Guardando foto
            </h3>

            <p className="mt-2 text-[11px] leading-4 text-slate-400">
              Subiendo foto, medidas y generando análisis visual.
            </p>
          </div>

          <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-[28px] border border-[#10b981]/25 bg-[#10b981]/10">
            <div className="absolute inset-1 animate-spin rounded-[24px] border-2 border-transparent border-t-[#10b981]" />
            <div className="absolute inset-4 animate-pulse rounded-2xl bg-[#10b981]/10" />

            <span className="relative text-2xl font-black text-[#10b981]">
              {percent}%
            </span>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-500">
          <span>{seconds}s</span>
          <span className="text-[#10b981]">
            {percent < 96 ? "Procesando..." : "Finalizando..."}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <div
                key={step}
                className={`rounded-2xl border px-1 py-2 text-center ${
                  completed
                    ? "border-[#10b981]/25 bg-[#10b981]/10"
                    : active
                      ? "border-[#10b981]/40 bg-[#10b981]/5"
                      : "border-white/5 bg-black/10"
                }`}
              >
                <p
                  className={`text-[8px] font-black uppercase ${
                    completed || active ? "text-white" : "text-slate-600"
                  }`}
                >
                  {completed ? "✓ " : ""}
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
