import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Flame,
  Beef,
  Wheat,
  Droplets,
  AlertCircle,
  RefreshCcw,
  ShoppingBasket,
  Clock,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

const PROFILE_KEY = "nutricoach_profile";
const PROGRESS_KEY = "nutricoach_diet_progress";
const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://nutricoach-backend-frlc.onrender.com";

export function MealPlan() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [dietId, setDietId] = useState(null);
  const [step, setStep] = useState("form");
  const [plan, setPlan] = useState([]);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [usedFallback, setUsedFallback] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [view, setView] = useState("diet");
  const [progress, setProgress] = useState({});

  const [form, setForm] = useState({
    mealsPerDay: "4",
    dietStyle: "equilibrada",
    budget: "medio",
    cookingLevel: "basico",
    dislikedFoods: "",
    allergies: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
      const savedProgress =
        JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};

      setProfile(savedProfile);
      setProgress(savedProgress);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("weekly_diets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error cargando dieta:", error);
        return;
      }

      if (data?.length > 0) {
        setDietId(data[0].id);
        setPlan(normalizePlan(data[0].week || []));
        setUsedFallback(Boolean(data[0].used_fallback));
        setStep("result");
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (step !== "loading") return;

    setSecondsLeft(120);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const totals = useMemo(() => getWeekTotals(plan), [plan]);
  const activeDayData = plan[activeDay] || plan[0];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMeal = (day, index) => {
    const key = `${day}-${index}`;

    const updatedProgress = {
      ...progress,
      [key]: !progress[key],
    };

    setProgress(updatedProgress);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));
  };

  const saveDietToSupabase = async ({ week, fallback }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No hay usuario autenticado.");
    }

    const { data, error } = await supabase
      .from("weekly_diets")
      .insert({
        user_id: user.id,
        week,
        used_fallback: fallback,
      })
      .select()
      .single();

    if (error) throw error;

    setDietId(data.id);
  };

  const generatePlan = async () => {
    setError("");
    setUsedFallback(false);
    setActiveDay(0);
    setView("diet");
    setProgress({});
    localStorage.removeItem(PROGRESS_KEY);

    if (!profile) {
      setError(
        "Primero debes completar tu perfil para generar una dieta personalizada."
      );
      return;
    }

    try {
      setStep("loading");

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 120000);

      const response = await fetch(`${API_URL}/generate-diet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          preferences: form,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo generar la dieta con IA.");
      }

      if (!data.week || !Array.isArray(data.week) || data.week.length === 0) {
        throw new Error("La IA no devolvió una dieta válida.");
      }

      const cleanWeek = normalizePlan(data.week);

      await saveDietToSupabase({
        week: cleanWeek,
        fallback: false,
      });

      setPlan(cleanWeek);
      setUsedFallback(false);
      setStep("result");
    } catch (err) {
      console.error("Error generando dieta:", err);

      const fastPlan = createFastPlan(profile, form);

      try {
        await saveDietToSupabase({
          week: fastPlan,
          fallback: true,
        });
      } catch (supabaseError) {
        console.error("Error guardando fallback:", supabaseError);
      }

      setPlan(fastPlan);
      setUsedFallback(true);
      setStep("result");
    }
  };

  const resetDiet = async () => {
    if (dietId) {
      const { error } = await supabase
        .from("weekly_diets")
        .delete()
        .eq("id", dietId);

      if (error) {
        console.error("Error eliminando dieta:", error);
      }
    }

    localStorage.removeItem(PROGRESS_KEY);

    setDietId(null);
    setPlan([]);
    setUsedFallback(false);
    setError("");
    setActiveDay(0);
    setView("diet");
    setProgress({});
    setStep("form");
  };

  return (
    <section className="relative min-h-screen bg-[#08120f] px-3 pt-4 pb-32 text-white font-sans uppercase tracking-tight sm:px-6 sm:pt-6 sm:pb-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_42%),radial-gradient(circle_at_bottom_left,#4361ee12,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-4 flex items-center justify-between border-b border-white/10 pb-4 sm:mb-6 sm:pb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black text-emerald-400 transition hover:bg-emerald-500 hover:text-[#06130d] sm:px-5 sm:py-3"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          {step === "result" && (
            <button
              onClick={resetDiet}
              className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black text-emerald-400 transition hover:bg-white hover:text-[#06130d] sm:px-5 sm:py-3"
            >
              <RefreshCcw size={17} />
              Nueva dieta
            </button>
          )}
        </header>

        <div className="mb-5">
          <p className="mb-1 text-[10px] font-black tracking-[0.3em] text-emerald-400">
            NUTRISMART COACH
          </p>

          <h1 className="text-3xl font-black italic leading-none sm:text-5xl">
            Dieta personalizada
          </h1>

          <p className="mt-2 max-w-2xl text-xs normal-case leading-5 text-white/55 sm:text-sm">
            Genera una dieta semanal con comidas, porciones, ingredientes y lista
            de compra optimizada.
          </p>
        </div>

        {!profile && (
          <div className="mb-4 border border-yellow-400/20 bg-yellow-400/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-300" />

              <div>
                <h2 className="font-black text-yellow-200">
                  Falta completar tu perfil
                </h2>

                <p className="mt-1 text-xs normal-case text-white/60">
                  Necesitamos tu edad, peso, altura y objetivo para calcular una
                  dieta útil.
                </p>

                <button
                  onClick={() => navigate("/perfil")}
                  className="mt-3 bg-yellow-400 px-5 py-3 text-xs font-black text-[#06130d]"
                >
                  Completar perfil
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 border border-red-400/20 bg-red-500/10 p-4 text-xs font-bold normal-case text-red-300">
            {error}
          </div>
        )}

        {step === "form" && (
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-emerald-500/20 bg-emerald-500 p-5 text-[#06130d] shadow-2xl shadow-emerald-500/20 sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center bg-white/30">
                <Sparkles size={28} />
              </div>

              <h2 className="mt-5 text-2xl font-black italic">
                Dieta según tu objetivo
              </h2>

              <p className="mt-3 text-sm font-semibold normal-case opacity-80">
                Personalizamos solo cuando quieres crear tu dieta, sin llenar la
                app de preguntas innecesarias.
              </p>

              <div className="mt-5 grid gap-2">
                <InfoPill label="Objetivo" value={formatGoal(profile?.goal || profile?.objetivo)} />
                <InfoPill
                  label="Calorías"
                  value={`${profile?.goals?.calories || 1800} kcal`}
                />
                <InfoPill
                  label="Proteína"
                  value={`${profile?.goals?.protein || 120} g`}
                />
              </div>
            </div>

            <div className="border border-white/10 bg-[#0d1714] p-4 shadow-2xl sm:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-black italic">
                  Personaliza tu dieta
                </h2>

                <p className="mt-1 text-xs normal-case text-white/55">
                  Responde rápido para que el plan sea más realista.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Comidas al día"
                  name="mealsPerDay"
                  value={form.mealsPerDay}
                  onChange={handleChange}
                >
                  <option value="3">3 comidas</option>
                  <option value="4">4 comidas</option>
                  <option value="5">5 comidas</option>
                </Select>

                <Select
                  label="Tipo de dieta"
                  name="dietStyle"
                  value={form.dietStyle}
                  onChange={handleChange}
                >
                  <option value="equilibrada">Equilibrada</option>
                  <option value="alta_proteina">Alta en proteína</option>
                  <option value="economica">Económica</option>
                  <option value="rapida">Rápida y fácil</option>
                  <option value="mediterranea">Mediterránea</option>
                </Select>

                <Select
                  label="Presupuesto semanal"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </Select>

                <Select
                  label="Nivel de cocina"
                  name="cookingLevel"
                  value={form.cookingLevel}
                  onChange={handleChange}
                >
                  <option value="basico">Básico</option>
                  <option value="medio">Medio</option>
                  <option value="avanzado">Avanzado</option>
                </Select>

                <Input
                  label="Alimentos que no te gustan"
                  name="dislikedFoods"
                  value={form.dislikedFoods}
                  onChange={handleChange}
                  placeholder="Ej: atún, brócoli, huevo..."
                />

                <Input
                  label="Alergias o restricciones"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="Ej: lactosa, gluten..."
                />
              </div>

              <button
                onClick={generatePlan}
                disabled={!profile}
                className="mt-5 flex w-full items-center justify-center gap-2 bg-emerald-500 px-6 py-4 text-sm font-black text-[#06130d] shadow-xl shadow-emerald-500/20 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles size={20} />
                Generar dieta semanal
              </button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="border border-white/10 bg-[#0d1714] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center bg-emerald-500/20 text-3xl font-black text-emerald-300">
              {secondsLeft}
            </div>

            <h2 className="text-2xl font-black italic">
              Generando tu dieta...
            </h2>

            <p className="mt-2 text-sm normal-case text-white/60">
              La IA está creando comidas, porciones y lista de compra.
            </p>
          </div>
        )}

        {step === "result" && (
          <div>
            {usedFallback && (
              <div className="mb-4 border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-100">
                <p className="font-black">Dieta rápida generada</p>

                <p className="mt-1 text-xs normal-case text-white/60">
                  La IA tardó demasiado o falló, así que se creó un plan base
                  completo.
                </p>
              </div>
            )}

            <div className="mb-4 grid grid-cols-4 gap-2">
              <SummaryCard
                icon={<Flame size={17} />}
                title="Kcal"
                value={Math.round(totals.calories)}
              />
              <SummaryCard
                icon={<Beef size={17} />}
                title="Prot"
                value={`${Math.round(totals.protein)}g`}
              />
              <SummaryCard
                icon={<Wheat size={17} />}
                title="Carb"
                value={`${Math.round(totals.carbs)}g`}
              />
              <SummaryCard
                icon={<Droplets size={17} />}
                title="Grasa"
                value={`${Math.round(totals.fat)}g`}
              />
            </div>

            <div className="mb-4 border border-white/10 bg-[#0d1714] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black italic">
                    Tu dieta semanal
                  </h2>

                  <p className="mt-1 text-xs normal-case text-white/50">
                    {view === "diet"
                      ? "Elige un día y marca las comidas completadas."
                      : "Lista semanal con cantidades totales."}
                  </p>
                </div>

                <button
                  onClick={() => setView(view === "diet" ? "shopping" : "diet")}
                  className="flex shrink-0 items-center gap-2 border border-white/10 bg-white/5 px-3 py-3 text-[9px] font-black text-emerald-400 transition hover:bg-emerald-500 hover:text-[#06130d]"
                >
                  <ShoppingBasket size={17} />
                  {view === "diet" ? "Compra" : "Dieta"}
                </button>
              </div>

              {view === "diet" && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {plan.map((day, index) => (
                    <button
                      key={day.day}
                      onClick={() => setActiveDay(index)}
                      className={`whitespace-nowrap px-4 py-3 text-[10px] font-black transition ${
                        activeDay === index
                          ? "bg-emerald-500 text-[#06130d]"
                          : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {day.day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {view === "diet" && activeDayData && (
              <DayCard
                day={activeDayData}
                progress={progress}
                toggleMeal={toggleMeal}
              />
            )}

            {view === "shopping" && <ShoppingList plan={plan} />}
          </div>
        )}
      </div>

      <BottomNav />
    </section>
  );
}

