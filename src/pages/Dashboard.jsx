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
  Zap,
  Home as HomeIcon,
  BarChart3,
  TrendingUp
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
  
  // Lógica de Check-in Semanal
  const hasCheckinThisWeek = useMemo(() => {
    return checkins.some((item) => {
      if (!item.createdAt) return false;
      const now = new Date();
      const checkDate = new Date(item.createdAt);
      return (now - checkDate) <= 7 * 24 * 60 * 60 * 1000;
    });
  }, [checkins]);

  return (
    <section className="relative min-h-screen bg-[#050a09] px-4 py-6 pb-32 text-white font-sans uppercase tracking-tight">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98110,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500 flex items-center justify-center text-[#050a09] shadow-[0_0_25px_#10b98155]">
              <Zap size={24} className="fill-current" />
            </div>
            <div>
              <p className="text-2xl font-black italic tracking-tighter leading-none">
                Nutri <span className="text-emerald-500">Smart</span> Coach
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                Sistema: <span className="text-emerald-500 font-black text-nowrap">Operativo</span>
              </p>
            </div>
          </div>
          <button onClick={() => navigate("/perfil")} className="border border-white/10 bg-white/5 p-3 hover:bg-emerald-500 hover:text-[#050a09] transition-all">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            {/* Hero Section */}
            <section className="border border-white/10 bg-[#0d1412] p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center gap-2 bg-[#050a09] border border-emerald-500/30 px-3 py-1 text-[10px] font-black text-emerald-400">
                  <Activity size={12} /> STATUS: OPTIMIZANDO
                </div>
                <h1 className="text-5xl md:text-7xl font-black italic leading-[0.85] mb-4">
                  HOLA, <br />
                  <span className="text-emerald-500">{profile?.name || "USUARIO"}</span>
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <button onClick={() => navigate("/foto-comida")} className="flex items-center justify-center gap-3 bg-emerald-500 py-5 font-black text-[#050a09] hover:bg-white transition-all shadow-[0_15px_30px_#10b98122]">
                    <Camera size={20} /> ESCANEAR COMIDA
                  </button>
                  <button onClick={() => navigate("/plan-comidas")} className="flex items-center justify-center gap-3 border border-white/10 bg-white/5 py-5 font-black hover:bg-white hover:text-[#050a09] transition-all text-sm">
                    <Utensils size={18} /> DIETA SEMANAL
                  </button>
                </div>
              </div>
            </section>

            {/* Macros Grid */}
            <div className="grid gap-4 md:grid-cols-3">
               <MacroBlock label="CALORÍAS" current={totals.calories} goal={goals.calories} unit="KCAL" color="bg-emerald-500" />
               <MacroBlock label="PROTEÍNA" current={totals.protein} goal={goals.protein} unit="G" color="bg-blue-400" />
               <MacroBlock label="CARBOS" current={totals.carbs} goal={goals.carbs} unit="G" color="bg-amber-400" />
            </div>

            {/* PANEL DE CHECK-IN SEMANAL (REINTEGRADO) */}
            <section className="border border-white/10 bg-[#0d1412] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-6">
                <div className={`h-16 w-16 flex items-center justify-center border-2 ${hasCheckinThisWeek ? 'border-emerald-500 text-emerald-500' : 'border-blue-500 text-blue-500 animate-pulse'}`}>
                  <ScanLine size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase">Progreso Visual</h3>
                  <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                    {hasCheckinThisWeek ? "Check-in semanal completado" : "Pendiente: Realiza tu check-in semanal"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/checkin")}
                className={`px-8 py-4 font-black text-[11px] tracking-[0.2em] transition-all ${hasCheckinThisWeek ? 'bg-white/5 border border-white/10 text-white/50 hover:text-white' : 'bg-blue-500 text-white hover:bg-white hover:text-blue-500'}`}
              >
                {hasCheckinThisWeek ? "VER EVOLUCIÓN" : "REGISTRAR AHORA"}
              </button>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-emerald-500 p-8 text-[#050a09]">
              <div className="flex justify-between items-start mb-4 text-[#050a09]/40">
                <Trophy size={32} />
                <TrendingUp size={20} />
              </div>
              <p className="text-xs font-black tracking-[0.3em] opacity-60">SCORE NUTRICIONAL</p>
              <div className="flex items-baseline gap-1">
                <h2 className="text-8xl font-black italic leading-none">{nutritionScore}</h2>
                <span className="text-xl font-black">/10</span>
              </div>
            </div>

            <div className="border border-white/10 bg-[#0d1412] p-6 space-y-6">
              <h3 className="text-xs font-black tracking-[0.4em] text-emerald-500 italic">ÚLTIMAS COMIDAS</h3>
              <div className="space-y-3">
                {lastMeals.length > 0 ? (
                  lastMeals.map((meal, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#050a09] border border-white/5 p-4">
                      <div>
                        <p className="text-[9px] font-black text-emerald-500">{meal.mealType || "INGESTA"}</p>
                        <p className="text-xs font-black italic">{meal.food.substring(0, 15)}...</p>
                      </div>
                      <p className="text-lg font-black italic">{Math.round(meal.calories)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-white/20 py-4 text-center border border-dashed border-white/10">SIN DATOS HOY</p>
                )}
              </div>
              <button onClick={() => navigate("/comidas")} className="w-full py-3 text-[10px] font-black tracking-[0.3em] border border-white/10 hover:bg-white hover:text-[#050a09] transition-all">
                HISTORIAL COMPLETO
              </button>
            </div>
          </aside>
        </div>

        {/* Footer IA */}
        <section className="mt-6 border border-emerald-500/20 bg-emerald-500/5 p-8 flex items-center gap-6">
          <div className="h-12 w-12 shrink-0 flex items-center justify-center bg-emerald-500 text-[#050a09]">
            <Sparkles size={24} />
          </div>
          <p className="text-sm font-black italic leading-tight text-white/70 tracking-wide">
            "{getSmartTip(totals, goals, todayMeals.length)}"
          </p>
        </section>
      </div>

      <BottomNav />
    </section>
  );
}

// Subcomponentes
function MacroBlock({ label, current, goal, unit, color }) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));
  return (
    <div className="border border-white/10 bg-[#0d1412] p-6 group">
      <p className="text-[10px] font-black tracking-[0.3em] text-white/30 mb-4">{label}</p>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-black italic leading-none">{Math.round(current)}</span>
        <span className="text-[10px] font-bold text-white/20 uppercase">{unit} / {goal}</span>
      </div>
      <div className="h-1 w-full bg-white/5">
        <div className={`h-full ${color} transition-all duration-1000 shadow-[0_0_8px_current]`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d1412]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-4">
        <NavItem icon={<HomeIcon size={20} />} label="Inicio" onClick={() => navigate("/")} />
        <NavItem icon={<Camera size={20} />} label="Escanear" active onClick={() => navigate("/foto-comida")} />
        <NavItem icon={<Utensils size={20} />} label="Dieta" onClick={() => navigate("/plan-comidas")} />
        <NavItem icon={<BarChart3 size={20} />} label="Progreso" onClick={() => navigate("/checkin")} />
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? "text-emerald-500" : "text-white/30 hover:text-white"}`}>
      <div className={`p-1 ${active ? "bg-emerald-500/10 border border-emerald-500/50" : ""}`}>{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function getSmartTip(totals, goals, mealCount) {
  if (mealCount === 0) return "SISTEMA LISTO. ESCANEA TU COMIDA PARA INICIAR EL PROCESAMIENTO.";
  if (totals.protein < goals.protein * 0.5) return "DÉFICIT PROTEICO DETECTADO. PRIORIZA PROTEÍNA MAGRA EN TU SIGUIENTE INGESTA.";
  if (totals.calories > goals.calories) return "LÍMITE CALÓRICO EXCEDIDO. SE RECOMIENDA MODERACIÓN.";
  return "BALANCE ÓPTIMO. SIGUE LAS MÉTRICAS PARA MAXIMIZAR RESULTADOS.";
}