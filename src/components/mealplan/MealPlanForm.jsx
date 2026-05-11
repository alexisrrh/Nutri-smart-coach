import { useMemo } from "react";
import {
  BadgeEuro,
  CalendarDays,
  ChefHat,
  Home,
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
  PLAN_DAYS = [],
  MEALS_PER_DAY = [],
}) {
  const selectedSummary = useMemo(() => {
    const diet = DIET_TYPES?.find((item) => item.value === formData.dietType);
    const goal = GOAL_TYPES?.find((item) => item.value === formData.goal);
    const budget = BUDGET_TYPES?.find((item) => item.value === formData.budget);
    const days = PLAN_DAYS?.find((item) => item.value === formData.planDays);
    const meals = MEALS_PER_DAY?.find(
      (item) => item.value === formData.mealsPerDay
    );

    return {
      diet: diet?.label || "Balanceada",
      goal: goal?.label || "Perder grasa",
      budget: budget?.label || "Normal",
      days: days?.label || `${formData.planDays || 7} días`,
      meals: meals?.label || `${formData.mealsPerDay || 4} comidas`,
    };
  }, [formData, DIET_TYPES, GOAL_TYPES, BUDGET_TYPES, PLAN_DAYS, MEALS_PER_DAY]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#07170f] shadow-[0_30px_120px_rgba(16,185,129,0.08)]"
    >
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10 border-b border-white/10 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
            <Sparkles size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
              Smart Diet Builder
            </p>

            <h2 className="mt-0.5 text-lg font-black uppercase italic tracking-tight text-white">
              Personaliza tu dieta
            </h2>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <SummaryPill label="Días" value={cleanLabel(selectedSummary.days)} />
          <SummaryPill label="Comidas" value={cleanLabel(selectedSummary.meals)} />
          <SummaryPill label="Dieta" value={cleanLabel(selectedSummary.diet)} />
          <SummaryPill label="Objetivo" value={cleanLabel(selectedSummary.goal)} />
        </div>
      </div>

      <div className="relative z-10 space-y-3 p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            icon={<CalendarDays size={14} />}
            label="Días"
            name="planDays"
            value={formData.planDays}
            onChange={handleChange}
          >
            {PLAN_DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            icon={<Utensils size={14} />}
            label="Comidas"
            name="mealsPerDay"
            value={formData.mealsPerDay}
            onChange={handleChange}
          >
            {MEALS_PER_DAY.map((meal) => (
              <option key={meal.value} value={meal.value}>
                {meal.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            icon={<Salad size={14} />}
            label="Dieta"
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
            icon={<Target size={14} />}
            label="Objetivo"
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

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            icon={<BadgeEuro size={14} />}
            label="Budget"
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
            icon={<ChefHat size={14} />}
            label="Cocina"
            name="cookingLevel"
            value={formData.cookingLevel}
            onChange={handleChange}
          >
            <option value="easy">Fácil</option>
            <option value="medium">Media</option>
            <option value="hard">Pro</option>
          </SelectField>
        </div>

        <TextAreaField
          icon={<Home size={14} />}
          label="Tengo en casa"
          name="homeFoods"
          value={formData.homeFoods}
          onChange={handleChange}
          placeholder="Ej: huevos, pollo, arroz, brócoli, yogur griego..."
        />

        <TextField
          icon={<XCircle size={14} />}
          label="Evitar"
          name="exclusions"
          value={formData.exclusions}
          onChange={handleChange}
          placeholder="Ej: lactosa, gluten, atún..."
        />

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#10b981] px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#06110c] shadow-[0_20px_60px_rgba(16,185,129,0.22)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={15} />
              Calculando...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generar dieta inteligente
            </>
          )}

          {!loading && (
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
          )}
        </button>
      </div>
    </form>
  );
}

function SelectField({ icon, label, name, value, onChange, children }) {
  return (
    <label className="block min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
        <span className="text-[#10b981]">{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-2xl border border-white/10 bg-[#0d2218] px-2 text-[10px] font-black uppercase text-white outline-none transition focus:border-[#10b981]"
      >
        {children}
      </select>
    </label>
  );
}

function TextField({ icon, label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
        <span className="text-[#10b981]">{icon}</span>
        {label}
      </div>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-white/10 bg-[#0d2218] px-3 text-xs font-bold normal-case text-white outline-none transition placeholder:text-slate-600 focus:border-[#10b981]"
      />
    </label>
  );
}

function TextAreaField({ icon, label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
        <span className="text-[#10b981]">{icon}</span>
        {label}
      </div>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-2xl border border-white/10 bg-[#0d2218] px-3 py-3 text-xs font-bold normal-case text-white outline-none transition placeholder:text-slate-600 focus:border-[#10b981]"
      />
    </label>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
      <p className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[9px] font-black uppercase text-white">
        {value}
      </p>
    </div>
  );
}

function cleanLabel(label = "") {
  return String(label).replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}