import { Link } from "react-router-dom";
import {
  Camera,
  Utensils,
  LineChart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Zap,
} from "lucide-react";

export function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050a09] text-white font-sans">
      <section className="relative px-6 py-8 md:px-12 lg:px-24">
        {/* Luces de fondo sutiles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#4361ee12,transparent_40%),radial-gradient(circle_at_20%_80%,#00e68a08,transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:50px_50px]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-emerald-500 shadow-[0_0_20px_#10b98144]">
              <Sparkles size={20} className="text-[#050a09]" />
            </div>
            <p className="text-xl font-black tracking-tighter uppercase italic">
              Nutri <span className="text-emerald-500">Smart</span> Coach
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="bg-white px-6 py-2 text-[11px] font-black text-[#050a09] uppercase tracking-[0.2em] hover:bg-emerald-500 transition">
              Empezar Ahora
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          {/* TEXTO DE VENTAS (HERO) */}
          <div className="flex flex-col items-start text-left">
            <div className="mb-6 inline-flex items-center gap-2 bg-emerald-500/10 border-l-4 border-emerald-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
              <Zap size={14} className="fill-current" />
              TU TRANSFORMACIÓN COMIENZA AQUÍ
            </div>

            <h1 className="text-7xl font-black leading-[0.85] tracking-tighter md:text-9xl italic uppercase">
              DOMINA <br /> 
              <span className="text-emerald-500">TU CUERPO</span>
            </h1>

            <p className="mt-8 max-w-lg text-xl font-bold leading-tight text-white/60 uppercase tracking-tight">
              La tecnología más avanzada para <span className="text-white">hackear tu nutrición</span>. Analiza tus platos en segundos y alcanza tu mejor versión física.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center gap-4 bg-emerald-500 px-12 py-6 text-base font-black uppercase tracking-widest text-[#050a09] hover:bg-white transition-all shadow-[0_20px_40px_#10b98133] group"
              >
                  INICIAR ANALISIS
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-8 w-full">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black italic">100%</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 text-nowrap">Precisión IA</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black italic">24/7</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 text-nowrap">Coach Inteligente</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black italic">GRATIS</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 text-nowrap">Prueba Inicial</span>
              </div>
            </div>
          </div>

          {/* TARJETA DE ANÁLISIS (MÁS CLARA) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-sm opacity-10 blur-xl group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative border border-white/10 bg-[#0d1412] p-1">
              <div className="bg-[#050a09] p-6 border border-white/5">
                <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Sistema.Visión_IA</p>
                    <h2 className="text-2xl font-black tracking-tight uppercase italic text-white">Análisis en Vivo</h2>
                  </div>
                  <div className="h-10 w-10 border border-white/20 flex items-center justify-center text-emerald-500 bg-white/5">
                    <Camera size={18} />
                  </div>
                </div>

                <div className="relative mb-8 h-72 overflow-hidden border border-white/10 bg-[#121a17]">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
                    alt="Nutrición"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Línea de Escaneo Láser más visible */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-emerald-400 shadow-[0_0_15px_#4ade80] animate-[scan_2.5s_ease-in-out_infinite] z-20" />
                  
                  {/* Overlay degradado ajustado para no oscurecer demasiado la comida */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a09] via-transparent to-transparent opacity-40" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DashboardMacro title="Calorías" value="1230" unit="kcal" color="bg-emerald-500" pct="60%" />
                  <DashboardMacro title="Proteína" value="100" unit="g" color="bg-blue-400" pct="85%" />
                  <DashboardMacro title="Carbohidratos" value="145" unit="g" color="bg-amber-400" pct="45%" />
                  <DashboardMacro title="Grasas" value="42" unit="g" color="bg-rose-500" pct="30%" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MENÚ INFERIOR (ESTILO DASHBOARD) */}
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 border border-white/10 bg-[#0a0f0e] shadow-2xl">
          <DashboardTab icon={<Camera size={18}/>} title="Analizar" active={true} />
          <DashboardTab icon={<Utensils size={18}/>} title="Dietas" />
          <DashboardTab icon={<LineChart size={18}/>} title="Progreso" />
          <DashboardTab icon={<Sparkles size={18}/>} title="Coach IA" />
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
      `}} />
    </main>
  );
}

function DashboardMacro({ title, value, unit, color, pct }) {
  return (
    <div className="bg-white/[0.03] p-4 border border-white/[0.05] hover:bg-white/[0.07] transition-colors">
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-black italic tracking-tighter">{value}</span>
        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">{unit}</span>
      </div>
      <div className="mt-4 h-[2px] w-full bg-white/5">
        <div className={`h-full ${color} opacity-80 shadow-[0_0_8px_current]`} style={{ width: pct }} />
      </div>
    </div>
  );
}

function DashboardTab({ icon, title, active = false }) {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-3 p-8 transition-all cursor-pointer border-r border-white/5 last:border-none ${active ? 'bg-emerald-500 text-[#050a09]' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}>
      <span className={active ? 'text-[#050a09]' : 'text-emerald-400 group-hover:text-emerald-300'}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">{title}</span>
    </div>
  );
}