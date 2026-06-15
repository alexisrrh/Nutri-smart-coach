import { ArrowLeft, FileText, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppShell, MetaBadge, SecondaryButton, SurfaceCard } from "../../components/ui";
import { getCurrentAppLanguage } from "../../i18n";

export function LegalLayout({ children, eyebrow, title, updatedAt }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const language = i18n.resolvedLanguage || i18n.language || getCurrentAppLanguage();
  const navLinks = [
    { to: "/privacy", label: t("settings.legal.layout.nav.privacy"), icon: ShieldCheck },
    { to: "/terms", label: t("settings.legal.layout.nav.terms"), icon: FileText },
    { to: "/delete-account", label: t("settings.legal.layout.nav.deleteAccount"), icon: Trash2 },
  ];
  const formattedUpdatedAt = formatDate(updatedAt, language);

  return (
    <AppShell
      withBottomNav={true}
      hideBottomNav={false}
      wide
      contentClassName="!px-3 !pt-3"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3 pb-25"
    >
      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-3 rounded-[36px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-3 py-3 shadow-[0_24px_60px_-18px_var(--app-glow)] md:my-6 md:min-h-[880px] md:rounded-[40px] md:border-8 md:px-4 md:py-4">
          <header className="shrink-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <SecondaryButton
                onClick={() => navigate(-1)}
                icon={<ArrowLeft size={14} />}
                className="w-auto px-2.5 py-1.5 text-[10px]"
              >
                {t("settings.legal.layout.back")}
              </SecondaryButton>

              <MetaBadge icon={<Sparkles size={12} />} className="px-2.5 py-1">
                {t("settings.legal.layout.trustCenter")}
              </MetaBadge>
            </div>

            <SurfaceCard className="relative overflow-hidden p-3.5 shadow-[0_14px_36px_rgba(0,0,0,0.12)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[var(--app-primary-soft)] blur-3xl opacity-70" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_30%,rgba(0,0,0,0.08)_100%)]" />
              <div className="relative z-10 flex items-start gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_22px_var(--app-glow)]">
                  <ShieldCheck size={20} />
                  <span className="absolute -inset-1 rounded-[20px] border border-[var(--app-primary)]/10" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--app-muted)]">
                    {eyebrow}
                  </p>
                  <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-[var(--app-text)]">
                    {title}
                  </h1>
                  <p className="mt-1.5 max-w-[28rem] text-[12px] font-medium leading-5 text-[var(--app-muted)]">
                    {t("settings.legal.layout.description")}
                  </p>
                  <p className="mt-2 text-[11px] font-medium leading-4 text-[var(--app-muted)]">
                    {t("settings.legal.layout.updatedAt")}: {formattedUpdatedAt}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
                <TrustChip>{t("settings.legal.layout.chips.protected")}</TrustChip>
                <TrustChip>{t("settings.legal.layout.chips.management")}</TrustChip>
                <TrustChip>{t("settings.legal.layout.chips.synced")}</TrustChip>
              </div>
            </SurfaceCard>
          </header>

          <nav className="grid grid-cols-3 gap-1.5 rounded-[1.25rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center justify-center gap-2 rounded-[1rem] border px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] transition duration-200 active:scale-[0.98] ${
                    active
                      ? "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_16px_var(--app-glow)]"
                      : "border-transparent bg-transparent text-[var(--app-muted)] hover:text-[var(--app-text)]"
                  }`}
                >
                  <Icon size={12} className={active ? "text-[var(--app-primary)]" : "text-[var(--app-muted)]"} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <article className="space-y-3 text-[13px] font-medium leading-6 text-[color:color-mix(in_srgb,var(--app-text)_82%,var(--app-muted))]">
            {children}
          </article>
      </div>
    </AppShell>
  );
}

export function LegalSection({ title, children }) {
  return (
    <SurfaceCard className="p-3.5" variant="soft" radius="md">
      <h2 className="mb-2 text-[14px] font-semibold tracking-tight text-[var(--app-text)]">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </SurfaceCard>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-primary)] shadow-[0_0_8px_var(--app-glow)]" />
          <span className="leading-6">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TrustChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_94%,transparent)_0%,color-mix(in_srgb,var(--app-card)_96%,transparent)_100%)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
      {children}
    </span>
  );
}

function formatDate(value, locale) {
  if (!value) return "—";

  try {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat(locale || "es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed);
  } catch {
    return value;
  }
}
