import { WORKOUT_GOALS, WORKOUT_LEVELS } from "./exerciseLibrary";

const BASE_SPLITS = {
  Principiante: {
    2: [
      makeDay({
        name: "Full body A",
        muscles: ["Pecho", "Espalda", "Piernas", "Abdomen"],
        focus: "strength_main",
        duration: "44 min",
        intensity: "baja-media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Básicos de cuerpo completo",
      }),
      makeDay({
        name: "Full body B",
        muscles: ["Glúteos", "Piernas", "Hombros", "Tríceps"],
        focus: "glute_focus",
        duration: "45 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Glúteos y pierna con soporte superior",
      }),
    ],
    3: [
      makeDay({
        name: "Full body técnica",
        muscles: ["Pecho", "Espalda", "Piernas"],
        focus: "strength_main",
        duration: "42 min",
        intensity: "baja-media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Técnica y básicos",
      }),
      makeDay({
        name: "Lower + core",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "44 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Pierna y abdomen",
      }),
      makeDay({
        name: "Upper base",
        muscles: ["Pecho", "Espalda", "Hombros"],
        focus: "upper_balance",
        duration: "43 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Empuje y tracción suave",
      }),
    ],
    4: [
      makeDay({
        name: "Upper A",
        muscles: ["Pecho", "Espalda", "Hombros"],
        focus: "upper_balance",
        duration: "45 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Torso técnico y equilibrado",
      }),
      makeDay({
        name: "Lower A",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "46 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Base de piernas y glúteo",
      }),
      makeDay({
        name: "Upper B",
        muscles: ["Espalda", "Bíceps", "Tríceps"],
        focus: "upper_balance",
        duration: "44 min",
        intensity: "media",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Brazos y espalda controlados",
      }),
      makeDay({
        name: "Lower B",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "45 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Pierna y glúteo con cierre",
      }),
    ],
    5: [
      makeDay({
        name: "Full body fuerza",
        muscles: ["Pecho", "Espalda", "Piernas"],
        focus: "strength_main",
        duration: "46 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Básicos y técnica",
      }),
      makeDay({
        name: "Lower glute",
        muscles: ["Glúteos", "Piernas"],
        focus: "glute_focus",
        duration: "47 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Más pierna, menos aislamiento",
      }),
      makeDay({
        name: "Upper base",
        muscles: ["Pecho", "Espalda", "Hombros"],
        focus: "upper_balance",
        duration: "45 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Torso y hombros",
      }),
      makeDay({
        name: "Lower estabilidad",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "46 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Unilateral y control",
      }),
      makeDay({
        name: "Core + recovery",
        muscles: ["Abdomen", "Hombros", "Espalda"],
        focus: "core_finish",
        duration: "40 min",
        intensity: "baja-media",
        exerciseSlots: ["core", "accessory", "mobility"],
        brief: "Core y descarga",
      }),
    ],
    6: [
      makeDay({
        name: "Full body A",
        muscles: ["Pecho", "Espalda", "Piernas", "Abdomen"],
        focus: "strength_main",
        duration: "42 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Arranque completo",
      }),
      makeDay({
        name: "Lower A",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "44 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core"],
        brief: "Pierna técnica",
      }),
      makeDay({
        name: "Upper A",
        muscles: ["Pecho", "Espalda", "Hombros"],
        focus: "upper_balance",
        duration: "43 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Torso equilibrado",
      }),
      makeDay({
        name: "Full body B",
        muscles: ["Glúteos", "Piernas", "Bíceps", "Tríceps"],
        focus: "glute_focus",
        duration: "44 min",
        intensity: "media",
        exerciseSlots: ["compound", "accessory", "glute_focus", "core"],
        brief: "Volumen moderado",
      }),
      makeDay({
        name: "Upper B",
        muscles: ["Espalda", "Hombros", "Bíceps"],
        focus: "upper_balance",
        duration: "43 min",
        intensity: "media",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Espalda y hombros",
      }),
      makeDay({
        name: "Lower B",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "core_finish",
        duration: "44 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "core", "accessory"],
        brief: "Glúteo, core y cierre",
      }),
    ],
  },
  Intermedio: {
    2: [
      makeDay({
        name: "Upper / Lower A",
        muscles: ["Pecho", "Espalda", "Piernas"],
        focus: "strength_main",
        duration: "50 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core", "mobility"],
        brief: "Cuerpo completo con más volumen",
      }),
      makeDay({
        name: "Upper / Lower B",
        muscles: ["Glúteos", "Piernas", "Hombros", "Bíceps"],
        focus: "glute_focus",
        duration: "52 min",
        intensity: "media",
        exerciseSlots: ["compound", "glute_focus", "accessory", "core", "isolation"],
        brief: "Glúteos, pierna y torso",
      }),
    ],
    3: [
      makeDay({
        name: "Push",
        muscles: ["Pecho", "Hombros", "Tríceps"],
        focus: "upper_balance",
        duration: "52 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Empuje equilibrado",
      }),
      makeDay({
        name: "Pull",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "51 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Tracción y brazos",
      }),
      makeDay({
        name: "Legs + core",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "54 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Piernas con cierre abdominal",
      }),
    ],
    4: [
      makeDay({
        name: "Upper A",
        muscles: ["Pecho", "Espalda", "Hombros"],
        focus: "upper_balance",
        duration: "52 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Torso base",
      }),
      makeDay({
        name: "Lower A",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "54 min",
        intensity: "media-alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Pierna pesada",
      }),
      makeDay({
        name: "Upper B",
        muscles: ["Espalda", "Bíceps", "Tríceps"],
        focus: "upper_balance",
        duration: "51 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Brazos y espalda",
      }),
      makeDay({
        name: "Lower B",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "53 min",
        intensity: "media-alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Glúteo y abdomen",
      }),
    ],
    5: [
      makeDay({
        name: "Pecho + Tríceps",
        muscles: ["Pecho", "Tríceps"],
        focus: "upper_balance",
        duration: "52 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Empuje con accesorios",
      }),
      makeDay({
        name: "Espalda + Bíceps",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "51 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Tracción más densa",
      }),
      makeDay({
        name: "Piernas",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "55 min",
        intensity: "media-alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Volumen de tren inferior",
      }),
      makeDay({
        name: "Hombros + Core",
        muscles: ["Hombros", "Abdomen"],
        focus: "core_finish",
        duration: "48 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Estabilidad y deltoides",
      }),
      makeDay({
        name: "Glúteos + Piernas",
        muscles: ["Glúteos", "Piernas", "Abdomen"],
        focus: "glute_focus",
        duration: "54 min",
        intensity: "media-alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Especialización inferior",
      }),
    ],
    6: [
      makeDay({
        name: "Push",
        muscles: ["Pecho", "Hombros", "Tríceps"],
        focus: "upper_balance",
        duration: "52 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Empuje completo",
      }),
      makeDay({
        name: "Pull",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "52 min",
        intensity: "media",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Tracción completa",
      }),
      makeDay({
        name: "Legs",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "56 min",
        intensity: "media-alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Base de tren inferior",
      }),
      makeDay({
        name: "Push hipertrofia",
        muscles: ["Pecho", "Hombros", "Tríceps"],
        focus: "upper_balance",
        duration: "51 min",
        intensity: "media",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Volumen de torso",
      }),
      makeDay({
        name: "Pull hipertrofia",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "51 min",
        intensity: "media",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Espalda y brazos",
      }),
      makeDay({
        name: "Legs + Glutes",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "56 min",
        intensity: "media-alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Piernas con especialización glútea",
      }),
    ],
  },
  Avanzado: {
    2: [
      makeDay({
        name: "Full body fuerza",
        muscles: ["Pecho", "Espalda", "Piernas"],
        focus: "strength_main",
        duration: "55 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Básicos pesados",
      }),
      makeDay({
        name: "Full body densidad",
        muscles: ["Glúteos", "Hombros", "Bíceps", "Tríceps"],
        focus: "glute_focus",
        duration: "56 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Alta densidad y control",
      }),
    ],
    3: [
      makeDay({
        name: "Push pesado",
        muscles: ["Pecho", "Hombros", "Tríceps"],
        focus: "upper_balance",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Empuje de fuerza",
      }),
      makeDay({
        name: "Pull pesado",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Tracción de fuerza",
      }),
      makeDay({
        name: "Legs + Glutes",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "60 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Pierna y glúteo prioritarios",
      }),
    ],
    4: [
      makeDay({
        name: "Upper fuerza",
        muscles: ["Pecho", "Espalda", "Hombros"],
        focus: "upper_balance",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "core"],
        brief: "Torso pesado",
      }),
      makeDay({
        name: "Lower fuerza",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "60 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Base de tren inferior",
      }),
      makeDay({
        name: "Upper volumen",
        muscles: ["Espalda", "Bíceps", "Tríceps"],
        focus: "upper_balance",
        duration: "55 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Volumen de torso",
      }),
      makeDay({
        name: "Lower volumen",
        muscles: ["Piernas", "Glúteos", "Abdomen"],
        focus: "glute_focus",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Glúteo y core",
      }),
    ],
    5: [
      makeDay({
        name: "Pecho pesado",
        muscles: ["Pecho", "Tríceps"],
        focus: "upper_balance",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Presses y accesorios",
      }),
      makeDay({
        name: "Espalda pesada",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Tracción potente",
      }),
      makeDay({
        name: "Piernas fuerza",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "61 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Básicos de tren inferior",
      }),
      makeDay({
        name: "Hombros + Brazos",
        muscles: ["Hombros", "Bíceps", "Tríceps"],
        focus: "upper_balance",
        duration: "54 min",
        intensity: "alta",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Deltoides y brazos",
      }),
      makeDay({
        name: "Glúteos + Abdomen",
        muscles: ["Glúteos", "Abdomen", "Piernas"],
        focus: "glute_focus",
        duration: "58 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "core", "accessory"],
        brief: "Especialización inferior",
      }),
    ],
    6: [
      makeDay({
        name: "Push fuerza",
        muscles: ["Pecho", "Hombros", "Tríceps"],
        focus: "upper_balance",
        duration: "56 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Empuje pesado",
      }),
      makeDay({
        name: "Pull fuerza",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "56 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "accessory", "isolation", "core"],
        brief: "Tracción pesada",
      }),
      makeDay({
        name: "Legs fuerza",
        muscles: ["Piernas", "Glúteos"],
        focus: "glute_focus",
        duration: "62 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "accessory", "core"],
        brief: "Tren inferior prioritario",
      }),
      makeDay({
        name: "Push hipertrofia",
        muscles: ["Pecho", "Hombros", "Tríceps"],
        focus: "upper_balance",
        duration: "55 min",
        intensity: "alta",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Volumen de empuje",
      }),
      makeDay({
        name: "Pull hipertrofia",
        muscles: ["Espalda", "Bíceps"],
        focus: "upper_balance",
        duration: "55 min",
        intensity: "alta",
        exerciseSlots: ["compound", "accessory", "isolation", "core"],
        brief: "Volumen de tracción",
      }),
      makeDay({
        name: "Glutes + Core",
        muscles: ["Glúteos", "Piernas", "Abdomen"],
        focus: "glute_focus",
        duration: "60 min",
        intensity: "alta",
        exerciseSlots: ["strength_main", "compound", "glute_focus", "core", "accessory"],
        brief: "Glúteos y core de cierre",
      }),
    ],
  },
};

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6];

