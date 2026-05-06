import { Link } from "react-router-dom";
import {
  Camera,
  Utensils,
  LineChart,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

export function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08120f] text-white font-sans">
      <section className="relative px-4 py-6 md:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#4361ee18,transparent_40%),radial-gradient(circle_at_20%_80%,#00e68a14,transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-5 md:pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-emerald-500 shadow-[0_0_20px_#10b98144]">
              <Sparkles size={20} className="text-[#050a09]" />
            </div>

            <p className="text-base font-black tracking-tighter uppercase italic sm:text-xl">
              Nutri <span className="text-emerald-500">Smart</span> Coach
            </p>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link
              to="/login"
              className="hidden text-[11px] font-black uppercase tracking-[0.2em] text-white/40 transition hover:text-white md:block"
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/registro"
              className="bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#050a09] transition hover:bg-emerald-500 sm:px-6 sm:text-[11px]"
            >
              Empezar
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div className="flex flex-col items-start text-left">
            <div className="mb-5 inline-flex items-center gap-2 border-l-4 border-emerald-500 bg-emerald-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400 sm:px-4 sm:text-[11px]">
              <Zap size={14} className="fill-current" />
              TU TRANSFORMACIÓN COMIENZA AQUÍ
            </div>

            <h1 className="text-5xl font-black leading-[0.85] tracking-tighter italic uppercase sm:text-7xl md:text-9xl">
              DOMINA <br />
              <span className="text-emerald-500">TU CUERPO</span>
            </h1>

           

            <div className="mt-8 flex w-full flex-col gap-4 sm:mt-12 sm:w-auto sm:flex-row">
              <Link
                to="/registro"
                className="group inline-flex items-center justify-center gap-4 bg-emerald-500 px-8 py-5 text-sm font-black uppercase tracking-widest text-[#050a09] shadow-[0_20px_40px_#10b98133] transition-all hover:bg-white sm:px-12 sm:py-6 sm:text-base"
              >
                INICIAR ANALISIS
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-2"
                />
              </Link>
            </div>

            <div className="mt-8 grid w-full grid-cols-3 gap-4 border-t border-white/5 pt-6 sm:mt-16 sm:gap-8 sm:pt-8">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-black italic sm:text-2xl">
                  100%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/35 sm:text-[9px]">
                  Precisión IA
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xl font-black italic sm:text-2xl">
                  24/7
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/35 sm:text-[9px]">
                  Coach Inteligente
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xl font-black italic sm:text-2xl">
                  GRATIS
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/35 sm:text-[9px]">
                  Prueba Inicial
                </span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 opacity-15 blur-xl transition duration-1000 group-hover:opacity-30"></div>

            <div className="relative border border-white/10 bg-[#10201b] p-1">
              <div className="border border-white/5 bg-[#0b1713] p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4 sm:mb-6">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.35em] text-emerald-500 sm:text-[10px] sm:tracking-[0.5em]">
                      Sistema.Visión_IA
                    </p>

                    <h2 className="text-xl font-black tracking-tight uppercase italic text-white sm:text-2xl">
                      Análisis en Vivo
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 text-emerald-500">
                    <Camera size={18} />
                  </div>
                </div>

                <div className="relative mb-6 h-56 overflow-hidden border border-white/10 bg-[#121a17] sm:mb-8 sm:h-72">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
                    alt="Nutrición"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 top-0 z-20 h-[2px] animate-[scan_2.5s_ease-in-out_infinite] bg-emerald-400 shadow-[0_0_15px_#4ade80]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a09] via-transparent to-transparent opacity-35" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DashboardMacro
                    title="Calorías"
                    value="1230"
                    unit="kcal"
                    color="bg-emerald-500"
                    pct="60%"
                  />
                  <DashboardMacro
                    title="Proteína"
                    value="100"
                    unit="g"
                    color="bg-blue-400"
                    pct="85%"
                  />
                  <DashboardMacro
                    title="Carbohidratos"
                    value="145"
                    unit="g"
                    color="bg-amber-400"
                    pct="45%"
                  />
                  <DashboardMacro
                    title="Grasas"
                    value="42"
                    unit="g"
                    color="bg-rose-500"
                    pct="30%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-4 border border-white/10 bg-[#0d1714] shadow-2xl">
          <DashboardTab icon={<Camera size={18} />} title="Analizar" active />
          <DashboardTab icon={<Utensils size={18} />} title="Dietas" />
          <DashboardTab icon={<LineChart size={18} />} title="Progreso" />
          <DashboardTab icon={<Sparkles size={18} />} title="Coach IA" />
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scan {
              0%, 100% { top: 0%; opacity: 0; }
              10%, 90% { opacity: 1; }
              50% { top: 100%; }
            }
          `,
        }}
      />
    </main>
  );
}

function DashboardMacro({ title, value, unit, color, pct }) {
  return (
    <div className="border border-white/[0.05] bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.07] sm:p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35 sm:text-[9px] sm:tracking-[0.25em]">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-black italic tracking-tighter sm:text-2xl">
          {value}
        </span>

        <span className="text-[9px] font-black uppercase tracking-widest text-white/25 sm:text-[10px]">
          {unit}
        </span>
      </div>

      <div className="mt-3 h-[2px] w-full bg-white/5 sm:mt-4">
        <div
          className={`h-full ${color} opacity-80 shadow-[0_0_8px_current]`}
          style={{ width: pct }}
        />
      </div>
    </div>
  );
}

function DashboardTab({ icon, title, active = false }) {
  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-r border-white/5 p-3 transition-all last:border-none sm:p-4 md:flex-row md:gap-3 md:p-8 ${
        active
          ? "bg-emerald-500 text-[#050a09]"
          : "text-white/40 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-[#050a09]" : "text-emerald-400"}>
        {icon}
      </span>

      <span className="text-[7px] font-black uppercase tracking-[0.18em] sm:text-[9px] md:text-[10px] md:tracking-[0.3em]">
        {title}
      </span>
    </div>
  );
}