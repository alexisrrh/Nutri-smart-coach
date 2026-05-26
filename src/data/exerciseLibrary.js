export const EXERCISE_MUSCLES = [
  "Pecho",
  "Espalda",
  "Piernas",
  "Glúteos",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Abdomen",
];

export const MUSCLE_GROUPS = EXERCISE_MUSCLES;
export const WORKOUT_LEVELS = ["Principiante", "Intermedio", "Avanzado"];
export const WORKOUT_GOALS = ["Ganar músculo", "Definir", "Fuerza"];
export const EXERCISE_EQUIPMENT_TYPES = [
  "bodyweight",
  "dumbbell",
  "barbell",
  "cable",
  "machine",
  "band",
  "kettlebell",
  "cardio",
  "mobility",
];
export const EXERCISE_TYPES = ["strength", "core", "cardio", "mobility"];

const LEVEL_SETS = {
  Principiante: 3,
  Intermedio: 4,
  Avanzado: 5,
};

const GOAL_REPS = {
  "Ganar músculo": "8-12",
  Definir: "10-15",
  Fuerza: "4-6",
};

const GOAL_REST = {
  "Ganar músculo": "75-120s",
  Definir: "45-75s",
  Fuerza: "120-150s",
};

export const englishNameByMediaKey = {
  "press-banca": "barbell bench press",
  "press-inclinado-mancuernas": "dumbbell incline bench press",
  "aperturas-cable": "cable fly",
  flexiones: "push up",
  "fondos-pecho": "chest dips",
  "press-declinado-mancuernas": "dumbbell decline bench press",
  dominadas: "pull up",
  "jalon-pecho": "lat pulldown",
  "remo-barra": "barbell row",
  "remo-sentado": "seated cable row",
  "pullover-polea": "cable pullover",
  "face-pull": "face pull",
  sentadilla: "barbell squat",
  "prensa-piernas": "leg press",
  "peso-muerto-rumano": "romanian deadlift",
  zancadas: "dumbbell lunge",
  "extensiones-cuadriceps": "leg extension",
  "curl-femoral": "leg curl",
  "hip-thrust": "barbell hip thrust",
  "patada-gluteo": "glute kickback",
  "abduccion-cadera": "hip abduction",
  "sentadilla-sumo": "sumo squat",
  "puente-gluteo": "glute bridge",
  "pull-through": "cable pull-through",
  "press-militar": "overhead press",
  "elevaciones-laterales": "lateral raise",
  "face-pull-hombro": "face pull",
  "elevaciones-frontales": "front raise",
  "pajaro-mancuernas": "dumbbell reverse fly",
  "arnold-press": "arnold press",
  "curl-mancuernas": "biceps curl",
  "curl-barra-z": "ez bar curl",
  "curl-martillo": "hammer curl",
  "curl-inclinado": "incline dumbbell curl",
  "curl-predicador": "preacher curl",
  "curl-concentrado": "concentration curl",
  "fondos-banco": "bench dips",
  "extension-polea": "rope tricep pushdown",
  "press-frances": "lying triceps extension",
  "patada-triceps": "triceps kickback",
  "press-cerrado": "close grip bench press",
  "extension-cuerda": "rope tricep pushdown",
  plancha: "plank",
  "crunch-cable": "cable crunch",
  "elevacion-piernas": "leg raise",
  "dead-bug": "dead bug",
  "pallof-press": "pallof press",
  "rueda-abdominal": "ab wheel rollout",
};

const MOVEMENT_CALORIES = {
  compound: 1.2,
  accessory: 1,
  isolation: 0.9,
  core: 0.85,
  cardio: 1.15,
  mobility: 0.7,
};

function createExercise({
  slug,
  name,
  englishName,
  muscle,
  secondaryMuscles = [],
  difficulty,
  equipment,
  description,
  tips,
  mistakes,
  level = difficulty || "Intermedio",
  goals = WORKOUT_GOALS,
  movementType,
  setsByLevel,
  repsByGoal,
  restByGoal,
  estimatedCalories,
  type,
  instructions,
  duration,
}) {
  const resolvedLevel = normalizeLevel(level);
  const resolvedDifficulty = difficulty || resolvedLevel;
  const resolvedMovementType = movementType || inferMovementType({ slug, name, muscle, secondaryMuscles });
  const resolvedType = type || getExerciseType(resolvedMovementType);
  const resolvedGoals = Array.isArray(goals) && goals.length ? goals : WORKOUT_GOALS;
  const resolvedSetsByLevel = setsByLevel || { ...LEVEL_SETS };
  const resolvedRepsByGoal = repsByGoal || { ...GOAL_REPS };
  const resolvedRestByGoal = restByGoal || { ...GOAL_REST };
  const difficultyScore = inferDifficultyScore({ level: resolvedDifficulty }, resolvedMovementType);
  const equipmentType = inferEquipmentType({ equipment, slug, name });
  const patternGroup = inferPatternGroup({
    slug,
    name,
    muscle,
    secondaryMuscles,
    movementType: resolvedMovementType,
  });
  const priorityByFocus = buildPriorityByFocus(
    {
      muscle,
      secondaryMuscles,
    },
    resolvedMovementType,
    difficultyScore
  );
  const resolvedEnglishName = englishName || englishNameByMediaKey[slug] || "";
  const resolvedInstructions = Array.isArray(instructions) && instructions.length
    ? instructions
    : buildInstructions(description, tips);
  const resolvedDuration = duration || getExerciseDuration(resolvedMovementType, resolvedLevel);
  const mediaExtension = slug === "prensa-unilateral" ? "png" : slug === "russian-twist" ? "webp" : "gif";

  return {
    id: slug,
    mediaKey: slug,
    name,
    englishName: resolvedEnglishName || name,
    muscle,
    secondaryMuscles,
    type: resolvedType,
    level: resolvedLevel,
    difficulty: resolvedDifficulty,
    goal: resolvedGoals[0],
    goals: resolvedGoals,
    movementType: resolvedMovementType,
    equipmentType,
    patternGroup,
    difficultyScore,
    priorityByFocus,
    equipment,
    instructions: resolvedInstructions,
    duration: resolvedDuration,
    gif: `/exercises/${slug}.${mediaExtension}`,
    image: `/exercises/${slug}.${mediaExtension}`,
    description,
    tips,
    mistakes,
    sets: resolvedSetsByLevel[resolvedLevel] || LEVEL_SETS.Intermedio,
    reps: resolvedRepsByGoal[resolvedGoals[0]] || GOAL_REPS["Ganar músculo"],
    rest: resolvedRestByGoal[resolvedGoals[0]] || GOAL_REST["Ganar músculo"],
    setsByLevel: resolvedSetsByLevel,
    repsByGoal: resolvedRepsByGoal,
    restByGoal: resolvedRestByGoal,
    estimatedCalories:
      estimatedCalories || getEstimatedCalories(resolvedLevel, resolvedMovementType),
  };
}

function normalizeLevel(level) {
  if (WORKOUT_LEVELS.includes(level)) return level;
  return "Intermedio";
}

function inferMovementType(exercise) {
  const token = normalizeExerciseToken(`${exercise.slug || exercise.id} ${exercise.name}`);

  if (
    token.includes("plancha") ||
    token.includes("crunch") ||
    token.includes("abdomen") ||
    token.includes("elevacion-piernas") ||
    token.includes("dead bug") ||
    token.includes("pallof") ||
    token.includes("rueda abdominal")
  ) {
    return "core";
  }

  if (
    token.includes("caminata") ||
    token.includes("bike") ||
    token.includes("cardio") ||
    token.includes("jump") ||
    token.includes("burpee")
  ) {
    return "cardio";
  }

  if (
    token.includes("movilidad") ||
    token.includes("warmup") ||
    token.includes("estir") ||
    token.includes("stretch")
  ) {
    return "mobility";
  }

  if (
    token.includes("curl") ||
    token.includes("extension") ||
    token.includes("elevaciones") ||
    token.includes("face pull") ||
    token.includes("aperturas") ||
    token.includes("abduccion") ||
    token.includes("patada") ||
    token.includes("pull-through") ||
    token.includes("fly")
  ) {
    return "isolation";
  }

  if (
    token.includes("prensa") ||
    token.includes("sentadilla") ||
    token.includes("press") ||
    token.includes("dominadas") ||
    token.includes("remo") ||
    token.includes("peso muerto") ||
    token.includes("jalon") ||
    token.includes("hip thrust") ||
    token.includes("zancada") ||
    token.includes("fondos")
  ) {
    return "compound";
  }

  if (["Glúteos", "Piernas"].includes(exercise.muscle)) {
    return "accessory";
  }

  return "accessory";
}

