export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {/* HERO */}
      <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#07170f] p-4">
        <div className="h-3 w-28 rounded-full bg-white/10" />

        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-full bg-white/10" />
            <div className="h-7 w-24 rounded-full bg-[#10b981]/20" />
            <div className="mt-3 h-3 w-48 rounded-full bg-white/10" />
            <div className="h-3 w-40 rounded-full bg-white/10" />
          </div>

          <div className="h-24 w-24 rounded-full bg-[#10b981]/10" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="h-16 rounded-2xl bg-white/5" />
          <div className="h-16 rounded-2xl bg-white/5" />
          <div className="h-16 rounded-2xl bg-white/5" />
        </div>
      </div>

      {/* MACROS */}
      <div className="grid grid-cols-4 gap-2">
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-28 rounded-[26px] bg-white/5" />
        <div className="h-28 rounded-[26px] bg-white/5" />
        <div className="h-28 rounded-[26px] bg-white/5" />
      </div>

      {/* INSIGHT */}
      <div className="h-32 rounded-[28px] bg-white/5" />

      {/* INFO */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-32 rounded-[28px] bg-white/5" />
        <div className="h-32 rounded-[28px] bg-white/5" />
      </div>
    </div>
  );
}