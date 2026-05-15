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
  const [selectedMeal, setSelectedMeal] = useState(null);

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

  const scoredMealsCount = useMemo(
    () => filteredMeals.filter((meal) => Number(meal.score) > 0).length,
    [filteredMeals]
  );

  const recommendedMealsCount = useMemo(
    () => filteredMeals.filter((meal) => Boolean(meal.recommendation)).length,
    [filteredMeals]
  );

  const motivationMessage = useMemo(
    () =>
      getMealsMotivationMessage({
        filteredCount: filteredMeals.length,
        totalCount: meals.length,
        totals,
        filter,
        search,
        scoredMealsCount,
        recommendedMealsCount,
      }),
    [
      filteredMeals.length,
      meals.length,
      totals,
      filter,
      search,
      scoredMealsCount,
      recommendedMealsCount,
    ]
  );

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
      if (selectedMeal?.id === mealId) {
        setSelectedMeal(null);
      }
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
    <AppShell
      className="overflow-hidden"
      contentClassName="px-2 pt-2"
    >
      <section className="flex h-full min-h-0 flex-col gap-1">
        <div className="shrink-0 space-y-1.5">
          <HistoryHeader
            onBack={() => navigate("/dashboard")}
            onScan={() => navigate("/foto-comida")}
          />

          <MacroSummary totals={totals} mealsCount={filteredMeals.length} />

          <MealsMotivationCard message={motivationMessage} />

          {remoteError && (
            <StatusBox type="info" className="text-xs leading-5">
              {remoteError}
            </StatusBox>
          )}

          <SurfaceCard className="p-2" radius="md" variant="soft">
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-black/25 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
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

            <div className="relative mt-1.5">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#10b981]/70"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar comida..."
                className="h-9 w-full rounded-2xl bg-[#081713]/90 pl-9 pr-3 text-[11px] font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] outline-none transition placeholder:text-white/28 focus:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.45)]"
              />
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard className="flex min-h-0 flex-1 flex-col p-2" radius="lg">
          <div className="mb-1.5 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] pb-1.5">
            <div>
              <h2 className="text-[13px] font-black uppercase italic tracking-tight">
                Timeline IA
              </h2>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-white/45">
                {filteredMeals.length} comida{filteredMeals.length !== 1 ? "s" : ""} mostrada
                {filteredMeals.length !== 1 ? "s" : ""}
              </p>
            </div>

            {meals.length > 0 && (
                <button
                  onClick={clearMeals}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-red-300/75 transition hover:bg-red-400/15 hover:text-red-200"
                >
                  <Trash2 size={12} />
                  Limpiar
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredMeals.length === 0 ? (
              <Empty onClick={() => navigate("/foto-comida")} />
            ) : (
              <div className="grid gap-2">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  deleting={deletingId === meal.id}
                  onDelete={() => deleteMeal(meal)}
                  onSelect={() => setSelectedMeal(meal)}
                />
              ))}
              </div>
            )}
          </div>
        </SurfaceCard>
      </section>

      {selectedMeal && (
        <MealDetailSheet
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onDelete={async () => {
            await deleteMeal(selectedMeal);
            setSelectedMeal(null);
          }}
        />
      )}
    </AppShell>
  );
}

function HistoryHeader({ onBack, onScan }) {
  return (
    <SurfaceCard as="header" className="overflow-hidden p-2" radius="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#10b981]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#10b981]">
            <Sparkles size={11} />
            Historial IA
          </div>

          <h1 className="text-[22px] font-black uppercase italic leading-none text-white">
            Historial
          </h1>

          <p className="mt-0.5 text-[11px] leading-4 text-white/60">
            Tus comidas analizadas.
          </p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <IconAction onClick={onBack} label="Volver">
            <ArrowLeft size={15} />
          </IconAction>

          <IconAction onClick={onScan} label="Escanear" active>
            <Camera size={15} />
          </IconAction>
        </div>
      </div>
    </SurfaceCard>
  );
}

