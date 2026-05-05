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
    <main className="min-h-screen overflow-hidden bg-[#06130d] text-white">
      <section className="relative px-6 py-8 md:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#00e68a33,transparent_35%),radial-gradient(circle_at_bottom_left,#84cc1630,transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:70px_70px]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#06130d]">
              <Sparkles size={24} />
            </div>
            <p className="text-xl font-black">NutriCoach iA</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-2xl px-5 py-3 font-bold text-white/70 transition hover:text-white md:block"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/registro"
              className="rounded-2xl bg-white px-5 py-3 font-black text-[#06130d] transition hover:bg-emerald-200"
            >
              Crear cuenta
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              <Zap size={16} />
              Nutrición con IA, simple y rápida
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Calcula calorías con una foto de tu comida
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
              Analiza tus platos, guarda tus comidas, crea dietas semanales con
              IA y sigue tu progreso desde una experiencia sencilla.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/registro"
                className="flex items-center justify-center gap-2 rounded-3xl bg-emerald-400 px-7 py-4 text-lg font-black text-[#06130d] shadow-2xl shadow-emerald-400/20 transition hover:scale-[1.02] hover:bg-emerald-300"
              >
                Empezar gratis
                <ArrowRight size={22} />
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/10 px-7 py-4 text-lg font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                Ya tengo cuenta
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MiniTrust icon={<ShieldCheck />} text="Datos seguros" />
              <MiniTrust icon={<Clock />} text="Rápido de usar" />
              <MiniTrust icon={<Sparkles />} text="IA personalizada" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-emerald-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="rounded-[2rem] bg-[#081b12] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
                      Análisis IA
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      Plato detectado
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-[#06130d]">
                    <Camera size={25} />
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
                    alt="Comida saludable"
                    className="h-72 w-full object-cover"
                  />
                </div>

                <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-lime-400 p-5 text-[#06130d]">
                  <p className="text-sm font-black uppercase tracking-[0.2em] opacity-70">
                    Resultado
                  </p>
                  <h3 className="mt-1 text-3xl font-black">
                    Bowl de pollo y arroz
                  </h3>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Macro title="Calorías" value="620 kcal" />
                  <Macro title="Proteína" value="45 g" />
                  <Macro title="Carbs" value="70 g" />
                  <Macro title="Grasas" value="16 g" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-5 pb-16 md:grid-cols-4">
          <Feature
            icon={<Camera />}
            title="Foto de comida"
            text="Sube una foto y recibe una estimación nutricional."
          />
          <Feature
            icon={<Utensils />}
            title="Dieta semanal"
            text="Crea planes personalizados según tu objetivo."
          />
          <Feature
            icon={<LineChart />}
            title="Progreso"
            text="Registra comidas, peso y seguimiento semanal."
          />
          <Feature
            icon={<Sparkles />}
            title="IA práctica"
            text="Recomendaciones simples, claras y accionables."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
    </div>
  );
}

function Macro({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
        {title}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function MiniTrust({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70">
      <span className="text-emerald-300">{icon}</span>
      {text}
    </div>
  );
}