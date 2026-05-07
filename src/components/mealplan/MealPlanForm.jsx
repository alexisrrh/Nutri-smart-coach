import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export function MealPlanForm({ 
  formData, 
  setFormData, 
  loading, 
  handleSubmit,
  DIET_TYPES,
  GOAL_TYPES,
  BUDGET_TYPES
}) {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/5 bg-[#091710] p-6">
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tipo de Dieta */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Dieta</label>
          <select
            name="dietType"
            value={formData.dietType}
            onChange={handleChange}
            className="rounded-xl border border-white/10 bg-[#0d2218] p-3 text-xs font-bold text-white focus:border-[#10b981] focus:outline-none uppercase"
          >
            {DIET_TYPES?.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Objetivo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objetivo Nutricional</label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="rounded-xl border border-white/10 bg-[#0d2218] p-3 text-xs font-bold text-white focus:border-[#10b981] focus:outline-none uppercase"
          >
            {GOAL_TYPES?.map((goal) => (
              <option key={goal.value} value={goal.value}>{goal.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Comidas al día */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comidas al día</label>
          <select
            name="mealsPerDay"
            value={formData.mealsPerDay}
            onChange={handleChange}
            className="rounded-xl border border-white/10 bg-[#0d2218] p-3 text-xs font-bold text-white focus:border-[#10b981] focus:outline-none uppercase"
          >
            <option value="3">3 comidas (Básica)</option>
            <option value="4">4 comidas (Recomendada)</option>
            <option value="5">5 comidas (Deportistas)</option>
          </select>
        </div>

        {/* Presupuesto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presupuesto</label>
          <select
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="rounded-xl border border-white/10 bg-[#0d2218] p-3 text-xs font-bold text-white focus:border-[#10b981] focus:outline-none uppercase"
          >
            {BUDGET_TYPES?.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Nivel de cocina */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Complejidad</label>
          <select
            name="cookingLevel"
            value={formData.cookingLevel}
            onChange={handleChange}
            className="rounded-xl border border-white/10 bg-[#0d2218] p-3 text-xs font-bold text-white focus:border-[#10b981] focus:outline-none uppercase"
          >
            <option value="easy">Fácil y rápido</option>
            <option value="medium">Intermedio</option>
            <option value="hard">Elaborado</option>
          </select>
        </div>
      </div>

      {/* Alérgenos */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alimentos a evitar</label>
        <input
          type="text"
          name="exclusions"
          value={formData.exclusions}
          onChange={handleChange}
          placeholder="Ej: lactosa, gluten..."
          className="rounded-xl border border-white/10 bg-[#0d2218] p-3 text-xs font-bold text-white placeholder:text-slate-600 focus:border-[#10b981] focus:outline-none uppercase"
        />
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#10b981] py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-[#0da371] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={14} />
            Calculando plan...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generar dieta inteligente
          </>
        )}
      </button>
    </form>
  );
}
