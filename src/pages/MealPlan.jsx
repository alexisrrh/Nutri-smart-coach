import React, { useState, useEffect } from "react";
import { Download, Share2, ShoppingCart, AlertTriangle, BarChart2, Scan, Calendar, User } from "lucide-react";

// IMPORTACIONES DE TUS COMPONENTES MODULARES
import { DietSummary } from "../components/mealplan/DietSummary";
import { MealPlanForm } from "../components/mealplan/MealPlanForm";
import { DayDietView } from "../components/mealplan/DayDietView";
import { ShoppingListView } from "../components/mealplan/ShoppingListView";
import { PrintablePlan } from "../components/mealplan/PrintablePlan";
import { WeeklyCalendarView } from "../components/mealplan/WeeklyCalendarView";

const DIET_TYPES = [
  { value: "balanced", label: "⚖️ Balanceada" },
  { value: "keto", label: "🥑 Cetogénica (Keto)" },
  { value: "vegetarian", label: "🌱 Vegetariana" },
  { value: "vegan", label: "🌿 Vegana" },
  { value: "hyperprotein", label: "🥩 Alta en Proteínas" }
];

const GOAL_TYPES = [
  { value: "lose_fat", label: "🔥 Perder grasa" },
  { value: "gain_muscle", label: "💪 Ganar músculo" },
  { value: "maintain", label: "🏃‍♂️ Mantener" }
];

const BUDGET_TYPES = [
  { value: "low", label: "🪙 Económico" },
  { value: "medium", label: "💵 Estándar" },
  { value: "high", label: "💎 Premium" }
];

const normalizePlan = (weekArray) => {
  if (!Array.isArray(weekArray)) return [];
  return weekArray.map((day) => ({
    day: day.day || "Día",
    meals: day.meals || {}
  }));
};

const getWeekTotals = (plan) => {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  if (!plan || plan.length === 0) return totals;
  plan.forEach((day) => {
    if (!day.meals) return;
    Object.values(day.meals).forEach((meal) => {
      totals.calories += Number(meal.calories || meal.kcal || 0);
      totals.protein += Number(meal.protein || 0);
      totals.carbs += Number(meal.carbs || 0);
      totals.fat += Number(meal.fat || 0);
    });
  });
  return totals;
};

