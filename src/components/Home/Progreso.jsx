import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Award, ArrowRight } from "lucide-react";
import { NavNavigation } from "./NavNavigation";

export function Progreso() {
  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6">
      
      <main className="relative w-full max-w-[430px] h-absolute min-h-screen md:min-h-[880px] md:h-[880px] overflow-y-auto overflow-x-hidden bg-[#06110e] text-white font-sans md:rounded-[40px] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[#1f2937] flex flex-col justify-between scrollbar-none">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,var(--app-primary)15,transparent_55%),radial-gradient(circle_at_15%_75%,#06b6d410,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <section className="relative z-10 px-5 py-5 flex flex-col flex-1">
          
          <nav className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="NutriSmart Coach"
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-primary)33] border border-[var(--app-border)]"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight">
                  Nutri<span className="text-[var(--app-primary)]">Smart</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-primary)]/60">
                  Coach IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/60 transition hover:text-white">Login</Link>
              <Link to="/registro" className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#03110d] transition hover:bg-[var(--app-primary)]">Empezar</Link>
            </div>
          </nav>

          <div className="flex-1 flex flex-col gap-4 overflow-visible">
            <div className="text-center mb-2">
                <h1 className="text-[2rem] font-black italic uppercase tracking-tight leading-none block">
                    My <span className="inline-block bg-gradient-to-r from-[var(--app-primary)] via-[var(--app-primary)] to-cyan-300 bg-clip-text text-transparent pr-[0.15em] -mr-[0.15em]">Progress</span>
                </h1>
                <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-primary)]/60">Métricas en tiempo real</p>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] p-4 flex items-center gap-3 shadow-[inset_0_0_15px_var(--app-glow)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_10px_var(--app-glow)]">
                <Award size={20} />
              </div>
              <div className="leading-tight">
                <h3 className="text-xs font-black uppercase text-white tracking-wide">¡Meta semanal alcanzada!</h3>
                <p className="text-[11px] text-white/60 mt-0.5">Tu ritmo de quema grasa se ha acelerado.</p>
              </div>
            </div>

            <div>
              <div className="mb-2 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Evolución de peso</h3>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="flex justify-between items-end h-24 gap-2">
                  <BarChartColumn pct="90%" label="Sem 1" value="78.2" />
                  <BarChartColumn pct="75%" label="Sem 2" value="77.5" />
                  <BarChartColumn pct="50%" label="Sem 3" value="76.9" />
                  <BarChartColumn pct="35%" label="Sem 4" value="76.1" active />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard title="Grasa" value="14.2%" change="-1.5%" icon={<TrendingUp size={14} className="text-[var(--app-primary)] rotate-180" />} />
              <MetricCard title="Músculo" value="62.4 kg" change="+0.8 kg" icon={<TrendingUp size={14} className="text-[var(--app-primary)]" />} />
            </div>

            <div>
              <div className="mb-2 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Línea de hábitos</h3>
              </div>
              <div className="space-y-2">
                <HistoryRow date="Hoy" title="Análisis Plato" details="1230 kcal" />
                <HistoryRow date="Ayer" title="Peso" details="76.1 kg" />
              </div>
            </div>

            
          </div>
          <div className="w-full mt-4 mb-12">
              <Link to="/registro" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_12px_30px_var(--app-glow)] transition-all hover:bg-white active:scale-[0.95]">
                Ver reporte detallado
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
        </section>

        <div className="px-5 pb-8 relative z-20">
          <NavNavigation />
        </div>
      </main>
    </div>
  );
}

// FUNCIONES CORREGIDAS (Sin Tipos de TypeScript)
function BarChartColumn({ pct, label, value, active = false }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
      <span className="text-[9px] font-bold text-white/40 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute mb-14 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 z-20">
        {value}
      </span>
      <div className="w-full rounded-t-lg bg-white/5 overflow-hidden h-full flex items-end">
        <div 
          className={`w-full rounded-t-md transition-all duration-500 ${active ? 'bg-[var(--app-primary)] shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-white/20'}`} 
          style={{ height: pct }} 
        />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wider ${active ? 'text-[var(--app-primary)]' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );
}

function MetricCard({ title, value, change, icon }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors">
      <p className="text-[9px] font-black uppercase tracking-wider text-white/40">{title}</p>
      <p className="text-lg font-black italic mt-0.5 text-white">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {icon}
        <span className="text-[10px] font-bold text-[var(--app-primary)]">{change}</span>
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
      <span className="text-[10px] font-bold text-[var(--app-primary)] bg-[var(--app-primary-soft)] px-2 py-0.5 rounded-full border border-[var(--app-border)]">
        {details}
      </span>
    </div>
  );
}