function getExerciseType(movementType) {
  if (movementType === "core") return "core";
  if (movementType === "cardio") return "cardio";
  if (movementType === "mobility") return "mobility";
  return "strength";
}

function getExerciseDuration(movementType, level) {
  const durationByMovement = {
    compound: "6-10 min",
    accessory: "4-6 min",
    isolation: "3-5 min",
    core: "2-4 min",
    cardio: "8-15 min",
    mobility: "3-6 min",
  };

  const durationByLevel = {
    Principiante: durationByMovement.accessory,
    Intermedio: durationByMovement[movementType] || "4-6 min",
    Avanzado: durationByMovement[movementType] || "5-8 min",
  };

  return durationByLevel[level] || durationByMovement[movementType] || "4-6 min";
}

function buildInstructions(description, tips = []) {
  const base = [];

  if (description) base.push(description);
  if (Array.isArray(tips)) base.push(...tips);

  return Array.from(new Set(base.filter(Boolean)));
}

function inferDifficultyScore(exercise, movementType) {
  const levelScore = {
    Principiante: 2,
    Intermedio: 3,
    Avanzado: 4,
  }[exercise.level || "Intermedio"] || 2;

  const movementAdjust = {
    compound: 1,
    accessory: 0,
    isolation: -1,
    core: -1,
    cardio: -1,
    mobility: -2,
  }[movementType] ?? 0;

  return clampScore(levelScore + movementAdjust);
}

function buildPriorityByFocus(exercise, movementType, difficultyScore) {
  const primary = normalizeExerciseToken(exercise.muscle);
  const secondary = (exercise.secondaryMuscles || []).map(normalizeExerciseToken);
  const hasGlute = primary.includes("glut") || secondary.some((item) => item.includes("glut"));
  const hasUpper = ["pecho", "espalda", "hombro", "biceps", "triceps"].some((group) =>
    primary.includes(group) || secondary.some((item) => item.includes(group))
  );
  const hasCore = primary.includes("abdomen") || secondary.some((item) => item.includes("abdomen"));
  const strengthBias = movementType === "compound" ? 5 : movementType === "accessory" ? 3 : 2;

  return {
    General: clampScore(
      movementType === "compound" ? 5 : movementType === "accessory" ? 4 : 3
    ),
    "Glúteos y piernas": clampScore(hasGlute ? 5 : primary.includes("piernas") ? 4 : 2),
    "Torso y brazos": clampScore(hasUpper ? 5 : primary.includes("abdomen") ? 2 : 1),
    "Core/abdomen": clampScore(hasCore ? 5 : movementType === "core" ? 5 : 1),
    "Fuerza completa": clampScore(Math.max(strengthBias, difficultyScore + 1)),
  };
}

function inferEquipmentType(exercise) {
  const token = normalizeExerciseToken(
    [exercise?.equipment, exercise?.slug, exercise?.name].filter(Boolean).join(" ")
  );

  if (token.includes("kettlebell") || token.includes("pesa rusa")) return "kettlebell";
  if (
    token.includes("cardio") ||
    token.includes("bike") ||
    token.includes("treadmill") ||
    token.includes("running") ||
    token.includes("jump rope")
  ) {
    return "cardio";
  }
  if (
    token.includes("movilidad") ||
    token.includes("stretch") ||
    token.includes("estir") ||
    token.includes("warmup")
  ) {
    return "mobility";
  }
  if (token.includes("barra") || token.includes("barbell") || token.includes("z")) return "barbell";
  if (token.includes("mancuerna") || token.includes("dumbbell")) return "dumbbell";
  if (token.includes("polea") || token.includes("cable")) return "cable";
  if (
    token.includes("máquina") ||
    token.includes("maquina") ||
    token.includes("machine") ||
    token.includes("sled")
  ) {
    return "machine";
  }
  if (token.includes("banda") || token.includes("band")) return "band";
  if (
    token.includes("peso corporal") ||
    token.includes("body weight") ||
    token.includes("corporal") ||
    token.includes("paralelas") ||
    token.includes("barra fija") ||
    token.includes("predicador") ||
    token.includes("banco")
  ) {
    return "bodyweight";
  }

  return "bodyweight";
}

function inferPatternGroup({ slug, name, muscle, secondaryMuscles = [], movementType }) {
  const token = normalizeExerciseToken(`${slug} ${name}`);
  const muscleToken = normalizeExerciseToken(muscle);
  const secondaryToken = secondaryMuscles.map(normalizeExerciseToken).join(" ");
  const fullToken = `${token} ${muscleToken} ${secondaryToken}`;

  if (movementType === "core") return "core";
  if (movementType === "cardio") return "cardio";
  if (movementType === "mobility") return "mobility";
  if (fullToken.includes("hip thrust") || fullToken.includes("abduccion") || muscleToken.includes("glut")) {
    return "glute";
  }
  if (fullToken.includes("sentadilla") || fullToken.includes("prensa") || fullToken.includes("zancada")) {
    return "squat";
  }
  if (fullToken.includes("peso muerto") || fullToken.includes("rumano") || fullToken.includes("pull-through")) {
    return "hinge";
  }
  if (fullToken.includes("press") || fullToken.includes("flexiones") || fullToken.includes("fondos")) {
    return "push";
  }
  if (fullToken.includes("remo") || fullToken.includes("dominadas") || fullToken.includes("jalon") || fullToken.includes("pull")) {
    return "pull";
  }
  if (fullToken.includes("curl")) return "arms";
  if (fullToken.includes("extension") || muscleToken.includes("triceps")) return "arms";

  return movementType || "accessory";
}

function getEstimatedCalories(level, movementType) {
  const levelBase = {
    Principiante: 55,
    Intermedio: 75,
    Avanzado: 95,
  }[level] || 75;

  return Math.round(levelBase * (MOVEMENT_CALORIES[movementType] || 1));
}

function clampScore(value) {
  return Math.max(1, Math.min(5, value));
}

function normalizeExerciseToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const chest = [
  createExercise({
    slug: "press-banca",
    mediaKey: "press-banca",
    name: "Press banca",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    difficulty: "Intermedio",
    equipment: "Barra y banco",
    description: "Básico horizontal para construir fuerza y masa de pecho.",
    tips: ["Escápulas retraídas", "Pies firmes", "Baja controlado"],
    mistakes: ["Rebotar la barra", "Abrir codos", "Perder tensión"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "press-inclinado-mancuernas",
    mediaKey: "press-inclinado-mancuernas",
    name: "Press inclinado mancuerna",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    difficulty: "Intermedio",
    equipment: "Mancuernas y banco",
    description: "Enfoca la parte superior del pecho con recorrido más libre.",
    tips: ["Banco 25-35°", "Mancuernas al pecho alto", "Subida limpia"],
    mistakes: ["Inclinación excesiva", "Recorrido corto", "Arquear lumbar"],
  }),
  createExercise({
    slug: "aperturas-cable",
    name: "Aperturas en cable",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros"],
    difficulty: "Avanzado",
    equipment: "Poleas",
    description: "Aislamiento con tensión constante para terminar el pecho.",
    tips: ["Codos suaves", "Pecho arriba", "Cruza ligeramente"],
    mistakes: ["Convertirlo en press", "Demasiado peso", "Cerrar hombros"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "flexiones",
    name: "Flexiones",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros", "Abdomen"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    description: "Empuje básico para dominar control corporal y técnica.",
    tips: ["Cuerpo en bloque", "Manos bajo hombros", "Empuja el suelo"],
    mistakes: ["Hundir cadera", "Recortar recorrido", "Subir cabeza"],
    level: "Principiante",
  }),
  createExercise({
    slug: "fondos-pecho",
    name: "Fondos en paralelas",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    difficulty: "Avanzado",
    equipment: "Paralelas",
    description: "Básico pesado para pecho inferior y tríceps.",
    tips: ["Inclinación leve", "Baja estable", "Sube sin impulso"],
    mistakes: ["Bajar demasiado", "Balanceo", "Cerrar codos"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "press-declinado-mancuernas",
    name: "Press declinado mancuerna",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    difficulty: "Intermedio",
    equipment: "Mancuernas y banco",
    description: "Variante de empuje para enfatizar el pecho inferior.",
    tips: ["Muñecas rectas", "Bajada controlada", "Empuja al centro"],
    mistakes: ["Recortar abajo", "Codos abiertos", "Perder escápulas"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "press-banca-mancuernas",
    name: "Press banca con mancuernas",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    difficulty: "Intermedio",
    equipment: "Mancuernas y banco",
    movementType: "compound",
    description: "Variante estable para cargar el pecho con recorrido más libre.",
    tips: ["Baja controlado", "Mantén escápulas juntas", "Sube sin chocar mancuernas"],
    mistakes: ["Abrir codos", "Rebotar abajo", "Perder tensión"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "press-inclinado-barra",
    name: "Press inclinado con barra",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    difficulty: "Intermedio",
    equipment: "Barra y banco inclinado",
    movementType: "compound",
    description: "Empuje inclinado para enfatizar la porción superior del pecho.",
    tips: ["Banco 25-35°", "Pies firmes", "Empuja en línea limpia"],
    mistakes: ["Inclinar demasiado", "Recortar recorrido", "Arquear lumbar"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "aperturas-mancuernas",
    name: "Aperturas con mancuernas",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros"],
    difficulty: "Principiante",
    equipment: "Mancuernas y banco",
    movementType: "isolation",
    description: "Aislamiento simple para sentir el pecho en todo el recorrido.",
    tips: ["Codos suaves", "Pecho arriba", "Baja lento"],
    mistakes: ["Convertirlo en press", "Bajar demasiado", "Cerrar hombros"],
    level: "Principiante",
  }),
  createExercise({
    slug: "press-suelo-mancuernas",
    name: "Press de suelo con mancuernas",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps"],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    movementType: "compound",
    description: "Empuje corto y controlado para pecho y tríceps con menos estrés de hombro.",
    tips: ["Antebrazos verticales", "Toca suave el suelo", "Sube estable"],
    mistakes: ["Rebotar", "Abrir demasiado codos", "Perder control"],
    level: "Principiante",
  }),
  createExercise({
    slug: "flexiones-declive",
    name: "Flexiones declinadas",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    difficulty: "Intermedio",
    equipment: "Peso corporal",
    movementType: "compound",
    description: "Variante con pies elevados para cargar más la parte superior del pecho.",
    tips: ["Cuerpo en bloque", "Baja completo", "Empuja fuerte"],
    mistakes: ["Hundir cadera", "Acortar recorrido", "Elevar cabeza"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "press-maquina-pecho",
    name: "Press de pecho en máquina",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    difficulty: "Principiante",
    equipment: "Máquina",
    movementType: "compound",
    description: "Opción guiada para acumular volumen con estabilidad.",
    tips: ["Escápulas apoyadas", "Recorrido completo", "Empuja sin bloquear"],
    mistakes: ["Recortar abajo", "Soltar la tensión", "Ajuste incorrecto"],
    level: "Principiante",
  }),
  createExercise({
    slug: "aperturas-polea-alta",
    name: "Aperturas en polea alta",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros"],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "isolation",
    description: "Cruce alto para aislar pecho con tensión continua.",
    tips: ["Codos fijos", "Cruza al frente", "Controla el regreso"],
    mistakes: ["Demasiado peso", "Flexionar codos de más", "Perder postura"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "press-con-bandas",
    name: "Press con bandas",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    difficulty: "Principiante",
    equipment: "Bandas",
    movementType: "compound",
    description: "Empuje con resistencia variable para trabajar técnica y velocidad.",
    tips: ["Tensa desde abajo", "Mantén el tronco firme", "Subida explosiva"],
    mistakes: ["Banda floja", "Perder postura", "Recortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "press-unilateral-polea",
    name: "Press unilateral en polea",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    difficulty: "Avanzado",
    equipment: "Polea",
    movementType: "compound",
    description: "Empuje unilateral para mejorar control, simetría y estabilidad.",
    tips: ["Torso quieto", "Empuja al centro", "Resiste rotación"],
    mistakes: ["Girar el cuerpo", "Usar impulso", "Perder rango"],
    level: "Avanzado",
  }),
];

const back = [
  createExercise({
    slug: "dominadas",
    name: "Dominadas",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Abdomen"],
    difficulty: "Avanzado",
    equipment: "Barra fija",
    description: "Tracción vertical clave para dorsales y fuerza relativa.",
    tips: ["Deprime escápulas", "Pecho hacia la barra", "Sin balanceo"],
    mistakes: ["Tirar solo con brazos", "No extender abajo", "Impulso"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "jalon-pecho",
    mediaKey: "jalon-al-pecho",
    name: "Jalón al pecho",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    difficulty: "Principiante",
    equipment: "Polea alta",
    description: "Alternativa estable para aprender a traccionar dorsales.",
    tips: ["Codos abajo", "Pecho abierto", "Subida controlada"],
    mistakes: ["Tras nuca", "Encoger hombros", "Balancear torso"],
    level: "Principiante",
  }),
  createExercise({
    slug: "remo-barra",
    name: "Remo con barra",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Hombros"],
    difficulty: "Intermedio",
    equipment: "Barra",
    description: "Tracción horizontal pesada para grosor de espalda.",
    tips: ["Bisagra sólida", "Tira al abdomen", "Pausa arriba"],
    mistakes: ["Redondear espalda", "Tirar con lumbar", "Acortar recorrido"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "remo-sentado",
    mediaKey: "remo-sentado",
    name: "Remo sentado",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    difficulty: "Principiante",
    equipment: "Polea baja",
    description: "Remo estable para espalda media con bajo coste técnico.",
    tips: ["Torso estable", "Codos atrás", "Aprieta escápulas"],
    mistakes: ["Balancear cuerpo", "Encoger hombros", "Soltar de golpe"],
    level: "Principiante",
  }),
  createExercise({
    slug: "pullover-polea",
    name: "Pullover en polea",
    muscle: "Espalda",
    secondaryMuscles: ["Pecho"],
    difficulty: "Intermedio",
    equipment: "Polea alta",
    description: "Aísla dorsales y mejora la conexión muscular.",
    tips: ["Codos fijos", "Cadera estable", "Tensión continua"],
    mistakes: ["Doblar demasiado codos", "Perder postura", "Usar impulso"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "face-pull",
    name: "Face pull",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    difficulty: "Principiante",
    equipment: "Polea",
    description: "Trabajo de salud escapular y deltoide posterior.",
    tips: ["Tira a la cara", "Codos altos", "Pausa atrás"],
    mistakes: ["Arquear lumbar", "Tirar al pecho", "Perder control"],
    level: "Principiante",
  }),
  createExercise({
    slug: "jalon-agarre-cerrado",
    name: "Jalón con agarre cerrado",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    difficulty: "Principiante",
    equipment: "Polea",
    movementType: "compound",
    description: "Tracción estable para dorsales con un agarre más cómodo.",
    tips: ["Codos abajo", "Pecho abierto", "Sube controlado"],
    mistakes: ["Tirar tras nuca", "Encoger hombros", "Balancear torso"],
    level: "Principiante",
  }),
  createExercise({
    slug: "remo-unilateral-mancuerna",
    name: "Remo unilateral con mancuerna",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    difficulty: "Intermedio",
    equipment: "Mancuerna y banco",
    movementType: "compound",
    description: "Remo a una mano para corregir asimetrías y ganar grosor.",
    tips: ["Espalda neutra", "Tira al bolsillo", "Pausa arriba"],
    mistakes: ["Girar el tronco", "Jalar con impulso", "Acortar recorrido"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "remo-t-bar",
    name: "Remo T-bar",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Hombros"],
    difficulty: "Avanzado",
    equipment: "Barra",
    movementType: "compound",
    description: "Tracción pesada para densidad de espalda media y alta.",
    tips: ["Bisagra firme", "Tira al ombligo", "Pausa arriba"],
    mistakes: ["Redondear lumbar", "Rebote", "Perder el core"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "pulldown-brazos-rectos",
    name: "Pulldown con brazos rectos",
    muscle: "Espalda",
    secondaryMuscles: ["Hombros"],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "isolation",
    description: "Aislamiento de dorsales con codos extendidos y tensión continua.",
    tips: ["Codos casi fijos", "Costillas abajo", "Controla la vuelta"],
    mistakes: ["Doblar demasiado codos", "Arqueo lumbar", "Balanceo"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "dominadas-asistidas-banda",
    name: "Dominadas asistidas con banda",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Abdomen"],
    difficulty: "Principiante",
    equipment: "Banda",
    movementType: "compound",
    description: "Versión asistida para progresar hacia dominadas completas.",
    tips: ["Activa escápulas", "Pecho hacia arriba", "Sin balanceo"],
    mistakes: ["Tirar solo con brazos", "Recorrido corto", "Impulso"],
    level: "Principiante",
  }),
  createExercise({
    slug: "remo-pendlay",
    name: "Remo Pendlay",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Hombros"],
    difficulty: "Avanzado",
    equipment: "Barra",
    movementType: "compound",
    description: "Remo explosivo desde el suelo para fuerza y potencia.",
    tips: ["Torso paralelo", "Toca el suelo", "Tira explosivo"],
    mistakes: ["Redondear", "Usar impulso", "No resetear abajo"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "remo-pecho-soportado",
    name: "Remo con pecho apoyado",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    difficulty: "Principiante",
    equipment: "Máquina",
    movementType: "compound",
    description: "Remo guiado que reduce el estrés lumbar y mejora el aislamiento.",
    tips: ["Pecho apoyado", "Aprieta escápulas", "Suelta lento"],
    mistakes: ["Tirar con cuello", "Acortar recorrido", "Balancear cuerpo"],
    level: "Principiante",
  }),
  createExercise({
    slug: "pullover-mancuerna",
    name: "Pullover con mancuerna",
    muscle: "Espalda",
    secondaryMuscles: ["Pecho"],
    difficulty: "Intermedio",
    equipment: "Mancuerna y banco",
    movementType: "isolation",
    description: "Trabajo de dorsales y caja torácica con recorrido amplio.",
    tips: ["Codos suaves", "Abre el pecho", "Baja controlado"],
    mistakes: ["Doblar demasiado codos", "Arquear lumbar", "Perder el control"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "jalon-agarre-amplio",
    name: "Jalón con agarre amplio",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "compound",
    description: "Variante amplia para enfatizar dorsales y espalda alta.",
    tips: ["Codos hacia abajo", "Pecho alto", "Controla la subida"],
    mistakes: ["Tras nuca", "Encoger hombros", "Balanceo"],
    level: "Intermedio",
  }),
];

const legs = [
  createExercise({
    slug: "sentadilla",
    mediaKey: "sentadilla",
    name: "Sentadilla",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Abdomen"],
    difficulty: "Intermedio",
    equipment: "Barra",
    description: "Básico de tren inferior para fuerza y masa global.",
    tips: ["Brace abdominal", "Rodillas siguen pies", "Peso centrado"],
    mistakes: ["Rodillas colapsan", "Talones arriba", "Lumbar neutra rota"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "prensa-piernas",
    name: "Prensa de piernas",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Principiante",
    equipment: "Máquina",
    description: "Acumula volumen de piernas con control y estabilidad.",
    tips: ["Pies firmes", "No bloquees rodillas", "Bajada cómoda"],
    mistakes: ["Despegar cadera", "Juntar rodillas", "Bajar sin control"],
    level: "Principiante",
  }),
  createExercise({
    slug: "peso-muerto-rumano",
    mediaKey: "peso-muerto-rumano",
    name: "Peso muerto rumano",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Espalda"],
    difficulty: "Intermedio",
    equipment: "Barra o mancuernas",
    description: "Bisagra de cadera para femoral y cadena posterior.",
    tips: ["Cadera atrás", "Barra cerca", "Espalda larga"],
    mistakes: ["Rodillas muy flexionadas", "Redondear espalda", "Alejar carga"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "zancadas",
    mediaKey: "zancadas",
    name: "Zancadas",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Principiante",
    equipment: "Mancuernas o peso corporal",
    description: "Unilateral para piernas y estabilidad.",
    tips: ["Paso estable", "Torso alto", "Empuja con pierna delantera"],
    mistakes: ["Rodilla colapsa", "Paso corto", "Perder equilibrio"],
    level: "Principiante",
  }),
  createExercise({
    slug: "extensiones-cuadriceps",
    name: "Extensión de cuádriceps",
    muscle: "Piernas",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Máquina",
    description: "Aislamiento simple para terminar cuádriceps.",
    tips: ["Sube fuerte", "Pausa arriba", "Baja lento"],
    mistakes: ["Balanceo", "Bloquear de golpe", "Recorrido corto"],
    level: "Principiante",
  }),
  createExercise({
    slug: "curl-femoral",
    name: "Curl femoral",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Principiante",
    equipment: "Máquina",
    description: "Aislamiento de femoral con control y tensión continua.",
    tips: ["Cadera quieta", "Aprieta atrás", "Bajada controlada"],
    mistakes: ["Impulso", "Cadera despega", "Recortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "sentadilla-frontal",
    name: "Sentadilla frontal",
    muscle: "Piernas",
    secondaryMuscles: ["Abdomen", "Glúteos"],
    difficulty: "Avanzado",
    equipment: "Barra",
    movementType: "compound",
    description: "Sentadilla con más demanda de cuádriceps y torso erguido.",
    tips: ["Codos altos", "Torso vertical", "Brace fuerte"],
    mistakes: ["Codo cae", "Talones despegan", "Lumbar redonda"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "hack-squat",
    name: "Hack squat",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Intermedio",
    equipment: "Máquina",
    movementType: "compound",
    description: "Máquina guiada para sobrecargar piernas con menos demanda técnica.",
    tips: ["Pies firmes", "Baja controlado", "Empuja completo"],
    mistakes: ["Rodillas colapsan", "Bajar sin control", "Despegar cadera"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "prensa-unilateral",
    name: "Prensa unilateral",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Intermedio",
    equipment: "Máquina",
    movementType: "compound",
    description: "Variante unilateral para corregir desequilibrios de piernas.",
    tips: ["Controla la bajada", "Rodilla sigue al pie", "No bloquees"],
    mistakes: ["Mover cadera", "Recortar recorrido", "Empujar de rebote"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "step-up",
    name: "Step-up",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Principiante",
    equipment: "Mancuernas o peso corporal",
    movementType: "compound",
    description: "Subida al cajón para fuerza unilateral y estabilidad.",
    tips: ["Apoya todo el pie", "Empuja con la pierna de arriba", "Torso alto"],
    mistakes: ["Impulso de pierna de abajo", "Bajar sin control", "Colapsar rodilla"],
    level: "Principiante",
  }),
  createExercise({
    slug: "peso-muerto-piernas-rigidas",
    name: "Peso muerto con piernas rígidas",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Espalda"],
    difficulty: "Intermedio",
    equipment: "Barra",
    movementType: "compound",
    description: "Bisagra enfocada en femoral y cadena posterior.",
    tips: ["Cadera atrás", "Barra cerca", "Espalda larga"],
    mistakes: ["Rodillas muy flexionadas", "Redondear", "Alejar la carga"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "buenos-dias",
    name: "Buenos días",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Espalda"],
    difficulty: "Avanzado",
    equipment: "Barra",
    movementType: "compound",
    description: "Bisagra avanzada para femoral, glúteo y control del tronco.",
    tips: ["Espalda neutra", "Cadera atrás", "Carga moderada"],
    mistakes: ["Redondear lumbar", "Bajar de más", "Movimiento brusco"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "sentadilla-bulgara",
    name: "Sentadilla búlgara",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Intermedio",
    equipment: "Mancuernas",
    movementType: "compound",
    description: "Unilateral exigente para cuádriceps y estabilidad.",
    tips: ["Paso estable", "Baja vertical", "Rodilla sigue al pie"],
    mistakes: ["Inclinarte demasiado", "Apoyarte atrás", "Recortar rango"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-femoral-sentado",
    name: "Curl femoral sentado",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Intermedio",
    equipment: "Máquina",
    movementType: "isolation",
    description: "Aislamiento de femoral con mejor rango en posición sentada.",
    tips: ["Aprieta atrás", "Controla el retorno", "No despegar cadera"],
    mistakes: ["Rebote", "Recortar recorrido", "Impulso"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "sentadilla-goblet",
    name: "Sentadilla goblet",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Abdomen"],
    difficulty: "Principiante",
    equipment: "Mancuerna o kettlebell",
    movementType: "compound",
    description: "Sentadilla accesible para aprender técnica y profundidad.",
    tips: ["Pecho alto", "Talones firmes", "Rodillas acompañan"],
    mistakes: ["Pies colapsan", "Redondear", "Recortar profundidad"],
    level: "Principiante",
  }),
];

const glutes = [
  createExercise({
    slug: "hip-thrust",
    mediaKey: "hip-thrust",
    name: "Hip thrust",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Intermedio",
    equipment: "Barra y banco",
    description: "Principal para tensión de glúteo con extensión de cadera.",
    tips: ["Pausa arriba", "Talones firmes", "Costillas abajo"],
    mistakes: ["Hiperextender lumbar", "Pies lejos", "Subir sin bloquear"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "patada-gluteo",
    name: "Patada de glúteo",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Polea o banda",
    description: "Aislamiento de glúteo para acabar la sesión con control.",
    tips: ["Pelvis estable", "Pausa final", "Recorrido limpio"],
    mistakes: ["Girar cadera", "Arquear lumbar", "Lanzar la pierna"],
    level: "Principiante",
  }),
  createExercise({
    slug: "abduccion-cadera",
    name: "Abducción de cadera",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Máquina o banda",
    description: "Trabaja glúteo medio para estabilidad y forma.",
    tips: ["Pausa abierto", "Sin rebotes", "Controla el cierre"],
    mistakes: ["Usar impulso", "Inclinarte", "Recorrido mínimo"],
    level: "Principiante",
  }),
  createExercise({
    slug: "sentadilla-sumo",
    name: "Sentadilla sumo",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Intermedio",
    equipment: "Mancuernas o barra",
    description: "Variante amplia para glúteos y aductores.",
    tips: ["Pies abiertos", "Rodillas fuera", "Pecho arriba"],
    mistakes: ["Pies demasiado cerrados", "Redondear", "Rebote abajo"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "puente-gluteo",
    name: "Puente de glúteo",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Peso corporal o barra",
    description: "Movimiento simple para activar y cargar glúteos.",
    tips: ["Aprieta arriba", "Talones al suelo", "Pelvis neutra"],
    mistakes: ["Arqueo lumbar", "Subir con impulso", "Pies lejos"],
    level: "Principiante",
  }),
  createExercise({
    slug: "pull-through",
    name: "Pull-through",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas", "Espalda"],
    difficulty: "Intermedio",
    equipment: "Polea",
    description: "Bisagra de cadera para glúteos con sensación continua.",
    tips: ["Cadera atrás", "Tensión continua", "Aprieta al final"],
    mistakes: ["Sentarte demasiado", "Redondear", "Balancear"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "hip-thrust-unilateral",
    name: "Hip thrust unilateral",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Intermedio",
    equipment: "Mancuerna",
    movementType: "compound",
    description: "Variante unilateral para potenciar glúteo y estabilidad pélvica.",
    tips: ["Pausa arriba", "Pelvis neutra", "Empuja con el talón"],
    mistakes: ["Arquear lumbar", "Pies lejos", "Perder control"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "puente-gluteo-mancuerna",
    name: "Puente de glúteo con mancuerna",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Mancuerna",
    movementType: "compound",
    description: "Puente accesible para cargar glúteos con más resistencia.",
    tips: ["Aprieta arriba", "Talones al suelo", "Costillas abajo"],
    mistakes: ["Subir con la espalda", "Mover pies", "Rebotar"],
    level: "Principiante",
  }),
  createExercise({
    slug: "step-up-alto",
    name: "Step-up alto",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Intermedio",
    equipment: "Mancuernas",
    movementType: "compound",
    description: "Subida alta para enfatizar glúteo y control unilateral.",
    tips: ["Banco estable", "Empuja con la pierna de arriba", "Torso firme"],
    mistakes: ["Impulso", "Rodilla colapsa", "Bajar sin control"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "sentadilla-bulgara-gluteo",
    name: "Sentadilla búlgara para glúteo",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Intermedio",
    equipment: "Mancuernas",
    movementType: "compound",
    description: "Sesgo de glúteo en la búlgara con zancada más larga.",
    tips: ["Paso largo", "Torso ligeramente inclinado", "Baja controlado"],
    mistakes: ["Paso corto", "Perder estabilidad", "Rebotar abajo"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "peso-muerto-una-pierna",
    name: "Peso muerto a una pierna",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas", "Espalda"],
    difficulty: "Intermedio",
    equipment: "Mancuerna",
    movementType: "compound",
    description: "Bisagra unilateral para glúteo, equilibrio y cadena posterior.",
    tips: ["Cadera cuadrada", "Mira al suelo", "Barra o mancuerna cerca"],
    mistakes: ["Girar pelvis", "Redondear", "Romper equilibrio"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "patada-gluteo-polea",
    name: "Patada de glúteo en polea",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Polea",
    movementType: "isolation",
    description: "Aislamiento con tensión continua para terminar glúteos.",
    tips: ["Pelvis estable", "Aprieta arriba", "No arquees lumbar"],
    mistakes: ["Impulso", "Girar cadera", "Acortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "abduccion-cadera-polea",
    name: "Abducción de cadera en polea",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Polea",
    movementType: "isolation",
    description: "Trabajo preciso de glúteo medio para estabilidad de cadera.",
    tips: ["Mantén el tronco quieto", "Pausa al abrir", "Vuelve lento"],
    mistakes: ["Balancearte", "Compensar con lumbar", "Recorrido corto"],
    level: "Principiante",
  }),
  createExercise({
    slug: "puente-gluteo-banda",
    name: "Puente de glúteo con banda",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    difficulty: "Principiante",
    equipment: "Banda",
    movementType: "accessory",
    description: "Activación y volumen con resistencia elástica constante.",
    tips: ["Empuja hacia afuera", "Aprieta arriba", "Mantén tensión"],
    mistakes: ["Rodillas se juntan", "Rebotar", "Perder pelvis neutra"],
    level: "Principiante",
  }),
  createExercise({
    slug: "swing-kettlebell",
    name: "Swing con kettlebell",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas", "Espalda"],
    difficulty: "Intermedio",
    equipment: "Kettlebell",
    movementType: "compound",
    description: "Bisagra explosiva para glúteos, femoral y potencia.",
    tips: ["Cadera explosiva", "Espalda neutra", "No eleves con brazos"],
    mistakes: ["Sentadilla en lugar de bisagra", "Usar brazos", "Redondear"],
    level: "Intermedio",
  }),
];

const shoulders = [
  createExercise({
    slug: "press-militar",
    name: "Press militar",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps", "Abdomen"],
    difficulty: "Intermedio",
    equipment: "Barra o mancuernas",
    description: "Empuje vertical para deltoides y estabilidad del core.",
    tips: ["Glúteos activos", "Trayectoria vertical", "Costillas abajo"],
    mistakes: ["Arquear lumbar", "Empujar delante", "Rebote abajo"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "elevaciones-laterales",
    name: "Elevaciones laterales",
    muscle: "Hombros",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    description: "Aislamiento clave para deltoide lateral y amplitud visual.",
    tips: ["Codos suaves", "Sin impulso", "Bajada lenta"],
    mistakes: ["Trapecio activo", "Demasiado peso", "Balanceo"],
    level: "Principiante",
  }),
  createExercise({
    slug: "face-pull-hombro",
    name: "Face pull espalda alta",
    muscle: "Espalda",
    secondaryMuscles: ["Hombros"],
    difficulty: "Principiante",
    equipment: "Polea",
    description: "Variante orientada a espalda alta, trapecio medio y control escapular.",
    tips: ["Tira a la cara", "Codos altos", "Pausa atrás"],
    mistakes: ["Arquear lumbar", "Tirar al pecho", "Perder control"],
    level: "Principiante",
  }),
  createExercise({
    slug: "elevaciones-frontales",
    name: "Elevaciones frontales",
    muscle: "Hombros",
    secondaryMuscles: ["Pecho"],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    description: "Enfoque simple en deltoide anterior.",
    tips: ["Sube sin balanceo", "Controla la bajada", "Codos suaves"],
    mistakes: ["Demasiado impulso", "Subir muy alto", "Encoger hombros"],
    level: "Principiante",
  }),
  createExercise({
    slug: "pajaro-mancuernas",
    name: "Pájaro con mancuernas",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    difficulty: "Intermedio",
    equipment: "Mancuernas",
    description: "Aislamiento del deltoide posterior con control.",
    tips: ["Bisagra estable", "Apertura controlada", "No rebotes"],
    mistakes: ["Movimiento corto", "Trapecio arriba", "Impulso"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "arnold-press",
    name: "Arnold press",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps"],
    difficulty: "Intermedio",
    equipment: "Mancuernas",
    description: "Variante completa para hombro y coordinación.",
    tips: ["Gira suave", "Costillas abajo", "Subida controlada"],
    mistakes: ["Arqueo lumbar", "Velocidad excesiva", "Cerrar recorrido"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "press-hombro-maquina",
    name: "Press de hombro en máquina",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps"],
    difficulty: "Principiante",
    equipment: "Máquina",
    movementType: "compound",
    description: "Empuje guiado para hombros con estabilidad y recorrido limpio.",
    tips: ["Asiento bien ajustado", "Costillas abajo", "Empuja sin bloquear"],
    mistakes: ["Cerrar codos", "Arquear lumbar", "Bajar a medias"],
    level: "Principiante",
  }),
  createExercise({
    slug: "elevaciones-laterales-inclinadas",
    name: "Elevaciones laterales inclinadas",
    muscle: "Hombros",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Mancuernas y banco",
    movementType: "isolation",
    description: "Aíslan deltoide lateral con más tensión en la parte baja.",
    tips: ["Codos suaves", "Recorrido limpio", "Baja controlada"],
    mistakes: ["Impulso", "Trapecio dominante", "Subir de más"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "elevaciones-laterales-polea",
    name: "Elevaciones laterales en polea",
    muscle: "Hombros",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "isolation",
    description: "Tensión constante para el deltoide lateral y mejor conexión.",
    tips: ["Brazo estable", "Sin balanceo", "Pausa arriba"],
    mistakes: ["Demasiado peso", "Encoger hombros", "Soltar el cable"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "elevaciones-posteriores-polea",
    name: "Elevaciones posteriores en polea",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "isolation",
    description: "Trabajo específico del deltoide posterior con tensión constante.",
    tips: ["Codos altos", "Aprieta atrás", "No gires el torso"],
    mistakes: ["Jalar con espalda", "Balancearte", "Acortar recorrido"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "landmine-press",
    name: "Landmine press",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps"],
    difficulty: "Intermedio",
    equipment: "Barra",
    movementType: "compound",
    description: "Empuje en diagonal amable para hombros y estabilidad del tronco.",
    tips: ["Empuja al frente", "Costillas quietas", "Controla la bajada"],
    mistakes: ["Arquear lumbar", "Empujar con impulso", "Cerrar recorrido"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "pike-push-up",
    name: "Pike push-up",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps"],
    difficulty: "Avanzado",
    equipment: "Peso corporal",
    movementType: "compound",
    description: "Empuje vertical con peso corporal para hombros y tríceps.",
    tips: ["Cadera alta", "Cabeza entre manos", "Baja controlado"],
    mistakes: ["Codos muy abiertos", "Recortar recorrido", "Perder tensión"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "cuban-press",
    name: "Cuban press",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    difficulty: "Avanzado",
    equipment: "Mancuernas ligeras",
    movementType: "accessory",
    description: "Trabajo técnico para hombros con énfasis en estabilidad y control.",
    tips: ["Carga ligera", "Giro suave", "No aceleres"],
    mistakes: ["Demasiado peso", "Perder postura", "Compensar con lumbar"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "press-militar-sentado",
    name: "Press militar sentado",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps"],
    difficulty: "Intermedio",
    equipment: "Barra",
    movementType: "compound",
    description: "Empuje vertical sentado para reforzar hombros con más control.",
    tips: ["Torso erguido", "Barra alineada", "Baja estable"],
    mistakes: ["Arquear lumbar", "Bloquear brusco", "Pecho fuera de control"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "y-raise-mancuernas",
    name: "Y-raise con mancuernas",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    difficulty: "Principiante",
    equipment: "Mancuernas ligeras",
    movementType: "isolation",
    description: "Movimiento de control para deltoide y salud escapular.",
    tips: ["Peso ligero", "Recorrido corto", "Control total"],
    mistakes: ["Subir de más", "Trapecio dominante", "Impulso"],
    level: "Principiante",
  }),
];

const biceps = [
  createExercise({
    slug: "curl-mancuernas",
    mediaKey: "curl-biceps",
    name: "Curl de bíceps",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    description: "Flexión de codo básica con control y rango completo.",
    tips: ["Codos quietos", "Supina arriba", "Bajada lenta"],
    mistakes: ["Balancear espalda", "Subir hombros", "Recortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "curl-barra-z",
    name: "Curl con barra Z",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Barra Z",
    description: "Variante más estable para cargar bíceps con control.",
    tips: ["Muñecas neutras", "Codos pegados", "Sin balanceo"],
    mistakes: ["Impulso", "Apretar muñecas", "Recorrido corto"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-martillo",
    name: "Curl martillo",
    muscle: "Bíceps",
    secondaryMuscles: ["Antebrazo"],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    description: "Enfatiza braquial y antebrazo con agarre neutro.",
    tips: ["Agarre neutro", "Codos fijos", "Subida limpia"],
    mistakes: ["Muñeca rota", "Balanceo", "Romper recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "curl-inclinado",
    name: "Curl inclinado",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Banco inclinado y mancuernas",
    description: "Mayor estiramiento y tensión para bíceps largo.",
    tips: ["Banco estable", "Baja completo", "Subida sin impulso"],
    mistakes: ["Codo adelante", "Recorrido corto", "Muñecas rígidas"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-predicador",
    name: "Curl predicador",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Banco predicador",
    description: "Aísla bíceps con recorrido más estricto.",
    tips: ["Brazo apoyado", "Bajada lenta", "Control arriba"],
    mistakes: ["Subir con hombro", "Rebotar abajo", "Recortar extensión"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-concentrado",
    name: "Curl concentrado",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Mancuerna",
    description: "Aislamiento simple para terminar con sensación muscular.",
    tips: ["Codo fijo", "Squeeze arriba", "Bajada lenta"],
    mistakes: ["Balancear torso", "Acortar recorrido", "Subir rápido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "curl-polea-baja",
    name: "Curl en polea baja",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Polea",
    movementType: "isolation",
    description: "Curl con tensión continua y curva estable de resistencia.",
    tips: ["Codos fijos", "Aprieta arriba", "Baja lento"],
    mistakes: ["Balanceo", "Soltar tensión", "Recortar rango"],
    level: "Principiante",
  }),
  createExercise({
    slug: "spider-curl",
    name: "Spider curl",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Banco inclinado y mancuernas",
    movementType: "isolation",
    description: "Aislamiento estricto para aislar el bíceps y eliminar impulso.",
    tips: ["Pecho apoyado", "Bajada lenta", "Squeeze arriba"],
    mistakes: ["Mover hombros", "Impulso", "Recortar extensión"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-21",
    name: "Curl 21",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Barra Z",
    movementType: "isolation",
    description: "Serie clásica en tres rangos para gran estímulo metabólico.",
    tips: ["Controla cada bloque", "No acelera", "Mantén el core firme"],
    mistakes: ["Balanceo", "Romper el rango", "Usar demasiado peso"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "drag-curl",
    name: "Drag curl",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Barra",
    movementType: "isolation",
    description: "Curl con barra pegada al cuerpo para enfatizar bíceps.",
    tips: ["Barra pegada", "Codos atrás", "Subida suave"],
    mistakes: ["Alejar la barra", "Balancearte", "Subir con hombro"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-martillo-cruzado",
    name: "Curl martillo cruzado",
    muscle: "Bíceps",
    secondaryMuscles: ["Antebrazo"],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    movementType: "isolation",
    description: "Variante neutra para braquial y brazo completo.",
    tips: ["Agarre neutro", "Codo quieto", "Subida limpia"],
    mistakes: ["Rotar muñeca", "Balanceo", "Recortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "curl-bayesian",
    name: "Curl Bayesian",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "isolation",
    description: "Trabajo de bíceps con brazo detrás del cuerpo y gran estiramiento.",
    tips: ["Brazo atrás", "Pausa abajo", "Sube sin impulso"],
    mistakes: ["Mover hombro", "Recortar estiramiento", "Tirar con espalda"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-invertido",
    name: "Curl invertido",
    muscle: "Bíceps",
    secondaryMuscles: ["Antebrazo"],
    difficulty: "Intermedio",
    equipment: "Barra",
    movementType: "isolation",
    description: "Enfatiza braquial y antebrazo con agarre prono.",
    tips: ["Muñecas neutras", "Codos fijos", "Bajada controlada"],
    mistakes: ["Balanceo", "Romper muñeca", "Recortar rango"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "curl-alterno-supinacion",
    name: "Curl alterno con supinación",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Mancuernas",
    movementType: "isolation",
    description: "Curl alterno con giro para mejorar sensación y control.",
    tips: ["Gira arriba", "Codo quieto", "Baja lento"],
    mistakes: ["Balanceo", "Giro brusco", "Acortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "curl-predicador-maquina",
    name: "Curl predicador en máquina",
    muscle: "Bíceps",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Máquina",
    movementType: "isolation",
    description: "Aislamiento guiado para cargar bíceps con técnica estricta.",
    tips: ["Apoya el brazo", "Suelta lento", "Aprieta arriba"],
    mistakes: ["Rebote", "Mover hombro", "Recortar extensión"],
    level: "Intermedio",
  }),
];

const triceps = [
  createExercise({
    slug: "fondos-banco",
    name: "Fondos en banco",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    difficulty: "Principiante",
    equipment: "Banco",
    description: "Empuje simple para tríceps con peso corporal.",
    tips: ["Escápulas abajo", "Codos atrás", "Bajada controlada"],
    mistakes: ["Bajar demasiado", "Hombros adelante", "Impulso"],
    level: "Principiante",
  }),
  createExercise({
    slug: "extension-polea",
    mediaKey: "extension-triceps",
    name: "Extensión en polea",
    muscle: "Tríceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Polea",
    description: "Aislamiento estable para volumen de tríceps.",
    tips: ["Codos quietos", "Aprieta abajo", "Sube controlado"],
    mistakes: ["Mover hombros", "Recortar abajo", "Balanceo"],
    level: "Principiante",
  }),
  createExercise({
    slug: "press-frances",
    name: "Press francés",
    muscle: "Tríceps",
    secondaryMuscles: ["Hombros"],
    difficulty: "Intermedio",
    equipment: "Barra Z o mancuernas",
    description: "Extensión de tríceps con fuerte estímulo en la cabeza larga.",
    tips: ["Codos cerrados", "Bajada controlada", "Sin abrir pecho"],
    mistakes: ["Codos abiertos", "Mover el hombro", "Romper recorrido"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "patada-triceps",
    name: "Patada de tríceps",
    muscle: "Tríceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Mancuerna o polea",
    description: "Aislamiento simple para finalizar el brazo.",
    tips: ["Brazo fijo", "Extiende completo", "Pausa atrás"],
    mistakes: ["Balanceo", "Recortar extensión", "Codo suelto"],
    level: "Principiante",
  }),
  createExercise({
    slug: "press-cerrado",
    name: "Press cerrado",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    difficulty: "Intermedio",
    equipment: "Barra",
    description: "Empuje pesado con énfasis en tríceps.",
    tips: ["Agarre cerrado", "Codos cerca", "Bajada controlada"],
    mistakes: ["Abrir codos", "Rebotar barra", "Perder tensión"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "extension-cuerda",
    name: "Extensión con cuerda",
    muscle: "Tríceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Polea y cuerda",
    description: "Acabado limpio para tríceps con recorrido cómodo.",
    tips: ["Separa al final", "Codos fijos", "Controla la vuelta"],
    mistakes: ["Impulso", "Mover hombros", "Abrir demasiado"],
    level: "Principiante",
  }),
  createExercise({
    slug: "extension-por-encima-cabeza-mancuerna",
    name: "Extensión por encima de la cabeza con mancuerna",
    muscle: "Tríceps",
    secondaryMuscles: ["Hombros"],
    difficulty: "Intermedio",
    equipment: "Mancuerna",
    movementType: "isolation",
    description: "Ataca la cabeza larga del tríceps con gran estiramiento.",
    tips: ["Codos cerrados", "Baja lento", "Costillas quietas"],
    mistakes: ["Abrir codos", "Arquear lumbar", "Recortar rango"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "extension-por-encima-cabeza-polea",
    name: "Extensión por encima de la cabeza en polea",
    muscle: "Tríceps",
    secondaryMuscles: ["Hombros"],
    difficulty: "Intermedio",
    equipment: "Polea",
    movementType: "isolation",
    description: "Aislamiento con polea para mantener tensión continua.",
    tips: ["Codos fijos", "Aprieta al final", "Vuelve con control"],
    mistakes: ["Mover hombros", "Arqueo lumbar", "Soltar de golpe"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "pushdown-barra-recta",
    name: "Pushdown con barra recta",
    muscle: "Tríceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Polea",
    movementType: "isolation",
    description: "Variante clásica para volumen y control del tríceps.",
    tips: ["Codos pegados", "Aprieta abajo", "Sube lento"],
    mistakes: ["Balanceo", "Cerrar codos", "Recortar recorrido"],
    level: "Principiante",
  }),
  createExercise({
    slug: "press-jm",
    name: "Press JM",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    difficulty: "Avanzado",
    equipment: "Barra",
    movementType: "compound",
    description: "Cruce entre press y extensión para cargar mucho tríceps.",
    tips: ["Codos al frente", "Bajada controlada", "Agarre estable"],
    mistakes: ["Abrir codos", "Rebotar", "Perder control"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "extension-unilateral-polea",
    name: "Extensión unilateral en polea",
    muscle: "Tríceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Polea",
    movementType: "isolation",
    description: "Aislamiento unilateral para simetría y conexión muscular.",
    tips: ["Brazo fijo", "Extiende completo", "Pausa abajo"],
    mistakes: ["Impulso", "Mover hombro", "Recortar rango"],
    level: "Principiante",
  }),
  createExercise({
    slug: "fondos-paralelas-triceps",
    name: "Fondos en paralelas para tríceps",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    difficulty: "Avanzado",
    equipment: "Paralelas",
    movementType: "compound",
    description: "Empuje corporal pesado con mayor énfasis en tríceps.",
    tips: ["Torso más vertical", "Codos atrás", "Baja estable"],
    mistakes: ["Bajar demasiado", "Balancearte", "Abrir codos"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "press-banca-cerrado-smith",
    name: "Press banca cerrado en Smith",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    difficulty: "Intermedio",
    equipment: "Máquina Smith",
    movementType: "compound",
    description: "Empuje guiado para sobrecargar tríceps con control.",
    tips: ["Agarre estrecho", "Codos cerca", "Baja con control"],
    mistakes: ["Abrir codos", "Rebotar barra", "Perder tensión"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "extension-acostada-mancuernas",
    name: "Extensión acostada con mancuernas",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho"],
    difficulty: "Intermedio",
    equipment: "Mancuernas",
    movementType: "isolation",
    description: "Extensión acostada para aislar tríceps con recorrido libre.",
    tips: ["Codos apuntan al techo", "Baja controlado", "Sube sin balanceo"],
    mistakes: ["Abrir codos", "Romper el hombro", "Acortar rango"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "kickback-cruzado",
    name: "Kickback cruzado",
    muscle: "Tríceps",
    secondaryMuscles: [],
    difficulty: "Principiante",
    equipment: "Mancuerna",
    movementType: "isolation",
    description: "Finalizador simple para sentir el tríceps por completo.",
    tips: ["Brazo fijo", "Extiende al final", "Pausa corta"],
    mistakes: ["Balanceo", "Recortar extensión", "Mover hombro"],
    level: "Principiante",
  }),
];

const abs = [
  createExercise({
    slug: "plancha",
    name: "Plancha",
    muscle: "Abdomen",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    description: "Base de estabilidad del core y control lumbo-pélvico.",
    tips: ["Costillas abajo", "Glúteos activos", "Respira corto"],
    mistakes: ["Hundir lumbar", "Elevar cadera", "Aguantar sin respirar"],
    level: "Principiante",
  }),
  createExercise({
    slug: "crunch-cable",
    name: "Crunch en polea",
    muscle: "Abdomen",
    secondaryMuscles: [],
    difficulty: "Intermedio",
    equipment: "Polea",
    description: "Flexión resistida para hipertrofia abdominal.",
    tips: ["Cadera quieta", "Exhala abajo", "Vuelve lento"],
    mistakes: ["Tirar con brazos", "Mover cuello", "Sentarse atrás"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "elevacion-piernas",
    name: "Elevación de piernas",
    muscle: "Abdomen",
    secondaryMuscles: ["Piernas"],
    difficulty: "Avanzado",
    equipment: "Barra o banco",
    description: "Control avanzado de abdomen inferior y pelvis.",
    tips: ["Retroversión pélvica", "Sin balanceo", "Baja lento"],
    mistakes: ["Impulsarte", "Arquear lumbar", "Recortar arriba"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "dead-bug",
    name: "Dead bug",
    muscle: "Abdomen",
    secondaryMuscles: ["Espalda"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    description: "Core anti-extensión con control y coordinación.",
    tips: ["Lumbar pegada", "Movimiento lento", "Exhala al extender"],
    mistakes: ["Despegar lumbar", "Apurar", "Perder control"],
    level: "Principiante",
  }),
  createExercise({
    slug: "pallof-press",
    name: "Pallof press",
    muscle: "Abdomen",
    secondaryMuscles: ["Glúteos"],
    difficulty: "Intermedio",
    equipment: "Polea o banda",
    description: "Antirotación para un core sólido y funcional.",
    tips: ["Resiste giro", "Torso quieto", "Exhala al empujar"],
    mistakes: ["Balancearte", "Acortar extensión", "Cadera suelta"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "rueda-abdominal",
    name: "Rueda abdominal",
    muscle: "Abdomen",
    secondaryMuscles: ["Hombros"],
    difficulty: "Avanzado",
    equipment: "Rueda abdominal",
    description: "Desafío de anti-extensión para core y hombros.",
    tips: ["Costillas abajo", "Recorre corto al inicio", "Control total"],
    mistakes: ["Arquear lumbar", "Ir demasiado lejos", "Colapsar hombros"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "crunch-bicicleta",
    name: "Crunch bicicleta",
    muscle: "Abdomen",
    secondaryMuscles: ["Oblicuos"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Trabajo clásico de abdomen y oblicuos con rotación controlada.",
    tips: ["Exhala al cruzar", "Codo a rodilla sin tirar", "Controla el ritmo"],
    mistakes: ["Jalar cuello", "Ir demasiado rápido", "Perder la lumbar"],
    level: "Principiante",
  }),
  createExercise({
    slug: "hollow-hold",
    name: "Hollow hold",
    muscle: "Abdomen",
    secondaryMuscles: ["Hombros"],
    difficulty: "Intermedio",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Isometría de core para anti-extensión y control corporal.",
    tips: ["Lumbar pegada", "Costillas abajo", "Respira corto"],
    mistakes: ["Arquear lumbar", "Relajar abdomen", "Aguantar sin control"],
    level: "Intermedio",
  }),
  createExercise({
    slug: "russian-twist",
    name: "Russian twist",
    muscle: "Abdomen",
    secondaryMuscles: ["Oblicuos"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Rotación controlada para oblicuos y estabilidad del tronco.",
    tips: ["Torso firme", "Giro corto", "Mantén el abdomen activo"],
    mistakes: ["Girar solo brazos", "Ir rápido", "Perder postura"],
    level: "Principiante",
  }),
  createExercise({
    slug: "reverse-crunch",
    name: "Reverse crunch",
    muscle: "Abdomen",
    secondaryMuscles: ["Cadera"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Flexión de pelvis para enfatizar abdomen inferior.",
    tips: ["Sube la pelvis", "Baja lento", "No balancees"],
    mistakes: ["Impulso", "Arquear lumbar", "Recortar rango"],
    level: "Principiante",
  }),
  createExercise({
    slug: "mountain-climber-lento",
    name: "Mountain climber lento",
    muscle: "Abdomen",
    secondaryMuscles: ["Hombros", "Piernas"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Trabajo de core dinámico con foco en control y estabilidad.",
    tips: ["Cadera estable", "Rodillas al frente", "Ritmo constante"],
    mistakes: ["Bambolear cadera", "Ir demasiado rápido", "Perder apoyo"],
    level: "Principiante",
  }),
  createExercise({
    slug: "side-plank",
    name: "Plancha lateral",
    muscle: "Abdomen",
    secondaryMuscles: ["Hombros", "Glúteos"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Isometría para oblicuos y estabilidad lateral.",
    tips: ["Cadera alta", "Cuerpo en línea", "Respira corto"],
    mistakes: ["Cadera caída", "Rotar el tronco", "Sostener cuello"],
    level: "Principiante",
  }),
  createExercise({
    slug: "bird-dog",
    name: "Bird dog",
    muscle: "Abdomen",
    secondaryMuscles: ["Espalda", "Glúteos"],
    difficulty: "Principiante",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Ejercicio de control lumbar y coordinación cruzada.",
    tips: ["Lumbar neutra", "Movimiento lento", "Alarga brazos y piernas"],
    mistakes: ["Girar pelvis", "Ir rápido", "Perder control"],
    level: "Principiante",
  }),
  createExercise({
    slug: "hollow-rock",
    name: "Hollow rock",
    muscle: "Abdomen",
    secondaryMuscles: ["Hombros"],
    difficulty: "Avanzado",
    equipment: "Peso corporal",
    movementType: "core",
    description: "Versión dinámica del hollow hold para core avanzado.",
    tips: ["Mantén la forma", "Movimiento corto", "Tensión constante"],
    mistakes: ["Arquear lumbar", "Balancearte demasiado", "Perder control"],
    level: "Avanzado",
  }),
  createExercise({
    slug: "hanging-knee-raise",
    name: "Elevación de rodillas colgado",
    muscle: "Abdomen",
    secondaryMuscles: ["Espalda"],
    difficulty: "Intermedio",
    equipment: "Barra fija",
    movementType: "core",
    description: "Elevación colgada para abdomen inferior y control de pelvis.",
    tips: ["Sin balanceo", "Retroversión al subir", "Baja lento"],
    mistakes: ["Impulso", "Arquear lumbar", "Subir de prisa"],
    level: "Intermedio",
  }),
];

export const EXERCISE_LIBRARY = [
  ...chest,
  ...back,
  ...legs,
  ...glutes,
  ...shoulders,
  ...biceps,
  ...triceps,
  ...abs,
];
