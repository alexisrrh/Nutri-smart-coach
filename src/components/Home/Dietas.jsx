import { Link } from "react-router-dom";
import {Zap, Camera, Utensils, LineChart, ShieldCheck, Clock, Flame, Apple, ArrowRight, CheckCircle2 } from "lucide-react";
import { NavNavigation } from "./NavNavigation";

export function Dietas() {
  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6">
      
      {/* Contenedor móvil con dimensiones fijas de smartphone */}
      <main className="relative w-full max-w-[430px] h-absolute min-h-screen md:min-h-[880px] md:h-[880px] overflow-y-auto overflow-x-hidden bg-[#06110e] text-white font-sans md:rounded-[40px] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[#1f2937] flex flex-col justify-between">
        
        {/* Capas decorativas de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#10b98112,transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

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
            
            {/* PANEL DE DIETA SEMANAL IA PREMIUM */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[#06110e] to-transparent p-4 mb-4 backdrop-blur-xl group">
              
              {/* Efecto de luz ambiental en la esquina */}
              <div className="absolute -right-8 -top-8 h-24 w-24 bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400 text-[#03110d]">
                      <Zap size={12} className="fill-current" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">Generador de Dietas IA</h3>
                  </div>
                  <span className="text-sm font-black text-white mt-1.5 uppercase italic">Plan Semanal Optimizado</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-emerald-300/60 uppercase tracking-tighter">Status</span>
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Actualizado
                  </span>
                </div>
              </div>

              {/* Texto explicativo con mayor impacto visual */}
              <div className="relative rounded-xl border border-white/5 bg-white/[0.02] p-3 mb-4">
                <p className="text-[10px] leading-relaxed text-white/70 italic">
                  "Nuestra IA analiza tus métricas de la semana para generar un <span className="text-emerald-300 font-bold">menú personalizado de 7 días</span>, ajustando cada gramo para que alcances tu objetivo sin pasar hambre."
                </p>
              </div>

            {/* Visualización de Macros del Plan */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end px-0.5">
                  <span className="text-[7px] font-black uppercase text-white/30">Energía</span>
                  <span className="text-[9px] font-bold text-emerald-300">2.1k</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end px-0.5">
                  <span className="text-[7px] font-black uppercase text-white/30">Proteína</span>
                  <span className="text-[9px] font-bold text-cyan-300">160g</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end px-0.5">
                  <span className="text-[7px] font-black uppercase text-white/30">Variedad</span>
                  <span className="text-[9px] font-bold text-amber-300">Alta</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </div>


            {/* CRONOGRAMA DE COMIDAS / TIMELINE CON DESCRIPCIÓN */}
            <div className="mb-2.5 px-1 flex flex-col">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Distribución de Nutrientes</h3>
              <p className="text-[10px] text-white/45 leading-normal mt-0.5">
                Dividimos tus macronutrientes en bloques horarios estratégicos para optimizar tus picos de energía corporales y mejorar la síntesis proteica.
              </p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[290px] pr-1 scrollbar-none relative border-l border-white/5 ml-2 pl-3">
              
              <MealRow 
                time="08:30 AM" 
                type="Desayuno" 
                title="Tortilla de claras y avena" 
                macros="340 kcal • 30g Pro"
                completed={true}
              />
              
              
              <MealRow 
                time="02:30 PM" 
                type="Almuerzo" 
                title="Bowl de pollo, quinoa y aguacate" 
                macros="680 kcal • 44g Pro"
                completed={true}
                current={true}
              />
              
              
              <MealRow 
                time="09:35 PM" 
                type="Cena" 
                title="Salmón a la plancha con espárragos" 
                macros="520 kcal • 38g Pro"
                completed={false}
              />

            </div>
          </div>

          {/* BOTÓN DE ACCIÓN INMEDIATA */}
          <div className="w-full mt-4">
            <Link
              to="/registro"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_12px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all hover:bg-white"
            >
              Iniciar Dieta Personalizada
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="h-20"></div> 
          </div>

          {/* MENÚ INFERIOR TÁCTIL SINCRONIZADO CON HOME */}
          

        </section>
        <NavNavigation />
      </main>
    </div>
  );
}

{/* COMPONENTES COMPLEMENTARIOS INTERNOS MEJORADOS CORREGIDOS */}
function MealRow({ time, type, title, macros, completed, current = false }) {
  return (
    <div className={`relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
      current 
        ? "border-emerald-500/30 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.06)]" 
        : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
    }`}>
      {/* Nodo indicador del Timeline */}
      <div className={`absolute -left-[17px] top-[22px] h-2 w-2 rounded-full border ${
        current ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_8px_#10b981]' : completed ? 'bg-emerald-500/40 border-emerald-400/20' : 'bg-[#06110e] border-white/20'
      }`} />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-white/40">
          <Clock size={11} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{time}</span>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
          completed 
            ? "text-emerald-400 bg-emerald-400/5 border border-emerald-400/10" 
            : "text-white/20 bg-white/5"
        }`}>
          {type}
        </span>
      </div>
      
      <div className="flex items-start justify-between gap-4">
        <div className="leading-tight">
          <h4 className={`text-xs font-black tracking-wide ${current ? 'text-emerald-300' : 'text-white/80'}`}>
            {title}
          </h4>
          <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">
            <Flame size={11} className="text-orange-400" />
            <span className="font-medium">{macros}</span>
          </p>
        </div>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          completed 
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
            : 'border-white/10 bg-white/5 text-white/20'
        }`}>
          {completed ? <CheckCircle2 size={13} /> : <Apple size={13} />}
        </div>
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
