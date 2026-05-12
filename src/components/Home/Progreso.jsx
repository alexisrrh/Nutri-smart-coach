import { Link } from "react-router-dom";
import { Camera, Utensils, LineChart, ShieldCheck, ArrowLeft, TrendingUp, Calendar, Award, ArrowRight } from "lucide-react";

export function Progreso() {
  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6">
      
      {/* Contenedor móvil con dimensiones fijas de smartphone */}
      <main className="relative w-full max-w-[430px] h-absolute min-h-screen md:min-h-[880px] md:h-[880px] overflow-y-auto overflow-x-hidden bg-[#06110e] text-white font-sans md:rounded-[40px] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[#1f2937] flex flex-col justify-between">
        
        {/* Capas decorativas de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#10b98110,transparent_50%)] pointer-events-none" />
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

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 flex flex-col mt-4">
            
            {/* TARJETA RESUMEN DE LOGROS */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Award size={20} />
              </div>
              <div className="leading-tight">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">¡Meta semanal alcanzada!</h3>
                <p className="text-[11px] text-white/60 leading-normal mt-0.5">La combinación de tu déficit calórico y el entrenamiento optimizado por la IA ha acelerado tu ritmo de quema grasa.</p>
              </div>
            </div>

            {/* GRÁFICO CON DESCRIPCIÓN */}
            <div className="mb-1 px-1 flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Control de peso IA</h3>
              <p className="text-[10px] text-white/30 leading-normal mt-0.5">Graficamos tus variaciones semanales analizando tendencias reales por encima de las fluctuaciones diarias de líquidos.</p>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4 backdrop-blur-md">
              <div className="flex justify-between items-end h-28 gap-2 pt-2">
                <BarChartColumn pct="90%" label="Sem 1" value="78.2 kg" />
                <BarChartColumn pct="75%" label="Sem 2" value="77.5 kg" />
                <BarChartColumn pct="50%" label="Sem 3" value="76.9 kg" />
                <BarChartColumn pct="35%" label="Sem 4" value="76.1 kg" active />
              </div>
            </div>

            {/* TARJETAS DE MÉTRICAS CON EXPLICACIÓN */}
            <div className="mb-2 px-1 flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Métricas avanzadas</h3>
              <p className="text-[10px] text-white/30 leading-normal mt-0.5">Calculamos la recomposición corporal estimando la relación entre tejido adiposo y magro.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetricCard 
                title="Grasa Corporal" 
                value="14.2%" 
                change="-1.5% esta sem." 
                icon={<TrendingUp size={14} className="text-emerald-400 transform rotate-180" />} 
              />
              <MetricCard 
                title="Masa Muscular" 
                value="62.4 kg" 
                change="+0.8 kg esta sem." 
                icon={<TrendingUp size={14} className="text-emerald-400" />} 
              />
            </div>

            {/* HISTORIAL DE LOGS */}
            <div className="mb-2 px-1 flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Línea de hábitos</h3>
              <p className="text-[10px] text-white/30 leading-normal mt-0.5">Registro automático de actividades y comidas validadas por el escáner.</p>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-none">
              <HistoryRow date="Hoy, 12 de Mayo" title="Análisis de Plato IA" details="1230 kcal" />
              <HistoryRow date="Ayer, 11 de Mayo" title="Registro de Peso" details="76.1 kg" />
            </div>

          </div>

          {/* BOTÓN DE ACCIÓN INMEDIATA */}
          <div className="w-full mt-4">
            <Link
              to="/registro"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_12px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all hover:bg-white"
            >
              Ver reporte detallado
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* MENÚ INFERIOR TÁCTIL SINCRONIZADO CON HOME Y DIETAS */}
          <div className="relative z-10 mt-5 grid grid-cols-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            <DashboardTab to="/" icon={<Camera size={16} />} title="Analizar" />
            <DashboardTab to="/bodyscannerhome" icon={<ShieldCheck size={16} />} title="BodyScanner" />
            <DashboardTab to="/dietahome" icon={<Utensils size={16} />} title="Dietas" />
            <DashboardTab bro to="/progresohome" icon={<LineChart size={16} />} title="Progresos" active />
          </div>

        </section>
      </main>
    </div>
  );
}

{/* COMPONENTES COMPLEMENTARIOS INTERNOS */}
function BarChartColumn({ pct, label, value, active = false }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
      <span className="text-[9px] font-bold text-white/40 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute mb-14 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 z-20">
        {value}
      </span>
      <div className="w-full rounded-t-lg bg-white/5 overflow-hidden h-full flex items-end">
        <div 
          className={`w-full rounded-t-md transition-all duration-500 ${active ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-white/20'}`} 
          style={{ height: pct }} 
        />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wider ${active ? 'text-emerald-400' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );
}

function MetricCard({ title, value, change, icon }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-white/40">{title}</p>
      <p className="text-lg font-black italic mt-0.5 text-white">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {icon}
        <span className="text-[10px] font-bold text-emerald-400">{change}</span>
      </div>
    </div>
  );
}

function HistoryRow({ date, title, details }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 mt-0.5">
          <Calendar size={13} />
        </div>
        <div className="leading-tight">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{date}</p>
          <h4 className="text-xs font-black text-white/80 mt-0.5">{title}</h4>
        </div>
      </div>
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full border border-emerald-400/10">
        {details}
      </span>
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
