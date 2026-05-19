export default function AIStat({ title, value, color }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border p-2.5 backdrop-blur-xl transition"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface)",
      }}
    >
      <div
        className="absolute -right-6 -top-6 h-14 w-14 rounded-full opacity-0 transition group-hover:opacity-100"
        style={{ backgroundColor: "var(--app-primary-soft)", filter: "blur(2rem)" }}
      />

      <div className="relative z-10">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[7px] font-black uppercase tracking-widest text-[var(--app-muted)]">
            {title}
          </p>

          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--app-primary)", boxShadow: "0 0 10px var(--app-glow)" }} />
        </div>

        <p className={`truncate text-sm font-black ${color}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