function IconAction({ children, onClick, label, active = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-2xl transition active:scale-[0.96] ${
        active
          ? "bg-[#10b981] text-[#06110c] shadow-[0_0_24px_rgba(16,185,129,0.18)]"
          : "bg-white/[0.055] text-slate-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MacroSummary({ totals, mealsCount }) {
  return (
    <SurfaceCard className="p-2" radius="lg">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#10b981]">
            Resumen
          </p>

          <p className="mt-0.5 text-[11px] text-white/55">
            {mealsCount} análisis filtrado{mealsCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-2xl bg-[#10b981]/10 text-[#10b981]">
          <Flame size={15} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <SummaryChip icon={<Flame size={11} />} title="Kcal" value={totals.calories} />
        <SummaryChip icon={<Beef size={11} />} title="Prot" value={totals.protein} unit="g" />
        <SummaryChip icon={<Wheat size={11} />} title="Carbs" value={totals.carbs} unit="g" />
        <SummaryChip icon={<Droplets size={11} />} title="Grasa" value={totals.fat} unit="g" />
      </div>
    </SurfaceCard>
  );
}

function MealsMotivationCard({ message }) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[#10b981]/15 bg-[#07170f]/95 px-2.5 py-1.5 shadow-[0_14px_42px_rgba(16,185,129,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,#22d3ee17,transparent_40%),radial-gradient(circle_at_100%_50%,#10b98114,transparent_34%)]" />

      <div className="relative z-10 flex items-start gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
          <Sparkles size={13} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#10b981]">
            Coach IA
          </p>
          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold leading-4 text-white/72">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryChip({ icon, title, value, unit = "" }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.04] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]">
      <div className="mb-0.5 text-[#10b981]">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-tight text-white/42">
        {title}
      </p>
      <p className="mt-0.5 truncate text-[13px] font-black text-white">
        {Math.round(Number(value) || 0)}
        <span className="ml-0.5 text-[9px] text-[#10b981]/65">{unit}</span>
      </p>
    </div>
  );
}

function getMealsMotivationMessage({
  filteredCount,
  totalCount,
  totals,
  filter,
  search,
  scoredMealsCount,
  recommendedMealsCount,
}) {
  if (search && filteredCount === 0) {
    return "Prueba otro término para revisar tus registros.";
  }

  if (totalCount === 0) {
    return "Escanea una comida para empezar a construir tu historial.";
  }

  if (filteredCount === 0) {
    return "Tu historial tiene datos; cambia el filtro para ver más comidas.";
  }

  if (recommendedMealsCount > 0) {
    return "Revisar tus análisis te ayuda a decidir con más intención.";
  }

  if (scoredMealsCount >= 3) {
    return "Tu historial empieza a mostrar patrones útiles.";
  }

  if (filter === "today") {
    return "Cada comida registrada mejora tu control nutricional.";
  }

  if (filter === "week") {
    return "Buen trabajo: estás construyendo conciencia sobre lo que comes.";
  }

  if (Number(totals?.protein || 0) > 0 || Number(totals?.calories || 0) > 0) {
    return "Sigue escaneando: más datos te dan más claridad.";
  }

  return "Tu historial convierte cada registro en una señal útil.";
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wide transition ${
        active
          ? "bg-[#10b981] text-[#06110e] shadow-[0_0_18px_rgba(16,185,129,0.16)]"
          : "text-white/55 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MealCard({ meal, onDelete, deleting, onSelect }) {
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
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-[22px] bg-[#081713] p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition hover:bg-[#0b1d18] hover:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]"
    >
      <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />

      <div className="relative">
        <div className="mb-2 flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <MetaBadge className="px-2 py-0.5 tracking-wide">
                {meal.mealType || "Comida"}
              </MetaBadge>

              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/45">
                <Clock size={11} />
                {date} · {time}
              </span>

              {score && (
                <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-cyan-200">
                  Score {score}
                </span>
              )}
            </div>

            <h3 className="line-clamp-1 text-[15px] font-black uppercase italic leading-tight tracking-tight text-white">
              {meal.food || "Comida analizada"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            onClickCapture={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            className="shrink-0 rounded-2xl bg-white/[0.045] p-2 text-white/42 transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Borrar comida"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr] gap-1.5">
          <Mini title="Kcal" value={meal.calories} strong />
          <Mini title="Prot" value={meal.protein} unit="g" strong />
          <Mini title="Carbs" value={meal.carbs} unit="g" />
          <Mini title="Grasa" value={meal.fat} unit="g" />
        </div>

        {meal.recommendation && (
          <div className="mt-2 rounded-2xl bg-emerald-400/[0.045] p-2.5 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-300">
              Análisis IA <ChevronRight size={11} />
            </p>
            <p className="line-clamp-2 text-xs leading-4 text-white/62">
              {meal.recommendation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function MealDetailSheet({ meal, onClose, onDelete }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const dateValue = meal?.createdAt || meal?.created_at || new Date(0).toISOString();
  const date = new Date(dateValue).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const time = new Date(dateValue).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const image = meal?.image || meal?.image_url || meal?.imageUrl || null;
  const score = Number(meal?.score) || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-2 pb-2 pt-10 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <style>{`
        @keyframes mealSheetIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de comida"
        className="flex max-h-[86dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[30px] border border-[#10b981]/15 bg-[#07170f]/96 shadow-[0_-18px_60px_rgba(0,0,0,0.45)]"
        style={{ animation: "mealSheetIn 220ms ease-out" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center py-2">
          <div className="h-1.5 w-12 rounded-full bg-white/15" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[92px] pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {image && (
            <div className="relative mb-3 h-40 overflow-hidden rounded-[24px] bg-black/25">
              <img src={image} alt={meal.food || "Comida analizada"} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07170f] via-[#07170f]/20 to-transparent" />
              <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#10b981] backdrop-blur-xl">
                Análisis IA
              </div>
            </div>
          )}

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#10b981]">
                {meal.mealType || "Comida"}
              </p>

              <h3 className="mt-1 text-2xl font-black uppercase italic leading-[0.95] text-white">
                {meal.food || "Comida analizada"}
              </h3>

              <p className="mt-1 text-xs leading-4 text-white/55">
                {date} · {time}
              </p>
            </div>

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-[#10b981]/10 text-[#10b981] shadow-[0_0_24px_rgba(16,185,129,0.12)]">
              <div className="text-center">
                <p className="text-[24px] font-black italic leading-none">{score ?? "—"}</p>
                <p className="text-[10px] font-black uppercase tracking-wide text-white/40">
                  score
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricBox label="Kcal" value={meal.calories} unit="kcal" />
            <MetricBox label="Proteína" value={meal.protein} unit="g" accent />
            <MetricBox label="Carbs" value={meal.carbs} unit="g" />
            <MetricBox label="Grasas" value={meal.fat} unit="g" />
          </div>

          {meal.recommendation && (
            <div className="mt-3 rounded-[22px] bg-white/[0.045] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#10b981]">
                Recomendación IA
              </p>
              <p className="text-xs leading-5 text-white/72">
                {meal.recommendation}
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-[#06110e]/95 px-3 py-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl bg-red-400/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-wide text-red-200 transition active:scale-[0.98] hover:bg-red-400/15"
            >
              Borrar análisis
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/[0.05] px-3 py-2.5 text-[10px] font-black uppercase tracking-wide text-white/80 transition active:scale-[0.98] hover:bg-white/[0.08]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricBox({ label, value, unit, accent = false }) {
  return (
    <div className={`rounded-2xl p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)] ${
      accent ? "bg-[#10b981]/10" : "bg-white/[0.045]"
    }`}>
      <p className="text-[10px] font-black uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className={`mt-1 text-sm font-black ${accent ? "text-emerald-100" : "text-white"}`}>
        {Math.round(Number(value) || 0)}
        <span className="ml-1 text-[10px] text-[#10b981]/60">{unit}</span>
      </p>
    </div>
  );
}

function Mini({ title, value, unit = "", strong = false }) {
  return (
    <div className={`rounded-2xl p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)] ${
      strong ? "bg-[#10b981]/10" : "bg-white/[0.045]"
    }`}>
      <p className="text-[10px] font-black uppercase tracking-wide text-white/40">
        {title}
      </p>
      <p className={`mt-0.5 text-sm font-black ${strong ? "text-emerald-100" : "text-white"}`}>
        {Math.round(Number(value) || 0)}
        <span className="ml-1 text-[10px] text-emerald-300/60">{unit}</span>
      </p>
    </div>
  );
}

function Empty({ onClick }) {
  return (
    <div className="rounded-[24px] bg-white/[0.035] px-4 py-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-400/10 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.10)]">
        <CalendarDays size={22} />
      </div>

      <h3 className="text-base font-black uppercase tracking-tight text-white">
        Sin comidas registradas
      </h3>

      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-4 text-white/50">
        Analiza una comida para empezar tu timeline nutricional.
      </p>

      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#06110e] transition active:scale-[0.98] hover:bg-white"
      >
        <Camera size={16} />
        Escanear comida
      </button>
    </div>
  );
}
