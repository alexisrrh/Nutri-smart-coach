import React, { useMemo } from "react";
import {
  AlertCircle,
  BadgeEuro,
  ChefHat,
  Loader2,
  Salad,
  Sparkles,
  Target,
  Utensils,
  XCircle,
} from "lucide-react";

export function MealPlanForm({
  formData,
  setFormData,
  loading,
  handleSubmit,
  DIET_TYPES,
  GOAL_TYPES,
  BUDGET_TYPES,
}) {
  const selectedSummary = useMemo(() => {
    const diet = DIET_TYPES?.find((item) => item.value === formData.dietType);
    const goal = GOAL_TYPES?.find((item) => item.value === formData.goal);
    const budget = BUDGET_TYPES?.find((item) => item.value === formData.budget);

    return {
      diet: diet?.label || "Balanceada",
      goal: goal?.label || "Perder grasa",
      budget: budget?.label || "Estándar",
      meals: formData.mealsPerDay || "4",
    };
  }, [formData, DIET_TYPES, GOAL_TYPES, BUDGET_TYPES]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-white/5 bg-[#091710] shadow-2xl shadow-black/20"
    >
      <div className="border-b border-white/5 bg-[#07120d] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
            <Sparkles size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#10b981]">
              Smart Diet Builder
            </p>

            <h2 className="mt-1 text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl">
              Personaliza tu dieta
            </h2>

            <p className="mt-1 text-xs normal-case leading-5 text-slate-400">
              Ajusta objetivo, estilo, presupuesto y alimentos a evitar. La IA
              generará una semana completa con porciones y macros.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryPill label="Objetivo" value={cleanLabel(selectedSummary.goal)} />
          <SummaryPill label="Dieta" value={cleanLabel(selectedSummary.diet)} />
          <SummaryPill label="Comidas" value={`${selectedSummary.meals}/día`} />
          <SummaryPill label="Budget" value={cleanLabel(selectedSummary.budget)} />
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            icon={<Salad size={15} />}
            label="Tipo de dieta"
            name="dietType"
            value={formData.dietType}
            onChange={handleChange}
          >
            {DIET_TYPES?.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            icon={<Target size={15} />}
            label="Objetivo nutricional"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
          >
            {GOAL_TYPES?.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SelectField
            icon={<Utensils size={15} />}
            label="Comidas al día"
            name="mealsPerDay"
            value={formData.mealsPerDay}
            onChange={handleChange}
          >
            <option value="3">3 comidas</option>
            <option value="4">4 comidas</option>
            <option value="5">5 comidas</option>
          </SelectField>

          <SelectField
            icon={<BadgeEuro size={15} />}
            label="Presupuesto"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
          >
            {BUDGET_TYPES?.map((budget) => (
              <option key={budget.value} value={budget.value}>
                {budget.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            icon={<ChefHat size={15} />}
            label="Nivel de cocina"
            name="cookingLevel"
            value={formData.cookingLevel}
            onChange={handleChange}
          >
            <option value="easy">Fácil y rápido</option>
            <option value="medium">Intermedio</option>
            <option value="hard">Elaborado</option>
          </SelectField>
        </div>

        <TextField
          icon={<XCircle size={15} />}
          label="Alimentos a evitar"
          name="exclusions"
          value={formData.exclusions}
          onChange={handleChange}
          placeholder="Ej: lactosa, gluten, atún, brócoli..."
        />

        <div className="flex items-start gap-2 rounded-xl border border-[#10b981]/10 bg-[#10b981]/5 p-3">
          <AlertCircle className="mt-0.5 shrink-0 text-[#10b981]" size={15} />

          <p className="text-xs normal-case leading-5 text-slate-400">
            Consejo: cuanto más claro seas con alergias o alimentos que no te
            gustan, mejor será la dieta generada.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#10b981] px-5 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-[#0da371] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={15} />
              Calculando plan...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generar dieta inteligente
            </>
          )}

          {!loading && (
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-700 hover:translate-x-full" />
          )}
        </button>
      </div>
    </form>
  );
}

function SelectField({ icon, label, name, value, onChange, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span className="text-[#10b981]">{icon}</span>
        {label}
      </div>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-[#0d2218] px-3 py-3 text-xs font-bold uppercase text-white outline-none transition focus:border-[#10b981]"
      >
        {children}
      </select>
    </label>
  );
}

function TextField({ icon, label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span className="text-[#10b981]">{icon}</span>
        {label}
      </div>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0d2218] px-3 py-3 text-xs font-bold normal-case text-white outline-none transition placeholder:text-slate-600 focus:border-[#10b981]"
      />
    </label>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0d2218]/70 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-black uppercase text-white">
        {value}
      </p>
    </div>
  );
}

function cleanLabel(label = "") {
  return String(label).replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}