export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-[#07170f] p-5">
        <div className="h-3 w-32 rounded-full bg-white/10" />

        <div className="mt-5 flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 w-40 rounded-full bg-white/10" />
            <div className="h-4 w-52 rounded-full bg-white/10" />
          </div>

          <div className="h-24 w-24 rounded-full bg-emerald-400/10" />
        </div>

        <div className="mt-5 h-28 rounded-[1.5rem] bg-white/5" />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-20 rounded-2xl bg-white/5" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-20 rounded-[1.5rem] bg-emerald-400/10" />
          <div className="h-20 rounded-[1.5rem] bg-white/5" />
        </div>
      </div>

      <div className="h-40 rounded-[2rem] border border-white/10 bg-white/5" />

      <div className="grid grid-cols-2 gap-3">
        <div className="h-36 rounded-[2rem] bg-white/5" />
        <div className="h-36 rounded-[2rem] bg-white/5" />
        <div className="h-36 rounded-[2rem] bg-white/5" />
        <div className="h-36 rounded-[2rem] bg-white/5" />
      </div>
    </div>
  );
}