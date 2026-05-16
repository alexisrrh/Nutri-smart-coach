import { useEffect, useRef, useState } from "react";
import {
  BadgeEuro,
  CalendarDays,
  Check,
  ChefHat,
  ChevronDown,
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
      className="relative rounded-[26px] border border-white/10 bg-[#07170f]/95 shadow-[0_26px_90px_rgba(16,185,129,0.08)]"
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10 border-b border-white/[0.08] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
            <Sparkles size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#10b981]">
              Smart Diet Builder
            </p>

            <h2 className="mt-0.5 text-[15px] font-bold normal-case leading-tight tracking-normal text-white">
              Personaliza tu dieta
            </h2>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-2 p-3">
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            icon={<Target size={14} />}
            label="Objetivo"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            options={GOAL_TYPES}
          />

          <SelectField
            icon={<Salad size={14} />}
            label="Tipo dieta"
            name="dietType"
            value={formData.dietType}
            onChange={handleChange}
            options={DIET_TYPES}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            icon={<CalendarDays size={14} />}
            label="Días"
            name="planDays"
            value={formData.planDays}
            onChange={handleChange}
            options={PLAN_DAYS}
          />

          <SelectField
            icon={<Utensils size={14} />}
            label="Comidas"
            name="mealsPerDay"
            value={formData.mealsPerDay}
            onChange={handleChange}
            options={MEALS_PER_DAY}
          />
        </div>

        <SelectField
          icon={<BadgeEuro size={14} />}
          label="Presupuesto"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          options={BUDGET_TYPES}
        />

        <details className="group rounded-[18px] border border-white/10 bg-black/15">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <Home size={12} className="text-[#10b981]" />
              Preferencias avanzadas
            </span>

            <span className="text-[#10b981] transition group-open:rotate-45">+</span>
          </summary>

          <div className="space-y-2 border-t border-white/10 p-2">
            <SelectField
              icon={<ChefHat size={14} />}
              label="Cocina"
              name="cookingLevel"
              value={formData.cookingLevel}
              onChange={handleChange}
              options={[
                { value: "easy", label: "Fácil" },
                { value: "medium", label: "Media" },
                { value: "hard", label: "Pro" },
              ]}
            />

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
          </div>
        </details>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-[1.15rem] border border-emerald-300/25 bg-gradient-to-br from-[#063d2d] via-[#07523b] to-[#0a6b4c] px-3 py-3 text-white shadow-[0_16px_38px_rgba(16,185,129,0.24)] transition duration-300 hover:border-emerald-200/40 hover:shadow-[0_18px_44px_rgba(16,185,129,0.32)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition duration-700 group-hover:translate-x-full" />

          {loading ? (
            <span className="relative z-10 flex min-h-[48px] items-center justify-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[0.95rem] border border-white/10 bg-[#06110e]/35">
                <Loader2 className="animate-spin text-emerald-100" size={18} />
              </span>

              <span className="flex min-w-0 flex-col items-start justify-center text-left">
                <span className="text-[12px] font-black uppercase leading-tight tracking-[0.12em]">
                  Generando dieta...
                </span>
                <span className="mt-0.5 text-[10px] font-bold normal-case leading-tight text-emerald-100/80">
                  Plan personalizado con IA
                </span>
              </span>
            </span>
          ) : (
            <span className="relative z-10 flex min-h-[48px] items-center justify-center gap-9">
              <span className="relative grid h-18 w-22 shrink-0 place-items-center overflow-hidden rounded-[0.95rem] bg-[#06110e]/35">
                <span className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,#6ee7b7_72%,transparent_90%,transparent_100%)] opacity-70 animate-[spin_2.5s_linear_infinite]" />
                <span className="absolute inset-[2px] rounded-[0.9rem] bg-[#07583f]" />
              <img
  src="/icons/dieta.png"
  alt="Generar dieta"
  className="relative z-10 h-20 w-25 object-cover pb-3"
/>
              </span>

              <span className="flex min-w-0 flex-col items-start justify-center text-left">
                <span className="text-[12px] font-black uppercase leading-tight tracking-[0.12em]">
                  Generar dieta
                </span>
                <span className="mt-0.5 text-[10px] font-bold normal-case leading-tight text-emerald-100/85">
                  Plan personalizado con IA
                </span>
              </span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

function SelectField({ icon, label, name, value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function selectOption(nextValue) {
    onChange({
      target: {
        name,
        value: nextValue,
      },
    });
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;

    event.preventDefault();

    if (!open) {
      setOpen(true);
      return;
    }

    const currentIndex = Math.max(
      0,
      options.findIndex((option) => option.value === value)
    );

    if (event.key === "ArrowDown") {
      const nextValue = options[Math.min(options.length - 1, currentIndex + 1)]?.value;
      if (nextValue) selectOption(nextValue);
    } else if (event.key === "ArrowUp") {
      const nextValue = options[Math.max(0, currentIndex - 1)]?.value;
      if (nextValue) selectOption(nextValue);
    } else {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative block min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
        <span className="text-[#10b981]">{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-[1rem] bg-[#0b1d15]/95 px-2.5 text-left text-[11px] font-semibold normal-case leading-tight text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] outline-none transition focus:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.55),0_0_0_3px_rgba(16,185,129,0.10)] ${
          open ? "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.5)]" : ""
        }`}
      >
        <span className="truncate">{selected?.label || "Seleccionar"}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#10b981] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-52 overflow-y-auto rounded-2xl border border-[#10b981]/20 bg-[#07170f] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectOption(option.value)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-[11px] font-semibold normal-case transition ${
                  active
                    ? "bg-[#10b981] text-[#06110c]"
                    : "text-slate-300 hover:bg-[#10b981]/10 hover:text-white"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active && <Check size={13} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TextField({ icon, label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
        <span className="text-[#10b981]">{icon}</span>
        {label}
      </div>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-[1rem] border border-white/10 bg-[#0d2218] px-2.5 text-[11px] font-semibold normal-case text-white outline-none transition placeholder:text-slate-600 focus:border-[#10b981]"
      />
    </label>
  );
}

function TextAreaField({ icon, label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
        <span className="text-[#10b981]">{icon}</span>
        {label}
      </div>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-[1rem] border border-white/10 bg-[#0d2218] px-2.5 py-2 text-[11px] font-semibold normal-case text-white outline-none transition placeholder:text-slate-600 focus:border-[#10b981]"
      />
    </label>
  );
}
