import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Zap, ArrowRight } from "lucide-react";
import SmartImage from "../../components/ui/SmartImage";
import { NavNavigation } from "./NavNavigation";

export function BodyScaner() {
  return (
    <div className="h-dvh w-full bg-[var(--app-bg)] flex items-start justify-center overflow-hidden font-sans">
      
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
      `}</style>

      <main
        className="relative w-full max-w-[430px] h-full md:h-[880px] bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-2xl md:border-8 md:border-[var(--app-border)] flex flex-col overflow-hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        
        {/* Capas decorativas de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,var(--app-primary)15,transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

        {/* 1. HEADER (Fijo) */}
        <header className="relative z-20 px-5 pt-3 shrink-0">
          <nav className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
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

        {/* 2. CONTENIDO SCROLLABLE (Para evitar choques en móviles pequeños) */}
        <section className="relative z-10 flex-1 overflow-hidden overflow-x-hidden px-5">
          <div className="flex h-full flex-col items-center text-center py-3">
            <h1 className="text-[1.75rem] font-black italic uppercase tracking-tight leading-none text-[var(--app-text)]">
              Body <span className="bg-gradient-to-r from-[var(--app-primary)] to-cyan-300 bg-clip-text text-transparent">Scaner</span>
            </h1>
            <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">
              Check-in físico con foto
            </p>

            {/* VISOR DE ESCÁNER */}
            <div className="mt-4">
              <Link 
                to="/registro" 
                className="relative flex h-36 w-36 items-center justify-center rounded-[3rem] border border-[var(--app-border)] bg-gradient-to-b from-[var(--app-primary-soft)] to-transparent p-1.5 backdrop-blur-sm active:scale-[0.98] shadow-[0_0_40px_var(--app-glow)] transition-all block group"
              >
                <div className="radar-glow absolute inset-0 rounded-[3rem] bg-[var(--app-primary)]/20" />
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2.4rem] border-2 border-[var(--app-border)] bg-[var(--app-surface)] shadow-[inset_0_0_20px_var(--app-glow)]">
                    <SmartImage src="/icons/bodyscan.png" alt="Body Scan" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/70 via-transparent to-transparent z-10 pointer-events-none" />
                    {/* LÍNEA LÁSER ROJA */}
                    <div className="laser-line absolute inset-x-0 z-20 h-[2px] bg-red-500 shadow-[0_0_15px_#ef4444,0_0_5px_#ffffff]" />
                </div>
              </Link>
            </div>

            {/* LISTA DE CARACTERÍSTICAS (Incluyendo Privacidad) */}
            <div className="mt-4 w-full space-y-2 text-left pb-2">
              <FeatureCard 
                icon={<Sparkles size={14} className="text-[var(--app-primary)]" />}
                title="Grasa Corporal Estimada"
                desc="Detecta cambios en la definición muscular mediante IA visual."
              />
              <FeatureCard 
                icon={<Zap size={14} className="text-cyan-300" />}
                title="Evolución de Perímetros"
                desc="Mide variaciones en hombros, cintura y extremidades."
              />
              <FeatureCard 
                icon={<ShieldCheck size={14} className="text-amber-300" />}
                title="Privacidad Protegida"
                desc="Tus fotos se procesan localmente y nunca se comparten."
              />
            </div>
          </div>
        </section>

        {/* 3. FOOTER FIJO (Botón + Nav integrados) */}
     
          <div className="flex flex-col w-full">
          <div className="px-5 pt-3 pb-10 w-full">
              <Link
                to="/registro"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-3 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all"
              >
                Iniciar Escaneo <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="h-16 flex items-center justify-center">
              <NavNavigation />
            </div>
          </div>
       
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/50 backdrop-blur-sm">
      <div className="shrink-0 mt-0.5 bg-[var(--app-surface)] p-2 rounded-xl border border-[var(--app-border)] shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="text-[12px] font-black uppercase italic text-[var(--app-text)] tracking-tight">{title}</h4>
        <p className="text-[10px] text-[var(--app-muted)] leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
