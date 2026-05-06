import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Trophy,
  Utensils,
  ScanLine,
  Sparkles,
  Settings,
  Activity,
  Zap,
  Home as HomeIcon,
  BarChart3,
  TrendingUp,
} from "lucide-react";

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
    calories: 2200,
    protein: 150,
    carbs: 200,
    fat: 70,
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

  const hasCheckinThisWeek = useMemo(() => {
    return checkins.some((item) => {
      if (!item.createdAt) return false;
      const now = new Date();
      const checkDate = new Date(item.createdAt);
      return now - checkDate <= 7 * 24 * 60 * 60 * 1000;
    });
  }, [checkins]);

  return (
   <section className="relative min-h-screen bg-[#08120f] px-4 pt-5 pb-48 text-white font-sans uppercase tracking-tight sm:px-6 sm:pt-6 sm:pb-52">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_42%),radial-gradient(circle_at_bottom_left,#4361ee12,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-5 sm:mb-10 sm:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 items-center justify-center bg-emerald-500 text-[#050a09] shadow-[0_0_25px_#10b98155] sm:h-12 sm:w-12">
              <Zap size={22} className="fill-current" />
            </div>

            <div>
              <p className="text-lg font-black italic leading-none tracking-tighter sm:text-2xl">
                Nutri <span className="text-emerald-500">Smart</span> Coach
              </p>

              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/35 sm:text-[10px] sm:tracking-[0.4em]">
                Sistema:{" "}
                <span className="text-emerald-500 font-black">Operativo</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/perfil")}
            className="border border-white/10 bg-white/5 p-3 transition-all hover:bg-emerald-500 hover:text-[#050a09]"
          >
            <Settings size={20} />
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_350px] lg:gap-6">
          <div className="space-y-5 sm:space-y-6">
            <section className="relative overflow-hidden border border-white/10 bg-[#0d1714] p-5 sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-5 inline-flex items-center gap-2 border border-emerald-500/30 bg-[#08120f] px-3 py-1 text-[9px] font-black text-emerald-400 sm:mb-6 sm:text-[10px]">
                  <Activity size={12} /> STATUS: OPTIMIZANDO
                </div>

                <h1 className="mb-4 text-4xl font-black italic leading-[0.85] sm:text-5xl md:text-7xl">
                  HOLA, <br />
                  <span className="text-emerald-500">
                    {profile?.name || profile?.nombre || "USUARIO"}
                  </span>
                </h1>

                <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                  <button
                    onClick={() => navigate("/foto-comida")}
                    className="flex items-center justify-center gap-3 bg-emerald-500 py-4 text-sm font-black text-[#050a09] shadow-[0_15px_30px_#10b98122] transition-all hover:bg-white sm:py-5"
                  >
                    <Camera size={20} /> ESCANEAR COMIDA
                  </button>

                  <button
                    onClick={() => navigate("/plan-comidas")}
                    className="flex items-center justify-center gap-3 border border-white/10 bg-white/5 py-4 text-sm font-black transition-all hover:bg-white hover:text-[#050a09] sm:py-5"
                  >
                    <Utensils size={18} /> DIETA SEMANAL
                  </button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <MacroBlock
                label="CALORÍAS"
                current={totals.calories}
                goal={goals.calories}
                unit="KCAL"
                color="bg-emerald-500"
              />

              <MacroBlock
                label="PROTEÍNA"
                current={totals.protein}
                goal={goals.protein}
                unit="G"
                color="bg-blue-400"
              />

              <MacroBlock
                label="CARBOS"
                current={totals.carbs}
                goal={goals.carbs}
                unit="G"
                color="bg-amber-400"
              />
            </div>

            <section className="flex flex-col gap-5 border border-white/10 border-l-4 border-l-blue-500 bg-[#0d1714] p-5 sm:p-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center border-2 sm:h-16 sm:w-16 ${
                    hasCheckinThisWeek
                      ? "border-emerald-500 text-emerald-500"
                      : "border-blue-500 text-blue-500 animate-pulse"
                  }`}
                >
                  <ScanLine size={30} />
                </div>

                <div>
                  <h3 className="text-lg font-black italic uppercase sm:text-xl">
                    Progreso Visual
                  </h3>

                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45 sm:text-[10px]">
                    {hasCheckinThisWeek
                      ? "Check-in semanal completado"
                      : "Pendiente: realiza tu check-in semanal"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkin")}
                className={`px-6 py-4 text-[10px] font-black tracking-[0.2em] transition-all sm:px-8 sm:text-[11px] ${
                  hasCheckinThisWeek
                    ? "border border-white/10 bg-white/5 text-white/55 hover:text-white"
                    : "bg-blue-500 text-white hover:bg-white hover:text-blue-500"
                }`}
              >
                {hasCheckinThisWeek ? "VER EVOLUCIÓN" : "REGISTRAR AHORA"}
              </button>
            </section>
          </div>

          <aside className="grid gap-5 sm:grid-cols-2 lg:block lg:space-y-6">
            <div className="bg-emerald-500 p-6 text-[#050a09] sm:p-8">
              <div className="mb-4 flex items-start justify-between text-[#050a09]/45">
                <Trophy size={32} />
                <TrendingUp size={20} />
              </div>

              <p className="text-[10px] font-black tracking-[0.3em] opacity-60 sm:text-xs">
                SCORE NUTRICIONAL
              </p>

              <div className="flex items-baseline gap-1">
                <h2 className="text-7xl font-black italic leading-none sm:text-8xl">
                  {nutritionScore}
                </h2>

                <span className="text-xl font-black">/10</span>
              </div>
            </div>

            <div className="space-y-5 border border-white/10 bg-[#0d1714] p-5 sm:p-6">
              <h3 className="text-[10px] font-black italic tracking-[0.35em] text-emerald-500 sm:text-xs sm:tracking-[0.4em]">
                ÚLTIMAS COMIDAS
              </h3>

              <div className="space-y-3">
                {lastMeals.length > 0 ? (
                  lastMeals.map((meal, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border border-white/5 bg-[#08120f] p-4"
                    >
                      <div>
                        <p className="text-[9px] font-black text-emerald-500">
                          {meal.mealType || "INGESTA"}
                        </p>

                        <p className="text-xs font-black italic">
                          {(meal.food || "Comida").substring(0, 15)}...
                        </p>
                      </div>

                      <p className="text-lg font-black italic">
                        {Math.round(meal.calories || 0)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="border border-dashed border-white/10 py-4 text-center text-[10px] text-white/25">
                    SIN DATOS HOY
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate("/comidas")}
                className="w-full border border-white/10 py-3 text-[10px] font-black tracking-[0.3em] transition-all hover:bg-white hover:text-[#050a09]"
              >
                HISTORIAL COMPLETO
              </button>
            </div>
          </aside>
        </div>

       <section className="mt-5 mb-10 flex items-center gap-5 border border-emerald-500/20 bg-emerald-500/8 p-5 sm:mt-6 sm:mb-14 sm:gap-6 sm:p-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-emerald-500 text-[#050a09] sm:h-12 sm:w-12">
            <Sparkles size={24} />
          </div>

          <p className="text-xs font-black italic leading-tight tracking-wide text-white/75 sm:text-sm">
            "{getSmartTip(totals, goals, todayMeals.length)}"
          </p>
        </section>
      </div>

      <BottomNav />
    </section>
  );
}

function MacroBlock({ label, current, goal, unit, color }) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));

  return (
    <div className="group border border-white/10 bg-[#0d1714] p-3 sm:p-6">
      <p className="mb-3 text-[8px] font-black tracking-[0.18em] text-white/35 sm:mb-4 sm:text-[10px] sm:tracking-[0.3em]">
        {label}
      </p>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-1">
        <span className="text-2xl font-black italic leading-none sm:text-4xl">
          {Math.round(current)}
        </span>

        <span className="text-[8px] font-bold uppercase text-white/30 sm:text-[10px]">
          {unit} / {goal}
        </span>
      </div>

      <div className="h-1 w-full bg-white/5">
        <div
          className={`h-full ${color} shadow-[0_0_8px_current] transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d1714]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-3 sm:py-4">
        <NavItem
          icon={<HomeIcon size={20} />}
          label="Inicio"
          onClick={() => navigate("/")}
        />

        <NavItem
          icon={<Camera size={20} />}
          label="Escanear"
          active
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
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? "text-emerald-500" : "text-white/35 hover:text-white"
      }`}
    >
      <div
        className={`p-1 ${
          active ? "border border-emerald-500/50 bg-emerald-500/10" : ""
        }`}
      >
        {icon}
      </div>

      <span className="text-[8px] font-black uppercase tracking-widest sm:text-[9px]">
        {label}
      </span>
    </button>
  );
}

function getSmartTip(totals, goals, mealCount) {
  if (mealCount === 0)
    return "SISTEMA LISTO. ESCANEA TU COMIDA PARA INICIAR EL PROCESAMIENTO.";

  if (totals.protein < goals.protein * 0.5)
    return "DÉFICIT PROTEICO DETECTADO. PRIORIZA PROTEÍNA MAGRA EN TU SIGUIENTE INGESTA.";

  if (totals.calories > goals.calories)
    return "LÍMITE CALÓRICO EXCEDIDO. SE RECOMIENDA MODERACIÓN.";

  return "BALANCE ÓPTIMO. SIGUE LAS MÉTRICAS PARA MAXIMIZAR RESULTADOS.";
}