function DayCard({ day, progress, toggleMeal }) {
  const totals = getDayTotals(day);
  const completed = day.meals.filter((_, i) => progress[`${day.day}-${i}`])
    .length;
  const total = day.meals.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="border border-white/10 bg-[#0d1714] shadow-2xl">
      <div className="border-b border-white/10 bg-[#08120f] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] text-emerald-400">
              PLAN DIARIO
            </p>

            <h3 className="mt-1 text-3xl font-black italic">{day.day}</h3>
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-emerald-400">{percent}%</p>
            <p className="text-[8px] font-black tracking-widest text-white/35">
              COMPLETADO
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Badge>🔥 {Math.round(totals.calories)}</Badge>
          <Badge>🥩 {Math.round(totals.protein)}g</Badge>
          <Badge>🍞 {Math.round(totals.carbs)}g</Badge>
          <Badge>🥑 {Math.round(totals.fat)}g</Badge>
        </div>

        <div className="mt-4 h-1.5 w-full bg-white/10">
          <div
            className="h-1.5 bg-emerald-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 p-3">
        {day.meals?.map((meal, index) => (
          <MealItem
            key={`${day.day}-${meal.name}-${index}`}
            meal={meal}
            day={day.day}
            index={index}
            progress={progress}
            toggleMeal={toggleMeal}
          />
        ))}
      </div>
    </div>
  );
}

