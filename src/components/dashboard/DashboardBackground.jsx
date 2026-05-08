export default function DashboardBackground() {
  return (
    <>
      {/* BASE */}
      <div className="pointer-events-none absolute inset-0 bg-[#06110c]" />

      {/* RADIALS */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#10b98122,transparent_30%)]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[340px] w-[340px] rounded-full bg-[#10b981]/10 blur-[120px]" />

      <div className="pointer-events-none absolute right-0 top-0 h-[320px] w-[320px] rounded-full bg-emerald-400/10 blur-[120px]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:34px_34px]" />

      {/* GLOW TOP */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-[#10b981]/20 blur-[120px]" />

      {/* NOISE */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-soft-light">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url('https://grainy-gradients.vercel.app/noise.svg')",
          }}
        />
      </div>

      {/* LIGHT LINE */}
      <div className="pointer-events-none absolute left-0 top-[120px] h-px w-full bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent" />
    </>
  );
}