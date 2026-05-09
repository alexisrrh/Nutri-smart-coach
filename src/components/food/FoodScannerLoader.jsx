import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ScanLine, Sparkles } from "lucide-react";

export default function FoodScannerLoader({ preview }) {
  const [percent, setPercent] = useState(8);

  const steps = [
    "Detectando",
    "Macros",
    "Calidad",
    "Resultado",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) return 100;
        if (prev < 45) return prev + 7;
        if (prev < 80) return prev + 4;
        if (prev < 96) return prev + 1;
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
    <section className="mt-3 overflow-hidden rounded-[32px] border border-[#10b981]/20 bg-[#07170f] p-3 shadow-[0_30px_90px_rgba(16,185,129,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#10b981]">
            Analizando comida
          </p>
          <h3 className="mt-1 text-xl font-black uppercase italic">
            AI Food Scan
          </h3>
        </div>

        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#10b981]/25 bg-[#10b981]/10">
          <ScanLine size={28} className="animate-spin text-[#10b981]" />
        </div>
      </div>

      <div className="relative h-[245px] overflow-hidden rounded-[26px] bg-black/30">
        {preview && (
          <img
            src={preview}
            alt="Analizando comida"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        )}

        <div className="absolute inset-0 bg-[#04110b]/50" />

        <div className="absolute left-0 right-0 top-0 h-24 animate-[scanner_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-[#10b981]/35 to-transparent" />

        <div className="relative z-10 grid h-full place-items-center text-center">
          <div>
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-[28px] border border-[#10b981]/25 bg-black/50 text-[#10b981] backdrop-blur-xl">
              <Loader2 size={38} className="animate-spin" />
            </div>

            <p className="text-5xl font-black italic leading-none text-[#10b981]">
              {percent}%
            </p>

            <p className="mt-2 text-[9px] font-black uppercase tracking-[0.28em] text-white/45">
              Procesando con IA
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const active = index === activeStep;

          return (
            <div
              key={step}
              className={`rounded-2xl px-1 py-2 text-center ${
                completed
                  ? "bg-[#10b981]/10"
                  : active
                  ? "bg-white/5"
                  : "bg-black/20"
              }`}
            >
              <div className="mb-1 flex justify-center">
                {completed ? (
                  <CheckCircle2 size={13} className="text-[#10b981]" />
                ) : active ? (
                  <Sparkles size={13} className="text-[#10b981]" />
                ) : (
                  <ScanLine size={13} className="text-white/20" />
                )}
              </div>

              <p
                className={`text-[7px] font-black uppercase leading-3 ${
                  completed || active ? "text-white" : "text-slate-600"
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