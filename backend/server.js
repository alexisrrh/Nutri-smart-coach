import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, RefreshCcw, ShoppingBasket, Clock, 
  CheckCircle2, ChevronRight, Utensils, Scale, Flame 
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

const PROFILE_KEY = "nutricoach_profile";
const PROGRESS_KEY = "nutricoach_diet_progress";

export function MealPlan() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [view, setView] = useState("diet");
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
        const savedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
        setProfile(savedProfile);
        setProgress(savedProgress);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("weekly_diets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data?.length > 0) {
          setPlan(data[0].week || []);
        }
      } catch (error) {
        console.error("Error cargando plan:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeDayData = useMemo(() => plan[activeDay] || null, [plan, activeDay]);
  
  const dayTotals = useMemo(() => {
    if (!activeDayData) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return activeDayData.meals.reduce((acc, m) => {
      acc.calories += Number(m.calories) || 0;
      acc.protein += Number(m.protein) || 0;
      acc.carbs += Number(m.carbs) || 0;
      acc.fat += Number(m.fat) || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [activeDayData]);

  const toggleMeal = (dayName, index) => {
    const key = `${dayName}-${index}`;
    const updatedProgress = { ...progress, [key]: !progress[key] };
    setProgress(updatedProgress);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06130d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-32 text-white">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="space-y-1">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="group flex items-center gap-2 text-emerald-400 font-bold mb-2 transition-transform active:scale-95"
            >
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </button>
            <h1 className="text-4xl font-black tracking-tight uppercase italic leading-none">
              Build <span className="text-emerald-500 not-italic">Plan</span>
            </h1>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-emerald-400 hover:bg-white/10 transition-all"
          >
            <RefreshCcw size={20} />
          </button>
        </header>

        {activeDayData ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Selector de Días */}
            <nav className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {plan.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => { setActiveDay(idx); setView("diet"); }}
                  className={`flex-none px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all border ${
                    activeDay === idx && view === "diet"
                    ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-105" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {day.day}
                </button>
              ))}
            </nav>

            {/* Panel de Macros (Gráficos) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MacroProgress label="Energía" current={dayTotals.calories} total={profile?.goals?.calories || 2000} unit="kcal" color="#10b981" />
              <MacroProgress label="Proteína" current={dayTotals.protein} total={profile?.goals?.protein || 150} unit="g" color="#ef4444" />
              <MacroProgress label="Carbs" current={dayTotals.carbs} total={profile?.goals?.carbs || 200} unit="g" color="#f59e0b" />
              <MacroProgress label="Grasas" current={dayTotals.fat} total={profile?.goals?.fat || 70} unit="g" color="#3b82f6" />
            </div>

            {/* Lista de Comidas */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500/50">Daily Protocol</h3>
                <span className="text-[10px] font-bold text-white/20 uppercase">Gramajes de precisión</span>
              </div>

              <div className="grid gap-4">
                {activeDayData.meals.map((meal, mIdx) => (
                  <MealCard 
                    key={mIdx}
                    meal={meal}
                    isDone={progress[`${activeDayData.day}-${mIdx}`]}
                    onToggle={() => toggleMeal(activeDayData.day, mIdx)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
             <p className="text-white/20 font-black uppercase tracking-[0.2em]">Genera un plan para comenzar</p>
          </div>
        )}
      </div>
      <BottomNav />
    </section>
  );
}

/** Componente de Gráfico Circular */
function MacroProgress({ label, current, total, unit, color }) {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/[0.03] p-5 rounded-[2.5rem] flex flex-col items-center gap-3 border border-white/5 hover:bg-white/[0.06] transition-all">
      <div className="relative h-20 w-20 shrink-0">
        <svg className="h-full w-full -rotate-90 shadow-2xl">
          <circle cx="40" cy="40" r={radius} fill="transparent" stroke="currentColor" strokeWidth="5" className="text-white/5" />
          <circle 
            cx="40" cy="40" r={radius} fill="transparent" stroke={color} strokeWidth="5" 
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black leading-none">{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-tighter text-white/30 mb-0.5">{label}</p>
        <p className="text-base font-black italic">{Math.round(current)}<span className="text-[10px] opacity-40 ml-0.5">{unit}</span></p>
      </div>
    </div>
  );
}

/** Tarjeta de Comida con Detalle de Gramajes */
function MealCard({ meal, isDone, onToggle }) {
  return (
    <div 
      onClick={onToggle}
      className={`group relative flex flex-col p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${
        isDone 
        ? "bg-emerald-500/5 border-emerald-500/20 opacity-50 scale-[0.98]" 
        : "bg-white/[0.03] border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-5 mb-4">
        <div className={`h-14 w-14 rounded-3xl flex items-center justify-center transition-all ${
          isDone ? "bg-emerald-500 text-black shadow-lg" : "bg-white/5 text-emerald-500"
        }`}>
          {isDone ? <CheckCircle2 size={24} strokeWidth={3} /> : <Utensils size={24} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-emerald-500 italic uppercase tracking-tighter mb-1">
            {meal.time} · {meal.name}
          </p>
          <h4 className="text-xl font-black uppercase italic tracking-tight truncate">
            {meal.food}
          </h4>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xl font-black leading-none">{meal.calories}</p>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Kcal</p>
        </div>
      </div>

      {/* SECCIÓN TÉCNICA: Gramajes e Ingredientes */}
      <div className="bg-black/30 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Scale size={16} className="text-emerald-500 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Cantidades de preparación:</p>
            <p className="text-sm font-bold text-white/90 leading-tight">
              {meal.details || "Consulta el desglose en la guía"}
            </p>
          </div>
        </div>

        {/* Mini Macros por Plato */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6">
          <div className="text-center min-w-[35px]">
            <p className="text-[8px] font-bold text-white/20 uppercase">P</p>
            <p className="text-xs font-black text-red-500">{meal.protein}g</p>
          </div>
          <div className="text-center min-w-[35px]">
            <p className="text-[8px] font-bold text-white/20 uppercase">C</p>
            <p className="text-xs font-black text-amber-500">{meal.carbs}g</p>
          </div>
          <div className="text-center min-w-[35px]">
            <p className="text-[8px] font-bold text-white/20 uppercase">G</p>
            <p className="text-xs font-black text-blue-500">{meal.fat}g</p>
          </div>
        </div>
      </div>

      {/* Flecha indicativa en hover */}
      {!isDone && (
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={20} className="text-emerald-500" />
        </div>
      )}
    </div>
  );
}