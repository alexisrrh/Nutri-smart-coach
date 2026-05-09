import { ArrowRight, Sparkles } from "lucide-react";

export default function SmartSwapCard({ result }) {
  if (!result) return null;

  const improvements = Array.isArray(result.improvements)
    ? result.improvements.slice(0, 2)
    : [];

  if (improvements.length === 0) return null;

  return (
    <section className="mt-2 rounded-[26px] bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#10b981]" />

          <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#10b981]">
            Ajustes IA
          </p>
        </div>

        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
          smart
        </span>
      </div>

      <div className="grid gap-2">
        {improvements.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#10b981]/10 px-3 py-2.5"
          >
            <p className="text-[10px] normal-case leading-4 text-emerald-100/85">
              {cleanText(item)}
            </p>

            <ArrowRight size={14} className="shrink-0 text-[#10b981]" />
          </div>
        ))}
      </div>
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