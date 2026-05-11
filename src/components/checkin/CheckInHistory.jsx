import { Camera, History } from "lucide-react";
import { formatDate, shortText } from "./checkinUtils";

export function CheckInHistory({ history = [], loading = false }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20">
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#10b981]" />

            <h3 className="text-sm font-black uppercase italic">
              Historial semanal
            </h3>
          </div>

          <span className="text-[10px] font-black text-slate-500">
            {history.length} registros
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Cargando historial...</p>
        ) : history.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">
            <Camera className="mx-auto mb-2 text-[#10b981]" size={28} />

            <p className="text-xs font-black uppercase">
              Sin historial
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Guarda tu primer check-in.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {history.map((item, index) => (
              <HistoryCard key={item.id || index} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ item, index }) {
  return (
    <div className="w-[300px] shrink-0 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04]">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt="Check-in"
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="grid h-44 place-items-center bg-white/5 text-xs text-slate-500">
          Sin foto
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black uppercase text-[#10b981]">
            Registro {index + 1}
          </p>

          <p className="text-[9px] text-slate-500">
            {formatDate(item.created_at)}
          </p>
        </div>

        <h4 className="mt-2 text-2xl font-black">
          {item.weight || "-"} kg
        </h4>

        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
          <MiniMetric label="Cintura" value={item.waist} />
          <MiniMetric label="Pecho" value={item.chest} />
          <MiniMetric label="Cadera" value={item.hips} />
        </div>

        <div className="mt-3 space-y-2 text-[11px] leading-4 text-slate-300">
          <p>
            <span className="font-black text-[#10b981]">
              Grasa:
            </span>{" "}
            {item.body_fat_range || "No estimable"}
          </p>

          <p>
            <span className="font-black text-[#10b981]">
              Confianza:
            </span>{" "}
            {item.confidence ? `${item.confidence}%` : "-"}
          </p>

          <p>
            <span className="font-black text-[#10b981]">
              Cambios:
            </span>{" "}
            {shortText(item.visual_changes, 170) || "Sin análisis visual."}
          </p>

          <p>
            <span className="font-black text-[#10b981]">
              Consejo:
            </span>{" "}
            {shortText(item.recommendation, 190) || "Sin recomendación."}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      <p className="text-slate-500">{label}</p>

      <p className="font-black text-white">
        {value || "-"} cm
      </p>
    </div>
  );
}