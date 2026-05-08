export default function AIScoreRing({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(10, Number(score) || 0));
  const percent = safeScore * 10;

  return (
    <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[#10b981]/20 bg-black/30">
      <div className="absolute inset-2 rounded-full border border-[#10b981]/10" />

      <div className="absolute inset-0 rounded-full border border-[#10b981]/20 animate-ping opacity-20" />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#10b981 ${percent}%, rgba(255,255,255,0.06) ${percent}%)`,
          mask: "radial-gradient(circle, transparent 56%, black 57%)",
          WebkitMask: "radial-gradient(circle, transparent 56%, black 57%)",
        }}
      />

      <div className="relative text-center">
        <p className="text-5xl font-black italic leading-none text-[#10b981]">
          {safeScore}
        </p>

        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/40">
          AI Score
        </p>
      </div>
    </div>
  );
}