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
        setPlan(data[0].week || []);
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

      await saveDietToSupabase({
        week: data.week,
        fallback: false,
      });

      setPlan(data.week);
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
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 transition hover:bg-white/15"
        >
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-emerald-400">
              NutriCoach iA
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Dieta personalizada
            </h1>

            <p className="mt-3 max-w-2xl text-white/60">
              Genera una dieta semanal adaptada a tu objetivo, preferencias,
              presupuesto y nivel de cocina.
            </p>
          </div>

          {step === "result" && (
            <button
              onClick={resetDiet}
              className="flex items-center justify-center gap-2 rounded-3xl bg-white/10 px-5 py-4 font-black text-emerald-300 transition hover:bg-white/15"
            >
              <RefreshCcw size={20} />
              Generar otra
            </button>
          )}
        </div>

        {!profile && (
          <div className="mb-6 rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-300" />

              <div>
                <h2 className="font-black text-yellow-200">
                  Falta completar tu perfil
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Necesitamos tu edad, peso, altura y objetivo para calcular una
                  dieta más útil.
                </p>

                <button
                  onClick={() => navigate("/perfil")}
                  className="mt-4 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-[#06130d]"
                >
                  Completar perfil
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-[2rem] border border-red-400/20 bg-red-500/10 p-5 font-bold text-red-300">
            {error}
          </div>
        )}

        {step === "form" && (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500 to-lime-400 p-6 text-[#06130d] shadow-2xl shadow-emerald-500/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/40">
                <Sparkles size={30} />
              </div>

              <h2 className="mt-6 text-3xl font-black">
                Dieta según tu objetivo
              </h2>

              <p className="mt-3 font-semibold opacity-80">
                No hacemos preguntas al empezar. Solo personalizamos cuando
                realmente quieres crear tu dieta.
              </p>

              <div className="mt-6 grid gap-3">
                <InfoPill label="Objetivo" value={formatGoal(profile?.goal)} />
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

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6">
                <h2 className="text-2xl font-black">Personaliza tu dieta</h2>

                <p className="mt-2 text-white/60">
                  Responde rápido para que la dieta sea más realista para ti.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
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
                  placeholder="Ej: lactosa, gluten, frutos secos..."
                />
              </div>

              <button
                onClick={generatePlan}
                disabled={!profile}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles size={22} />
                Generar dieta semanal
              </button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400/20 text-4xl font-black text-emerald-300">
              {secondsLeft}
            </div>

            <h2 className="text-2xl font-black">
              Generando tu dieta personalizada...
            </h2>

            <p className="mt-3 text-white/60">
              La IA está creando un plan semanal con comidas y macros.
            </p>

            <p className="mt-4 text-sm font-bold text-emerald-300">
              Puede tardar hasta 2 minutos.
            </p>
          </div>
        )}

        {step === "result" && (
          <div>
            {usedFallback && (
              <div className="mb-6 rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-5 text-yellow-100">
                <p className="font-black">Dieta rápida generada</p>

                <p className="mt-1 text-sm text-white/60">
                  La IA tardó demasiado o falló, así que se creó un plan base
                  completo.
                </p>
              </div>
            )}

            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <SummaryCard
                icon={<Flame />}
                title="Calorías semana"
                value={`${Math.round(totals.calories)} kcal`}
              />
              <SummaryCard
                icon={<Beef />}
                title="Proteínas"
                value={`${Math.round(totals.protein)} g`}
              />
              <SummaryCard
                icon={<Wheat />}
                title="Carbs"
                value={`${Math.round(totals.carbs)} g`}
              />
              <SummaryCard
                icon={<Droplets />}
                title="Grasas"
                value={`${Math.round(totals.fat)} g`}
              />
            </div>

            <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Tu dieta semanal</h2>

                  <p className="mt-1 text-white/50">
                    {view === "diet"
                      ? "Elige un día y marca las comidas completadas."
                      : "Lista generada automáticamente desde tu dieta."}
                  </p>
                </div>

                <button
                  onClick={() => setView(view === "diet" ? "shopping" : "diet")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-black text-emerald-300 transition hover:bg-white/15"
                >
                  <ShoppingBasket size={20} />
                  {view === "diet" ? "Lista de compra" : "Ver dieta"}
                </button>
              </div>

              {view === "diet" && (
                <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                  {plan.map((day, index) => (
                    <button
                      key={day.day}
                      onClick={() => setActiveDay(index)}
                      className={`whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-black transition ${
                        activeDay === index
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
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
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
      <div className="border-b border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Plan diario
            </p>

            <h3 className="mt-1 text-3xl font-black">{day.day}</h3>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-black">
            <Badge>🔥 {Math.round(totals.calories)} kcal</Badge>
            <Badge>🥩 {Math.round(totals.protein)}g</Badge>
            <Badge>🍞 {Math.round(totals.carbs)}g</Badge>
            <Badge>🥑 {Math.round(totals.fat)}g</Badge>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm text-white/60">
            Progreso: {completed} / {total} comidas ({percent}%)
          </p>

          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5">
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
  const image = getMealImage(meal.food);
  const done = progress[`${day}-${index}`];

  return (
    <div
      className={`overflow-hidden rounded-3xl border ${
        done ? "border-emerald-400/50" : "border-white/10"
      } bg-white/5`}
    >
      <div className="relative">
        <img
          src={image}
          alt={meal.food}
          className={`h-56 w-full object-cover ${done ? "opacity-60" : ""}`}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06130d]/90 via-[#06130d]/10 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              <Clock size={16} />
              {meal.time} · {meal.name}
            </div>

            <button
              onClick={() => toggleMeal(day, index)}
              className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                done
                  ? "bg-emerald-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {done ? "✔ Hecho" : "Marcar"}
            </button>
          </div>

          <h4
            className={`text-2xl font-black ${
              done ? "line-through text-white/50" : "text-white"
            }`}
          >
            {meal.food}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <MiniMacro icon={<Flame size={16} />} title="Calorías" value={`${meal.calories || 0} kcal`} />
        <MiniMacro icon={<Beef size={16} />} title="Proteína" value={`${meal.protein || 0} g`} />
        <MiniMacro icon={<Wheat size={16} />} title="Carbs" value={`${meal.carbs || 0} g`} />
        <MiniMacro icon={<Droplets size={16} />} title="Grasas" value={`${meal.fat || 0} g`} />
      </div>
    </div>
  );
}

function ShoppingList({ plan }) {
  const items = buildShoppingList(plan);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
        Lista semanal
      </p>

      <h3 className="mt-1 text-3xl font-black">Lista de compra</h3>

      <p className="mt-2 text-white/50">
        Generada automáticamente a partir de tu dieta semanal.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
          >
            <span className="font-bold text-white/80">{item}</span>
            <span className="rounded-xl bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">
              comprar
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildShoppingList(plan) {
  const text = plan
    .flatMap((day) => day.meals || [])
    .map((meal) => meal.food || "")
    .join(" ")
    .toLowerCase();

  const possibleItems = [
    "pollo",
    "pavo",
    "arroz",
    "avena",
    "leche",
    "plátano",
    "huevos",
    "verduras",
    "aguacate",
    "yogur griego",
    "frutos secos",
    "salmón",
    "patata",
    "ensalada",
    "pasta integral",
    "carne magra",
    "fruta",
    "queso fresco",
    "pan integral",
    "pescado",
    "boniato",
    "merluza",
    "frutos rojos",
  ];

  const found = possibleItems.filter((item) => text.includes(item));
  const unique = [...new Set(found)];

  return unique.length > 0
    ? unique
    : ["pollo", "arroz", "huevos", "verduras", "yogur griego"];
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
        {icon}
      </div>

      <p className="text-sm font-semibold text-white/50">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function MiniMacro({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="mb-1 text-emerald-300">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
        {title}
      </p>
      <p className="font-black">{value}</p>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-xl bg-emerald-400/10 px-3 py-2 text-emerald-300">
      {children}
    </span>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label>
      <p className="mb-2 font-bold text-white/80">{label}</p>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-[#06130d] px-4 py-4 font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label>
      <p className="mb-2 font-bold text-white/80">{label}</p>
      <select
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-[#06130d] px-4 py-4 font-semibold text-white outline-none focus:border-emerald-400"
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

function getMealImage(food = "") {
  const text = food.toLowerCase();

  if (
    text.includes("avena") ||
    text.includes("yogur") ||
    text.includes("fruta")
  ) {
    return "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("pollo") || text.includes("pavo")) {
    return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("arroz") || text.includes("pasta")) {
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80";
  }

  if (
    text.includes("salmón") ||
    text.includes("pescado") ||
    text.includes("merluza")
  ) {
    return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("ensalada") || text.includes("verduras")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("huevo") || text.includes("tortilla")) {
    return "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("carne") || text.includes("ternera")) {
    return "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80";
  }

  return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80";
}

function createFastPlan(profile = {}, preferences = {}) {
  const goal = profile?.goal || "mantener_peso";
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
      meal("08:00", "Desayuno", "Tortilla de claras con fruta", 350, 32, 30, 9),
      meal("13:30", "Almuerzo", "Pollo con verduras y arroz pequeño", 520, 48, 45, 14),
      meal("18:00", "Merienda", "Yogur griego natural con frutos rojos", 220, 20, 20, 5),
      meal("21:00", "Cena", "Pescado blanco con ensalada y patata cocida", 430, 42, 35, 10),
      meal("23:00", "Extra", "Queso fresco batido", 160, 18, 10, 3),
    ],
    ganar_musculo: [
      meal("08:00", "Desayuno", "Avena con leche, plátano y 2 huevos", 620, 35, 80, 18),
      meal("13:30", "Almuerzo", "Pollo con arroz, aguacate y verduras", 780, 55, 85, 22),
      meal("18:00", "Merienda", "Yogur griego con frutos secos", 420, 28, 30, 20),
      meal("21:00", "Cena", "Salmón con patata y ensalada", 650, 50, 45, 24),
      meal("23:00", "Extra", "Requesón o yogur alto en proteína", 250, 25, 15, 8),
    ],
    mantener_peso: [
      meal("08:00", "Desayuno", "Avena con yogur y fruta", 450, 25, 60, 12),
      meal("13:30", "Almuerzo", "Pavo con arroz y verduras", 620, 45, 70, 16),
      meal("18:00", "Merienda", "Tostada integral con queso fresco", 300, 18, 35, 10),
      meal("21:00", "Cena", "Huevos con ensalada y pan integral", 480, 38, 30, 20),
      meal("23:00", "Extra", "Yogur natural", 160, 12, 15, 5),
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

function meal(time, name, food, calories, protein, carbs, fat) {
  return {
    time,
    name,
    food,
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