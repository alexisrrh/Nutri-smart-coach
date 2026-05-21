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
}) {
  const resolvedLevel = normalizeLevel(level);
  const resolvedDifficulty = difficulty || resolvedLevel;
  const resolvedMovementType = movementType || inferMovementType({ slug, name, muscle, secondaryMuscles });
  const resolvedGoals = Array.isArray(goals) && goals.length ? goals : WORKOUT_GOALS;
  const resolvedSetsByLevel = setsByLevel || { ...LEVEL_SETS };
  const resolvedRepsByGoal = repsByGoal || { ...GOAL_REPS };
  const resolvedRestByGoal = restByGoal || { ...GOAL_REST };
  const difficultyScore = inferDifficultyScore({ level: resolvedDifficulty }, resolvedMovementType);
  const priorityByFocus = buildPriorityByFocus(
    {
      muscle,
      secondaryMuscles,
    },
    resolvedMovementType,
    difficultyScore
  );

  return {
    id: slug,
    name,
    muscle,
    secondaryMuscles,
    level: resolvedLevel,
    difficulty: resolvedDifficulty,
    goal: resolvedGoals[0],
    goals: resolvedGoals,
    movementType: resolvedMovementType,
    difficultyScore,
    priorityByFocus,
    equipment,
    gif: `/exercises/${slug}.webp`,
    image: `/exercises/${slug}.webp`,
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
    secondaryMuscles: ["Tríceps", "Abdomen"],
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
    secondaryMuscles: ["Tríceps"],
    difficulty: "Intermedio",
    equipment: "Mancuernas y banco",
    description: "Variante de empuje para enfatizar el pecho inferior.",
    tips: ["Muñecas rectas", "Bajada controlada", "Empuja al centro"],
    mistakes: ["Recortar abajo", "Codos abiertos", "Perder escápulas"],
    level: "Intermedio",
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
    muscle: "Espalda",
    secondaryMuscles: ["Hombros"],
    difficulty: "Principiante",
    equipment: "Polea",
    description: "Trabajo de salud escapular y deltoide posterior.",
    tips: ["Tira a la cara", "Codos altos", "Pausa atrás"],
    mistakes: ["Arquear lumbar", "Tirar al pecho", "Perder control"],
    level: "Principiante",
  }),
];

const legs = [
  createExercise({
    slug: "sentadilla",
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
];

const glutes = [
  createExercise({
    slug: "hip-thrust",
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
    name: "Face pull",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    difficulty: "Principiante",
    equipment: "Polea",
    description: "Deltoide posterior y salud escapular.",
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
];

const biceps = [
  createExercise({
    slug: "curl-mancuernas",
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
];

const triceps = [
  createExercise({
    slug: "fondos-banco",
    name: "Fondos en banco",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho"],
    difficulty: "Principiante",
    equipment: "Banco",
    description: "Empuje simple para tríceps con peso corporal.",
    tips: ["Escápulas abajo", "Codos atrás", "Bajada controlada"],
    mistakes: ["Bajar demasiado", "Hombros adelante", "Impulso"],
    level: "Principiante",
  }),
  createExercise({
    slug: "extension-polea",
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
    secondaryMuscles: ["Pecho"],
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
