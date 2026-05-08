export default function MacroCard({
  icon,
  label,
  current,
  goal,
  unit = "",
}) {
  const percentage = goal
    ? Math.min(100, Math.round((current / goal) * 100))
    : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#091710] p-2">
      <div className="mb-1 flex items-center gap-1 text-[#10b981]">
        {icon}

        <p className="text-[7px] font-black uppercase text-slate-500">
          {label}
        </p>
      </div>

      <p className="text-sm font-black">
        {Math.round(current)}
        <span className="text-[8px] text-slate-500">{unit}</span>
      </p>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#10b981]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}