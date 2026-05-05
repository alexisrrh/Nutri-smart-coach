import { Link } from "react-router-dom";
import { Camera, Activity, Apple, Dumbbell, LineChart } from "lucide-react";

export function Home() {
  return (
    <main className="min-h-screen bg-[#07130d] px-6 py-20 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center">
        <div className="max-w-4xl">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            NutriCoach IA
          </span>

          <h1 className="mt-8 text-5xl font-bold leading-tight md:text-7xl">
            Calcula calorías con una foto de tu comida
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Sube una foto de tu plato, registra tus comidas, controla tus calorías
            y sigue tu progreso nutricional desde una sola app.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/foto-comida"
              className="flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-black"
            >
              <Camera size={20} />
              Calcular calorías
            </Link>

            <Link
              to="/registro"
              className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white"
            >
              Crear cuenta
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-4">
          <Feature icon={<Camera />} title="Foto de comida" />
          <Feature icon={<Apple />} title="Plan de comidas" />
          <Feature icon={<Activity />} title="Calorías diarias" />
          <Feature icon={<LineChart />} title="Progreso semanal" />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 text-emerald-300">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}