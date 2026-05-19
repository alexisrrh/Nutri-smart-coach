export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div
        className="rounded-[2rem] border p-5"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
      >
        <div className="h-3 w-32 rounded-full" style={{ backgroundColor: "var(--app-primary-soft)" }} />

        <div className="mt-5 flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 w-40 rounded-full" style={{ backgroundColor: "var(--app-primary-soft)" }} />
            <div className="h-4 w-52 rounded-full" style={{ backgroundColor: "var(--app-primary-soft)" }} />
          </div>

          <div className="h-24 w-24 rounded-full" style={{ backgroundColor: "var(--app-primary-soft)" }} />
        </div>

        <div className="mt-5 h-28 rounded-[1.5rem]" style={{ backgroundColor: "var(--app-surface)" }} />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-20 rounded-2xl" style={{ backgroundColor: "var(--app-surface)" }} />
          <div className="h-20 rounded-2xl" style={{ backgroundColor: "var(--app-surface)" }} />
          <div className="h-20 rounded-2xl" style={{ backgroundColor: "var(--app-surface)" }} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-20 rounded-[1.5rem]" style={{ backgroundColor: "var(--app-primary-soft)" }} />
          <div className="h-20 rounded-[1.5rem]" style={{ backgroundColor: "var(--app-surface)" }} />
        </div>
      </div>

      <div className="h-40 rounded-[2rem] border" style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }} />

      <div className="grid grid-cols-2 gap-3">
        <div className="h-36 rounded-[2rem]" style={{ backgroundColor: "var(--app-surface)" }} />
        <div className="h-36 rounded-[2rem]" style={{ backgroundColor: "var(--app-surface)" }} />
        <div className="h-36 rounded-[2rem]" style={{ backgroundColor: "var(--app-surface)" }} />
        <div className="h-36 rounded-[2rem]" style={{ backgroundColor: "var(--app-surface)" }} />
      </div>
    </div>
  );
}
