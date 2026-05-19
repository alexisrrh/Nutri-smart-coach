import { Link } from "react-router-dom";
import { Camera, ShieldCheck, Sparkles, Zap } from "lucide-react";
import SmartImage from "../../components/ui/SmartImage";
import { NavNavigation } from "./NavNavigation";

export function BodyScaner() {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] flex items-center justify-center p-0 md:p-6">
      
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
      <main className="relative w-full max-w-[430px] h-absolute min-h-screen md:min-h-[880px] md:h-[880px] overflow-y-auto overflow-x-hidden bg-[var(--app-card)] text-[var(--app-text)] font-sans md:rounded-[40px] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[var(--app-border)] flex flex-col justify-between">
        
        {/* Capas decorativas de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,var(--app-primary)15,transparent_55%),radial-gradient(circle_at_15%_75%,var(--app-primary)10,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-25" />

        <section className="relative z-10 px-5 py-5 flex flex-col justify-between flex-1">
          
          {/* NAV BAR MÓVIL */}
          <nav className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="NutriSmart Coach"
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-glow)] border border-[var(--app-border)]"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight text-[var(--app-text)]">
                  Nutri<span className="text-[var(--app-primary)]">Smart</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  Coach IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
              >
                Login
              </Link>
              <Link
                to="/registro"
                className="rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)] transition hover:bg-[var(--app-primary)]"
              >
                Empezar
              </Link>
            </div>
          </nav>

          

          {/* CONTENIDO PRINCIPAL DE LA HERRAMIENTA */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-6 px-1">

            {/* Títulos Principales sin recortes */}
            <h1 className="text-[2rem] font-black italic uppercase tracking-tight overflow-visible leading-none block text-[var(--app-text)]">
              Body
              <span className="inline-block bg-gradient-to-r from-[var(--app-primary)] via-[var(--app-primary)] to-cyan-300 bg-clip-text text-transparent pr-[0.15em] -mr-[0.15em]">
                Scaner
              </span>
            </h1>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">
              Check-in físico con foto
            </p>

            

            <br></br>
            
           {/* Contenedor del escáner con super-neón esmeralda de alta intensidad (Siempre activo al máximo) */}
            <Link 
            to="/registro" 
            className="relative mb-6 flex h-44 w-44 items-center justify-center rounded-[3.2rem] border border-[var(--app-border)] bg-gradient-to-b from-[var(--app-primary-soft)] to-transparent p-2.5 backdrop-blur-sm cursor-pointer active:scale-[0.98] shadow-[0_0_20px_var(--app-glow),0_0_40px_var(--app-glow),0_0_60px_var(--app-glow)] transition-all block group"
            >
            {/* Pulso de radar interno con opacidad incrementada */}
            <div className="radar-glow absolute inset-0 rounded-[3.2rem] bg-[var(--app-primary)]/20" />
            
            {/* Contenedor interno del visor con contorno verde esmeralda puro */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2.6rem] border-2 border-[var(--app-border)] bg-[var(--app-surface)] shadow-[inset_0_0_20px_var(--app-glow)]">
                
                {/* Cuadros de enfoque técnico en las esquinas con destello LED de máxima potencia */}
                <div className="absolute top-4 left-4 h-3 w-3 border-t-2 border-l-2 border-[var(--app-border)] z-20 shadow-[0_0_8px_var(--app-glow),0_0_15px_var(--app-glow)]" />
                <div className="absolute top-4 right-4 h-3 w-3 border-t-2 border-r-2 border-[var(--app-border)] z-20 shadow-[0_0_8px_var(--app-glow),0_0_15px_var(--app-glow)]" />
                <div className="absolute bottom-4 left-4 h-3 w-3 border-b-2 border-l-2 border-[var(--app-border)] z-20 shadow-[0_0_8px_var(--app-glow),0_0_15px_var(--app-glow)]" />
                <div className="absolute bottom-4 right-4 h-3 w-3 border-b-2 border-r-2 border-[var(--app-border)] z-20 shadow-[0_0_8px_var(--app-glow),0_0_15px_var(--app-glow)]" />
                
                {/* TU IMAGEN LOCAL */}
                <SmartImage
                src="/icons/bodyscan.png"
                alt="Progreso de composición corporal"
                className="h-full w-full object-cover opacity-100 absolute inset-0 z-0 scale-100"
                />

                {/* Filtro degradado esmeralda de alta densidad en la base */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/70 via-transparent to-transparent z-10 pointer-events-none" />
                
                {/* LÍNEA LÁSER ROJA CONSTANTE */}
                <div className="laser-line absolute inset-x-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--app-primary)] to-transparent shadow-[0_0_12px_var(--app-glow)]" />
            </div>
            </Link>

            <p className="mt-4 text-xs leading-relaxed text-[var(--app-muted)] px-3">
              Sube fotos comparables para revisar cambios físicos visibles y medidas clave.
            </p>





            {/* LISTA DE CARACTERÍSTICAS */}
            <div className="mt-6 w-full space-y-2.5 text-left">
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
                desc="Tus imágenes se procesan de forma 100% cifrada y privada."
              />
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN INMEDIATA */}
          <div className="w-full mt-2">
            <Link
              to="/registro"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-4 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all hover:bg-[var(--app-primary)]"
              >
              Iniciar escaneo
              <Camera size={16} className="transition-transform group-hover:translate-x-1" />
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
    <div className="flex gap-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 transition-all duration-200 hover:bg-[var(--app-primary-soft)] active:scale-[0.99] cursor-pointer">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-inner">
        {icon}
      </div>
      <div className="leading-tight flex flex-col justify-center">
        <h3 className="text-[11px] font-black text-[var(--app-text)] uppercase tracking-wider">{title}</h3>
        <p className="mt-0.5 text-[10px] text-[var(--app-muted)] leading-normal">{desc}</p>
      </div>
    </div>
  );
}
