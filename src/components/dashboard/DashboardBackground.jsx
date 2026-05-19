export default function DashboardBackground() {
  return (
    <>
      {/* BASE */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: "var(--app-surface)" }} />

      {/* RADIALS */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, var(--app-primary-soft), transparent 30%)",
        }}
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[340px] w-[340px] rounded-full blur-[120px]"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      <div
        className="pointer-events-none absolute right-0 top-0 h-[320px] w-[320px] rounded-full blur-[120px]"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

      {/* GLOW TOP */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[220px] w-[220px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      />

      {/* NOISE */}
   

      {/* LIGHT LINE */}
      <div className="pointer-events-none absolute left-0 top-[120px] h-px w-full bg-gradient-to-r from-transparent via-[var(--app-primary)] to-transparent" />
    </>
  );
}
