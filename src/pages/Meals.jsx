import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Trash2,
  CalendarDays,
  Camera,
  ChevronRight,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

const STORAGE_KEY = "nutricoach_meals";

export function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const savedMeals = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setMeals(savedMeals);
  }, []);

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories) || 0;
        acc.protein += Number(meal.protein) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fat += Number(meal.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  const deleteMeal = (id) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearMeals = () => {
    if (window.confirm("¿BORRAR TODO EL HISTORIAL?")) {
      setMeals([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <section className="min-h-screen bg-[#060b13] px-4 py-8 pb-32 text-slate-200 font-sans tracking-tight">
      <div className="mx-auto max-w-5xl">
        
        {/* BOTÓN VOLVER - TOTALMENTE CUADRADO */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400/70 hover:text-emerald-400 transition-all"
        >
          <ArrowLeft size={16} /> [ Volver al dashboard ]
        </button>

        {/* HEADER CON GRADIENTE */}
        <div className="mb-10 border-l-2 border-emerald-500 pl-6">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">
            System.Database_
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-emerald-500/50 md:text-5xl">
            Historial de Comidas
          </h1>
        </div>

        {/* RESUMEN - TARJETAS CUADRADAS */}
        <div className="mb-10 grid gap-1 grid-cols-2 md:grid-cols-4">
          <Summary icon={<Flame size={18} />} title="Calorías" value={totals.calories} unit="kcal" />
          <Summary icon={<Beef size={18} />} title="Proteínas" value={totals.protein} unit="g" />
          <Summary icon={<Wheat size={18} />} title="Carbs" value={totals.carbs} unit="g" />
          <Summary icon={<Droplets size={18} />} title="Grasas" value={totals.fat} unit="g" />
        </div>

        {/* CONTENEDOR DE LISTA - SIN ROUNDED */}
        <div className="relative border border-white/10 bg-[#ffffff03] p-8 backdrop-blur-2xl shadow-2xl">
          <div className="absolute top-0 left-0 h-[2px] w-20 bg-emerald-500"></div>
          
          <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white font-mono">Registros_Guardados</h2>
              <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest mt-1">
                Count: {meals.length}
              </p>
            </div>

            {meals.length > 0 && (
              <button
                onClick={clearMeals}
                className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-400 transition-all"
              >
                [ Limpiar_Historial ]
              </button>
            )}
          </div>

          {meals.length === 0 ? (
            <Empty onClick={() => navigate("/foto-comida")} />
          ) : (
            <div className="grid gap-6">
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onDelete={() => deleteMeal(meal.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </section>
  );
}

/* COMPONENTES CUADRADOS */

function Summary({ icon, title, value, unit }) {
  return (
    <div className="border border-white/5 bg-white/[0.03] p-6 backdrop-blur-xl transition-all hover:bg-emerald-500/5 hover:border-emerald-500/30">
      <div className="mb-3 text-emerald-500/50">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-xl font-black text-white leading-none">{value}</p>
        <p className="text-[9px] font-bold text-emerald-500/40 uppercase">{unit}</p>
      </div>
    </div>
  );
}

function MealCard({ meal, onDelete }) {
  const date = new Date(meal.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="relative border border-white/10 bg-white/[0.01] p-6 transition-all hover:border-white/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-emerald-400 border border-emerald-500/30 px-2 py-1 uppercase tracking-tighter">
              {meal.mealType}
            </span>
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              DATE: {date}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-white font-mono">
            {meal.food || "Unknown_Entry"}
          </h3>
        </div>

        <button
          onClick={onDelete}
          className="text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-red-400 transition-all"
        >
          [ Borrar ]
        </button>
      </div>

      {/* MINI MACROS CUADRADOS */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-6">
        <Mini title="Calories" value={meal.calories} unit="kcal" />
        <Mini title="Protein" value={meal.protein} unit="g" />
        <Mini title="Carbs" value={meal.carbs} unit="g" />
        <Mini title="Fat" value={meal.fat} unit="g" />
      </div>

      {/* RECOMENDACIÓN IA ESTILO TÉCNICO */}
      <div className="mt-6 border-l-2 border-emerald-500/30 bg-emerald-500/[0.02] p-4">
        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          Análisis_IA <ChevronRight size={10} />
        </p>
        <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
          {meal.recommendation}
        </p>
      </div>
    </div>
  );
}

function Mini({ title, value, unit }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-sm font-black text-white">{value}<span className="ml-1 text-emerald-500/40 text-[9px]">{unit}</span></p>
    </div>
  );
}

function Empty({ onClick }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex h-16 w-16 items-center justify-center border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 mb-6">
        <CalendarDays size={32} />
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight text-white">Base de datos vacía</h3>
      <p className="text-xs font-medium text-slate-500 mt-2 mb-10 uppercase tracking-widest">Inicia análisis de sensor_</p>

      <button
        onClick={onClick}
        className="inline-flex items-center gap-3 border border-emerald-500 bg-emerald-500/10 px-10 py-5 text-xs font-black uppercase tracking-[0.3em] text-emerald-500 transition-all hover:bg-emerald-500 hover:text-[#060b13]"
      >
        <Camera size={16} />
        Nuevo Análisis
      </button>
    </div>
  );
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Fat_Loss";
  if (goal === "ganar_musculo") return "Muscle_Gain";
  if (goal === "mantener_peso") return "Maintain";
  return "General";
}
