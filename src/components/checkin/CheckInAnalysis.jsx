import { BrainCircuit, Sparkles } from "lucide-react";
import { shortText } from "./checkinUtils";

export function CheckInAnalysis({ lastCheckin, profile, weightDiff, onOpenFull }) {
  const visualChanges = shortText(
    lastCheckin?.visual_changes ||
      "La IA revisa cambios de grasa, definición y consistencia entre semanas.",
    100
  );
  const recommendation = shortText(
    lastCheckin?.recommendation ||
      "Mantén la misma luz, postura y distancia para comparar mejor la evolución.",
    84
  );
  const hasLongAnalysis =
    (lastCheckin?.visual_changes || "").length > 100 ||
    (lastCheckin?.recommendation || "").length > 84;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#091710] px-3 py-3 shadow-2xl shadow-black/20">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10 mb-2 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#10b981]">
          <Sparkles size={11} />
          Análisis IA
        </div>

        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {profile?.goal || "Progreso"}
        </div>
      </div>

      <p className="relative z-10 line-clamp-2 text-[11px] leading-5 text-slate-300">
        {visualChanges}
      </p>

      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
        <MiniChip
          label="Progreso"
          value={weightDiff === null ? "Pendiente" : weightDiff <= 0 ? "A favor" : "En ajuste"}
        />
        <MiniChip
          label="Confianza"
          value={lastCheckin?.confidence ? `${lastCheckin.confidence}%` : "-"}
        />
        <MiniChip
          label="Grasa"
          value={lastCheckin?.body_fat_range || "No estimable"}
        />
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#10b981]">
            <BrainCircuit size={13} />
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
              Recomendación
            </p>
          </div>

          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white">
            {recommendation}
          </p>
        </div>
      </div>

      {hasLongAnalysis && (
        <button
          type="button"
          onClick={onOpenFull}
          className="relative z-10 mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 transition hover:border-[#10b981]/30 hover:text-white"
        >
          Ver análisis completo
        </button>
      )}
    </section>
  );
}

function MiniChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-black text-white">
        {value}
      </p>
    </div>
  );
}
