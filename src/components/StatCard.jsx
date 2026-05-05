export function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
      <p className="mt-2 text-sm text-emerald-300">{subtitle}</p>
    </div>
  );
}