import { useState } from "react";
import { WORKOUT_GOALS, WORKOUT_LEVELS } from "../../data/exerciseLibrary";
import { DAYS_PER_WEEK_OPTIONS } from "../../data/workoutSplits";

export const WORKOUT_FOCUS_OPTIONS = [
  "General",
  "Glúteos y piernas",
  "Torso y brazos",
  "Core/abdomen",
  "Fuerza completa",
];

const WORKOUT_CONFIG_KEYS = {
  level: "workout_level",
  goal: "workout_goal",
  focus: "workout_focus",
  daysPerWeek: "workout_days_per_week",
  completed: "workout_config_completed",
  generatedAt: "workout_config_generated_at",
};

export function useWorkoutConfig(profile) {
  const savedConfig = getSavedWorkoutConfig(profile);
  const [selectedLevel, setSelectedLevel] = useState(savedConfig.level);
  const [selectedGoal] = useState(savedConfig.goal);
  const [selectedFocus, setSelectedFocus] = useState(savedConfig.focus);
  const [daysPerWeek, setDaysPerWeek] = useState(savedConfig.daysPerWeek);
  const [showConfig, setShowConfig] = useState(!savedConfig.completed);

  function saveWorkoutConfig(config) {
    if (typeof localStorage === "undefined") return;

    localStorage.setItem(WORKOUT_CONFIG_KEYS.level, config.level);
    localStorage.setItem(WORKOUT_CONFIG_KEYS.goal, config.goal);
    localStorage.setItem(WORKOUT_CONFIG_KEYS.focus, config.focus);
    localStorage.setItem(
      WORKOUT_CONFIG_KEYS.daysPerWeek,
      String(config.daysPerWeek)
    );
    localStorage.setItem(WORKOUT_CONFIG_KEYS.completed, "true");
    localStorage.setItem(WORKOUT_CONFIG_KEYS.generatedAt, new Date().toISOString());
  }

  return {
    daysPerWeek,
    savedConfig,
    saveWorkoutConfig,
    selectedFocus,
    selectedGoal,
    selectedLevel,
    setDaysPerWeek,
    setSelectedFocus,
    setSelectedLevel,
    setShowConfig,
    showConfig,
  };
}

function getSavedWorkoutConfig(profile) {
  if (typeof localStorage === "undefined") {
    return getDefaultWorkoutConfig(profile);
  }

  const level = localStorage.getItem(WORKOUT_CONFIG_KEYS.level);
  const goal = localStorage.getItem(WORKOUT_CONFIG_KEYS.goal);
  const focus = localStorage.getItem(WORKOUT_CONFIG_KEYS.focus);
  const daysPerWeek = Number(
    localStorage.getItem(WORKOUT_CONFIG_KEYS.daysPerWeek)
  );
  const completed =
    localStorage.getItem(WORKOUT_CONFIG_KEYS.completed) === "true";
  const generatedAt = localStorage.getItem(WORKOUT_CONFIG_KEYS.generatedAt);

  const profileGoal = getWorkoutGoalFromProfile(profile);

  return {
    level: WORKOUT_LEVELS.includes(level) ? level : getSuggestedLevel(profile),
    goal:
      profileGoal || (WORKOUT_GOALS.includes(goal) ? goal : WORKOUT_GOALS[0]),
    focus: WORKOUT_FOCUS_OPTIONS.includes(focus)
      ? focus
      : getSuggestedFocus(profile),
    daysPerWeek: DAYS_PER_WEEK_OPTIONS.includes(daysPerWeek)
      ? daysPerWeek
      : getSuggestedDaysPerWeek(profile),
    completed: completed && Boolean(generatedAt),
  };
}

function getDefaultWorkoutConfig(profile) {
  return {
    level: getSuggestedLevel(profile),
    goal: getWorkoutGoalFromProfile(profile) || WORKOUT_GOALS[0],
    focus: getSuggestedFocus(profile),
    daysPerWeek: getSuggestedDaysPerWeek(profile),
    completed: false,
  };
}

function getWorkoutGoalFromProfile(profile) {
  const profileGoal =
    profile?.goal || profile?.objetivo || profile?.preferences?.goal || "";

  if (profileGoal === "perder_grasa" || profileGoal === "bajar") {
    return "Definir";
  }

  if (profileGoal === "ganar_musculo" || profileGoal === "subir") {
    return "Ganar músculo";
  }

  if (profileGoal === "fuerza" || profileGoal === "strength") {
    return "Fuerza";
  }

  if (profileGoal === "mantener_peso" || profileGoal === "mantener") {
    return "Ganar músculo";
  }

  return "";
}

function getSuggestedFocus(profile) {
  const savedPreference = profile?.preferences?.workout_focus;
  if (WORKOUT_FOCUS_OPTIONS.includes(savedPreference)) return savedPreference;

  const gender =
    profile?.gender || profile?.genero || profile?.preferences?.gender;

  if (gender === "female" || gender === "mujer") return "Glúteos y piernas";
  if (gender === "male" || gender === "hombre") return "General";

  return "General";
}

function getSuggestedLevel(profile) {
  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;
  const age = Number(profile?.age);

  if (age >= 55 || activity === "low" || activity === "sedentary") {
    return "Principiante";
  }

  if (activity === "high") return "Intermedio";

  return WORKOUT_LEVELS[1];
}

function getSuggestedDaysPerWeek(profile) {
  const preference = Number(
    profile?.preferences?.workout_days_per_week ||
      profile?.preferences?.training_days_per_week
  );

  if (DAYS_PER_WEEK_OPTIONS.includes(preference)) return preference;

  const activity =
    profile?.activity_level ||
    profile?.activity ||
    profile?.preferences?.activity ||
    profile?.preferences?.activity_level;

  if (activity === "high") return 5;
  if (activity === "low" || activity === "sedentary") return 3;

  return 4;
}
