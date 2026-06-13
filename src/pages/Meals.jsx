import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import {
  AppShell,
  ConfirmDialog,
  StatusBox,
  SurfaceCard,
} from "../components/ui";
import { MealCard } from "../components/meals/MealCard";
import { MealDetailSheet } from "../components/meals/MealDetailSheet";
import { Empty } from "../components/meals/MealsEmptyState";
import { FilterButton } from "../components/meals/MealsFilters";
import { HistoryHeader } from "../components/meals/MealsHeader";
import {
  MacroSummary,
  MealsMotivationCard,
} from "../components/meals/MealsSummary";
import { useMealDeletion } from "../hooks/meals/useMealDeletion";
import { useMealFiltering } from "../hooks/meals/useMealFiltering";
import { useMealsHistory } from "../hooks/meals/useMealsHistory";
import { useMealTotals } from "../hooks/meals/useMealTotals";

export function Meals() {
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const { meals, setMeals, remoteError, setRemoteError } = useMealsHistory();
  const { filter, setFilter, search, setSearch, filteredMeals } =
    useMealFiltering(meals);
  const { totals, motivationMessage } = useMealTotals({
    meals,
    filteredMeals,
    filter,
    search,
  });
  const { deletingId, deleteMeal, clearMeals } = useMealDeletion({
    meals,
    setMeals,
    selectedMeal,
    setSelectedMeal,
    setRemoteError,
  });

  return (
    <AppShell
      className="overflow-hidden pb-15"
      contentClassName="px-2 pt-2"
  scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
     <section className="flex flex-col gap-1 pb-6">
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

          <SurfaceCard
            className="p-2"
            radius="md"
            variant="soft"
            style={{ backgroundColor: "var(--app-surface)" }}
          >
            <div
              className="grid grid-cols-3 gap-1 rounded-2xl p-1 shadow-[inset_0_0_0_1px_var(--app-border)]"
              style={{ backgroundColor: "var(--app-card)" }}
            >
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-primary)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar comida..."
                className="h-9 w-full rounded-2xl pl-9 pr-3 text-[11px] font-bold text-[var(--app-text)] shadow-[inset_0_0_0_1px_var(--app-border)] outline-none transition placeholder:text-[var(--app-muted)]"
                style={{ backgroundColor: "var(--app-surface)" }}
              />
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard className="flex flex-col p-2" radius="lg">
          <div
            className="mb-1.5 flex shrink-0 items-center justify-between gap-3 border-b pb-1.5"
            style={{ borderColor: "var(--app-border)" }}
          >
            <div>
              <h2 className="text-[13px] font-black tracking-tight text-[var(--app-text)]">
                Timeline IA
              </h2>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
                {filteredMeals.length} comida{filteredMeals.length !== 1 ? "s" : ""} mostrada
                {filteredMeals.length !== 1 ? "s" : ""}
              </p>
            </div>

            {meals.length > 0 && (
                <button
                  onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-red-300/75 transition hover:bg-red-400/15 hover:text-red-200"
                >
                  <Trash2 size={12} />
                  Limpiar
              </button>
            )}
          </div>

         <div className="pr-0.5 pb-2">
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

      <ConfirmDialog
        open={confirmClearOpen}
        variant="danger"
        title="Borrar historial"
        description="Se eliminaran todas las comidas guardadas en tu historial. Esta accion no se puede deshacer."
        cancelLabel="Cancelar"
        confirmLabel="Borrar"
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={async () => {
          setConfirmClearOpen(false);
          await clearMeals();
        }}
      />
    </AppShell>
  );
}
