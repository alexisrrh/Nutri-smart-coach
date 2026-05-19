export function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-text)]">
      <p className="text-sm text-[var(--app-muted)]">{title}</p>
      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
      <p className="mt-2 text-sm text-[var(--app-primary)]">{subtitle}</p>
    </div>
  );
}
