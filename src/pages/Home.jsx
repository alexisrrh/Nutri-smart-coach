import { Link } from "react-router-dom";
import {
  Camera,
  Utensils,
  LineChart,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
} from "lucide-react";
import SmartImage from "../components/ui/SmartImage";
export function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#06110e] text-white font-sans">
      <section className="relative min-h-screen px-4 py-4 md:px-10 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,#10b98122,transparent_35%),radial-gradient(circle_at_15%_80%,#38bdf822,transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:46px_46px]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 ">
           <img
  src="/favicon.png"
  alt="NutriSmart Coach"
 className="h-18 w-17 rounded-2xl object-cover bg-transparent p-1 shadow-[0_0_50px_#10b98155] border border-emerald-500"
/>

           <div className="leading-none">
  <p className="text-base font-black italic tracking-tight sm:text-xl">
    Nutri<span className="text-emerald-300">Smart</span>
  </p>
  <p className="mt-1 text-[12px] font-black uppercase tracking-[0.28em] text-emerald-300/60">
    Coach IA
  </p>
</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/50 transition hover:border-emerald-400/40 hover:text-white sm:block"
            >
              Iniciar Sesion
            </Link>

            <Link
              to="/registro"
              className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#03110d] transition hover:bg-emerald-400 sm:px-5"
            >
              Empezar
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-6 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-14">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300 sm:text-[11px]">
              <Zap size={14} className="fill-current" />
              Fitness + nutrición con IA
            </div>

            <h1 className="max-w-3xl text-[3.1rem] font-black leading-[0.88] tracking-tighter italic uppercase sm:text-7xl md:text-8xl lg:text-9xl">
              Domina
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                tu cuerpo
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base md:text-lg">
              Analiza comidas con IA, controla tus macros, crea dietas
              personalizadas y mide tu progreso semanal desde un solo lugar.
            </p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/registro"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-400 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#03110d] shadow-[0_20px_45px_#10b98133] transition hover:scale-[1.03] hover:bg-white sm:px-10 sm:text-sm"
              >
                Iniciar análisis
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-xs font-black uppercase tracking-widest text-white/70 transition hover:bg-white/10 hover:text-white sm:hidden"
              >
                Iniciar sesión
              </Link>
            </div>

            <div className="mt-6 grid w-full max-w-xl grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
              <Stat value="IA" label="Análisis" />
              <Stat value="24/7" label="Coach" />
              <Stat value="PRO" label="Hábitos" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-2 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.6rem] border border-white/8 bg-[#091814]/95 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.32em] text-emerald-300 sm:text-[9px]">
                      Sistema IA activo
                    </p>

                    <h2 className="text-xl font-black uppercase italic tracking-tight sm:text-2xl">
                      Análisis en vivo
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-emerald-300">
                    <Camera size={19} />
                  </div>
                </div>

                <div className="relative mb-4 h-44 overflow-hidden rounded-[1.3rem] border border-white/10 bg-[#121a17] sm:h-64 lg:h-72">
                 <SmartImage
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=70"
                    alt="Nutrición saludable"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />

                  <div className="absolute inset-x-0 top-0 z-20 h-[2px] animate-[scan_2.8s_ease-in-out_infinite] bg-emerald-300 shadow-[0_0_18px_#6ee7b7]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03110d] via-transparent to-transparent opacity-50" />

                  <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        Plato detectado
                      </span>
                      <span className="rounded-full bg-emerald-400 px-3 py-1 text-[9px] font-black text-[#03110d]">
                        92%
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-black">
                      Bowl saludable alto en proteína
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DashboardMacro
                    title="Calorías"
                    value="1230"
                    unit="kcal"
                    color="bg-emerald-400"
                    pct="60%"
                  />
                  <DashboardMacro
                    title="Proteína"
                    value="100"
                    unit="g"
                    color="bg-cyan-300"
                    pct="85%"
                  />
                  <DashboardMacro
                    title="Carbs"
                    value="145"
                    unit="g"
                    color="bg-amber-300"
                    pct="45%"
                  />
                  <DashboardMacro
                    title="Grasas"
                    value="42"
                    unit="g"
                    color="bg-rose-400"
                    pct="30%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-6 grid max-w-7xl grid-cols-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl sm:mt-8">
          <DashboardTab icon={<Camera size={18} />} title="Analizar" active />
          <DashboardTab icon={<Utensils size={18} />} title="Dietas" />
          <DashboardTab icon={<LineChart size={18} />} title="Progreso" />
          <DashboardTab icon={<ShieldCheck size={18} />} title="Hábitos" />
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

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center backdrop-blur-md sm:p-4">
      <span className="block text-lg font-black italic text-emerald-300 sm:text-2xl">
        {value}
      </span>
      <span className="mt-1 block text-[8px] font-bold uppercase tracking-widest text-white/35 sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

function DashboardMacro({ title, value, unit, color, pct }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-3 transition hover:bg-white/[0.08] sm:p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35 sm:text-[9px]">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-black italic tracking-tighter sm:text-2xl">
          {value}
        </span>

        <span className="text-[9px] font-black uppercase tracking-widest text-white/25">
          {unit}
        </span>
      </div>

      <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${color}`} style={{ width: pct }} />
      </div>
    </div>
  );
}

function DashboardTab({ icon, title, active = false }) {
  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-r border-white/5 p-3 transition-all last:border-none sm:p-4 md:flex-row md:gap-3 md:p-6 ${
        active
          ? "bg-emerald-400 text-[#03110d]"
          : "text-white/45 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-[#03110d]" : "text-emerald-300"}>
        {icon}
      </span>

      <span className="text-[7px] font-black uppercase tracking-[0.16em] sm:text-[9px] md:text-[10px]">
        {title}
      </span>
    </div>
  );
}