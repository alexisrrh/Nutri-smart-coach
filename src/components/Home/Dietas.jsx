import { Link } from "react-router-dom";
import { Camera, Utensils, LineChart, ShieldCheck, Clock, Flame, Apple, ArrowRight, CheckCircle2 } from "lucide-react";

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
            
            {/* PANEL DE BALANCE NUTRICIONAL DIARIO PREMIUM CON TEXTO EXPLICATIVO */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-4 mb-4 backdrop-blur-md">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex flex-col">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Métricas de Energía diaria</h3>
                  <span className="text-xs font-black text-emerald-300 mt-0.5">1,230 / 2,100 kcal</span>
                </div>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wider">Definición</span>
              </div>

              {/* Mensaje explicativo de Calorías */}
              <p className="text-[10px] text-white/45 leading-normal mb-3">
                Calculamos tu gasto metabólico basal y adaptamos dinámicamente el límite calórico para asegurar una pérdida grasa constante sin perder masa muscular.
              </p>

              {/* Barra de progreso de calorías */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" style={{ width: '58.5%' }} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2">
                  <p className="text-sm font-black italic text-white/40">2,100</p>
                  <p className="text-[7px] font-black uppercase tracking-wider text-white/30 mt-0.5">Objetivo</p>
                </div>
                <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl p-2">
                  <p className="text-sm font-black italic text-emerald-300">1,230</p>
                  <p className="text-[7px] font-black uppercase tracking-wider text-emerald-400/50 mt-0.5">Consumidas</p>
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2">
                  <p className="text-sm font-black italic text-white/70">870</p>
                  <p className="text-[7px] font-black uppercase tracking-wider text-white/40 mt-0.5">Restantes</p>
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
                time="11:30 AM" 
                type="Media Mañana" 
                title="Batido aislado + Almendras" 
                macros="210 kcal • 26g Pro"
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
                time="06:00 PM" 
                type="Merienda" 
                title="Yogur griego con berries" 
                macros="190 kcal • 18g Pro"
                completed={false}
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
          <div className="fixed bottom-0 left-0 right-0 z-50 mb-4 mx-4 grid grid-cols-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            <DashboardTab to="/" icon={<Camera size={16} />} title="Analizar" />
            <DashboardTab to="/bodyscannerhome" icon={<ShieldCheck size={16} />} title="Check-in foto" active />
            <DashboardTab to="/dietahome" icon={<Utensils size={16} />} title="Dietas" />
            <DashboardTab to="/progresohome" icon={<LineChart size={16} />} title="Peso/medidas" />
          </div>

        </section>
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
