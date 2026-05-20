export const GAMIFICATION_STORAGE_KEY = "nutrismart_gamification";
export const WORKOUT_COMPLETIONS_KEY = "nutrismart_workout_completions";

export const XP_REWARDS = {
  meal: 10,
  workout: 15,
  checkin: 20,
  protein: 5,
};

export const DAILY_PROGRESS_ITEMS = [
  {
    id: "diet",
    label: "Dieta",
  },
  {
    id: "protein",
    label: "Proteína",
  },
  {
    id: "workout",
    label: "Entreno",
  },
  {
    id: "checkin",
    label: "Check-in",
  },
];

export const ACHIEVEMENTS = [
  {
    id: "first_meal",
    label: "Primera comida analizada",
  },
  {
    id: "three_day_streak",
    label: "3 días seguidos",
  },
  {
    id: "first_checkin",
    label: "Primer check-in",
  },
  {
    id: "first_workout",
    label: "Primer entreno completado",
  },
];

export const XP_PER_LEVEL = 250;
export const DEFAULT_DAILY_MEAL_GOAL = 4;
