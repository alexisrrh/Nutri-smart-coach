import { useState } from "react";
import {
  completeWorkoutForToday,
  getLocalDateKey,
  getTodayWorkoutCompletion,
  getWorkoutCompletions,
  markWorkoutCompletion,
  unmarkWorkoutCompletion,
} from "../../services/gamificationService";
import { getWorkoutSessions } from "../../services/workoutSessionService";

export function useWorkoutHistory() {
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

  function refreshWorkoutHistory() {
    setTodayCompletion(getTodayWorkoutCompletion());
    setWorkoutCompletions(getWorkoutCompletions());
    setWorkoutSessions(getWorkoutSessions());
  }

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

    refreshWorkoutHistory();
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
