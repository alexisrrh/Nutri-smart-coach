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
    <div className="h-dvh w-full bg-[var(--app-bg)] flex items-center justify-center overflow-hidden font-sans">
      
      <main className="relative w-full max-w-[430px] h-full md:h-[880px] bg-[var(--app-surface)] text-[var(--app-text)] md:rounded-[40px] shadow-2xl md:border-8 md:border-[#1f2937] flex flex-col overflow-hidden">
        
        {/* FONDO CUADRICULADO Y GLOW (Recuperados) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%)] pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

        {/* 1. HEADER (Fijo) */}
        <header className="relative z-20 px-5 pt-5 shrink-0">
          <nav className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
            <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)]">
                INICIAR SESIÓN
              </Link>
              <Link to="/registro" className="rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)]">
                REGÍSTRATE
              </Link>
            </div>
          </nav>
        </header>

        {/* 2. CONTENIDO SCROLLABLE */}
        <section className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-5 pb-6">
          <div className="flex flex-col gap-6 mt-6">
            
            {/* TITULO */}
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-1 text-[9px] font-black uppercase text-[var(--app-primary)] shadow-[0_0_15px_var(--app-glow)]">
                <Zap size={11} className="fill-current" /> Fitness + NUTRICIÓN IA
              </div>
              <h1 className="text-[1.8rem] font-black italic uppercase leading-none tracking-tight">
                Domina <span className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary)] bg-clip-text text-transparent">tu cuerpo</span>
              </h1>
              <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">ANALISAMOS TU COMIDA CON PRECISIÓN</p>

            </div>

            {/* RECUADRO DE ANÁLISIS */}
            <div className="relative w-full px-1 shrink-0">
              <div className="absolute -inset-2 rounded-[2rem] bg-[var(--app-primary-soft)] blur-2xl pointer-events-none" />
              <div className="relative rounded-[1.8rem] border border-[var(--app-border)] bg-gradient-to-b from-[var(--app-primary-soft)] to-transparent p-2 backdrop-blur-sm shadow-[0_0_40px_var(--app-glow)]">
                <div className="rounded-[1.4rem] border-2 border-[var(--app-border)] bg-[var(--app-surface)]/95 p-3 shadow-[inset_0_0_20px_var(--app-glow)]">
                  
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--app-primary)]">Sistema IA activo</p>
                      <h2 className="mt-0.5 text-base font-black uppercase italic tracking-tight text-[var(--app-text)]">Análisis en vivo</h2>
                    </div>
                    <Link to="/registro" className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] active:scale-90 transition-all">
                      <Camera size={18} />
                    </Link>
                  </div>

                  <Link to="/registro" className="relative block h-40 overflow-hidden rounded-[1.1rem] border border-[var(--app-border)] bg-[var(--app-surface)] active:scale-[0.97] transition-transform group">
                    <SmartImage 
                      src="https://imag.bonviveur.com/presentacion-final-del-poke-bowl-de-pollo-y-verduras.webp" 
                      alt="Nutrición" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-x-0 z-20 h-[2px] animate-[scan_2.8s_ease-in-out_infinite] bg-red-500 shadow-[0_0_12px_#ef4444]" />
                  </Link>

                  <div className="grid grid-cols-2 gap-2 mt-3">
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
              <div className="grid grid-cols-3 gap-2 pb-4">
                <Stat value="IA" label="Análisis" />
                <Stat value="24/7" label="Coach" />
                <Stat value="PRO" label="Hábitos" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. FOOTER FIJO */}
        <footer className="relative z-30 shrink-0 bg-[var(--app-surface)]/95 backdrop-blur-2xl border-t border-[var(--app-border)]/20 pb-[env(safe-area-inset-bottom)]">
          <div className="flex flex-col w-full">
            {/* Contenedor central del botón y el link */}
            <div className="px-5 pt-4 pb-2 w-full flex flex-col items-center gap-3"> 
              
              <Link
                to="/registro"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-4 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all"
              >
                Iniciar análisis 
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Enlace centrado debajo del botón */}
              <Link 
                to="/privacidad" 
                className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] hover:text-[var(--app-primary)] transition-colors"
              >
                Política de Privacidad
              </Link>

            </div>

            {/* Navegación inferior */}
            <div className="h-20 w-full flex items-center justify-center">
              <NavNavigation />
            </div>
          </div>
        </footer>


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
function Stat({ value, label }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-center">
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
