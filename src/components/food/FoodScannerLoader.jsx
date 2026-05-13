import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ScanLine, Sparkles } from "lucide-react";

export default function FoodScannerLoader({ preview }) {
  const [percent, setPercent] = useState(8);

  const steps = ["Detectando", "Macros", "Calidad", "Resultado"];

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
    <section className="mt-2 overflow-hidden rounded-[22px] border border-[#10b981]/20 bg-[#07170f] p-2.5 shadow-[0_24px_70px_rgba(16,185,129,0.12)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#10b981]">
            Analizando comida
          </p>

          <h3 className="mt-0.5 text-base font-black uppercase italic">
            AI Food Scan
          </h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#10b981]/25 bg-[#10b981]/10">
          <ScanLine size={21} className="animate-spin text-[#10b981]" />
        </div>
      </div>

      <div className="relative h-[160px] overflow-hidden rounded-[18px] bg-black/30">
        {preview && (
          <img
            src={preview}
            alt="Analizando comida"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        )}

        <div className="absolute inset-0 bg-[#04110b]/50" />

        <div className="absolute left-0 right-0 top-0 h-20 animate-[scanner_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-[#10b981]/35 to-transparent" />

        <div className="relative z-10 grid h-full place-items-center text-center">
          <div>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-[20px] border border-[#10b981]/25 bg-black/50 text-[#10b981] backdrop-blur-xl">
              <Loader2 size={28} className="animate-spin" />
            </div>

            <p className="text-3xl font-black italic leading-none text-[#10b981]">
              {percent}%
            </p>

            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.22em] text-white/45">
              Procesando con IA
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981] transition-all duration-500"
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
                  ? "bg-[#10b981]/10"
                  : active
                  ? "bg-white/5"
                  : "bg-black/20"
              }`}
            >
              <div className="mb-0.5 flex justify-center">
                {completed ? (
                  <CheckCircle2 size={11} className="text-[#10b981]" />
                ) : active ? (
                  <Sparkles size={11} className="text-[#10b981]" />
                ) : (
                  <ScanLine size={11} className="text-white/20" />
                )}
              </div>

              <p
                className={`text-[6px] font-black uppercase leading-3 ${
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