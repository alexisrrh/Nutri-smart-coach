import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Dumbbell,
  Lock,
  Save,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppShell, useToast } from "../components/ui";
import { useAuth } from "../context/useAuth";
import {
  getSharedRoutineByShareId,
  getSharedWorkoutWeekByShareId,
  saveSharedRoutineToMyRoutines,
  saveSharedWorkoutWeekToMyRoutines,
} from "../services/customWorkoutService";

export default function SharedRoutine() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shareId } = useParams();
  const { user, loadingAuth } = useAuth();
  const toast = useToast();
  const isWeekRoute = location.pathname.includes("/rutinas/semana/");
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSharedRoutine() {
      if (!shareId) {
        if (!isMounted) return;
        setError("No se encontró la rutina compartida.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const sharedRoutine = isWeekRoute
          ? await getSharedWorkoutWeekByShareId(shareId)
          : await getSharedRoutineByShareId(shareId);
        if (!isMounted) return;
        setShareData(sharedRoutine);
      } catch (fetchError) {
        console.error("Error cargando rutina compartida:", fetchError);
        if (!isMounted) return;
        setError(
          fetchError.message || "No se pudo cargar esta rutina compartida."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadSharedRoutine();

    return () => {
      isMounted = false;
    };
  }, [isWeekRoute, shareId]);

  const summary = useMemo(() => {
    const routines = isWeekRoute
      ? Array.isArray(shareData?.routines)
        ? shareData.routines
        : []
      : Array.isArray(shareData?.days)
        ? [shareData]
        : [];

    const days = isWeekRoute
      ? routines.flatMap((routine) => routine?.days || [])
      : Array.isArray(shareData?.days)
        ? shareData.days
        : [];

    const totalExercises = days.reduce(
      (acc, day) => acc + (Array.isArray(day?.exercises) ? day.exercises.length : 0),
      0
    );

    return {
      routinesCount: routines.length,
      daysCount: days.length,
      totalExercises,
      muscles:
        days
          .flatMap((day) => day?.muscles || [])
          .filter(Boolean)
          .join(" · ") ||
        (isWeekRoute
          ? "Mi semana de entrenamiento"
          : shareData?.focus || "Rutina personalizada"),
    };
  }, [isWeekRoute, shareData]);

  async function handleSaveRoutine() {
    if (!user?.id || !shareData) return;

    setSaving(true);

    try {
      if (isWeekRoute) {
        await saveSharedWorkoutWeekToMyRoutines(user.id, shareData);
        toast.success("Semana guardada en Mis rutinas.");
      } else {
        await saveSharedRoutineToMyRoutines(user.id, shareData);
        toast.success("Rutina guardada en Mis rutinas.");
      }
      navigate("/rutinas");
    } catch (saveError) {
      console.error("Error guardando rutina compartida:", saveError);
      toast.error(saveError.message || "No se pudo guardar en tus rutinas.");
    } finally {
      setSaving(false);
    }
  }

  const handleLogin = () => {
    navigate(
      `/login?redirect=${encodeURIComponent(
        isWeekRoute ? `/rutinas/semana/${shareId}` : `/rutina/${shareId}`
      )}`
    );
  };

  return (
    <AppShell hideBottomNav wide contentClassName="overflow-x-hidden px-3 pb-6 pt-1.5">
      <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col gap-2 overflow-hidden overflow-x-hidden">
        <header className="w-full max-w-full shrink-0">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold transition hover:text-[var(--app-text)]"
            style={{
              backgroundColor: "var(--app-primary-soft)",
              color: "var(--app-muted)",
            }}
          >
            <ArrowLeft size={11} />
            Volver
          </button>

          <section className="relative w-full max-w-full min-w-0 overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_8px_24px_var(--app-glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,var(--app-primary-soft),transparent_42%)]" />
            <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.72)] px-2.5 py-1 text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                    {isWeekRoute ? "Semana compartida" : "Rutina compartida"}
                  </span>
                  <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1 text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-muted)]">
                    Pública
                  </span>
                </div>

                <h1 className="mt-2 text-[22px] font-semibold leading-none text-[var(--app-text)]">
                  {shareData?.title || shareData?.name ||
                    (isWeekRoute
                      ? "Mi semana de entrenamiento"
                      : "Cargando rutina...")}
                </h1>

                <p className="mt-1.5 max-w-[24rem] text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                  {shareData
                    ? isWeekRoute
                      ? "Guarda esta semana completa en tu cuenta para usar todas las rutinas cuando quieras."
                      : "Abre esta rutina y guárdala en tu cuenta para usarla cuando quieras."
                    : "Cargando los detalles de la rutina compartida."}
                </p>
              </div>

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[1rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]">
                <Dumbbell size={18} />
              </div>
            </div>
          </section>
        </header>

        <main className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading || loadingAuth ? (
            <div className="space-y-2 pt-1.5">
              <div className="rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
                <div className="h-4 w-32 animate-pulse rounded-full bg-[var(--app-primary-soft)]" />
                <div className="mt-3 h-20 animate-pulse rounded-[0.95rem] bg-[var(--app-surface)]" />
              </div>
            </div>
          ) : error ? (
            <section className="mt-1.5 rounded-[1rem] border border-[color:color-mix(in_srgb,#ff6b7a_18%,var(--app-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_92%,#1c0f14),var(--app-card))] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
              <div className="flex items-start gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.9rem] border border-[color:color-mix(in_srgb,#ff6b7a_18%,var(--app-border))] bg-[rgba(255,107,122,0.08)] text-[color:color-mix(in_srgb,#ff8a98_82%,var(--app-primary))]">
                  <Lock size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[16px] font-semibold text-[var(--app-text)]">
                    Rutina no disponible
                  </h2>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    {error}
                  </p>
                </div>
              </div>
            </section>
          ) : shareData ? (
            <div className="space-y-2 pb-2 pt-1.5">
              <section className="rounded-[1rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_92%,#08131b),var(--app-card))] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
                <div className="grid gap-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {isWeekRoute ? (
                      <>
                        <MetaPill
                          label="Rutinas"
                          value={`${summary.routinesCount}`}
                        />
                        <MetaPill label="Días" value={`${summary.daysCount}`} />
                        <MetaPill
                          label="Ejercicios"
                          value={`${summary.totalExercises}`}
                        />
                      </>
                    ) : (
                      <>
                        <MetaPill
                          label="Nivel"
                          value={shareData.level || "Libre"}
                        />
                        <MetaPill
                          label="Foco"
                          value={shareData.focus || "General"}
                        />
                        <MetaPill label="Días" value={`${summary.daysCount}`} />
                      </>
                    )}
                  </div>

                  <p className="text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                    {shareData.description ||
                      "Selecciona esta rutina y guárdala en tu cuenta para seguir entrenando con ella."}
                  </p>

                  <div className="rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5">
                    <p className="text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                      {isWeekRoute ? "Músculos de la semana" : "Músculos principales"}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[var(--app-text)]">
                      {summary.muscles}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {user?.id ? (
                      <button
                        type="button"
                        onClick={handleSaveRoutine}
                        disabled={saving}
                        className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--app-primary)] px-3 text-[10px] font-semibold text-[var(--app-surface)] shadow-[0_8px_18px_rgba(0,196,255,0.16)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                      >
                        <Save size={15} />
                        {saving
                          ? "Guardando..."
                          : isWeekRoute
                            ? "Guardar semana en mis rutinas"
                            : "Guardar en mis rutinas"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogin}
                        className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[0.95rem] bg-[var(--app-primary)] px-3 text-[10px] font-semibold text-[var(--app-surface)] shadow-[0_8px_18px_rgba(0,196,255,0.16)] transition duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <Lock size={15} />
                        {isWeekRoute
                          ? "Inicia sesión para guardar esta semana"
                          : "Inicia sesión para guardar esta rutina"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate("/rutinas")}
                      className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[0.95rem] border border-[color:color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[rgba(8,16,26,0.42)] px-3 text-[10px] font-semibold text-[var(--app-primary)] transition duration-150 hover:bg-[rgba(8,16,26,0.58)] active:scale-[0.98]"
                    >
                      Ver rutinas
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-[1rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                      Detalle
                    </p>
                    <h2 className="mt-1 text-[16px] font-semibold text-[var(--app-text)]">
                      {isWeekRoute ? "Rutinas incluidas" : "Ejercicios incluidos"}
                    </h2>
                  </div>
                  <div className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[8px] font-semibold text-[var(--app-muted)]">
                    {isWeekRoute
                      ? `${summary.routinesCount} rutinas`
                      : `${summary.totalExercises} ejercicios`}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {isWeekRoute
                    ? (shareData.routines || []).map((routine, routineIndex) => {
                        const routineDays = Array.isArray(routine?.days)
                          ? routine.days
                          : [];
                        const exerciseCount = routineDays.reduce(
                          (acc, day) =>
                            acc + (Array.isArray(day?.exercises) ? day.exercises.length : 0),
                          0
                        );

                        return (
                          <article
                            key={routine.id || `${routine.name}-${routineIndex}`}
                            className="rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                                  {routine.name || `Rutina ${routineIndex + 1}`}
                                </p>
                                <h3 className="mt-1 text-[12px] font-semibold text-[var(--app-text)]">
                                  {routine.focus || "Rutina personalizada"}
                                </h3>
                              </div>
                              <div className="rounded-full border border-[var(--app-border)] bg-[rgba(8,16,26,0.56)] px-2 py-1 text-[8px] font-semibold text-[var(--app-muted)]">
                                {exerciseCount} ejercicios
                              </div>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <MetaPill label="Nivel" value={routine.level || "Libre"} />
                              <MetaPill label="Días" value={`${routineDays.length}`} />
                            </div>
                          </article>
                        );
                      })
                    : (shareData.days || []).map((day, dayIndex) => {
                        const exercises = Array.isArray(day?.exercises)
                          ? day.exercises
                          : [];

                        return (
                          <article
                            key={day.id || `${day.name}-${dayIndex}`}
                            className="rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[7px] font-extrabold tracking-[0.12em] text-[var(--app-primary)]">
                                  {day.name || `Día ${dayIndex + 1}`}
                                </p>
                                <h3 className="mt-1 text-[12px] font-semibold text-[var(--app-text)]">
                                  {day.muscles?.join(" · ") || "Rutina personalizada"}
                                </h3>
                              </div>
                              <div className="rounded-full border border-[var(--app-border)] bg-[rgba(8,16,26,0.56)] px-2 py-1 text-[8px] font-semibold text-[var(--app-muted)]">
                                {exercises.length} ejercicios
                              </div>
                            </div>

                            <div className="mt-2 space-y-2">
                              {exercises.map((exercise, exerciseIndex) => (
                                <div
                                  key={
                                    exercise.exerciseId ||
                                    exercise.id ||
                                    `${exercise.name}-${exerciseIndex}`
                                  }
                                  className="rounded-[0.8rem] border border-[rgba(255,255,255,0.05)] bg-[rgba(8,16,26,0.3)] px-2.5 py-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-semibold text-[var(--app-text)]">
                                        {exercise.name || "Ejercicio"}
                                      </p>
                                      <p className="mt-0.5 text-[8px] font-medium text-[var(--app-muted)]">
                                        {exercise.muscle || day.muscles?.[0] || "General"}
                                      </p>
                                    </div>

                                    <div className="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-[8px] font-semibold text-[var(--app-primary)]">
                                      {exercise.sets || 3} x {exercise.reps || "8-12"}
                                    </div>
                                  </div>

                                  <p className="mt-1.5 text-[8px] font-medium text-[var(--app-muted)]">
                                    Descanso {exercise.rest || "90s"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                </div>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </AppShell>
  );
}

function MetaPill({ label, value }) {
  return (
    <div className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[8px] font-semibold text-[var(--app-muted)]">
      <span className="text-[var(--app-primary)]">{label}:</span> {value}
    </div>
  );
}
