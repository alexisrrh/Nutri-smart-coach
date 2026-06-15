import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowRight, Zap } from "lucide-react";
import SmartImage from "../components/ui/SmartImage";
import { NavNavigation } from "../components/Home/NavNavigation";
import { useAuth } from "../context/useAuth";
import {
  prefetchDashboardData,
  preloadDashboardChunk,
} from "../services/dashboardPrefetchService";

export function Home() {
  const { user, loadingAuth } = useAuth();

  useEffect(() => {
    if (loadingAuth || !user?.id) return undefined;

    const runPrefetch = () => {
      void preloadDashboardChunk();
      void prefetchDashboardData(user.id);
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(runPrefetch, { timeout: 1800 });

      return () => window.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(runPrefetch, 900);

    return () => window.clearTimeout(timeoutId);
  }, [loadingAuth, user?.id]);

  return (
    <div className="home-home-shell h-dvh w-full bg-[var(--app-bg)] flex items-start justify-center overflow-hidden font-sans">
      
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
        @media (max-width: 390px) {
          .home-header {
            gap: 0.4rem;
          }
          .home-header-brand {
            gap: 0.4rem;
          }
          .home-header-brand img {
            width: 34px;
            height: 34px;
          }
          .home-header-brand p:first-child {
            font-size: 0.78rem;
            line-height: 1;
          }
          .home-header-brand p:last-child {
            font-size: 7px;
            letter-spacing: 0.14em;
          }
          .home-header-auth {
            gap: 0.35rem;
          }
          .home-header-auth-btn {
            padding-left: 0.45rem;
            padding-right: 0.45rem;
            padding-top: 0.35rem;
            padding-bottom: 0.35rem;
            font-size: 8px;
            letter-spacing: 0.12em;
          }
          .home-header-auth-primary {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
        @media (max-height: 800px) {
          .home-home-shell > main {
            padding-top: calc(env(safe-area-inset-top) + 12px);
          }
          .home-home-shell .home-home-header {
            padding-top: 6px;
          }
          .home-home-shell .home-home-nav {
            padding-bottom: 6px;
          }
          .home-home-shell .home-home-title {
            font-size: 1.42rem;
          }
          .home-home-shell .home-home-badge {
            margin-bottom: 0.5rem;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
            font-size: 7px;
          }
          .home-home-shell .home-home-content {
            gap: 0.35rem;
            padding-top: 0.55rem;
            padding-bottom: 0.1rem;
          }
          .home-home-shell .home-home-panel-wrap {
            padding-left: 0;
            padding-right: 0;
          }
          .home-home-shell .home-home-panel {
            padding: 0.35rem;
          }
          .home-home-shell .home-home-panel-inner {
            padding: 0.5rem;
          }
          .home-home-shell .home-home-panel-header {
            margin-bottom: 0.35rem;
          }
          .home-home-shell .home-home-panel-title {
            font-size: 12px;
          }
          .home-home-shell .home-home-camera-btn {
            width: 1.75rem;
            height: 1.75rem;
          }
          .home-home-shell .home-home-preview {
            height: 7.5rem;
          }
          .home-home-shell .home-home-macros {
            margin-top: 0.45rem;
            gap: 0.35rem;
          }
          .home-home-shell .home-home-stats-grid {
            gap: 0.35rem;
            padding-bottom: 0.25rem;
          }
          .home-home-shell .home-home-stat {
            padding: 0.35rem;
          }
          .home-home-shell .home-home-privacy {
            margin-top: 0.15rem;
          }
          .home-home-shell .home-home-cta-wrap {
            padding-top: 0.25rem;
            padding-bottom: 0.85rem;
          }
          .home-home-shell .home-home-cta {
            padding-top: 0.7rem;
            padding-bottom: 0.7rem;
          }
          .home-home-shell .home-home-nav-wrap {
            margin-top: 0.5rem;
            height: 60px;
          }
        }
        @media (max-height: 700px) {
          .home-home-shell .home-home-title {
            font-size: 1.28rem;
          }
          .home-home-shell .home-home-badge {
            margin-bottom: 0.35rem;
            padding-top: 0.2rem;
            padding-bottom: 0.2rem;
          }
          .home-home-shell .home-home-content {
            gap: 0.25rem;
            padding-top: 0.4rem;
          }
          .home-home-shell .home-home-panel {
            padding: 0.28rem;
          }
          .home-home-shell .home-home-panel-inner {
            padding: 0.4rem;
          }
          .home-home-shell .home-home-panel-header {
            margin-bottom: 0.25rem;
          }
          .home-home-shell .home-home-preview {
            height: 6.9rem;
          }
          .home-home-shell .home-home-macros {
            margin-top: 0.35rem;
          }
          .home-home-shell .home-home-stats-grid {
            padding-bottom: 0.15rem;
          }
          .home-home-shell .home-home-nav-wrap {
            margin-top: 0.65rem;
            height: 54px;
          }
        }
      `}</style>

    <main
        className="relative w-full max-w-[430px] h-full md:h-[880px] bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-2xl md:border-8 md:border-[var(--app-border)] flex flex-col overflow-hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        
        {/* FONDO CUADRICULADO Y GLOW (Recuperados) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%)] pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

        {/* 1. HEADER (Fijo) */}
       <header className="home-home-header home-header relative z-20 px-5 pt-2 shrink-0">
          <nav className="home-home-nav flex items-center justify-between border-b border-[var(--app-border)] pb-2">
            <div className="home-header-brand flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="Logo"
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-glow)] border border-[var(--app-border)]"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight text-[var(--app-text)]">
                  NUTRI<span className="text-[var(--app-primary)]">SMART</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  Coach IA
                </p>
              </div>
            </div>

            <div className="home-header-auth flex items-center gap-2">
              <Link to="/login" className="home-header-auth-btn rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)]">
                INICIAR SESIÓN
              </Link>
              <Link to="/registro" className="home-header-auth-btn home-header-auth-primary rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)]">
                REGÍSTRATE
              </Link>
            </div>
          </nav>
        </header>

        {/* 2. CONTENIDO SCROLLABLE */}
    <section className="relative z-10 flex-1 px-5 pb-4 overflow-hidden">
      <div className="home-home-content flex h-full flex-col justify-between gap-2 pt-3">
            
            {/* TITULO */}
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="home-home-badge mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-1 text-[9px] font-black uppercase text-[var(--app-primary)] shadow-[0_0_15px_var(--app-glow)]">
                <Zap size={11} className="fill-current" /> Fitness + NUTRICIÓN IA
              </div>
              <h1 className="home-home-title text-[1.55rem] font-black italic uppercase leading-none tracking-tight">
                Domina <span className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary)] bg-clip-text text-transparent">tu cuerpo</span>
              </h1>
              <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">ANALISAMOS TU COMIDA CON PRECISIÓN</p>

            </div>

            {/* RECUADRO DE ANÁLISIS */}
            <div className="home-home-panel-wrap relative w-full px-1 shrink-0">
              <div className="absolute -inset-2 rounded-[2rem] bg-[var(--app-primary-soft)] blur-2xl pointer-events-none" />
              <div className="home-home-panel relative rounded-[1.8rem] border border-[var(--app-border)] bg-gradient-to-b from-[var(--app-primary-soft)] to-transparent p-2 backdrop-blur-sm shadow-[0_0_40px_var(--app-glow)]">
                <div className="home-home-panel-inner rounded-[1.4rem] border-2 border-[var(--app-border)] bg-[var(--app-surface)]/95 p-3 shadow-[inset_0_0_20px_var(--app-glow)]">
                  
                  <div className="home-home-panel-header mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--app-primary)]">Sistema IA activo</p>
                      <h2 className="home-home-panel-title mt-0.5 text-base font-black uppercase italic tracking-tight text-[var(--app-text)]">Análisis en vivo</h2>
                    </div>
                    <Link to="/registro" className="home-home-camera-btn h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] active:scale-90 transition-all">
                      <Camera size={18} />
                    </Link>
                  </div>

                  <Link to="/registro" className="home-home-preview relative block h-40 overflow-hidden rounded-[1.1rem] border border-[var(--app-border)] bg-[var(--app-surface)] active:scale-[0.97] transition-transform group">
                    <SmartImage 
                      src="https://imag.bonviveur.com/presentacion-final-del-poke-bowl-de-pollo-y-verduras.webp" 
                      alt="Nutrición" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-x-0 z-20 h-[2px] animate-[scan_2.8s_ease-in-out_infinite] bg-red-500 shadow-[0_0_12px_#ef4444]" />
                  </Link>

                  <div className="home-home-macros grid grid-cols-2 gap-2 mt-3">
                    <DashboardMacro title="Calorías" value="450" unit="kcal" color="bg-emerald-400" pct="60%" />
                    <DashboardMacro title="Proteína" value="28" unit="g" color="bg-cyan-400" pct="85%" />
                    <DashboardMacro title="Carbs" value="42" unit="g" color="bg-amber-300" pct="45%" />
                    <DashboardMacro title="Grasas" value="12" unit="g" color="bg-rose-400" pct="30%" />
                  </div>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="w-full shrink-0">
              <div className="home-home-stats-grid grid grid-cols-3 gap-2 pb-4">
                <Stat value="IA" label="Análisis" className="home-home-stat" />
                <Stat value="24/7" label="Coach" className="home-home-stat" />
                <Stat value="PRO" label="Hábitos" className="home-home-stat" />
              </div>
               <div className="home-home-privacy text-center justify-center">
                <Link 
                to="/privacy" 
                className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] hover:text-[var(--app-primary)] transition-colors "
              >
                Política de Privacidad
              </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FOOTER FIJO */}
     
          <div className="flex flex-col w-full">
            {/* Contenedor central del botón y el link */}
         <div className="home-home-cta-wrap px-5 pt-2 pb-4 w-full flex flex-col items-center gap-2">
              <Link
                to="/registro"
                className="home-home-cta group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-4 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all"
              >
                Iniciar análisis 
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

  

            </div>

            {/* Navegación inferior */}
           <div className="home-home-nav-wrap mt-2 h-[72px] w-full flex items-center justify-center">
              <NavNavigation />
            </div>
          </div>
     


      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

{/* --- AUXILIARES (Asegúrate de tenerlos) --- */}
function Stat({ value, label, className = "" }) {
  return (
    <div className={`rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-center ${className}`}>
      <span className="block text-base font-black italic text-[var(--app-primary)]">{value}</span>
      <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-widest text-[var(--app-muted)]">{label}</span>
    </div>
  );
}

function DashboardMacro({ title, value, unit, color, pct }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]">{title}</p>
      <div className="mt-0.5 flex items-baseline gap-0.5">
        <span className="text-base font-black italic text-[var(--app-text)]">{value}</span>
        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--app-muted)]">{unit}</span>
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-[var(--app-border)]/20">
        <div className={`h-full ${color}`} style={{ width: pct }} />
      </div>
    </div>
  );
}