export function MealPlan() {
  const [formData, setFormData] = useState({
    dietType: "balanced", goal: "lose_fat", mealsPerDay: "4", budget: "medium", cookingLevel: "easy", exclusions: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [progress, setProgress] = useState({});
  const [viewMode, setViewMode] = useState("list"); // "list" por defecto como tu captura
  const [profileComplete, setProfileComplete] = useState(false); // Control del banner amarillo

  useEffect(() => {
    const savedPlan = localStorage.getItem("smart_diet_plan");
    const savedProgress = localStorage.getItem("smart_diet_progress");
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  }, []);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🌟 CORRECCIÓN: Apuntamos al puerto real de tu backend (normalmente 5000 o 3000 según tu config)
      // Si usas un proxy en Vite cambia la URL a la que tenías antes
      const response = await fetch("http://localhost:5173/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      // Validamos si el servidor dio error antes de parsear el JSON
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }
      
      const data = await response.json();
      
      const cleanPlan = normalizePlan(data.week || []);
      setPlan(cleanPlan);
      setProgress({});
      localStorage.setItem("smart_diet_plan", JSON.stringify(cleanPlan));
    } catch (err) {
      console.error("Fallo de conexión con el Smart Coach:", err);
      alert("No se ha podido conectar con el servidor de IA. Asegúrate de tener el backend encendido.");
    } finally {
      setLoading(false);
    }
  };


  const toggleMeal = (mealId) => {
    setProgress((prev) => {
      const updated = { ...prev, [mealId]: !prev[mealId] };
      localStorage.setItem("smart_diet_progress", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#06110c] text-white font-sans pb-32">
      <PrintablePlan plan={plan} />

      {/* RESTRICCIONES DE ANCHO CENTRAL */}
      <main className="mx-auto max-w-6xl px-6 pt-8 space-y-6">
        
        {/* TOP BAR / HEADER LOGO */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black tracking-widest text-[#10b981] uppercase font-mono">
            NUTRISMART COACH
          </div>
          <button className="rounded-xl bg-[#0d2218] border border-[#10b981]/20 px-4 py-2 text-xs font-bold text-[#10b981] hover:bg-[#10b981]/10 transition">
            Nueva dieta
          </button>
        </div>

        {/* TÍTULO PRINCIPAL */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase md:text-4xl">
            DIETA PERSONALIZADA
          </h1>
          <p className="text-xs text-slate-400 mt-1">Dieta semanal con comidas, porciones, ingredientes y lista de compra.</p>
        </div>

        {/* BANNER ALERTA AMARILLA DE TU PERFIL */}
        {!profileComplete && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl bg-[#1a1605] border border-amber-500/20 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">FALTA COMPLETAR TU PERFIL</h4>
                <p className="text-xs text-amber-200/60 mt-1">Necesitamos tu edad, peso, altura y objetivo para calcular una dieta útil.</p>
              </div>
            </div>
            <button className="rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-black hover:bg-amber-400 transition whitespace-nowrap">
              Completar perfil
            </button>
          </div>
        )}

        {/* CONTENEDOR DEL FORMULARIO INTELIGENTE */}
        <MealPlanForm 
          formData={formData} setFormData={setFormData} loading={loading} handleSubmit={handleSubmit}
          DIET_TYPES={DIET_TYPES} GOAL_TYPES={GOAL_TYPES} BUDGET_TYPES={BUDGET_TYPES}
        />

        {/* SECCIÓN DIETA SEMANAL */}
        <div className="rounded-2xl bg-[#091710] border border-white/5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">TU DIETA SEMANAL</h2>
              <p className="text-xs text-slate-400 mt-0.5">Elige un día y marca tus comidas.</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2.5 text-xs font-bold text-[#10b981] hover:bg-[#10b981]/20">
              <ShoppingCart size={14} /> Compra
            </button>
          </div>

          {/* BOTONES ACCIONES SECUNDARIAS */}
          <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:justify-start">
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl bg-[#0d2218] border border-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900">
              <Download size={14} /> Imprimir / PDF
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#0d2218] border border-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900">
              <Share2 size={14} /> Compartir
            </button>
          </div>

          {/* TOTALES MACROS CONSOLIDADOS */}
          <DietSummary plan={plan} getWeekTotals={getWeekTotals} />

          {/* INTERRUPTOR PARA ACTIVAR EL NUEVO CALENDARIO SI LO DESEAS */}
          <div className="flex justify-end">
            <button 
              onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
              className="text-xs font-bold text-[#10b981] hover:underline"
            >
              {viewMode === "list" ? "⚙️ Cambiar a vista cuadrícula semanal" : "⚙️ Volver a vista por lista"}
            </button>
          </div>

          {/* RENDERIZADO DINÁMICO */}
          {viewMode === "calendar" ? (
            <WeeklyCalendarView plan={plan} activeDay={activeDay} setActiveDay={setActiveDay} />
          ) : (
            <DayDietView plan={plan} activeDay={activeDay} setActiveDay={setActiveDay} progress={progress} toggleMeal={toggleMeal} />
          )}

          <ShoppingListView plan={plan} />
        </div>
      </main>

      {/* MENÚ DE NAVEGACIÓN INFERIOR DE TU CAPTURA */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#091710]/95 border-t border-white/5 backdrop-blur-md px-6 py-3 no-print">
        <div className="mx-auto max-w-md flex items-center justify-between text-slate-400">
          <button className="flex flex-col items-center gap-1 text-[#10b981]">
            <BarChart2 size={20} /> <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-white transition">
            <Scan size={20} /> <span className="text-[10px] font-bold uppercase tracking-wider">Analizar</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-white transition">
            <Calendar size={20} /> <span className="text-[10px] font-bold uppercase tracking-wider">Historial</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-white transition">
            <User size={20} /> <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
