import { WORKOUT_GOALS, WORKOUT_LEVELS } from "./exercises";

const BASE_SPLITS = {
  Principiante: {
    2: [
      { name: "Full body A", muscles: ["Pecho", "Espalda", "Piernas", "Abdomen"] },
      { name: "Full body B", muscles: ["Piernas", "Glúteos", "Hombros", "Bíceps", "Tríceps"] },
    ],
    3: [
      { name: "Full body", muscles: ["Pecho", "Espalda", "Piernas"] },
      { name: "Full body", muscles: ["Glúteos", "Hombros", "Abdomen"] },
      { name: "Full body", muscles: ["Espalda", "Piernas", "Bíceps", "Tríceps"] },
    ],
    4: [
      { name: "Tren superior", muscles: ["Pecho", "Espalda", "Hombros"] },
      { name: "Tren inferior", muscles: ["Piernas", "Glúteos", "Abdomen"] },
      { name: "Tren superior", muscles: ["Espalda", "Bíceps", "Tríceps"] },
      { name: "Tren inferior", muscles: ["Piernas", "Glúteos"] },
    ],
  },
  Intermedio: {
    3: [
      { name: "Push", muscles: ["Pecho", "Hombros", "Tríceps"] },
      { name: "Pull", muscles: ["Espalda", "Bíceps"] },
      { name: "Legs", muscles: ["Piernas", "Glúteos", "Abdomen"] },
    ],
    4: [
      { name: "Upper", muscles: ["Pecho", "Espalda", "Hombros"] },
      { name: "Lower", muscles: ["Piernas", "Glúteos", "Abdomen"] },
      { name: "Push", muscles: ["Pecho", "Hombros", "Tríceps"] },
      { name: "Pull/Legs", muscles: ["Espalda", "Bíceps", "Piernas"] },
    ],
    5: [
      { name: "Pecho + Tríceps", muscles: ["Pecho", "Tríceps"] },
      { name: "Espalda + Bíceps", muscles: ["Espalda", "Bíceps"] },
      { name: "Piernas", muscles: ["Piernas"] },
      { name: "Hombros + Abdomen", muscles: ["Hombros", "Abdomen"] },
      { name: "Glúteos + Piernas", muscles: ["Glúteos", "Piernas"] },
    ],
  },
  Avanzado: {
    5: [
      { name: "Pecho pesado", muscles: ["Pecho", "Tríceps"] },
      { name: "Espalda pesada", muscles: ["Espalda", "Bíceps"] },
      { name: "Piernas fuerza", muscles: ["Piernas", "Glúteos"] },
      { name: "Hombros + Brazos", muscles: ["Hombros", "Bíceps", "Tríceps"] },
      { name: "Glúteos + Abdomen", muscles: ["Glúteos", "Abdomen"] },
    ],
    6: [
      { name: "Push", muscles: ["Pecho", "Hombros", "Tríceps"] },
      { name: "Pull", muscles: ["Espalda", "Bíceps"] },
      { name: "Legs", muscles: ["Piernas", "Glúteos"] },
      { name: "Push hipertrofia", muscles: ["Pecho", "Hombros", "Tríceps"] },
      { name: "Pull hipertrofia", muscles: ["Espalda", "Bíceps"] },
      { name: "Legs + Glúteos", muscles: ["Piernas", "Glúteos", "Abdomen"] },
    ],
  },
};

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6];

export const workoutSplits = WORKOUT_LEVELS.reduce((acc, level) => {
  acc[level] = WORKOUT_GOALS.reduce((goalAcc, goal) => {
    goalAcc[goal] = {};
    DAYS_PER_WEEK_OPTIONS.forEach((days) => {
      goalAcc[goal][days] = buildSplitDays(getClosestSplit(level, days), goal);
    });
    return goalAcc;
  }, {});
  return acc;
}, {});

export function getWorkoutSplit({ level, goal, daysPerWeek, focus = "General" }) {
  const baseSplit =
    workoutSplits[level]?.[goal]?.[daysPerWeek] || workoutSplits.Principiante[goal]?.[3];

  return applyWorkoutFocus(baseSplit, focus);
}

function getClosestSplit(level, daysPerWeek) {
  const levelSplits = BASE_SPLITS[level] || BASE_SPLITS.Principiante;

  if (levelSplits[daysPerWeek]) return levelSplits[daysPerWeek];

  const availableDays = Object.keys(levelSplits)
    .map(Number)
    .sort((a, b) => Math.abs(a - daysPerWeek) - Math.abs(b - daysPerWeek));

  return levelSplits[availableDays[0]];
}

function buildSplitDays(days, goal) {
  return days.map((day, index) => ({
    id: `day-${index + 1}`,
    day: index + 1,
    goal,
    duration: getDuration(day.muscles.length, goal),
    ...day,
  }));
}

function getDuration(muscleCount, goal) {
  const base = muscleCount >= 4 ? 58 : muscleCount === 3 ? 52 : 45;

  if (goal === "Fuerza") return `${base + 10} min`;
  if (goal === "Definir") return `${base - 5} min`;

  return `${base} min`;
}

function applyWorkoutFocus(split, focus) {
  if (!Array.isArray(split)) return [];

  return split.map((day, index) => {
    if (focus === "Glúteos y piernas" && index % 2 === 1) {
      return addPriorityMuscles(day, ["Glúteos", "Piernas"]);
    }

    if (focus === "Torso y brazos" && index % 2 === 0) {
      return addPriorityMuscles(day, ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps"]);
    }

    if (focus === "Core/abdomen" && !day.muscles.includes("Abdomen")) {
      return addPriorityMuscles(day, ["Abdomen"]);
    }

    if (focus === "Fuerza completa") {
      return {
        ...day,
        name: day.name.includes("fuerza") ? day.name : `${day.name} fuerza`,
      };
    }

    return day;
  });
}

function addPriorityMuscles(day, priorityMuscles) {
  const muscles = [...new Set([...priorityMuscles, ...day.muscles])].slice(0, 5);

  return {
    ...day,
    muscles,
  };
}
