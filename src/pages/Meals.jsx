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
    setMeals([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-6xl">
        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 transition hover:bg-white/15"
        >
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
            NutriCoach iA
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Historial de comidas
          </h1>

          <p className="mt-3 text-white/60">
            Aquí verás todas las comidas guardadas desde el análisis con IA.
          </p>
        </div>

        {/* RESUMEN */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Summary icon={<Flame />} title="Calorías" value={`${totals.calories} kcal`} />
          <Summary icon={<Beef />} title="Proteínas" value={`${totals.protein} g`} />
          <Summary icon={<Wheat />} title="Carbs" value={`${totals.carbs} g`} />
          <Summary icon={<Droplets />} title="Grasas" value={`${totals.fat} g`} />
        </div>

        {/* LISTA */}
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Comidas guardadas</h2>
              <p className="text-white/50">
                Total: {meals.length} comida(s)
              </p>
            </div>

            {meals.length > 0 && (
              <button
                onClick={clearMeals}
                className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 font-bold text-red-300 hover:bg-red-500/20"
              >
                <Trash2 size={18} />
                Limpiar historial
              </button>
            )}
          </div>

          {meals.length === 0 ? (
            <Empty onClick={() => navigate("/foto-comida")} />
          ) : (
            <div className="grid gap-4">
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

/* COMPONENTES */

function Summary({ icon, title, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-5">
      <div className="mb-3 text-emerald-300">{icon}</div>
      <p className="text-sm text-white/50">{title}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function MealCard({ meal, onDelete }) {
  const date = new Date(meal.createdAt).toLocaleString("es-ES");

  return (
    <div className="rounded-[2rem] bg-white/5 p-5 border border-white/10">
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-emerald-300 font-bold uppercase">
            {meal.mealType} · {date}
          </p>

          <h3 className="mt-2 text-2xl font-black">
            {meal.food || "Comida"}
          </h3>

          <p className="text-white/50 text-sm">
            Objetivo: {formatGoal(meal.goal)}
          </p>
        </div>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-red-300 hover:bg-red-500/20"
        >
          <Trash2 size={16} />
          Eliminar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini title="Calorías" value={`${meal.calories} kcal`} />
        <Mini title="Proteínas" value={`${meal.protein} g`} />
        <Mini title="Carbs" value={`${meal.carbs} g`} />
        <Mini title="Grasas" value={`${meal.fat} g`} />
      </div>

      <div className="mt-4 bg-white/10 p-4 rounded-2xl">
        <p className="text-emerald-300 text-sm font-bold">Recomendación</p>
        <p className="text-white/60 text-sm mt-1">
          {meal.recommendation}
        </p>
      </div>
    </div>
  );
}

function Mini({ title, value }) {
  return (
    <div className="bg-white/10 p-3 rounded-xl">
      <p className="text-xs text-white/40">{title}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function Empty({ onClick }) {
  return (
    <div className="text-center py-16">
      <CalendarDays size={40} className="mx-auto text-emerald-300 mb-4" />
      <h3 className="text-xl font-black">No hay comidas guardadas</h3>
      <p className="text-white/50 mt-2">
        Analiza tu primera comida para empezar.
      </p>

      <button
        onClick={onClick}
        className="mt-5 bg-emerald-500 px-5 py-3 rounded-2xl font-bold"
      >
        <Camera size={18} className="inline mr-2" />
        Analizar comida
      </button>
    </div>
  );
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener";
  return "No definido";
}