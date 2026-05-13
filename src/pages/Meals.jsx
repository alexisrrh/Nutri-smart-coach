import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Beef,
  Wheat,
  Droplets,
  CalendarDays,
  Camera,
  ChevronRight,
  Trash2,
  Search,
  Sparkles,
  Clock,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { API_URL } from "../config/api";
import { STORAGE_KEYS } from "../config/storageKeys";
import { supabase } from "../lib/supabase";
import { safeParse } from "../components/food/foodUtils";

const STORAGE_KEY = STORAGE_KEYS.MEALS;

export function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState(getCachedMeals);
  const [filter, setFilter] = useState("today");
  const [search, setSearch] = useState("");
  const [remoteError, setRemoteError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadRemoteMeals(localMeals) {
    try {
      setRemoteError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;

      const response = await fetch(`${API_URL}/meal-analyses/${user.id}`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            `No se pudo cargar el historial: ${response.status}`
        );
      }

      const remoteMeals = Array.isArray(data?.meal_analyses)
        ? data.meal_analyses
        : [];

      if (remoteMeals.length > 0 || localMeals.length === 0) {
        setMeals(remoteMeals);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteMeals));
      }
    } catch (error) {
      console.error("Error cargando comidas remotas:", error);
      setRemoteError(
        "Sin conexión con el historial remoto. Mostrando datos guardados en este dispositivo."
      );
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      loadRemoteMeals(getCachedMeals());
    });
  }, []);

  const filteredMeals = useMemo(() => {
    const now = new Date();

    return meals.filter((meal) => {
      const mealDate = new Date(
        meal.createdAt || meal.created_at || new Date(0).toISOString()
      );

      const matchesSearch = (meal.food || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const isToday = mealDate.toDateString() === now.toDateString();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const isWeek = mealDate >= sevenDaysAgo;

      if (filter === "today") return isToday && matchesSearch;
      if (filter === "week") return isWeek && matchesSearch;

      return matchesSearch;
    });
  }, [meals, filter, search]);

  const totals = useMemo(() => {
    return filteredMeals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories) || 0;
        acc.protein += Number(meal.protein) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fat += Number(meal.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filteredMeals]);

  async function deleteMeal(mealToDelete) {
    if (!mealToDelete) return;

    const mealId = mealToDelete.id;

    try {
      setRemoteError("");

      if (mealId) {
        setDeletingId(mealId);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          throw new Error("No hay usuario conectado para borrar esta comida.");
        }

        await deleteRemoteMeal(mealId, user.id);
      }

      const updated = removeMealFromList(meals, mealToDelete);
      setMeals(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error borrando comida:", error);
      setRemoteError(
        error?.message ||
          "No se pudo borrar en remoto. El historial local se mantiene intacto."
      );
    } finally {
      setDeletingId("");
    }
  }

  async function clearMeals() {
    if (!window.confirm("¿Borrar todo el historial?")) return;

    try {
      setRemoteError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error("No hay usuario conectado para borrar el historial remoto.");
      }

      const response = await fetch(
        `${API_URL}/meal-analyses/user/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            `No se pudo borrar el historial: ${response.status}`
        );
      }

      setMeals([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error limpiando historial:", error);
      setRemoteError(
        error?.message ||
          "No se pudo borrar el historial remoto. El historial local se mantiene intacto."
      );
    }
  }

  return (
    <section className="min-h-screen bg-[#06110e] px-4 py-5 pb-32 text-white font-sans">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <ArrowLeft size={14} /> Volver
        </button>

        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
                <Sparkles size={13} />
                Historial inteligente
              </div>

              <h1 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">
                Tus comidas
              </h1>

              <p className="mt-2 max-w-xl text-sm text-white/50">
                Revisa tus análisis, macros acumulados y recomendaciones de IA.
              </p>
            </div>

            <button
              onClick={() => navigate("/foto-comida")}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-400 px-5 py-4 text-xs font-black uppercase tracking-widest text-[#06110e] shadow-[0_20px_40px_#10b98122] transition hover:scale-[1.02] hover:bg-white"
            >
              <Camera size={16} />
              Nuevo análisis
            </button>
          </div>
        </div>

        {remoteError && (
          <div className="mb-5 rounded-[1.2rem] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-amber-100/70">
            {remoteError}
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Summary icon={<Flame size={18} />} title="Calorías" value={totals.calories} unit="kcal" />
          <Summary icon={<Beef size={18} />} title="Proteína" value={totals.protein} unit="g" />
          <Summary icon={<Wheat size={18} />} title="Carbs" value={totals.carbs} unit="g" />
          <Summary icon={<Droplets size={18} />} title="Grasas" value={totals.fat} unit="g" />
        </div>

        <div className="mb-5 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid grid-cols-3 gap-2">
              <FilterButton active={filter === "today"} onClick={() => setFilter("today")}>
                Hoy
              </FilterButton>
              <FilterButton active={filter === "week"} onClick={() => setFilter("week")}>
                Semana
              </FilterButton>
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                Todo
              </FilterButton>
            </div>

            <div className="relative">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar comida..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400/40 md:w-72"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">
                Registros
              </h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">
                {filteredMeals.length} comida{filteredMeals.length !== 1 ? "s" : ""} mostrada
                {filteredMeals.length !== 1 ? "s" : ""}
              </p>
            </div>

            {meals.length > 0 && (
              <button
                onClick={clearMeals}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/10 bg-red-400/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-300/60 transition hover:border-red-400/30 hover:text-red-300"
              >
                <Trash2 size={12} />
                Limpiar
              </button>
            )}
          </div>

          {filteredMeals.length === 0 ? (
            <Empty onClick={() => navigate("/foto-comida")} />
          ) : (
            <div className="grid gap-4">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  deleting={deletingId === meal.id}
                  onDelete={() => deleteMeal(meal)}
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

function Summary({ icon, title, value, unit }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-emerald-400/5 sm:p-5">
      <div className="mb-3 text-emerald-300">{icon}</div>

      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-white/35">
        {title}
      </p>

      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-black italic text-white">{Math.round(value)}</p>
        <p className="text-[10px] font-bold uppercase text-emerald-300/50">
          {unit}
        </p>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition ${
        active
          ? "bg-emerald-400 text-[#06110e]"
          : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MealCard({ meal, onDelete, deleting }) {
  const dateValue = meal.createdAt || meal.created_at || new Date(0).toISOString();

  const date = new Date(dateValue).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });

  const time = new Date(dateValue).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const score = Number(meal.score) || null;

  return (
    <div className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#081713] p-4 transition hover:border-emerald-400/25 hover:bg-[#0b1d18] sm:p-5">
      <div className="absolute right-0 top-0 h-20 w-20 bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300">
              {meal.mealType || "Comida"}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/35">
              <Clock size={11} />
              {date} · {time}
            </span>

            {score && (
              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-200">
                Score {score}/10
              </span>
            )}
          </div>

          <h3 className="text-xl font-black uppercase i
          talic tracking-tight text-white sm:text-2xl">
            {meal.food || "Comida analizada"}
          </h3>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <Mini title="Kcal" value={meal.calories} />
            <Mini title="Prot" value={meal.protein} unit="g" />
            <Mini title="Carbs" value={meal.carbs} unit="g" />
            <Mini title="Grasa" value={meal.fat} unit="g" />
          </div>

          {meal.recommendation && (
            <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
              <p className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                Análisis IA <ChevronRight size={11} />
              </p>
              <p className="line-clamp-2 text-xs leading-relaxed text-white/55">
                {meal.recommendation}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          disabled={deleting}
          className="self-start rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/35 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function Mini({ title, value, unit = "" }) {
  return (
    <div className="rounded-2xl bg-white/[0.045] p-3">
      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
        {title}
      </p>
      <p className="mt-1 text-sm font-black text-white">
        {Math.round(Number(value) || 0)}
        <span className="ml-1 text-[9px] text-emerald-300/50">{unit}</span>
      </p>
    </div>
  );
}

function Empty({ onClick }) {
  return (
    <div className="py-16 text-center">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
        <CalendarDays size={30} />
      </div>

      <h3 className="text-xl font-black uppercase tracking-tight text-white">
        Sin comidas registradas
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
        Analiza tu primera comida para empezar a construir tu historial nutricional.
      </p>

      <button
        onClick={onClick}
        className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-emerald-400 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#06110e] transition hover:scale-[1.03] hover:bg-white"
      >
        <Camera size={16} />
        Nuevo análisis
      </button>
    </div>
  );
}

function getCachedMeals() {
  const savedMeals = safeParse(localStorage.getItem(STORAGE_KEY), []);
  return Array.isArray(savedMeals) ? savedMeals : [];
}

async function deleteRemoteMeal(mealId, userId) {
  const response = await fetch(
    `${API_URL}/meal-analyses/${mealId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.detail ||
        `No se pudo borrar la comida: ${response.status}`
    );
  }
}

function removeMealFromList(meals, mealToDelete) {
  return meals.filter((meal) => {
    if (meal.id && mealToDelete.id) {
      return meal.id !== mealToDelete.id;
    }

    return (
      (meal.createdAt || meal.created_at) !==
      (mealToDelete.createdAt || mealToDelete.created_at)
    );
  });
}
