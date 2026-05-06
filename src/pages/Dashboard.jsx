import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Flame,
  Beef,
  Wheat,
  Droplets,
  CalendarDays,
  Trophy,
  ArrowRight,
  UserRound,
  Utensils,
  ScanLine,
  Sparkles,
  Settings,
  Activity,
  ChevronRight,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

const MEALS_KEY = "nutricoach_meals";
const PROFILE_KEY = "nutricoach_profile";
const CHECKIN_KEY = "nutricoach_checkins";

export function Dashboard() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    setMeals(JSON.parse(localStorage.getItem(MEALS_KEY)) || []);
    setProfile(JSON.parse(localStorage.getItem(PROFILE_KEY)) || null);
    setCheckins(JSON.parse(localStorage.getItem(CHECKIN_KEY)) || []);
  }, []);

  const goals = profile?.goals || {
    calories: 1800,
    protein: 120,
    carbs: 180,
    fat: 60,
  };

  const todayMeals = useMemo(() => {
    const today = new Date().toDateString();
    return meals.filter(
      (meal) =>
        meal.createdAt && new Date(meal.createdAt).toDateString() === today
    );
  }, [meals]);

  const totals = useMemo(() => {
    return todayMeals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories) || 0;
        acc.protein += Number(meal.protein) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fat += Number(meal.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const nutritionScore = Math.min(
    10,
    Math.round(
      ((totals.protein / goals.protein) * 4 +
        (totals.calories / goals.calories) * 3 +
        (totals.carbs / goals.carbs) * 1.5 +
        (totals.fat / goals.fat) * 1.5) *
        10
    ) / 10
  );

  const lastMeals = todayMeals.slice(0, 3);
  const hasCheckinThisWeek = checkins.some((item) => isThisWeek(item.createdAt));

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712] px-4 py-6 pb-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#16a34a33,transparent_32%),radial-gradient(circle_at_bottom_right,#bef2641f,transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-500/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center bg-emerald-400 text-[#030712] shadow-[0_0_40px_#34d39955] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
              <Sparkles size={23} />
            </div>

            <div>
              <p className="text-xl font-black">NutriCoach iA</p>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/35">
                Premium health
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/perfil")}
            className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 font-black text-white/80 backdrop-blur-xl transition hover:border-emerald-300/40 hover:text-emerald-200"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Settings size={18} />
              Perfil
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-300/15 to-transparent transition group-hover:translate-x-full" />
          </button>
        </header>

        {!profile && (
          <div className="mb-8 overflow-hidden border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_86%,96%_100%,0_100%)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center bg-emerald-400/20 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                  <UserRound />
                </div>
                <div>
                  <h2 className="text-lg font-black">Completa tu perfil</h2>
                  <p className="text-sm text-white/60">
                    Activa cálculos personalizados de calorías, macros y dieta.
                  </p>
                </div>
              </div>

              <LuxuryButton onClick={() => navigate("/perfil")}>
                Configurar ahora
              </LuxuryButton>
            </div>
          </div>
        )}

        <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="relative min-h-[560px] overflow-hidden border border-white/10 bg-white/[0.055] p-7 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,0_100%)] md:p-9">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />

            <div className="relative">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_#86efac]" />
                Coach inteligente activo
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
                {profile?.name
                  ? `Hola, ${profile.name}`
                  : "Tu cuerpo. Tus datos. Tu plan."}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
                Analiza comidas, controla macros, genera dietas semanales y mide
                tu progreso físico con una experiencia diseñada como una app de
                alto nivel.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PrimaryButton onClick={() => navigate("/foto-comida")}>
                  <Camera size={21} />
                  Analizar comida
                  <ChevronRight size={18} />
                </PrimaryButton>

                <SecondaryButton onClick={() => navigate("/plan-comidas")}>
                  <Utensils size={21} />
                  Dieta semanal
                </SecondaryButton>

                <SecondaryButton onClick={() => navigate("/perfil")}>
                  <Settings size={21} />
                  Ajustar perfil
                </SecondaryButton>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <MetricLine
                  icon={<Flame />}
                  label="Calorías"
                  value={Math.round(totals.calories)}
                  goal={goals.calories}
                  unit="kcal"
                />
                <MetricLine
                  icon={<Beef />}
                  label="Proteína"
                  value={Math.round(totals.protein)}
                  goal={goals.protein}
                  unit="g"
                />
                <MetricLine
                  icon={<Activity />}
                  label="Score"
                  value={nutritionScore}
                  goal={10}
                  unit="/10"
                />
              </div>
            </div>
          </section>

          <aside className="grid gap-6">
            <ScorePanel score={nutritionScore} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FeaturePanel
                icon={<Utensils />}
                label="Plan IA"
                title="Dieta semanal"
                text="Comidas adaptadas a tu objetivo."
                button="Crear"
                onClick={() => navigate("/plan-comidas")}
              />

              <FeaturePanel
                icon={<ScanLine />}
                label="Progreso"
                title={hasCheckinThisWeek ? "Registrado" : "Pendiente"}
                text="Foto semanal + evolución visual."
                button="Check-in"
                onClick={() => navigate("/checkin")}
              />
            </div>
          </aside>
        </main>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_90%,94%_100%,0_100%)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                  Hoy
                </p>
                <h2 className="mt-1 text-3xl font-black">Últimas comidas</h2>
              </div>

              <button
                onClick={() => navigate("/comidas")}
                className="group rounded-full border border-white/10 bg-white/10 px-4 py-3 font-black text-emerald-300 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
              >
                <span className="flex items-center gap-2">
                  Ver todo
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </button>
            </div>

            {lastMeals.length === 0 ? (
              <EmptyState onClick={() => navigate("/foto-comida")} />
            ) : (
              <div className="grid gap-3">
                {lastMeals.map((meal) => (
                  <MealRow key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl [clip-path:polygon(0_0,100%_0,100%_90%,94%_100%,0_100%)]">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                  <Sparkles />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                    Coach
                  </p>
                  <h2 className="text-3xl font-black">Consejo inteligente</h2>
                </div>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-white/66">
                {getSmartTip(totals, goals, todayMeals.length)}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <GhostButton onClick={() => navigate("/foto-comida")}>
                  Analizar otra comida
                </GhostButton>
                <GhostButton onClick={() => navigate("/checkin")}>
                  Ver progreso
                </GhostButton>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </section>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 px-6 py-4 font-black text-[#03110a] shadow-[0_20px_60px_#22c55e33] transition hover:scale-[1.02]"
    >
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.08] px-6 py-4 font-black text-white/85 backdrop-blur-xl transition hover:border-emerald-300/30 hover:bg-emerald-300/10 hover:text-emerald-200"
    >
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </button>
  );
}

function LuxuryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-emerald-400 px-5 py-3 font-black text-[#03110a] shadow-[0_12px_40px_#34d39933] transition hover:bg-lime-300"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-white/10 bg-white/10 px-5 py-4 font-black text-emerald-300 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
    >
      {children}
    </button>
  );
}

function MetricLine({ icon, label, value, goal, unit }) {
  const percentage = percent(value, goal);

  return (
    <div className="border-l border-emerald-300/25 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center gap-3 text-emerald-300">
        {icon}
        <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">
          {label}
        </p>
      </div>

      <p className="text-3xl font-black">
        {value}
        <span className="text-sm text-white/40">
          {" "}
          {unit === "/10" ? unit : `/ ${goal} ${unit}`}
        </span>
      </p>

      <div className="mt-4 h-[3px] overflow-hidden bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-lime-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ScorePanel({ score }) {
  return (
    <div className="relative min-h-[250px] overflow-hidden bg-gradient-to-br from-emerald-400 via-lime-300 to-green-400 p-7 text-[#03110a] shadow-[0_30px_80px_#22c55e33] [clip-path:polygon(0_0,100%_0,100%_86%,90%_100%,0_100%)]">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/35 blur-3xl" />
      <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

      <div className="relative">
        <div className="grid h-14 w-14 place-items-center bg-white/45 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
          <Trophy size={30} />
        </div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.28em] opacity-70">
          Score diario
        </p>

        <div className="mt-2 flex items-end gap-2">
          <h2 className="text-8xl font-black leading-none">{score}</h2>
          <p className="pb-3 text-2xl font-black opacity-60">/10</p>
        </div>

        <p className="mt-5 max-w-sm font-bold leading-7">
          {score >= 8
            ? "Día excelente. Estás alineado con tu objetivo."
            : score >= 5
            ? "Buen avance. Ajusta proteína y registra más comidas."
            : "Activa el seguimiento guardando tus comidas de hoy."}
        </p>
      </div>
    </div>
  );
}

function FeaturePanel({ icon, label, title, text, button, onClick }) {
  return (
    <div className="group relative overflow-hidden border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl transition hover:border-emerald-300/30 [clip-path:polygon(0_0,100%_0,100%_88%,90%_100%,0_100%)]">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-5 grid h-12 w-12 place-items-center bg-emerald-400/15 text-emerald-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
          {icon}
        </div>

        <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
          {label}
        </p>

        <h3 className="mt-2 text-2xl font-black">{title}</h3>

        <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>

        <button
          onClick={onClick}
          className="mt-5 rounded-full bg-white/10 px-5 py-3 font-black text-emerald-300 transition hover:bg-emerald-300/10"
        >
          {button}
        </button>
      </div>
    </div>
  );
}

function MealRow({ meal }) {
  return (
    <div className="border border-white/10 bg-white/[0.055] p-4 transition hover:border-emerald-300/25 hover:bg-white/[0.08]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
            {meal.mealType || "Comida"}
          </p>
          <h3 className="mt-1 font-black text-white/90">{meal.food}</h3>
        </div>

        <p className="text-lg font-black text-emerald-300">
          {Math.round(meal.calories || 0)} kcal
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onClick }) {
  return (
    <div className="grid min-h-[240px] place-items-center border border-white/10 bg-white/[0.035] p-6 text-center">
      <div>
        <CalendarDays className="mx-auto mb-4 text-emerald-300" size={42} />
        <h3 className="text-xl font-black">Aún no hay comidas hoy</h3>
        <p className="mt-2 text-white/50">
          Analiza tu primera comida para empezar.
        </p>
        <button
          onClick={onClick}
          className="mt-5 rounded-full bg-emerald-400 px-5 py-3 font-black text-[#03110a]"
        >
          Analizar comida
        </button>
      </div>
    </div>
  );
}

function getSmartTip(totals, goals, mealCount) {
  if (mealCount === 0) {
    return "Empieza subiendo una foto de tu comida. NutriCoach calculará tus calorías y macros automáticamente.";
  }

  if (totals.protein < goals.protein * 0.5) {
    return "Hoy vas bajo en proteína. Añade pollo, huevos, yogur griego, atún o legumbres.";
  }

  if (totals.calories > goals.calories) {
    return "Ya superaste tus calorías objetivo. En la próxima comida prioriza proteína magra y verduras.";
  }

  return "Buen equilibrio por ahora. Sigue registrando comidas para mantener el control.";
}

function isThisWeek(date) {
  if (!date) return false;
  const now = new Date();
  const checkDate = new Date(date);
  const diff = now - checkDate;
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

function percent(value, max) {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((Number(value || 0) / Number(max)) * 100));
}