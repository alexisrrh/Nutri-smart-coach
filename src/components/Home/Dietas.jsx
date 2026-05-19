import { Link } from "react-router-dom";
import { Zap, Clock, Flame, ArrowRight, CheckCircle2, Camera } from "lucide-react";
import { NavNavigation } from "./NavNavigation";
import dietashome from "../../../public/dietashome.jpeg";

export function Dietas() {
  const meals = [
    {
      time: "08:30 AM",
      type: "Desayuno",
      title: "Tortilla de claras y avena",
      macros: "340 kcal • 30g Pro",
      completed: true,
      img: "https://cdn0.recetasgratis.net/es/posts/6/2/3/tortilla_de_avena_73326_orig.jpg"
    },
    {
      time: "02:30 PM",
      type: "Almuerzo",
      title: "Bowl de pollo y quinoa",
      macros: "680 kcal • 44g Pro",
      completed: true,
      current: true,
      img: "https://rodrigoalimentacion.com/wp-content/uploads/2020/07/Sin-t%C3%ADtulo.jpg"
    },
    {
      time: "09:35 PM",
      type: "Cena",
      title: "Salmón con espárragos",
      macros: "520 kcal • 38g Pro",
      completed: false,
      img: "https://club-royal.es/wp-content/uploads/2021/09/84055431_s.jpg"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#030a08] flex items-center justify-center p-0 md:p-6 font-sans">
      <main className="relative w-full max-w-[430px] h-screen md:h-[880px] overflow-hidden bg-[#06110e] text-white md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[#1f2937] flex flex-col">
        
        {/* CAPAS DECORATIVAS */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,#10b98115,transparent_45%),radial-gradient(circle_at_15%_80%,#38bdf815,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* TU NAV ORIGINAL */}
        <header className="relative z-20 px-5 pt-5 shrink-0">
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
              <Link to="/login" className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/60">
                Login
              </Link>
              <Link to="/registro" className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#03110d]">
                Empezar
              </Link>
            </div>
          </nav>
        </header>

        {/* CONTENIDO PRINCIPAL - FLEX-1 PARA QUE RELLENE */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden px-5">
          
          <div className="pt-6 pb-4 text-center shrink-0">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
              Mi Dieta <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Hoy</span>
            </h1>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-emerald-300/60">
              Genera tu dieta semanal con IA
            </p>
          </div>

          {/* IMAGEN HERO CON SÚPER-NEÓN ESMERALDA DE ALTA INTENSIDAD */}
          <div className="relative mb-6 px-1 shrink-0">
            <div className="relative flex h-52 w-full items-center justify-center rounded-[2.5rem] border border-emerald-400 bg-gradient-to-b from-emerald-500/20 to-transparent p-2.5 backdrop-blur-sm shadow-[0_0_20px_#10b981,0_0_40px_rgba(16,185,129,0.4),0_0_60px_rgba(16,185,129,0.2)] transition-all">
                
                {/* Pulso de radar interno (Glow de fondo) */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-emerald-500/25" />
                
                {/* Contenedor interno del visor */}
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.8rem] border-2 border-emerald-400 bg-[#020a07] shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]">
                    
                    {/* TU IMAGEN DIETASHOME */}
                    <img
                      src={dietashome}
                      alt="Panel Nutricional IA"
                      className="h-full w-full object-cover opacity-100 absolute inset-0 z-0 transition-transform duration-700 hover:scale-105"
                    />

                    {/* Filtro degradado esmeralda de alta densidad en la base */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent z-10 pointer-events-none" />
                </div>
            </div>
          </div>



          {/* LISTA DE COMIDAS CON TAMAÑO ORIGINAL */}
                    <section className="flex-1 flex flex-col gap-2.5 min-h-0 pb-4">
            {meals.map((meal, index) => (
              <div key={index} className={`flex gap-3.5 p-3 rounded-2xl border transition-all duration-300 ${
                meal.current 
                  ? 'border-emerald-500/30 bg-emerald-500/[0.06] shadow-[0_8px_20px_-10px_rgba(16,185,129,0.1)]' 
                  : 'border-white/5 bg-white/[0.02]'
              }`}>
                {/* Imagen un poco más pequeña (h-14) */}
                <img src={meal.img} className="h-14 w-14 shrink-0 rounded-xl object-cover border border-white/10" alt="food" />
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{meal.time}</span>
                    {meal.completed && <CheckCircle2 size={12} className="text-emerald-400" />}
                  </div>
                  
                  {/* Texto ajustado (text-[13px]) */}
                  <h4 className={`text-[13px] font-black uppercase italic truncate leading-tight ${meal.current ? 'text-emerald-300' : 'text-white/90'}`}>
                    {meal.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Flame size={10} className="text-orange-400" />
                    <span className="text-[9px] font-bold text-white/40">{meal.macros}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

        </div>

        {/* BOTÓN Y NAV (FIJOS) */}
        <div className="w-full mt-0">
          <div className="px-1 mb-25">
              <Link
                to="/registro"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_12px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all hover:bg-white"
              >
                Iniciar Dieta
                <Camera size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              </div>
          <NavNavigation />
        </div>

      </main>
    </div>
  );
}






// Subcomponente MealRow mejorado con Imagen
function MealRow({ time, type, title, macros, completed, current, image }) {
  return (
    <div className={`group relative flex gap-4 p-3 rounded-2xl border transition-all duration-300 ${
      current 
        ? "border-emerald-500/40 bg-emerald-500/[0.05] ring-1 ring-emerald-500/20" 
        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
    }`}>
      {/* Imagen miniatura de la comida */}
      <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/10">
        <img src={image} alt={title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/30 uppercase">
            <Clock size={10} />
            {time}
          </div>
          {completed && (
            <CheckCircle2 size={12} className="text-emerald-400" />
          )}
        </div>
        <h4 className={`text-[13px] font-bold leading-tight ${current ? 'text-emerald-300' : 'text-white/90'}`}>
          {title}
        </h4>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[10px] text-white/40">
            <Flame size={10} className="text-orange-400" />
            {macros}
          </span>
          <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-white/30 uppercase tracking-tighter">
            {type}
          </span>
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
