import { Link } from "react-router-dom";
import { Camera, Utensils, LineChart, ShieldCheck, Sparkles, Zap, ArrowRight } from "lucide-react";
import SmartImage from "../../components/ui/SmartImage";
import { NavNavigation } from "./NavNavigation";

export function BodyScaner() {
  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6">
      
      <style>{`
        @keyframes laserMotion {
            0%, 100% { top: 0%; opacity: 1; } /* ✅ Opacidad fijada en 1 al inicio y final */
            50% { top: 100%; opacity: 1; }    /* ✅ Opacidad fijada en 1 a mitad del recorrido */
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
        `}</style>


      {/* Contenedor móvil con dimensiones fijas de smartphone */}
      <main className="relative w-full max-w-[430px] h-absolute min-h-screen md:min-h-[880px] md:h-[880px] overflow-y-auto overflow-x-hidden bg-[#06110e] text-white font-sans md:rounded-[40px] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[#1f2937] flex flex-col justify-between">
        
        {/* Capas decorativas de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,#10b98115,transparent_55%),radial-gradient(circle_at_15%_75%,#06b6d410,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <section className="relative z-10 px-5 py-5 flex flex-col justify-between flex-1">
          
          {/* NAV BAR MÓVIL */}
          <nav className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="NutriSmart Coach"
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_#10b98133] border border-emerald-500"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight">
                  Nutri<span className="text-emerald-300">Smart</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-emerald-300/60">
                  Coach IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/60 transition hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/registro"
                className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#03110d] transition hover:bg-emerald-400"
              >
                Empezar
              </Link>
            </div>
          </nav>

          {/* CONTENIDO PRINCIPAL DE LA HERRAMIENTA */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-6 px-1">
            
           {/* Contenedor del escáner con super-neón esmeralda de alta intensidad (Siempre activo al máximo) */}
            <Link 
            to="/registro" 
            className="relative mb-6 flex h-44 w-44 items-center justify-center rounded-[3.2rem] border border-emerald-400 bg-gradient-to-b from-emerald-500/20 to-transparent p-2.5 backdrop-blur-sm cursor-pointer active:scale-[0.98] shadow-[0_0_20px_#10b981,0_0_40px_rgba(16,185,129,0.4),0_0_60px_rgba(16,185,129,0.2)] transition-all block group"
            >
            {/* Pulso de radar interno con opacidad incrementada */}
            <div className="radar-glow absolute inset-0 rounded-[3.2rem] bg-emerald-500/25" />
            
            {/* Contenedor interno del visor con contorno verde esmeralda puro */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2.6rem] border-2 border-emerald-400 bg-[#020a07] shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]">
                
                {/* Cuadros de enfoque técnico en las esquinas con destello LED de máxima potencia */}
                <div className="absolute top-4 left-4 h-3 w-3 border-t-2 border-l-2 border-emerald-300 z-20 shadow-[0_0_8px_#10b981,0_0_15px_#10b981]" />
                <div className="absolute top-4 right-4 h-3 w-3 border-t-2 border-r-2 border-emerald-300 z-20 shadow-[0_0_8px_#10b981,0_0_15px_#10b981]" />
                <div className="absolute bottom-4 left-4 h-3 w-3 border-b-2 border-l-2 border-emerald-300 z-20 shadow-[0_0_8px_#10b981,0_0_15px_#10b981]" />
                <div className="absolute bottom-4 right-4 h-3 w-3 border-b-2 border-r-2 border-emerald-400 z-20 shadow-[0_0_8px_#10b981,0_0_15px_#10b981]" />
                
                {/* TU IMAGEN LOCAL */}
                <SmartImage
                src="/icons/bodyscan.png"
                alt="Progreso de composición corporal"
                className="h-full w-full object-cover opacity-100 absolute inset-0 z-0 scale-100"
                />

                {/* Filtro degradado esmeralda de alta densidad en la base */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent z-10 pointer-events-none" />
                
                {/* LÍNEA LÁSER ROJA CONSTANTE */}
                <div className="laser-line absolute inset-x-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#ef4444]" />
            </div>
            </Link>





            {/* Títulos Principales sin recortes */}
            <h1 className="text-[2rem] font-black italic uppercase tracking-tight overflow-visible leading-none block">
              Body
              <span className="inline-block bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent pr-[0.15em] -mr-[0.15em]">
                Scaner
              </span>
            </h1>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-emerald-300/60">
              Check-in físico con foto
            </p>

            <p className="mt-4 text-xs leading-relaxed text-white/60 px-3">
              Sube fotos comparables para revisar cambios físicos visibles y medidas clave.
            </p>

            {/* LISTA DE CARACTERÍSTICAS */}
            <div className="mt-6 w-full space-y-2.5 text-left">
              <FeatureCard 
                icon={<Sparkles size={14} className="text-emerald-300" />}
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
                desc="Tus imágenes se procesan de forma 100% cifrada y privada."
              />
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN INMEDIATA */}
          <div className="w-full mt-2">
            <Link
              to="/registro"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_12px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all hover:bg-white"
            >
              Iniciar escaneo
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="h-20"></div> 
          </div>

          {/* MENÚ INFERIOR TÁCTIL */}
          


        </section>
        <NavNavigation />
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/10 active:scale-[0.99] cursor-pointer">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner">
        {icon}
      </div>
      <div className="leading-tight flex flex-col justify-center">
        <h3 className="text-[11px] font-black text-white/90 uppercase tracking-wider">{title}</h3>
        <p className="mt-0.5 text-[10px] text-white/45 leading-normal">{desc}</p>
      </div>
    </div>
  );
}

function DashboardTab({ icon, title, to = "#", active = false }) {
  return (
    <Link
      to={to}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 p-2.5 transition-all text-center border-r border-white/5 last:border-none active:scale-95 duration-100 ${
        active
          ? "bg-emerald-400 text-[#03110d]"
          : "text-white/45 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-[#03110d]" : "text-emerald-300"}>
        {icon}
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.12em]">
        {title}
      </span>
    </Link>
  );
}
