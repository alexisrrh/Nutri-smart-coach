export default function SplashScreen({ visible }) {
  return (
    <div
      className={[
        "fixed inset-0 z-[200] flex items-center justify-center overflow-hidden px-6 transition-all duration-300 ease-out",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="splash-cinematic-bg absolute inset-0 bg-[var(--app-bg)]" />

      <div className="splash-grid absolute inset-0 opacity-60" />
      <div className="splash-vignette absolute inset-0" />

      <div className="splash-radial absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="splash-beam absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center text-center">
        <div className="splash-logo-wrap relative">
          <div className="splash-logo-halo absolute inset-[-34px]" />
          <div className="splash-logo-shimmer absolute inset-[-24px]" />

          <div
            className="splash-logo-frame relative grid h-[152px] w-[152px] place-items-center rounded-[34px] border border-[var(--app-border)] backdrop-blur-xl"
            style={{
              backgroundColor: "color-mix(in srgb, var(--app-surface) 72%, transparent)",
            }}
          >
            <img
              src="/apple-touch-icon.png"
              alt="NutriSmart Coach"
              className="splash-logo-image h-[150px] w-[150px] object-contain"
            />
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <p className="splash-title text-[22px] font-semibold tracking-[0.16em] text-[var(--app-text)]">
            NutriSmart Coach
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[var(--app-muted)]">
            AI Nutrition &amp; Body Tracking
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="splash-loader-line h-[2px] w-[112px] overflow-hidden rounded-full bg-[var(--app-primary-soft)]">
            <div
              className="splash-loader-progress h-full w-full origin-left rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, var(--app-primary) 50%, transparent 100%)",
              }}
            />
          </div>
          <div className="splash-loader-pulse h-2 w-2 rounded-full bg-[var(--app-primary)]" />
        </div>
      </div>
    </div>
  );
}
