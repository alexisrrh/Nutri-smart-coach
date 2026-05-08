export default function AIStat({ title, value, color }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-2.5 backdrop-blur-xl transition hover:border-[#10b981]/30">
      <div className="absolute -right-6 -top-6 h-14 w-14 rounded-full bg-[#10b981]/10 blur-2xl opacity-0 transition group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[7px] font-black uppercase tracking-widest text-white/35">
            {title}
          </p>

          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
        </div>

        <p className={`truncate text-sm font-black ${color}`}>
          {value}
        </p>
      </div>
    </div>
  );
}