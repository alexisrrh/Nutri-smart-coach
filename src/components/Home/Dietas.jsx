import { Link } from "react-router-dom";
import { CheckCircle2, Camera, Flame } from "lucide-react";
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
    <div className="min-h-screen w-full bg-[var(--app-bg)] flex items-center justify-center p-0 md:p-6 font-sans">
      <main className="relative w-full max-w-[430px] h-screen md:h-[880px] overflow-hidden bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[var(--app-border)] flex flex-col">
        
        {/* CAPAS DECORATIVAS */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%),radial-gradient(circle_at_15%_80%,var(--app-primary)12,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30" />

        {/* TU NAV ORIGINAL */}
        <header className="relative z-20 px-5 pt-5 shrink-0">
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
              <Link to="/login" className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)]">
                Login
              </Link>
              <Link to="/registro" className="rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)]">
                Empezar
              </Link>
            </div>
          </nav>
        </header>

        {/* CONTENIDO PRINCIPAL - FLEX-1 PARA QUE RELLENE */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden px-5">
          
          <div className="pt-6 pb-4 text-center shrink-0">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--app-text)]">
              Mi Dieta <span className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary)] bg-clip-text text-transparent">Hoy</span>
            </h1>
            <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">
              Genera tu dieta semanal con IA
            </p>
          </div>

          {/* IMAGEN HERO CON SÚPER-NEÓN ESMERALDA DE ALTA INTENSIDAD */}
          <div className="relative mb-6 px-1 shrink-0">
            <div className="relative flex h-52 w-full items-center justify-center rounded-[2.5rem] border border-[var(--app-border)] bg-gradient-to-b from-[var(--app-primary-soft)] to-transparent p-2.5 backdrop-blur-sm shadow-[0_0_20px_var(--app-glow),0_0_40px_var(--app-glow),0_0_60px_var(--app-glow)] transition-all">
                
                {/* Pulso de radar interno (Glow de fondo) */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-[var(--app-primary)]/18" />
                
                {/* Contenedor interno del visor */}
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.8rem] border-2 border-[var(--app-border)] bg-[var(--app-surface)] shadow-[inset_0_0_20px_var(--app-glow)]">
                    
                    {/* TU IMAGEN DIETASHOME */}
                    <img
                      src={dietashome}
                      alt="Panel Nutricional IA"
                      className="h-full w-full object-cover opacity-100 absolute inset-0 z-0 transition-transform duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/70 via-transparent to-transparent z-10 pointer-events-none" />
                </div>
            </div>
          </div>



          {/* LISTA DE COMIDAS CON TAMAÑO ORIGINAL */}
                    <section className="flex-1 flex flex-col gap-2.5 min-h-0 pb-4">
            {meals.map((meal, index) => (
              <div key={index} className={`flex gap-3.5 p-3 rounded-2xl border transition-all duration-300 ${
                meal.current 
                  ? 'border-[var(--app-border)] bg-[var(--app-primary-soft)] shadow-[0_8px_20px_-10px_var(--app-glow)]' 
                  : 'border-[var(--app-border)] bg-[var(--app-surface)]'
              }`}>
                {/* Imagen un poco más pequeña (h-14) */}
                <img src={meal.img} className="h-14 w-14 shrink-0 rounded-xl object-cover border border-[var(--app-border)]" alt="food" />
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[8px] font-black text-[var(--app-muted)] uppercase tracking-widest">{meal.time}</span>
                    {meal.completed && <CheckCircle2 size={12} className="text-[var(--app-primary)]" />}
                  </div>
                  
                  {/* Texto ajustado (text-[13px]) */}
                  <h4 className={`text-[13px] font-black uppercase italic truncate leading-tight ${meal.current ? 'text-[var(--app-primary)]' : 'text-[var(--app-text)]'}`}>
                    {meal.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Flame size={10} className="text-orange-400" />
                    <span className="text-[9px] font-bold text-[var(--app-muted)]">{meal.macros}</span>
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
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-4 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all hover:bg-[var(--app-primary)]"
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
