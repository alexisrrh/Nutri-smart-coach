import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Camera,
  Flame,
  Home as HomeIcon,
  Settings,
  Sparkles,
  Trophy,
  Utensils,
  Zap,
  Beef,
  Wheat,
  Droplets,
  ScanLine,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const MEALS_KEY = "nutricoach_meals";
const PROFILE_KEY = "nutricoach_profile";

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://nutricoach-backend-frlc.onrender.com";

export function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoadingData(true);

    const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);
    const localMeals = safeParse(localStorage.getItem(MEALS_KEY), []);

    setProfile(savedProfile);
    setMeals(localMeals);

    const userId = savedProfile?.id || savedProfile?.user_id;

    if (!userId) {
      setLoadingData(false);
      return;
    }

    try {
      const [mealsRes, checkinsRes, dietsRes] = await Promise.allSettled([
        fetch(`${API_URL}/meal-analyses/${userId}`),
        fetch(`${API_URL}/checkins/${userId}`),
        fetch(`${API_URL}/diet-plans/${userId}`),
      ]);

      if (mealsRes.status === "fulfilled" && mealsRes.value.ok) {
        const data = await mealsRes.value.json();
        setMeals(data.meal_analyses || localMeals);
      }

      if (checkinsRes.status === "fulfilled" && checkinsRes.value.ok) {
        const data = await checkinsRes.value.json();
        setCheckins(data.checkins || []);
      }

      if (dietsRes.status === "fulfilled" && dietsRes.value.ok) {
        const data = await dietsRes.value.json();
        setDietPlans(data.diet_plans || []);
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoadingData(false);
    }
  }

  const goals = useMemo(() => getGoals(profile), [profile]);

  const todayMeals = useMemo(() => {
    const today = new Date().toDateString();

    return meals.filter((meal) => {
      const date = meal.created_at || meal.createdAt;
      if (!date) return false;
      return new Date(date).toDateString() === today;
    });
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

  const nutritionScore = useMemo(() => {
    const proteinScore = Math.min(totals.protein / goals.protein, 1) * 4;
    const caloriesScore = Math.min(totals.calories / goals.calories, 1) * 3;
    const carbsScore = Math.min(totals.carbs / goals.carbs, 1) * 1.5;
    const fatScore = Math.min(totals.fat / goals.fat, 1) * 1.5;

    return Math.min(
      10,
      Math.round((proteinScore + caloriesScore + carbsScore + fatScore) * 10) /
        10
    );
  }, [totals, goals]);

  const lastMeal = meals[0];
  const lastCheckin = checkins[0];
  const activeDiet = dietPlans[0];

  const hasCheckinThisWeek = useMemo(() => {
    if (!lastCheckin?.created_at) return false;
    return Date.now() - new Date(lastCheckin.created_at).getTime() <= 7 * 86400000;
  }, [lastCheckin]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#06110c] px-3 pb-28 pt-4 text-white font-sans uppercase tracking-tight sm:px-6 sm:pb-40 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_38%),radial-gradient(circle_at_bottom_left,#22c55e12,transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-3">
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center bg-[#10b981] text-[#06110c] shadow-[0_0_24px_#10b98155]">
              <Zap size={18} className="fill-current" />
            </div>

            <div>
              <p className="text-base font-black uppercase italic leading-none">
                Nutri<span className="text-[#10b981]">Smart</span>
              </p>
              <p className="mt-1 text-[9px] font-black tracking-[0.28em] text-white/35">
                {loadingData ? "Sincronizando..." : "Sistema activo"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/perfil")}
            className="border border-white/10 bg-white/[0.04] p-2.5 transition hover:bg-[#10b981] hover:text-[#06110c]"
          >
            <Settings size={18} />
          </button>
        </header>

        <section className="grid gap-3 lg:grid-cols-[1fr_330px]">
          <div className="space-y-3">
            <TopPanel
              profile={profile}
              nutritionScore={nutritionScore}
              todayMeals={todayMeals}
              hasCheckinThisWeek={hasCheckinThisWeek}
              navigate={navigate}
            />

            <div className="grid grid-cols-4 gap-2">
              <MacroCard
                icon={<Flame size={15} />}
                label="Kcal"
                current={totals.calories}
                goal={goals.calories}
                unit=""
              />

              <MacroCard
                icon={<Beef size={15} />}
                label="Prot"
                current={totals.protein}
                goal={goals.protein}
                unit="g"
              />

              <MacroCard
                icon={<Wheat size={15} />}
                label="Carb"
                current={totals.carbs}
                goal={goals.carbs}
                unit="g"
              />

              <MacroCard
                icon={<Droplets size={15} />}
                label="Grasa"
                current={totals.fat}
                goal={goals.fat}
                unit="g"
              />
            </div>

            <QuickActions navigate={navigate} />

            <SmartCoachTip
              totals={totals}
              goals={goals}
              mealCount={todayMeals.length}
              hasDiet={Boolean(activeDiet)}
            />
          </div>

          <aside className="space-y-3">
            <ScorePanel nutritionScore={nutritionScore} />

            <StatusCard
              title="Último análisis"
              icon={<Camera size={17} />}
              value={lastMeal?.food || "Sin comida"}
              detail={
                lastMeal
                  ? `${Math.round(lastMeal.calories || 0)} kcal · ${
                      lastMeal.confidence || 70
                    }% confianza`
                  : "Escanea tu primera comida"
              }
              action="Escanear"
              onClick={() => navigate("/foto-comida")}
            />

            <StatusCard
              title="Dieta activa"
              icon={<Utensils size={17} />}
              value={activeDiet ? "Plan semanal creado" : "Sin dieta"}
              detail={
                activeDiet
                  ? new Date(activeDiet.created_at).toLocaleDateString("es-ES")
                  : "Genera una dieta inteligente"
              }
              action="Ver dieta"
              onClick={() => navigate("/plan-comidas")}
            />

            <StatusCard
              title="Check-in"
              icon={<ScanLine size={17} />}
              value={hasCheckinThisWeek ? "Completado" : "Pendiente"}
              detail={
                lastCheckin
                  ? `${lastCheckin.weight || "-"} kg · ${new Date(
                      lastCheckin.created_at
                    ).toLocaleDateString("es-ES")}`
                  : "Registra tu progreso"
              }
              action={hasCheckinThisWeek ? "Ver" : "Registrar"}
              onClick={() => navigate("/checkin")}
            />
          </aside>
        </section>
      </div>

      <DashboardBottomNav navigate={navigate} />
    </section>
  );
}

function TopPanel({
  profile,
  nutritionScore,
  todayMeals,
  hasCheckinThisWeek,
  navigate,
}) {
  const firstName = getFirstName(profile?.name || profile?.nombre);

  return (
    <section className="relative overflow-hidden border border-white/10 bg-[#091710] p-4 shadow-2xl shadow-black/20 [clip-path:polygon(0_0,100%_0,100%_94%,96%_100%,0_100%)]">
      <div className="absolute -right-16 -top-16 h-44 w-44 bg-[#10b981]/12 blur-3xl" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10b981]">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-black uppercase italic leading-none sm:text-4xl">
              Hola, <span className="text-[#10b981]">{firstName}</span>
            </h1>
          </div>

          <div className="border border-[#10b981]/25 bg-[#10b981]/10 px-3 py-2 text-right">
            <p className="text-xl font-black text-[#10b981]">
              {nutritionScore}
              <span className="text-xs text-slate-500">/10</span>
            </p>
            <p className="text-[8px] font-black uppercase text-slate-500">
              score
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MiniBox
            label="Comidas hoy"
            value={todayMeals.length}
            detail="scans"
            icon={<Activity size={14} />}
          />

          <MiniBox
            label="Objetivo"
            value={formatGoal(profile?.goal || profile?.objetivo)}
            detail="activo"
            icon={<Trophy size={14} />}
          />

          <MiniBox
            label="Check-in"
            value={hasCheckinThisWeek ? "OK" : "Pend."}
            detail="semana"
            icon={
              hasCheckinThisWeek ? (
                <TrendingDown size={14} />
              ) : (
                <TrendingUp size={14} />
              )
            }
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/foto-comida")}
            className="bg-[#10b981] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#06110c] transition hover:bg-white"
          >
            Escanear comida
          </button>

          <button
            onClick={() => navigate("/plan-comidas")}
            className="border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#06110c]"
          >
            Dieta semanal
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickActions({ navigate }) {
  return (
    <section className="grid grid-cols-3 gap-2">
      <ActionCard
        icon={<Camera size={18} />}
        label="Comida"
        onClick={() => navigate("/foto-comida")}
      />

      <ActionCard
        icon={<Utensils size={18} />}
        label="Dieta"
        onClick={() => navigate("/plan-comidas")}
      />

      <ActionCard
        icon={<BarChart3 size={18} />}
        label="Progreso"
        onClick={() => navigate("/checkin")}
      />
    </section>
  );
}

function ActionCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border border-white/10 bg-[#091710] p-3 text-left transition hover:border-[#10b981]/40 hover:bg-[#0d2218]"
    >
      <div className="mb-2 text-[#10b981]">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white">
        {label}
      </p>
    </button>
  );
}

function MacroCard({ icon, label, current, goal, unit }) {
  const percentage = goal ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <div className="border border-white/10 bg-[#091710] p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[#10b981]">
        {icon}
        <p className="truncate text-[8px] font-black uppercase text-slate-500">
          {label}
        </p>
      </div>

      <p className="text-lg font-black leading-none">
        {Math.round(current)}
        <span className="text-[9px] text-slate-500">{unit}</span>
      </p>

      <p className="mt-1 text-[8px] text-slate-500">meta {goal}</p>

      <div className="mt-2 h-1 bg-white/5">
        <div
          className="h-full bg-[#10b981] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ScorePanel({ nutritionScore }) {
  return (
    <div className="relative overflow-hidden bg-[#10b981] p-4 text-[#06110c] shadow-[0_20px_60px_#22c55e22]">
      <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/25 blur-3xl" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between opacity-70">
          <Trophy size={27} />
          <Sparkles size={18} />
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-70">
          Score nutricional
        </p>

        <h2 className="mt-1 text-6xl font-black italic leading-none">
          {nutritionScore}
          <span className="text-lg">/10</span>
        </h2>
      </div>
    </div>
  );
}

function StatusCard({ title, icon, value, detail, action, onClick }) {
  return (
    <div className="border border-white/10 bg-[#091710] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#10b981]">
          {icon}
          <p className="text-[9px] font-black uppercase tracking-[0.22em]">
            {title}
          </p>
        </div>
      </div>

      <p className="truncate text-sm font-black uppercase italic text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] normal-case text-slate-500">{detail}</p>

      <button
        onClick={onClick}
        className="mt-3 w-full border border-white/10 bg-white/[0.04] py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#10b981] transition hover:bg-[#10b981] hover:text-[#06110c]"
      >
        {action}
      </button>
    </div>
  );
}

function SmartCoachTip({ totals, goals, mealCount, hasDiet }) {
  return (
    <section className="border border-[#10b981]/20 bg-[#10b981]/10 p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center bg-[#10b981] text-[#06110c]">
          <Sparkles size={18} />
        </div>

        <p className="text-[11px] font-bold normal-case leading-5 text-emerald-100/80">
          {getSmartTip(totals, goals, mealCount, hasDiet)}
        </p>
      </div>
    </section>
  );
}

function MiniBox({ icon, label, value, detail }) {
  return (
    <div className="min-w-0 border border-white/10 bg-[#0d2218]/70 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[#10b981]">
        {icon}
        <p className="truncate text-[7px] font-black uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <p className="truncate text-sm font-black">
        {value}
        <span className="ml-1 text-[8px] text-slate-500">{detail}</span>
      </p>
    </div>
  );
}

function DashboardBottomNav({ navigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d1714]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        <NavItem
          icon={<HomeIcon size={20} />}
          label="Inicio"
          active
          onClick={() => navigate("/dashboard")}
        />

        <NavItem
          icon={<Camera size={20} />}
          label="Escanear"
          onClick={() => navigate("/foto-comida")}
        />

        <NavItem
          icon={<Utensils size={20} />}
          label="Dieta"
          onClick={() => navigate("/plan-comidas")}
        />

        <NavItem
          icon={<BarChart3 size={20} />}
          label="Progreso"
          onClick={() => navigate("/checkin")}
        />
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition ${
        active ? "text-[#10b981]" : "text-white/35 hover:text-white"
      }`}
    >
      <div
        className={`p-1 ${
          active ? "border border-[#10b981]/50 bg-[#10b981]/10" : ""
        }`}
      >
        {icon}
      </div>

      <span className="text-[8px] font-black uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}

function getSmartTip(totals, goals, mealCount, hasDiet) {
  if (!hasDiet) {
    return "Aún no tienes una dieta activa. Genera un plan semanal para que el sistema pueda guiarte mejor.";
  }

  if (mealCount === 0) {
    return "Escanea tu primera comida del día para activar tus métricas reales.";
  }

  if (totals.protein < goals.protein * 0.5) {
    return "Vas bajo de proteína. Prioriza pollo, huevos, yogur griego, pescado o proteína magra en tu próxima comida.";
  }

  if (totals.calories > goals.calories) {
    return "Has superado tu meta calórica. Mantén la siguiente comida más ligera y alta en proteína.";
  }

  return "Buen ritmo. Sigue registrando tus comidas para mantener el control real del día.";
}

function getGoals(profile) {
  const goal = profile?.goal || profile?.objetivo;

  if (goal === "ganar_musculo") {
    return { calories: 2600, protein: 170, carbs: 280, fat: 80 };
  }

  if (goal === "perder_grasa") {
    return { calories: 1900, protein: 150, carbs: 160, fat: 60 };
  }

  return { calories: 2200, protein: 150, carbs: 220, fat: 70 };
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Grasa";
  if (goal === "ganar_musculo") return "Músculo";
  if (goal === "mantener_peso") return "Mantener";
  return "Perfil";
}

function getFirstName(name) {
  if (!name) return "Usuario";
  return String(name).trim().split(" ")[0] || "Usuario";
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}