import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell, MetaBadge, SecondaryButton, SurfaceCard } from "../../components/ui";

const navLinks = [
  { to: "/privacy", label: "Privacidad" },
  { to: "/terms", label: "Términos" },
  { to: "/delete-account", label: "Eliminar cuenta" },
];

export function LegalLayout({ children, eyebrow, title, updatedAt }) {
  const navigate = useNavigate();

  return (
    <AppShell withBottomNav={false} wide contentClassName="!px-3 !pb-6 !pt-3">
      <div className="flex min-h-0 flex-col gap-3">
        <header className="shrink-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SecondaryButton
              onClick={() => navigate(-1)}
              icon={<ArrowLeft size={14} />}
              className="w-auto px-2.5 py-1.5 text-[10px]"
            >
              Volver
            </SecondaryButton>

            <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
              Legal
            </MetaBadge>
          </div>

          <SurfaceCard className="relative overflow-hidden p-4">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

            <div className="relative z-10 flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_28px_var(--app-glow)]">
                <ShieldCheck size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  {eyebrow}
                </p>
                <h1 className="mt-1 text-[26px] font-black uppercase italic leading-none tracking-tight text-[var(--app-text)]">
                  {title}
                </h1>
                <p className="mt-2 text-sm font-medium leading-5 text-[var(--app-muted)]">
                  Última actualización: {updatedAt}
                </p>
              </div>
            </div>
          </SurfaceCard>
        </header>

        <nav className="grid grid-cols-3 gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-center text-[9px] font-black uppercase leading-3 tracking-[0.08em] text-[var(--app-muted)] transition hover:text-[var(--app-primary)] active:scale-[0.98]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <article className="space-y-3 text-[13px] font-medium leading-6 text-[color:color-mix(in_srgb,var(--app-text)_82%,var(--app-muted))]">
            {children}
          </article>
        </div>
      </div>
    </AppShell>
  );
}

export function LegalSection({ title, children }) {
  return (
    <SurfaceCard className="p-4" variant="soft" radius="md">
      <h2 className="mb-2 text-[15px] font-black uppercase tracking-[0.08em] text-[var(--app-text)]">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </SurfaceCard>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