export const workoutSplits = WORKOUT_LEVELS.reduce((acc, level) => {
  acc[level] = WORKOUT_GOALS.reduce((goalAcc, goal) => {
    goalAcc[goal] = {};
    DAYS_PER_WEEK_OPTIONS.forEach((days) => {
      goalAcc[goal][days] = buildSplitDays(
        getClosestSplit(level, days),
        { level, goal, daysPerWeek: days }
      );
    });
    return goalAcc;
  }, {});
  return acc;
}, {});

export function getWorkoutSplit({ level, goal, daysPerWeek, focus = "General" }) {
  const baseSplit =
    workoutSplits[level]?.[goal]?.[daysPerWeek] || workoutSplits.Principiante[goal]?.[3];

  return applyWorkoutFocus(baseSplit, focus, goal);
}

function getClosestSplit(level, daysPerWeek) {
  const levelSplits = BASE_SPLITS[level] || BASE_SPLITS.Principiante;

  if (levelSplits[daysPerWeek]) return levelSplits[daysPerWeek];

  const availableDays = Object.keys(levelSplits)
    .map(Number)
    .sort((a, b) => Math.abs(a - daysPerWeek) - Math.abs(b - daysPerWeek));

  return levelSplits[availableDays[0]];
}

function buildSplitDays(days, { level, goal, daysPerWeek }) {
  return days.map((day, index) =>
    applyGoalVariant({
      id: `day-${index + 1}`,
      day: index + 1,
      level,
      goal,
      daysPerWeek,
      ...day,
    })
  );
}

