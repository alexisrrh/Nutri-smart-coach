import {
  Camera,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export function CheckInHero({
  lastCheckin,
  weightDiff,
  profile,
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20">
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#10b981]/25 bg-[#0d2218] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-[#10b981]">
          <Sparkles size={12} />
          Check-in físico con foto
        </div>

        <h1 className="text-3xl font-black uppercase italic leading-[0.9] tracking-tight sm:text-5xl">
          Revisa tu
          <br />
          <span className="text-[#10b981]">físico</span>
        </h1>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          Sube una foto semanal y registra medidas para comparar cambios visuales.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MetricBox
            icon={<Scale size={15} />}
            label="Peso"
            value={lastCheckin?.weight || profile?.weight || "-"}
            detail="kg"
          />

          <MetricBox
            icon={
              weightDiff !== null && weightDiff <= 0 ? (
                <TrendingDown size={15} />
              ) : (
                <TrendingUp size={15} />
              )
            }
            label="Cambio"
            value={
              weightDiff === null
                ? "-"
                : `${weightDiff > 0 ? "+" : ""}${weightDiff}`
            }
            detail="kg"
          />

          <MetricBox
            icon={<Camera size={15} />}
            label="Registros"
            value={lastCheckin ? "Activo" : "Nuevo"}
            detail="scan"
          />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, detail }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d2218]/70 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[#10b981]">
        {icon}

        <p className="truncate text-[7px] font-black uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <p className="truncate text-sm font-black text-white">
        {value}

        <span className="text-[9px] text-slate-500">
          {" "}
          {detail}
        </span>
      </p>
    </div>
  );
}
