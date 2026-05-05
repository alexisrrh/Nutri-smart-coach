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
      (meal) => meal.createdAt && new Date(meal.createdAt).toDateString() === today
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
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-6xl">
        {!profile && (
          <div className="mb-6 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                  <UserRound />
                </div>
                <div>
                  <h2 className="font-black">Completa tu perfil</h2>
                  <p className="text-sm text-white/60">
                    Así calculamos tus calorías, macros y dieta personalizada.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/perfil")}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white hover:bg-emerald-400"
              >
                Configurar ahora
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
              NutriCoach iA
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              {profile?.name ? `Hola, ${profile.name}` : "Tu progreso de hoy"}
            </h1>

            <p className="mt-3 max-w-2xl text-white/60">
              Controla tus comidas, dieta semanal y progreso físico desde un solo lugar.
            </p>
          </div>

          <button
            onClick={() => navigate("/foto-comida")}
            className="flex items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-400"
          >
            <Camera size={24} />
            Analizar comida
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <ActionCard
            icon={<Utensils size={30} />}
            title="Dieta semanal"
            text="Genera un plan de comidas según tu objetivo, horarios y macros."
            button="Crear dieta"
            onClick={() => navigate("/plan-comidas")}
          />

          <ActionCard
            icon={<ScanLine size={30} />}
            title="Check-in semanal"
            text={
              hasCheckinThisWeek
                ? "Ya registraste tu progreso esta semana."
                : "Sube una foto semanal para seguir tu evolución visual."
            }
            button={hasCheckinThisWeek ? "Ver progreso" : "Hacer check-in"}
            onClick={() => navigate("/checkin")}
          />
        </div>

        <div className="mb-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Calorías
                </p>
                <h2 className="mt-2 text-4xl font-black">
                  {Math.round(totals.calories)}
                  <span className="text-xl text-white/50"> / {goals.calories}</span>
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/20 text-emerald-300">
                <Flame size={32} />
              </div>
            </div>

            <ProgressBar value={totals.calories} max={goals.calories} />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MacroCard icon={<Beef />} title="Proteína" value={totals.protein} goal={goals.protein} unit="g" />
              <MacroCard icon={<Wheat />} title="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" />
              <MacroCard icon={<Droplets />} title="Grasas" value={totals.fat} goal={goals.fat} unit="g" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500 to-lime-400 p-6 text-[#06130d] shadow-2xl shadow-emerald-500/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/40">
              <Trophy size={30} />
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] opacity-70">
              Score diario
            </p>

            <h2 className="mt-2 text-6xl font-black">{nutritionScore}/10</h2>

            <p className="mt-4 font-bold">
              {nutritionScore >= 8
                ? "Muy buen día. Vas fuerte con tu objetivo."
                : nutritionScore >= 5
                ? "Vas bien, pero todavía puedes mejorar tus macros."
                : "Empieza guardando más comidas para medir mejor tu día."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Últimas comidas</h2>
                <p className="text-sm text-white/50">Comidas guardadas hoy</p>
              </div>

              <button
                onClick={() => navigate("/comidas")}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 hover:bg-white/15"
              >
                Ver todo
                <ArrowRight size={18} />
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

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-2xl font-black">Consejo inteligente</h2>

            <div className="mt-5 rounded-3xl bg-white/10 p-5">
              <p className="text-white/70">
                {getSmartTip(totals, goals, todayMeals.length)}
              </p>
            </div>

            <button
              onClick={() => navigate("/perfil")}
              className="mt-5 w-full rounded-3xl bg-white/10 px-5 py-4 font-black text-emerald-300 hover:bg-white/15"
            >
              Ajustar perfil
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </section>
  );
}

function ActionCard({ icon, title, text, button, onClick }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400/20 text-emerald-300">
        {icon}
      </div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-white/60">{text}</p>
      <button
        onClick={onClick}
        className="mt-5 w-full rounded-3xl bg-emerald-500 px-5 py-4 font-black text-white hover:bg-emerald-400"
      >
        {button}
      </button>
    </div>
  );
}

function MacroCard({ icon, title, value, goal, unit }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
        {icon}
      </div>
      <p className="text-sm text-white/50">{title}</p>
      <p className="mt-1 text-2xl font-black">
        {Math.round(value)}
        <span className="text-sm text-white/40"> / {goal}{unit}</span>
      </p>
      <div className="mt-3">
        <ProgressBar value={value} max={goal} small />
      </div>
    </div>
  );
}

function ProgressBar({ value, max, small = false }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/10 ${small ? "h-2" : "h-4"}`}>
      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
    </div>
  );
}

function MealRow({ meal }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            {meal.mealType || "Comida"}
          </p>
          <h3 className="mt-1 font-black">{meal.food}</h3>
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
    <div className="flex min-h-[230px] items-center justify-center rounded-3xl bg-white/5 p-6 text-center">
      <div>
        <CalendarDays className="mx-auto mb-4 text-emerald-300" size={42} />
        <h3 className="text-xl font-black">Aún no hay comidas hoy</h3>
        <p className="mt-2 text-white/50">Analiza tu primera comida para empezar.</p>
        <button
          onClick={onClick}
          className="mt-5 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white"
        >
          Analizar comida
        </button>
      </div>
    </div>
  );
}

function getSmartTip(totals, goals, mealCount) {
  if (mealCount === 0) return "Empieza subiendo una foto de tu comida. NutriCoach calculará tus calorías y macros automáticamente.";
  if (totals.protein < goals.protein * 0.5) return "Hoy vas bajo en proteína. Añade pollo, huevos, yogur griego, atún o legumbres.";
  if (totals.calories > goals.calories) return "Ya superaste tus calorías objetivo. En la próxima comida prioriza proteína magra y verduras.";
  return "Buen equilibrio por ahora. Sigue registrando comidas para mantener el control.";
}

function isThisWeek(date) {
  if (!date) return false;
  const now = new Date();
  const checkDate = new Date(date);
  const diff = now - checkDate;
  return diff <= 7 * 24 * 60 * 60 * 1000;
}