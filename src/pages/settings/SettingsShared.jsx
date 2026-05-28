import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { AppShell, MetaBadge, SurfaceCard } from "../../components/ui";

export function SettingsScreenShell({
  children,
  subtitle,
  title,
  badge = "Settings",
  onBack,
}) {
  return (
    <AppShell
      withBottomNav={true}
      hideBottomNav
      contentClassName="!px-2 !pt-2 !pb-[calc(120px+env(safe-area-inset-bottom))]"
    >
      <main className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SettingsFrame className="pb-2">
          <SettingsHero title={title} subtitle={subtitle} badge={badge} onBack={onBack} />
          <div className="space-y-2.5">{children}</div>
        </SettingsFrame>
      </main>
    </AppShell>
  );
}

export function SettingsFrame({ children, className = "" }) {
  return (
    <div
      className={`relative mx-auto flex w-full max-w-[430px] flex-col gap-2.5 rounded-[32px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2 pt-2 shadow-[0_18px_54px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)] md:my-6 md:min-h-[880px] md:rounded-[40px] md:border-8 md:px-3 md:py-3 md:shadow-[0_32px_64px_-12px_var(--app-glow)] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 32%), radial-gradient(circle at 92% 24%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 26%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 4%, transparent), transparent 32%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.12)_100%)]" />
      <div className="relative z-10 flex w-full flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function SettingsHero({ badge, onBack, subtitle, title, trailing }) {
  return (
    <SurfaceCard className="relative overflow-hidden p-2.5" radius="lg">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--app-primary) 14%, transparent), transparent 32%), radial-gradient(circle at 92% 24%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 26%)",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MetaBadge variant="neutral">{badge}</MetaBadge>
          <h1 className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[var(--app-text)]">
            {title}
          </h1>
          <p className="mt-2 max-w-[22rem] text-[13px] font-medium leading-5 text-[var(--app-muted)]">
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {trailing || null}
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition active:scale-[0.96] hover:text-[var(--app-text)]"
              aria-label="Volver"
            >
              <ArrowLeft size={15} />
            </button>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}

export function SettingsCard({
  children,
  className = "",
  title,
  description,
  icon,
  right,
}) {
  return (
    <SurfaceCard className={`relative overflow-hidden p-0 ${className}`} radius="lg" variant="soft">
      <div className="flex items-start justify-between gap-3 px-3 py-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-tight text-[var(--app-text)]">
              {title}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium leading-4 text-[var(--app-muted)]">
              {description}
            </span>
          </span>
        </span>
        {right || null}
      </div>

      <div className="border-t border-[var(--app-border)] px-2.5 pb-2.5 pt-2">
        {children}
      </div>
    </SurfaceCard>
  );
}

export function SettingsRow({
  description,
  icon,
  label,
  to,
  onClick,
  danger = false,
  right,
}) {
  const baseClass =
    "flex w-full min-h-[72px] items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 active:scale-[0.98] touch-manipulation";
  const toneClass = danger
    ? "border-red-400/14 bg-[color-mix(in_srgb,var(--app-surface)_84%,transparent)] hover:bg-red-400/8 active:bg-red-400/8"
    : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-primary-soft)] active:bg-[var(--app-primary-soft)]";
  const toneIcon = danger
    ? "border-red-400/16 bg-red-400/10 text-red-200"
    : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-primary)]";
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl border ${toneIcon}`}>
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-bold text-[var(--app-text)]">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-[var(--app-muted)]">
            {description}
          </span>
        </span>
      </span>
      {right || <ChevronDown size={15} className={`-rotate-90 shrink-0 ${danger ? "text-red-200" : "text-[var(--app-primary)]"}`} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseClass} ${toneClass}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClass} ${toneClass}`}>
      {content}
    </button>
  );
}

export function SettingsMetric({ label, value, accent = false, unit = "" }) {
  return (
    <div
      className="rounded-2xl border px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--app-border)]"
      style={{
        backgroundColor: accent ? "var(--app-primary-soft)" : "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-bold text-[var(--app-text)]">
        {value || "—"}
        {unit ? <span className="ml-1 text-[10px] text-[var(--app-primary)]/60">{unit}</span> : null}
      </p>
    </div>
  );
}
