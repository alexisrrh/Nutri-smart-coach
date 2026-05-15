import { Camera, History } from "lucide-react";
import { formatDate } from "./checkinUtils";

export function CheckInHistory({ history = [], loading = false, onSelect }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#091710] px-3 py-3 shadow-2xl shadow-black/20">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History size={15} className="text-[#10b981]" />
          <h3 className="text-sm font-black uppercase italic leading-none">
            Timeline semanal
          </h3>
        </div>

        <span className="text-[10px] font-black text-slate-500">
          {history.length} registros
        </span>
      </div>

      {loading ? (
        <p className="relative z-10 text-[10px] text-slate-400">
          Cargando historial...
        </p>
      ) : history.length === 0 ? (
        <div className="relative z-10 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-center">
          <Camera className="mx-auto mb-2 text-[#10b981]" size={22} />

          <p className="text-[10px] font-black uppercase text-white">
            Sin historial
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            Guarda tu primer check-in.
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {history.map((item, index) => (
            <HistoryCard
              key={item.id || index}
              item={item}
              index={index}
              onClick={() => onSelect?.(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item, index, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[112px] shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] text-left transition hover:border-[#10b981]/30"
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt="Check-in"
          className="h-[78px] w-full object-cover"
        />
      ) : (
        <div className="grid h-[78px] place-items-center bg-white/5 text-[10px] text-slate-500">
          Sin foto
        </div>
      )}

      <div className="p-2">
        <p className="text-[10px] font-black uppercase text-[#10b981]">
          Reg {index + 1}
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          {formatDate(item.created_at)}
        </p>
      </div>
    </button>
  );
}
