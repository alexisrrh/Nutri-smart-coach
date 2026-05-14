import { useEffect } from "react";
import { Camera, X } from "lucide-react";
import { formatDate, shortText } from "./checkinUtils";

export function CheckInDetailSheet({ checkin, mode = "detail", onClose }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!checkin) return null;

  const image = checkin.image_url || null;
  const title = mode === "analysis" ? "Análisis completo" : "Detalle del registro";
  const subtitle =
    mode === "analysis"
      ? "Resultado completo de la última foto."
      : "Información completa del check-in semanal.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-2 pb-2 pt-10 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <style>{`
        @keyframes checkinSheetIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[86dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[30px] border border-[#10b981]/15 bg-[#07170f]/96 shadow-[0_-18px_60px_rgba(0,0,0,0.45)]"
        style={{ animation: "checkinSheetIn 220ms ease-out" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center py-2">
          <div className="h-1.5 w-12 rounded-full bg-white/15" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[92px] pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {image ? (
            <div className="relative mb-3 h-40 overflow-hidden rounded-[24px] bg-black/25">
              <img
                src={image}
                alt={checkin.food || "Check-in corporal"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07170f] via-[#07170f]/25 to-transparent" />
              <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#10b981] backdrop-blur-xl">
                {mode === "analysis" ? "Análisis IA" : "Registro corporal"}
              </div>
            </div>
          ) : (
            <div className="mb-3 grid h-40 place-items-center rounded-[24px] border border-white/10 bg-white/[0.03] text-center">
              <div>
                <Camera className="mx-auto mb-2 text-[#10b981]" size={26} />
                <p className="text-[10px] font-black uppercase text-white">
                  Sin foto
                </p>
              </div>
            </div>
          )}

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#10b981]">
                {title}
              </p>

              <h3 className="mt-1 text-2xl font-black uppercase italic leading-[0.95] text-white">
                {formatDate(checkin.created_at)}
              </h3>

              <p className="mt-1 text-[11px] leading-4 text-white/55">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/25 text-slate-400 transition hover:border-[#10b981]/30 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Peso" value={checkin.weight ? `${checkin.weight} kg` : "-"} />
            <Metric label="Cintura" value={checkin.waist ? `${checkin.waist} cm` : "-"} />
            <Metric label="Pecho" value={checkin.chest ? `${checkin.chest} cm` : "-"} />
            <Metric label="Cadera" value={checkin.hips ? `${checkin.hips} cm` : "-"} />
          </div>

          <div className="mt-3 grid gap-2">
            <Metric label="Grasa estimada" value={checkin.body_fat_range || "No estimable"} />
            <Metric label="Confianza" value={checkin.confidence ? `${checkin.confidence}%` : "-"} />
          </div>

          <div className="mt-3 rounded-[24px] border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Cambios detectados
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white">
              {checkin.visual_changes ||
                "La IA revisa grasa corporal, definición y consistencia entre semanas."}
            </p>
          </div>

          <div className="mt-3 rounded-[24px] border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Recomendación
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white">
              {checkin.recommendation ||
                "Mantén la misma luz, postura y distancia para comparar mejor la evolución."}
            </p>
          </div>

          {checkin.notes ? (
            <div className="mt-3 rounded-[24px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Nota
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-300">
                {shortText(checkin.notes, 260)}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-2xl bg-[#10b981] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#06110c] shadow-[0_20px_60px_#22c55e22] transition hover:bg-white"
          >
            Cerrar
          </button>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
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
