import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Award, ArrowRight } from "lucide-react";
import { NavNavigation } from "./NavNavigation";

export function Progreso() {
  const { t } = useTranslation();
  return (
     <div className="home-progress-shell min-h-dvh w-full bg-[var(--app-bg)] flex items-start justify-center overflow-visible font-sans">
      
      <style>{`
        @keyframes laserMotion {
            0%, 100% { top: 0%; opacity: 1; }
            50% { top: 100%; opacity: 1; }
        }
        @keyframes radarPulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.15; }
            100% { transform: scale(0.95); opacity: 0.5; }
        }
        .laser-line {
            animation: laserMotion 3s ease-in-out infinite;
        }
        .radar-glow {
            animation: radarPulse 4s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-height: 760px) {
          .home-progress-shell > main {
            padding-top: calc(env(safe-area-inset-top) + 12px);
          }
          .home-progress-shell .home-progress-header {
            padding-top: 10px;
          }
          .home-progress-shell .home-progress-nav {
            padding-bottom: 10px;
          }
          .home-progress-shell .home-progress-title {
            font-size: 1.45rem;
          }
          .home-progress-shell .home-progress-body {
            gap: 12px;
            padding-top: 12px;
            padding-bottom: 12px;
          }
          .home-progress-shell .home-progress-banner {
            padding: 10px;
            gap: 10px;
          }
          .home-progress-shell .home-progress-chart {
            gap: 10px;
          }
          .home-progress-shell .home-progress-bars {
            height: 92px;
            gap: 10px;
          }
          .home-progress-shell .home-progress-metrics {
            gap: 8px;
          }
          .home-progress-shell .home-progress-history {
            gap: 8px;
            padding-bottom: 8px;
          }
          .home-progress-shell .home-progress-footer-cta {
            padding-top: 10px;
          }
          .home-progress-shell .home-progress-footer-button {
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .home-progress-shell .home-progress-footer-nav {
            height: 56px;
          }
        }
        @media (max-height: 700px) {
          .home-progress-shell .home-progress-title {
            font-size: 1.32rem;
          }
          .home-progress-shell .home-progress-body {
            gap: 10px;
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .home-progress-shell .home-progress-banner {
            padding: 9px;
            gap: 8px;
          }
          .home-progress-shell .home-progress-bars {
            height: 84px;
            gap: 8px;
          }
          .home-progress-shell .home-progress-footer-nav {
            height: 50px;
          }
        }
      `}</style>

    <main
        className="relative w-full max-w-[430px] min-h-dvh md:min-h-[880px] bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-2xl md:border-8 md:border-[var(--app-border)] flex flex-col overflow-visible"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        
        {/* FONDO CUADRICULADO Y GLOW (Identidad NutriSmart) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%)] pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

      {/* 1. HEADER (Fijo) */}
        <header className="home-progress-header relative z-20 px-5 pt-4 shrink-0">
          <nav className="home-progress-nav flex items-center justify-between border-b border-[var(--app-border)] pb-3.5">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt={t("home.brandAlt")}
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-glow)] border border-[var(--app-border)]"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight text-[var(--app-text)]">
                  {t("home.brandPrefix")}<span className="text-[var(--app-primary)]">{t("home.brandSuffix")}</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  {t("home.headerTagline")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)]">
                {t("home.header.login")}
              </Link>
              <Link to="/registro" className="rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)]">
                {t("home.header.register")}
              </Link>
            </div>
          </nav>
        </header>

        {/* 2. CONTENIDO SCROLLABLE */}
        <section className="relative z-10 flex-1 overflow-visible overflow-x-hidden px-5">
          
          <div className="home-progress-body flex h-full flex-col gap-4 py-4">
            
            {/* TÍTULO */}
            <div className="text-center">
                <h1 className="home-progress-title text-[1.95rem] font-black italic uppercase tracking-tighter leading-none text-[var(--app-text)]">
                    {t("home.progress.titlePrefix")} <span className="bg-gradient-to-r from-[var(--app-primary)] to-cyan-300 bg-clip-text text-transparent">{t("home.progress.titleAccent")}</span>
                </h1>
                <p className="mt-1 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">{t("home.progress.subtitle")}</p>
            </div>

            {/* BANNER DE LOGRO */}
            <div className="home-progress-banner rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] p-3 flex items-center gap-3 shadow-[inset_0_0_15px_var(--app-glow)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--app-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface)] text-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)] border border-[var(--app-border)]">
                <Award size={20} />
              </div>
              <div className="leading-tight z-10">
                <h3 className="text-xs font-black uppercase text-[var(--app-text)] tracking-wide italic">{t("home.progress.banner.title")}</h3>
                <p className="text-[10px] text-[var(--app-muted)] mt-0.5 font-bold uppercase tracking-tight">{t("home.progress.banner.subtitle")}</p>
              </div>
            </div>

            {/* GRÁFICO DE PESO */}
            <div className="home-progress-chart space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] px-1">{t("home.progress.weightTitle")}</h3>
              <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]/50 p-4 backdrop-blur-md shadow-xl">
                <div className="home-progress-bars flex justify-between items-end h-24 gap-2.5">
                  <BarChartColumn pct="90%" label={t("home.progress.weeks.s1")} value="78.2" />
                  <BarChartColumn pct="75%" label={t("home.progress.weeks.s2")} value="77.5" />
                  <BarChartColumn pct="55%" label={t("home.progress.weeks.s3")} value="76.9" />
                  <BarChartColumn pct="40%" label={t("home.progress.weeks.s4")} value="76.1" active />
                </div>
              </div>
            </div>

            {/* MÉTRICAS SECUNDARIAS */}
            <div className="home-progress-metrics grid grid-cols-2 gap-2.5">
              <MetricCard title={t("home.progress.metrics.fat")} value="14.2%" change="-1.5%" icon={<TrendingUp size={14} className="text-rose-400 rotate-180" />} />
              <MetricCard title={t("home.progress.metrics.muscle")} value="62.4 kg" change="+0.8 kg" icon={<TrendingUp size={14} className="text-emerald-400" />} />
            </div>

            {/* HISTORIAL RECIENTE */}
            <div className="home-progress-history space-y-2.5 pb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] px-1">{t("home.progress.habitsTitle")}</h3>
              <div className="space-y-2.5">
                <HistoryRow date={t("home.progress.history.today")} title={t("home.progress.history.meal")} details="1230 kcal" />
                <HistoryRow date={t("home.progress.history.yesterday")} title={t("home.progress.history.weight")} details="76.1 kg" />
              </div>
            </div>

          </div>
        </section>

        {/* 3. FOOTER FIJO (Doble nivel para evitar solapamiento) */}
      
          <div className="flex flex-col w-full">
            <div className="home-progress-footer-cta px-5 pt-3 pb-10 w-full">
              <Link
                to="/registro"
                className="home-progress-footer-button group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-3 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all"
              >
                {t("home.progress.cta")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="home-progress-footer-nav h-16 w-full flex items-center justify-center">
              <NavNavigation />
            </div>
          </div>
   
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

{/* --- COMPONENTES AUXILIARES --- */}

function BarChartColumn({ pct, label, value, active = false }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
      <div className="w-full rounded-t-lg bg-[var(--app-border)]/20 overflow-hidden h-full flex items-end">
        <div 
          className={`w-full rounded-t-md transition-all duration-700 ease-out ${active ? 'bg-[var(--app-primary)] shadow-[0_0_15px_var(--app-glow)]' : 'bg-[var(--app-border)]/60'}`} 
          style={{ height: pct }} 
        />
      </div>
      <div className="flex flex-col items-center">
        <span className={`text-[8px] font-black italic tracking-tighter ${active ? 'text-[var(--app-text)]' : 'text-[var(--app-muted)]'}`}>{value}</span>
        <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${active ? 'text-[var(--app-primary)]' : 'text-[var(--app-muted)]'}`}>{label}</span>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3.5 shadow-sm border-b-4 hover:border-[var(--app-primary)] transition-all">
      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--app-muted)]">{title}</p>
      <div className="flex items-baseline justify-between mt-1">
        <p className="text-lg font-black italic text-[var(--app-text)]">{value}</p>
        <div className="flex items-center gap-0.5">
          {icon}
          <span className="text-[8px] font-bold text-[var(--app-text)]/60">{change}</span>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ date, title, details }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-black text-[var(--app-primary)] uppercase italic w-8">{date}</span>
        <h4 className="text-[11px] font-black uppercase italic text-[var(--app-text)]">{title}</h4>
      </div>
      <span className="text-[9px] font-bold text-[var(--app-muted)] uppercase">{details}</span>
    </div>
  );
}