function applyGoalVariant(day) {
  const slots = [...day.exerciseSlots];
  let duration = day.duration;
  let intensity = day.intensity;
  let brief = day.brief;

  if (day.goal === "Fuerza") {
    duration = adjustDuration(duration, 6);
    intensity = bumpIntensity(intensity, 1);
    brief = `Básicos pesados · ${brief}`;
  }

  if (day.goal === "Definir") {
    duration = adjustDuration(duration, -3);
    brief = `Más densidad · ${brief}`;
    if (!slots.includes("core")) slots.push("core");
  }

  if (day.goal === "Ganar músculo") {
    duration = adjustDuration(duration, 2);
    brief = `Hipertrofia · ${brief}`;
    if (!slots.includes("accessory")) slots.push("accessory");
  }

  return {
    ...day,
    duration,
    intensity,
    brief,
    exerciseSlots: compactSlots(slots),
  };
}

function applyWorkoutFocus(split, focus, goal) {
  if (!Array.isArray(split)) return [];

  return split.map((day, index) => {
    if (focus === "Glúteos y piernas") {
      const shouldBiasLower = index % 2 === 1 || day.muscles.includes("Piernas") || day.muscles.includes("Glúteos");
      if (shouldBiasLower) {
        return {
          ...day,
          focus: "glute_focus",
          muscles: addPriorityMuscles(day, ["Glúteos", "Piernas"]),
          exerciseSlots: compactSlots(["strength_main", "compound", "glute_focus", ...day.exerciseSlots]),
          brief: `Glúteos y pierna · ${day.brief}`,
        };
      }
    }

    if (focus === "Torso y brazos") {
      const shouldBiasUpper = index % 2 === 0 || day.muscles.some((muscle) => ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps"].includes(muscle));
      if (shouldBiasUpper) {
        return {
          ...day,
          focus: "upper_balance",
          muscles: addPriorityMuscles(day, ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps"]),
          exerciseSlots: compactSlots(["strength_main", "compound", "accessory", ...day.exerciseSlots]),
          brief: `Torso y brazos · ${day.brief}`,
        };
      }
    }

    if (focus === "Core/abdomen") {
      return {
        ...day,
        focus: "core_finish",
        muscles: addPriorityMuscles(day, ["Abdomen"]),
        exerciseSlots: compactSlots([...day.exerciseSlots, "core"]),
        brief: `Core al final · ${day.brief}`,
      };
    }

    if (focus === "Fuerza completa") {
      return {
        ...day,
        focus: "strength_main",
        exerciseSlots: compactSlots(["strength_main", "compound", ...day.exerciseSlots.filter((slot) => slot !== "mobility")]),
        intensity: bumpIntensity(day.intensity, 1),
        brief: `Fuerza completa · ${day.brief}`,
      };
    }

    if (goal === "Fuerza") {
      return {
        ...day,
        exerciseSlots: compactSlots(["strength_main", "compound", ...day.exerciseSlots]),
        intensity: bumpIntensity(day.intensity, 1),
      };
    }

    return day;
  });
}

function addPriorityMuscles(day, priorityMuscles) {
  return [...new Set([...priorityMuscles, ...day.muscles])].slice(0, 5);
}

function compactSlots(slots) {
  return [...new Set(slots)].filter(Boolean);
}

function adjustDuration(duration, delta) {
  const value = Number(String(duration).match(/\d+/)?.[0] || 45);
  const next = Math.max(35, value + delta);
  return `${next} min`;
}

function bumpIntensity(intensity, steps) {
  const order = ["baja", "baja-media", "media", "media-alta", "alta"];
  const normalized = String(intensity || "").toLowerCase();
  const exactIndex = order.findIndex((item) => normalized === item);
  const fuzzyIndex = [...order]
    .reverse()
    .findIndex((item) => normalized.includes(item));
  const currentIndex = exactIndex !== -1 ? exactIndex : fuzzyIndex !== -1 ? order.length - 1 - fuzzyIndex : -1;
  const nextIndex = currentIndex === -1 ? 2 : Math.min(order.length - 1, currentIndex + steps);
  return order[nextIndex];
}

function makeDay(day) {
  return day;
}
