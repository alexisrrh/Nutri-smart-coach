import { Link } from "react-router-dom";
import {
  Camera,
  ArrowRight,
  Zap,
} from "lucide-react";
import SmartImage from "../components/ui/SmartImage";
import { NavNavigation } from "../components/Home/NavNavigation";

export function Home() {
  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6 font-sans">
      
      {/* Contenedor móvil con dimensiones de smartphone y LUZ EXTERNA */}
      <main className="relative w-full max-w-[430px] h-screen md:h-[880px] overflow-y-auto overflow-x-hidden bg-[#06110e] text-white md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[#1f2937] flex flex-col">
        
        {/* Capas decorativas de fondo (Glow ambiental) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,#10b98115,transparent_45%),radial-gradient(circle_at_15%_80%,#38bdf815,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <section className="relative z-10 px-5 py-5 flex flex-col flex-1">
          
          {/* NAV BAR MÓVIL */}
          <nav className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="NutriSmart Coach"
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_#10b98133] border border-emerald-500"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight text-white">
                  Nutri<span className="text-emerald-300">Smart</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-emerald-300/60">
                  Coach IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/60 transition hover:text-white">
                Login
              </Link>
              <Link to="/registro" className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#03110d] transition hover:bg-emerald-400">
                Empezar
              </Link>
            </div>
          </nav>

          {/* TITULO Y DESCRIPCIÓN */}
          <div className="flex flex-col items-center text-center mt-6 shrink-0">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Zap size={11} className="fill-current" />
              Fitness + nutrición con IA
            </div>
            <h1 className="text-[1.95rem] font-black italic uppercase leading-none tracking-tight">
              Domina <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">tu cuerpo</span>
            </h1>
          </div>

          {/* INTERFAZ DE ANÁLISIS DE DIETA CON LUZ SUPER-NEÓN */}
          <div className="relative w-full mt-6 px-1 shrink-0">
            {/* Resplandor de fondo (Blur) */}
            <div className="absolute -inset-2 rounded-[2rem] bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="relative rounded-[1.8rem] border border-emerald-400 bg-gradient-to-b from-emerald-500/20 to-transparent p-2 backdrop-blur-sm shadow-[0_0_20px_#10b981,0_0_40px_rgba(16,185,129,0.4),0_0_60px_rgba(16,185,129,0.2)]">
              <div className="rounded-[1.4rem] border-2 border-emerald-400 bg-[#091814]/95 p-3 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]">
                
                {/* Cabecera del Análisis */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-emerald-300">
                      Sistema IA activo
                    </p>
                    <h2 className="text-base font-black uppercase italic tracking-tight mt-0.5 text-white">
                      Análisis en vivo
                    </h2>
                  </div>
                  <Link 
                    to="/registro" 
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-300 active:scale-95 transition-transform cursor-pointer hover:bg-white/10"
                  >
                    <Camera size={15} />
                  </Link>
                </div>

                {/* VISOR DE ESCÁNER CON SMARTIMAGE */}
                <div className="relative h-44 overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#121a17]">
                  <Link to="/registro" className="block w-full h-full cursor-pointer active:scale-[0.99] transition-transform duration-150">
                    <SmartImage
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=70"
                      alt="Nutrición saludable"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    
                    {/* LÍNEA DE ESCÁNER ROJA ANIMADA */}
                    <div className="absolute inset-x-0 z-20 h-[2px] animate-[scan_2.8s_ease-in-out_infinite] bg-rose-500 shadow-[0_0_12px_#ef4444] pointer-events-none" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03110d] via-transparent to-transparent opacity-60 pointer-events-none" />
                  </Link>
                </div>

                {/* CUADRÍCULA DE MACRONUTRIENTES */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <DashboardMacro title="Calorías" value="1230" unit="kcal" color="bg-emerald-400" pct="60%" />
                  <DashboardMacro title="Proteína" value="100" unit="g" color="bg-cyan-300" pct="85%" />
                  <DashboardMacro title="Carbs" value="145" unit="g" color="bg-amber-300" pct="45%" />
                  <DashboardMacro title="Grasas" value="42" unit="g" color="bg-rose-400" pct="30%" />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN Y STATS */}
          
          <div className="w-full mt-auto pt-6 shrink-0">
            <div className="grid grid-cols-3 gap-2 px-1 pb-4">
              <Stat value="IA" label="Análisis" />
              <Stat value="24/7" label="Coach" />
              <Stat value="PRO" label="Hábitos" />
            </div>
            <div className="px-1 mb-25 ">
              <Link
                to="/registro"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_12px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all hover:bg-white"
              >
                Iniciar análisis
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            
          </div>

        </section>
        <NavNavigation />
      </main>

      {/* Animación del Escáner */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
      `}} />
    </div>
  );
}

{/* --- COMPONENTES INTERNOS AUXILIARES --- */}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2 text-center backdrop-blur-md transition-all hover:bg-white/[0.08]">
      <span className="block text-base font-black italic text-emerald-300">
        {value}
      </span>
      <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-widest text-white/35">
        {label}
      </span>
    </div>
  );
}

function DashboardMacro({ title, value, unit, color, pct }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.045] p-2.5 transition hover:bg-white/[0.08]">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">
        {title}
      </p>
      <div className="mt-0.5 flex items-baseline gap-0.5">
        <span className="text-base font-black italic tracking-tighter text-white">
          {value}
        </span>
        <span className="text-[8px] font-black uppercase tracking-widest text-white/25">
          {unit}
        </span>
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${color}`} style={{ width: pct }} />
      </div>
    </div>
  );
}
