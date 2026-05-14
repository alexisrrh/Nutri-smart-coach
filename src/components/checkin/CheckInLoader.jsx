import { useEffect, useState } from "react";

export function CheckInLoader({ loading }) {
  const [percent, setPercent] = useState(8);

  const steps = ["Foto", "Medidas", "Subida", "IA"];

  useEffect(() => {
    if (!loading) return;

    const resetTimer = setTimeout(() => {
      setPercent(8);
    }, 0);

    const progressInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return prev;
        if (prev < 45) return prev + 7;
        if (prev < 80) return prev + 4;
        return prev + 1;
      });
    }, 350);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(progressInterval);
    };
  }, [loading]);

  if (!loading) return null;

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((percent / 100) * steps.length)
  );

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#10b981]/18 bg-[#07170f] px-3 py-3 shadow-[0_16px_50px_rgba(16,185,129,0.1)]">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            Check-in físico IA
          </p>
          <p className="mt-1 text-sm font-black uppercase italic leading-none">
            Analizando foto
          </p>
        </div>

        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] border border-[#10b981]/25 bg-[#10b981]/10">
          <span className="text-lg font-black text-[#10b981]">{percent}%</span>
        </div>
      </div>

      <div className="relative z-10 mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-4 gap-1.5">
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
                className={`text-[9px] font-black uppercase ${
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
  );
}
