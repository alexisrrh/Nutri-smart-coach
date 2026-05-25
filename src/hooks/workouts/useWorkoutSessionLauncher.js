import { useEffect, useState } from "react";
import { buildWorkoutDay } from "../../services/workoutPlannerService";

export function useWorkoutSessionLauncher({
  profile,
  selectedDay,
  selectedFocus,
  selectedGoal,
  selectedLevel,
}) {
  const [activeDay, setActiveDay] = useState(null);
  const [workoutMode, setWorkoutMode] = useState(null);

  useEffect(() => {
    if (!workoutMode || typeof document === "undefined") return undefined;

    document.body.classList.add("workout-session-active");

    return () => {
      document.body.classList.remove("workout-session-active");
    };
  }, [workoutMode]);

  function handleStartWorkout() {
    const workoutDay = buildWorkoutDay({
      day: activeDay || selectedDay,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
      profile,
    });

    setWorkoutMode({
      day: workoutDay,
      exercises: workoutDay.exercises,
    });
  }

  function handleStartDayWorkout(day) {
    const workoutDay = buildWorkoutDay({
      day,
      level: selectedLevel,
      goal: selectedGoal,
      focus: selectedFocus,
      profile,
    });

    setActiveDay(workoutDay);
    setWorkoutMode({
      day: workoutDay,
      exercises: workoutDay.exercises,
    });
  }

  function handleCloseWorkoutSession() {
    setWorkoutMode(null);
    setActiveDay(null);
  }

  return {
    activeDay,
    handleCloseWorkoutSession,
    handleStartDayWorkout,
    handleStartWorkout,
    setActiveDay,
    setWorkoutMode,
    workoutMode,
  };
}
