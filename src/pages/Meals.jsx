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
import {
  AppShell,
  MetaBadge,
  PageHeaderCard,
  SecondaryButton,
  StatusBox,
  SurfaceCard,
} from "../components/ui";
import { supabase } from "../lib/supabase";
import {
  clearMeals as clearRemoteMeals,
  deleteMeal as deleteRemoteMeal,
  getCachedMeals,
  listMeals,
  removeMealFromCache,
} from "../services/mealService";

export function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState(getCachedMeals);
  const [filter, setFilter] = useState("today");
  const [search, setSearch] = useState("");
  const [remoteError, setRemoteError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadRemoteMeals() {
    try {
      setRemoteError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;

      setMeals(await listMeals(user.id));
    } catch (error) {
      console.error("Error cargando comidas remotas:", error);
      setRemoteError(
        "Sin conexión con el historial remoto. Mostrando datos guardados en este dispositivo."
      );
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      loadRemoteMeals();
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

      const updated = removeMealFromCache(mealToDelete);
      setMeals(updated);
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

      await clearRemoteMeals(user.id);

      setMeals([]);
    } catch (error) {
      console.error("Error limpiando historial:", error);
      setRemoteError(
        error?.message ||
          "No se pudo borrar el historial remoto. El historial local se mantiene intacto."
      );
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SecondaryButton
            onClick={() => navigate("/dashboard")}
            icon={<ArrowLeft size={14} />}
            className="w-auto px-3 py-2 text-[10px]"
          >
            Volver
          </SecondaryButton>

          <SecondaryButton
            onClick={() => navigate("/foto-comida")}
            icon={<Camera size={14} />}
            className="w-auto border-[#10b981]/25 bg-[#10b981]/10 px-3 py-2 text-[10px] text-[#86efac]"
          >
            Scan
          </SecondaryButton>
        </div>

        <PageHeaderCard
          badge="Historial inteligente"
          badgeIcon={<Sparkles size={13} />}
          icon={<CalendarDays size={20} />}
          title="Comidas"
          description="Revisa tus análisis, macros acumulados y recomendaciones de IA."
        >
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Summary icon={<Flame size={16} />} title="Calorías" value={totals.calories} unit="kcal" />
            <Summary icon={<Beef size={16} />} title="Proteína" value={totals.protein} unit="g" />
            <Summary icon={<Wheat size={16} />} title="Carbs" value={totals.carbs} unit="g" />
            <Summary icon={<Droplets size={16} />} title="Grasas" value={totals.fat} unit="g" />
          </div>
        </PageHeaderCard>

        {remoteError && (
          <StatusBox type="info" className="text-xs leading-5">
            {remoteError}
          </StatusBox>
        )}

        <SurfaceCard className="p-3" radius="md" variant="soft">
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

          <div className="relative mt-3">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar comida..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/40"
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-3" radius="xl">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                Registros
              </h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                {filteredMeals.length} comida{filteredMeals.length !== 1 ? "s" : ""} mostrada
                {filteredMeals.length !== 1 ? "s" : ""}
              </p>
            </div>

            {meals.length > 0 && (
              <button
                onClick={clearMeals}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-400/15 bg-red-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-red-300/80 transition hover:border-red-400/30 hover:text-red-200"
              >
                <Trash2 size={12} />
                Limpiar
              </button>
            )}
          </div>

          {filteredMeals.length === 0 ? (
            <Empty onClick={() => navigate("/foto-comida")} />
          ) : (
            <div className="grid gap-3">
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
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

function Summary({ icon, title, value, unit }) {
  return (
    <SurfaceCard variant="soft" radius="sm" className="p-3">
      <div className="mb-2 text-emerald-300">{icon}</div>

      <p className="text-[10px] font-black uppercase tracking-wide text-white/42">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <p className="text-xl font-black italic text-white">{Math.round(value)}</p>
        <p className="text-[10px] font-bold uppercase text-emerald-300/60">
          {unit}
        </p>
      </div>
    </SurfaceCard>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-[10px] font-black uppercase tracking-wide transition ${
        active
          ? "bg-emerald-400 text-[#06110e]"
          : "bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white"
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
    <article className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#081713] p-3 transition hover:border-emerald-400/25 hover:bg-[#0b1d18]">
      <div className="absolute right-0 top-0 h-20 w-20 bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <MetaBadge className="px-2.5 py-1 tracking-wide">
                {meal.mealType || "Comida"}
              </MetaBadge>

              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                <Clock size={11} />
                {date} · {time}
              </span>
            </div>

            <h3 className="line-clamp-2 text-lg font-black uppercase italic leading-tight tracking-tight text-white">
            {meal.food || "Comida analizada"}
            </h3>
          </div>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-white/45 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Borrar comida"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <Mini title="Kcal" value={meal.calories} />
          <Mini title="Prot" value={meal.protein} unit="g" />
          <Mini title="Carbs" value={meal.carbs} unit="g" />
          <Mini title="Grasa" value={meal.fat} unit="g" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {score && (
            <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-200">
              Score {score}/10
            </span>
          )}
        </div>

        {meal.recommendation && (
          <div className="mt-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3">
            <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-emerald-300">
              Análisis IA <ChevronRight size={11} />
            </p>
            <p className="line-clamp-3 text-xs leading-5 text-white/62">
              {meal.recommendation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Mini({ title, value, unit = "" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-white/40">
        {title}
      </p>
      <p className="mt-1 text-sm font-black text-white">
        {Math.round(Number(value) || 0)}
        <span className="ml-1 text-[10px] text-emerald-300/60">{unit}</span>
      </p>
    </div>
  );
}

function Empty({ onClick }) {
  return (
    <div className="py-10 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
        <CalendarDays size={26} />
      </div>

      <h3 className="text-lg font-black uppercase tracking-tight text-white">
        Sin comidas registradas
      </h3>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/50">
        Analiza tu primera comida para empezar a construir tu historial nutricional.
      </p>

      <button
        onClick={onClick}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wide text-[#06110e] transition hover:scale-[1.03] hover:bg-white"
      >
        <Camera size={16} />
        Nuevo análisis
      </button>
    </div>
  );
}
