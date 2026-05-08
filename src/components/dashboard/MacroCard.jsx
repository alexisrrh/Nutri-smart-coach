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

  const status =
    percentage >= 90
      ? "text-[#10b981]"
      : percentage >= 50
      ? "text-yellow-400"
      : "text-slate-400";

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#07170f] p-2.5">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#10b981]/10 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 text-[#10b981]">
            {icon}

            <p className="text-[7px] font-black uppercase tracking-wide text-slate-500">
              {label}
            </p>
          </div>

          <span className={`text-[8px] font-black ${status}`}>
            {percentage}%
          </span>
        </div>

        <p className="text-base font-black leading-none text-white">
          {Math.round(current)}
          <span className="ml-0.5 text-[8px] text-slate-500">{unit}</span>
        </p>

        <p className="mt-1 text-[8px] text-slate-600">
          meta {goal}
          {unit}
        </p>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#10b981] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}