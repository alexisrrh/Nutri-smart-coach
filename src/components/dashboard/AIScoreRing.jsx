export default function AIScoreRing({ score = 0 }) {
  const normalized = Math.max(0, Math.min(10, score));
  const percentage = normalized * 10;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  const color =
    normalized >= 8
      ? "#10b981"
      : normalized >= 5
      ? "#facc15"
      : "#f87171";

  return (
    <div className="relative flex items-center justify-center">
      {/* GLOW */}
      <div
        className="absolute h-28 w-28 rounded-full blur-3xl"
        style={{
          background: color,
          opacity: 0.18,
        }}
      />

      {/* RING */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="-rotate-90"
      >
        {/* background */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          fill="transparent"
        />

        {/* glow */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="14"
          fill="transparent"
          strokeOpacity="0.12"
        />

        {/* progress */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1s ease",
          }}
        />
      </svg>

      {/* CENTER */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="text-3xl font-black italic leading-none"
          style={{ color }}
        >
          {normalized}
        </span>

        <span className="mt-1 text-[8px] font-black uppercase tracking-[0.25em] text-white/35">
          SCORE
        </span>
      </div>
    </div>
  );
}