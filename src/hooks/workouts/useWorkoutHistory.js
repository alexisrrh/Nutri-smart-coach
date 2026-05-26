import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import {
  completeWorkoutForToday,
  getLocalDateKey,
  getTodayWorkoutCompletion,
  getWorkoutCompletions,
  markWorkoutCompletion,
  unmarkWorkoutCompletion,
} from "../../services/gamificationService";
import {
  getWorkoutSessions,
  listWorkoutSessions,
} from "../../services/workoutSessionService";

export function useWorkoutHistory() {
  const { user, loadingAuth } = useAuth();
  const userId = user?.id || null;
  const [todayCompletion, setTodayCompletion] = useState(() =>
    getTodayWorkoutCompletion()
  );
  const [workoutCompletions, setWorkoutCompletions] = useState(() =>
    getWorkoutCompletions()
  );
  const [workoutSessions, setWorkoutSessions] = useState(() =>
    getWorkoutSessions()
  );
  const [showHistory, setShowHistory] = useState(false);
  const [toggleMessage, setToggleMessage] = useState("");

  const refreshWorkoutHistory = useCallback(async () => {
    setTodayCompletion(getTodayWorkoutCompletion());
    setWorkoutCompletions(getWorkoutCompletions());

    if (!userId) {
      setWorkoutSessions([]);
      return;
    }

    try {
      const sessions = await listWorkoutSessions(userId);
      setWorkoutSessions(sessions);
    } catch (error) {
      console.error("Error cargando historial de entrenamientos:", error);
      setWorkoutSessions(getWorkoutSessions(userId));
    }
  }, [userId]);

  useEffect(() => {
    if (loadingAuth) return;

    if (!userId) {
      void Promise.resolve().then(() => {
        setTodayCompletion(null);
        setWorkoutCompletions([]);
        setWorkoutSessions([]);
      });
      return;
    }

    let active = true;

    async function loadWorkoutHistory() {
      try {
        const sessions = await listWorkoutSessions(userId);
        if (!active) return;

        setWorkoutSessions(sessions);
        setTodayCompletion(getTodayWorkoutCompletion());
        setWorkoutCompletions(getWorkoutCompletions());
      } catch (error) {
        if (!active) return;

        console.error("Error cargando historial de entrenamientos:", error);
        setWorkoutSessions(getWorkoutSessions(userId));
      }
    }

    void loadWorkoutHistory();

    return () => {
      active = false;
    };
  }, [loadingAuth, userId]);

  function handleCompleteWorkout({
    day,
    selectedLevel,
    selectedGoal,
    activeDay,
    selectedDay,
  }) {
    const workoutDay = day || activeDay || selectedDay;
    const result = completeWorkoutForToday({
      muscle: workoutDay.muscles.join(" + "),
      level: selectedLevel,
      goal: selectedGoal,
      dayId: workoutDay.id,
      dayName: workoutDay.name,
    });

    void refreshWorkoutHistory();
    return result;
  }

  function handleToggleDayCompletion(day, index, workoutContext = {}) {
    const { selectedGoal = "", selectedLevel = "" } = workoutContext;
    const dateKey = getPlanDayDateKey(index);
    const completion = getCompletionForPlanDay({
      completions: workoutCompletions,
      dateKey,
      dayId: day.id,
    });

    if (completion) {
      const nextCompletions = unmarkWorkoutCompletion(dateKey);
      setWorkoutCompletions(nextCompletions);
      setTodayCompletion(getTodayWorkoutCompletion());
      setToggleMessage("Entreno desmarcado");
    } else {
      markWorkoutCompletion({
        date: dateKey,
        dayId: day.id,
        dayName: day.name,
        muscle: day.muscles.join(" + "),
        level: selectedLevel,
        goal: selectedGoal,
      });
      setWorkoutCompletions(getWorkoutCompletions());
      setTodayCompletion(getTodayWorkoutCompletion());
      setToggleMessage("Entreno marcado");
    }

    window.setTimeout(() => setToggleMessage(""), 1800);
  }

  return {
    handleCompleteWorkout,
    handleToggleDayCompletion,
    refreshWorkoutHistory,
    setShowHistory,
    showHistory,
    todayCompletion,
    toggleMessage,
    workoutCompletions,
    workoutSessions,
  };
}

export function getPlanDayDateKey(index) {
  const weekStart = getWeekStartDate();
  weekStart.setDate(weekStart.getDate() + index);

  return getLocalDateKey(weekStart);
}

export function getCompletionForPlanDay({ completions, dateKey, dayId }) {
  return completions.find(
    (completion) =>
      completion.date === dateKey ||
      (completion.dayId && completion.dayId === dayId && isThisWeek(completion.date))
  );
}

function getWeekStartDate() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

function isThisWeek(dateKey) {
  const date = new Date(dateKey);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return date >= weekStart && date < weekEnd;
}
