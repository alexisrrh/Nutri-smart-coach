import { ArrowRight, Sparkles } from "lucide-react";

export default function SmartSwapCard({ result }) {
  if (!result) return null;

  const improvements = Array.isArray(result.improvements)
    ? result.improvements.slice(0, 1)
    : [];

  if (improvements.length === 0) return null;

  return (
    <section className="mt-1.5 rounded-[20px] border border-white/10 bg-black/20 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#10b981]" />

          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#10b981]">
            Ajuste IA
          </p>
        </div>

        <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
          smart
        </span>
      </div>

      {improvements.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-2 rounded-[16px] bg-[#10b981]/10 px-2.5 py-2"
        >
          <p className="line-clamp-2 text-[10px] leading-4 text-emerald-100/85">
            {cleanText(item)}
          </p>

          <ArrowRight size={12} className="shrink-0 text-[#10b981]" />
        </div>
      ))}
    </section>
  );
}

function cleanText(text) {
  if (!text) return "";

  return String(text)
    .replace(/\*\*/g, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}