function MealItem({ meal, day, index, progress, toggleMeal }) {
  const done = progress[`${day}-${index}`];
  const ingredients = getMealIngredients(meal);

  return (
    <div
      className={`border ${
        done
          ? "border-emerald-500/50 bg-emerald-500/5"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-emerald-400">
            <Clock size={14} />
            {meal.time} · {meal.name}
          </p>

          <h4
            className={`mt-2 text-xl font-black italic leading-tight ${
              done ? "line-through text-white/45" : "text-white"
            }`}
          >
            {meal.food}
          </h4>
        </div>

        <button
          onClick={() => toggleMeal(day, index)}
          className={`shrink-0 px-3 py-2 text-[10px] font-black tracking-widest transition ${
            done
              ? "bg-emerald-500 text-[#06130d]"
              : "border border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-[#06130d]"
          }`}
        >
          {done ? "HECHO" : "MARCAR"}
        </button>
      </div>

      <div className="grid gap-3 p-4">
        <div>
          <p className="mb-2 text-[10px] font-black tracking-[0.25em] text-white/35">
            PORCIONES E INGREDIENTES
          </p>

          <div className="grid gap-2">
            {ingredients.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-white/5 bg-[#08120f] px-3 py-2"
              >
                <span className="text-sm font-bold normal-case text-white/80">
                  {item.name}
                </span>

                <span className="shrink-0 text-xs font-black normal-case text-emerald-400">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <MiniMacro icon={<Flame size={14} />} title="Kcal" value={meal.calories || 0} />
          <MiniMacro icon={<Beef size={14} />} title="Prot" value={`${meal.protein || 0}g`} />
          <MiniMacro icon={<Wheat size={14} />} title="Carb" value={`${meal.carbs || 0}g`} />
          <MiniMacro icon={<Droplets size={14} />} title="Grasa" value={`${meal.fat || 0}g`} />
        </div>
      </div>
    </div>
  );
}

function ShoppingList({ plan }) {
  const items = buildShoppingList(plan);

  return (
    <div className="border border-white/10 bg-[#0d1714] p-4 shadow-2xl">
      <p className="text-[10px] font-black tracking-[0.25em] text-emerald-400">
        LISTA SEMANAL
      </p>

      <h3 className="mt-1 text-3xl font-black italic">Lista de compra</h3>

      <p className="mt-2 text-xs normal-case text-white/50">
        Cantidades totales aproximadas para toda la semana.
      </p>

      <div className="mt-5 grid gap-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 border border-white/10 bg-[#08120f] px-4 py-3"
          >
            <span className="font-bold normal-case text-white/85">
              {item.name}
            </span>

            <span className="shrink-0 text-right text-xs font-black normal-case text-emerald-400">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildShoppingList(plan) {
  const map = new Map();

  (plan || []).forEach((day) => {
    (day.meals || []).forEach((meal) => {
      getMealIngredients(meal).forEach((item) => {
        const cleanName = item.name?.trim();
        if (!cleanName) return;

        const key = cleanName.toLowerCase();
        const parsed = parseAmount(item.amount);

        if (!map.has(key)) {
          map.set(key, {
            name: cleanName,
            grams: 0,
            ml: 0,
            units: 0,
            plates: 0,
            portions: 0,
            unknown: [],
          });
        }

        const current = map.get(key);

        if (parsed.type === "g") current.grams += parsed.value;
        else if (parsed.type === "ml") current.ml += parsed.value;
        else if (parsed.type === "unit") current.units += parsed.value;
        else if (parsed.type === "plate") current.plates += parsed.value;
        else if (parsed.type === "portion") current.portions += parsed.value;
        else current.unknown.push(item.amount);
      });
    });
  });

  const items = Array.from(map.values()).map((item) => ({
    name: item.name,
    amount: formatTotalAmount(item),
  }));

  return items.length > 0
    ? items
    : [
        { name: "Pollo", amount: "1-2 kg" },
        { name: "Arroz", amount: "1 kg" },
        { name: "Huevos", amount: "12 unidades" },
        { name: "Verduras", amount: "varias raciones" },
        { name: "Yogur griego", amount: "4-7 unidades" },
      ];
}

function parseAmount(amount = "") {
  const text = String(amount).toLowerCase().trim();

  const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)\s*g/);
  if (rangeMatch) {
    const average = (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
    return { type: "g", value: average };
  }

  const gramMatch = text.match(/(\d+)\s*g/);
  if (gramMatch) return { type: "g", value: Number(gramMatch[1]) };

  const mlMatch = text.match(/(\d+)\s*ml/);
  if (mlMatch) return { type: "ml", value: Number(mlMatch[1]) };

  const unitMatch = text.match(
    /(\d+)\s*(unidad|unidades|huevo|huevos|pieza|piezas|rebanada|rebanadas|plátano|plátanos|banana|bananas|lata|latas)/i
  );
  if (unitMatch) return { type: "unit", value: Number(unitMatch[1]) };

  const plateMatch = text.match(/(\d+)\s*plato/);
  if (plateMatch) return { type: "plate", value: Number(plateMatch[1]) };

  const portionMatch = text.match(/(\d+)\s*raci/);
  if (portionMatch) return { type: "portion", value: Number(portionMatch[1]) };

  if (text.includes("1 plato")) return { type: "plate", value: 1 };
  if (text.includes("1 ración") || text.includes("1 racion")) {
    return { type: "portion", value: 1 };
  }

  return { type: "unknown", value: 0 };
}

function formatTotalAmount(item) {
  const parts = [];

  if (item.grams > 0) {
    if (item.grams >= 1000) {
      parts.push(`${(item.grams / 1000).toFixed(1)} kg`);
    } else {
      parts.push(`${Math.round(item.grams)}g`);
    }
  }

  if (item.ml > 0) {
    if (item.ml >= 1000) {
      parts.push(`${(item.ml / 1000).toFixed(1)} L`);
    } else {
      parts.push(`${Math.round(item.ml)}ml`);
    }
  }

  if (item.units > 0) parts.push(`${Math.round(item.units)} unidades`);
  if (item.plates > 0) parts.push(`${Math.round(item.plates)} platos`);
  if (item.portions > 0) parts.push(`${Math.round(item.portions)} raciones`);

  if (parts.length === 0 && item.unknown.length > 0) {
    return "cantidad semanal";
  }

  return parts.join(" + ") || "cantidad semanal";
}

function getMealIngredients(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients.map((item) => {
      if (typeof item === "string") return splitIngredient(item);

      return {
        name: item.name || item.food || "Ingrediente",
        amount: item.amount || item.quantity || "cantidad al gusto",
      };
    });
  }

  if (meal.details) {
    return meal.details
      .split(",")
      .map((item) => splitIngredient(item.trim()))
      .filter(Boolean);
  }

  return inferIngredientsFromFood(meal.food);
}

function splitIngredient(text = "") {
  const match = text.match(
    /^(\d+\s?g|\d+\s?ml|\d+\s?unidad(?:es)?|\d+\s?huevo(?:s)?|\d+\s?banana(?:s)?|\d+\s?plátano(?:s)?|\d+\s?lata(?:s)?|\d+\s?pieza(?:s)?|\d+\s?rebanada(?:s)?)/i
  );

  if (match) {
    return {
      amount: match[0],
      name: text.replace(match[0], "").replace(/^de\s+/i, "").trim(),
    };
  }

  return {
    name: text,
    amount: "al gusto",
  };
}

function inferIngredientsFromFood(food = "") {
  const text = food.toLowerCase();

  if (text.includes("avena")) {
    return [
      { name: "Avena", amount: "60g" },
      { name: "Yogur natural", amount: "200g" },
      { name: "Fruta", amount: "1 pieza" },
    ];
  }

  if (text.includes("pollo")) {
    return [
      { name: "Pechuga de pollo", amount: "180g" },
      { name: "Arroz", amount: "80g" },
      { name: "Verduras", amount: "200g" },
    ];
  }

  if (text.includes("pescado") || text.includes("merluza") || text.includes("salmón")) {
    return [
      { name: "Pescado", amount: "180g" },
      { name: "Patata cocida", amount: "200g" },
      { name: "Ensalada", amount: "1 plato" },
    ];
  }

  if (text.includes("huevo") || text.includes("tortilla")) {
    return [
      { name: "Huevos o claras", amount: "3 unidades" },
      { name: "Fruta", amount: "1 pieza" },
      { name: "Pan integral", amount: "1 rebanada" },
    ];
  }

  return [
    { name: food || "Comida principal", amount: "1 ración" },
    { name: "Verduras", amount: "1 plato" },
    { name: "Fuente de proteína", amount: "180g" },
  ];
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="border border-white/10 bg-[#0d1714] p-3">
      <div className="mb-2 text-emerald-400">{icon}</div>

      <p className="text-[8px] font-black tracking-[0.15em] text-white/35">
        {title}
      </p>

      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function MiniMacro({ icon, title, value }) {
  return (
    <div className="border border-white/10 bg-[#08120f] p-2">
      <div className="mb-1 text-emerald-400">{icon}</div>

      <p className="text-[8px] font-black tracking-[0.15em] text-white/35">
        {title}
      </p>

      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="bg-emerald-500/10 px-2 py-2 text-[10px] font-black text-emerald-400">
      {children}
    </span>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-white/25 p-3">
      <p className="text-[10px] font-black tracking-[0.2em] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label>
      <p className="mb-2 text-xs font-black text-white/70">{label}</p>
      <input
        {...props}
        className="w-full border border-white/10 bg-[#08120f] px-4 py-3 text-sm font-semibold normal-case text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label>
      <p className="mb-2 text-xs font-black text-white/70">{label}</p>
      <select
        {...props}
        className="w-full border border-white/10 bg-[#08120f] px-4 py-3 text-sm font-semibold normal-case text-white outline-none focus:border-emerald-400"
      >
        {children}
      </select>
    </label>
  );
}

function getDayTotals(day) {
  return (day.meals || []).reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories) || 0;
      acc.protein += Number(meal.protein) || 0;
      acc.carbs += Number(meal.carbs) || 0;
      acc.fat += Number(meal.fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function getWeekTotals(plan) {
  return (plan || []).reduce(
    (acc, day) => {
      const dayTotals = getDayTotals(day);
      acc.calories += dayTotals.calories;
      acc.protein += dayTotals.protein;
      acc.carbs += dayTotals.carbs;
      acc.fat += dayTotals.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function normalizePlan(plan = []) {
  return plan.map((day) => ({
    ...day,
    meals: (day.meals || []).map((item) => ({
      ...item,
      details:
        item.details ||
        item.ingredients
          ?.map((i) =>
            typeof i === "string"
              ? i
              : `${i.amount || i.quantity || ""} ${i.name || i.food || ""}`
          )
          .join(", ") ||
        "",
    })),
  }));
}

function createFastPlan(profile = {}, preferences = {}) {
  const goal = profile?.goal || profile?.objetivo || "mantener_peso";
  const mealsPerDay = Number(preferences?.mealsPerDay) || 4;

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const plans = {
    perder_grasa: [
      meal("08:00", "Desayuno", "Tortilla de claras con fruta", 350, 32, 30, 9, "4 claras de huevo, 1 huevo entero, 1 plátano"),
      meal("13:30", "Almuerzo", "Pollo con verduras y arroz pequeño", 520, 48, 45, 14, "180g pechuga de pollo, 70g arroz, 200g verduras"),
      meal("18:00", "Merienda", "Yogur griego natural con frutos rojos", 220, 20, 20, 5, "200g yogur griego, 80g frutos rojos"),
      meal("21:00", "Cena", "Pescado blanco con ensalada y patata cocida", 430, 42, 35, 10, "180g pescado blanco, 200g patata cocida, 1 plato ensalada"),
      meal("23:00", "Extra", "Queso fresco batido", 160, 18, 10, 3, "200g queso fresco batido"),
    ],
    ganar_musculo: [
      meal("08:00", "Desayuno", "Avena con leche, plátano y 2 huevos", 620, 35, 80, 18, "80g avena, 250ml leche, 1 plátano, 2 huevos"),
      meal("13:30", "Almuerzo", "Pollo con arroz, aguacate y verduras", 780, 55, 85, 22, "220g pollo, 100g arroz, 80g aguacate, 200g verduras"),
      meal("18:00", "Merienda", "Yogur griego con frutos secos", 420, 28, 30, 20, "250g yogur griego, 30g frutos secos"),
      meal("21:00", "Cena", "Salmón con patata y ensalada", 650, 50, 45, 24, "200g salmón, 250g patata, 1 plato ensalada"),
      meal("23:00", "Extra", "Requesón o yogur alto en proteína", 250, 25, 15, 8, "200g requesón o yogur alto en proteína"),
    ],
    mantener_peso: [
      meal("08:00", "Desayuno", "Avena con yogur y fruta", 450, 25, 60, 12, "60g avena, 200g yogur natural, 1 pieza fruta"),
      meal("13:30", "Almuerzo", "Pavo con arroz y verduras", 620, 45, 70, 16, "180g pavo, 90g arroz, 200g verduras"),
      meal("18:00", "Merienda", "Tostada integral con queso fresco", 300, 18, 35, 10, "2 rebanadas pan integral, 80g queso fresco"),
      meal("21:00", "Cena", "Huevos con ensalada y pan integral", 480, 38, 30, 20, "3 huevos, 1 plato ensalada, 1 rebanada pan integral"),
      meal("23:00", "Extra", "Yogur natural", 160, 12, 15, 5, "200g yogur natural"),
    ],
  };

  const selectedPlan = plans[goal] || plans.mantener_peso;

  return days.map((day, dayIndex) => ({
    day,
    meals: selectedPlan.slice(0, mealsPerDay).map((item, mealIndex) => ({
      ...item,
      food: varyMeal(item.food, dayIndex, mealIndex, goal),
    })),
  }));
}

function varyMeal(food, dayIndex, mealIndex, goal) {
  const variations = {
    perder_grasa: [
      "Pechuga de pollo con ensalada y arroz pequeño",
      "Merluza con verduras y patata cocida",
      "Tortilla de claras con fruta",
      "Yogur griego con frutos rojos",
      "Pavo con ensalada y boniato",
    ],
    ganar_musculo: [
      "Pollo con arroz, aguacate y verduras",
      "Pasta integral con carne magra",
      "Avena con leche, plátano y huevos",
      "Salmón con patata y ensalada",
      "Yogur griego con frutos secos",
    ],
    mantener_peso: [
      "Pavo con arroz y verduras",
      "Huevos con ensalada y pan integral",
      "Avena con yogur y fruta",
      "Pescado con patata cocida",
      "Tostada integral con queso fresco",
    ],
  };

  const list = variations[goal] || variations.mantener_peso;
  return list[(dayIndex + mealIndex) % list.length] || food;
}

function meal(time, name, food, calories, protein, carbs, fat, details = "") {
  return {
    time,
    name,
    food,
    details,
    calories,
    protein,
    carbs,
    fat,
  };
}

function formatGoal(goal) {
  if (goal === "perder_grasa") return "Perder grasa";
  if (goal === "ganar_musculo") return "Ganar músculo";
  if (goal === "mantener_peso") return "Mantener peso";
  return "No definido";
}