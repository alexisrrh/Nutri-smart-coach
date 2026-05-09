import { ArrowRight, Sparkles } from "lucide-react";

export default function SmartSwapCard({ result }) {
  if (!result) return null;

  const improvements = Array.isArray(result.improvements)
    ? result.improvements.slice(0, 2)
    : [];

  if (improvements.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#10b981]/20 bg-[#07170f] p-4">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#10b981]" />

          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            Mejoras IA
          </p>
        </div>

        <div className="space-y-2">
          {improvements.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
            >
             <p className="line-clamp-2 text-[11px] normal-case leading-5 text-slate-300">
  {item}
</p>

              <ArrowRight size={15} className="shrink-0 text-[#10b981]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}