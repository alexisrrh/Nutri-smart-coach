export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Piernas",
  "Glúteos",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Abdomen",
];

function enrichExercises(list) {
  return list.map((exercise, index) => {
    const movementType = exercise.movementType || inferMovementType(exercise);
    const difficultyScore = exercise.difficultyScore || inferDifficultyScore(exercise, movementType);
    const priorityByFocus = exercise.priorityByFocus || buildPriorityByFocus(exercise, movementType, difficultyScore);

    return {
      ...exercise,
      movementType,
      difficultyScore,
      priorityByFocus,
      alternatives: exercise.alternatives || buildAlternatives(exercise, list, index),
    };
  });
}

function inferMovementType(exercise) {
  const token = normalizeExerciseToken(`${exercise.id} ${exercise.name}`);

  if (
    token.includes("plancha") ||
    token.includes("crunch") ||
    token.includes("abdomen") ||
    token.includes("elevacion-piernas") ||
    token.includes("leg raise")
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
    token.includes("pull") ||
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
    token.includes("zancada")
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
  }[exercise.level || "Principiante"] || 2;

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

function buildAlternatives(exercise, list, index) {
  const sourceToken = normalizeExerciseToken(exercise.muscle);
  const sameMuscle = list
    .filter((item, itemIndex) => itemIndex !== index && item.muscle === exercise.muscle)
    .sort((a, b) => {
      const scoreA = scoreAlternative(a, sourceToken);
      const scoreB = scoreAlternative(b, sourceToken);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  return sameMuscle.map((item) => item.id);
}

function scoreAlternative(exercise, sourceToken) {
  let score = 0;
  const token = normalizeExerciseToken(`${exercise.id} ${exercise.name}`);

  if (token !== sourceToken) score += 1;
  if (exercise.movementType === "compound") score += 2;
  if (exercise.movementType === "accessory") score += 1;
  score += clampScore(exercise.difficultyScore || 2);

  return score;
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

function createExercise({
  id,
  muscle,
  secondaryMuscles = [],
  level = "Principiante",
  goals = WORKOUT_GOALS,
  name,
  equipment,
  image,
  gif,
  estimatedCalories,
  difficulty,
  description,
  tips,
  mistakes,
}) {
  return {
    id,
    muscle,
    secondaryMuscles,
    level,
    goal: goals[0],
    goals,
    name,
    equipment,
    image,
    gif: gif || image,
    sets: LEVEL_SETS[level],
    reps: GOAL_REPS[goals[0]],
    rest: GOAL_REST[goals[0]],
    setsByLevel: LEVEL_SETS,
    repsByGoal: GOAL_REPS,
    restByGoal: GOAL_REST,
    estimatedCalories: estimatedCalories || getEstimatedCalories(level),
    difficulty: difficulty || level,
    description,
    tips,
    mistakes,
  };
}

function getEstimatedCalories(level) {
  if (level === "Avanzado") return 95;
  if (level === "Intermedio") return 75;
  return 55;
}

const exerciseCatalog = [
  createExercise({
    id: "press-banca",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    level: "Intermedio",
    goals: ["Ganar músculo", "Fuerza"],
    name: "Press banca",
    equipment: "Barra y banco",
    image: "/exercises/press-banca.gif",
    description:
      "Básico de empuje horizontal para desarrollar pecho con alta transferencia de fuerza.",
    tips: ["Escápulas retraídas.", "Pies firmes.", "Bajada controlada."],
    mistakes: ["Rebotar la barra.", "Abrir demasiado los codos.", "Perder tensión escapular."],
  }),
  createExercise({
    id: "press-inclinado-mancuernas",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    level: "Intermedio",
    goals: ["Ganar músculo", "Definir"],
    name: "Press inclinado mancuernas",
    equipment: "Mancuernas y banco",
    image: "/exercises/press-inclinado-mancuernas.gif",
    description:
      "Enfatiza la zona superior del pecho con mayor libertad articular que la barra.",
    tips: ["Banco a 25-35 grados.", "Mancuernas bajan al pecho alto.", "No choques arriba."],
    mistakes: ["Inclinar demasiado el banco.", "Acortar recorrido.", "Arquear lumbar."],
  }),
  createExercise({
    id: "flexiones",
    muscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Abdomen"],
    level: "Principiante",
    goals: ["Definir", "Ganar músculo"],
    name: "Flexiones",
    equipment: "Peso corporal",
    image: "/exercises/flexiones.gif",
    description:
      "Empuje básico para dominar control corporal, pecho y tríceps.",
    tips: ["Cuerpo en bloque.", "Manos bajo hombros.", "Empuja el suelo."],
    mistakes: ["Hundir cadera.", "Recortar recorrido.", "Subir la cabeza."],
  }),
  createExercise({
    id: "aperturas-cable",
    muscle: "Pecho",
    secondaryMuscles: ["Hombros"],
    level: "Avanzado",
    goals: ["Ganar músculo", "Definir"],
    name: "Aperturas en cable",
    equipment: "Poleas",
    image: "/exercises/aperturas-cable.gif",
    description:
      "Aislamiento de pecho con tensión constante durante todo el recorrido.",
    tips: ["Codos suaves.", "Pecho arriba.", "Cruza ligeramente al final."],
    mistakes: ["Convertirlo en press.", "Usar demasiado peso.", "Cerrar hombros."],
  }),
  createExercise({
    id: "dominadas",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Abdomen"],
    level: "Avanzado",
    goals: ["Fuerza", "Ganar músculo"],
    name: "Dominadas",
    equipment: "Barra fija",
    image: "/exercises/dominadas.gif",
    description:
      "Básico vertical de espalda para dorsales, fuerza relativa y control escapular.",
    tips: ["Deprime escápulas.", "Pecho hacia la barra.", "Evita balanceo."],
    mistakes: ["Tirar solo con brazos.", "No extender abajo.", "Subir con impulso."],
  }),
  createExercise({
    id: "jalon-pecho",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    level: "Principiante",
    goals: ["Ganar músculo", "Definir"],
    name: "Jalón al pecho",
    equipment: "Polea alta",
    image: "/exercises/jalon-pecho.gif",
    description:
      "Alternativa progresiva a dominadas para construir dorsales y aprender a traccionar.",
    tips: ["Codos hacia abajo.", "Pecho abierto.", "Subida controlada."],
    mistakes: ["Tirar detrás de nuca.", "Balancear torso.", "Encoger hombros."],
  }),
  createExercise({
    id: "remo-barra",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps", "Hombros"],
    level: "Intermedio",
    goals: ["Fuerza", "Ganar músculo"],
    name: "Remo con barra",
    equipment: "Barra",
    image: "/exercises/remo-barra.gif",
    description:
      "Tracción horizontal pesada para grosor de espalda y estabilidad posterior.",
    tips: ["Bisagra sólida.", "Tira al abdomen.", "Pausa arriba."],
    mistakes: ["Redondear espalda.", "Tirar con lumbar.", "Recortar recorrido."],
  }),
  createExercise({
    id: "remo-sentado",
    muscle: "Espalda",
    secondaryMuscles: ["Bíceps"],
    level: "Principiante",
    goals: ["Ganar músculo", "Definir"],
    name: "Remo sentado",
    equipment: "Polea baja",
    image: "/exercises/remo-sentado.gif",
    description:
      "Remo estable para trabajar espalda media con bajo coste técnico.",
    tips: ["Torso estable.", "Codos atrás.", "Escápulas se juntan."],
    mistakes: ["Balancear el cuerpo.", "Encoger hombros.", "Soltar de golpe."],
  }),
  createExercise({
    id: "sentadilla",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Abdomen"],
    level: "Intermedio",
    goals: ["Fuerza", "Ganar músculo"],
    name: "Sentadilla",
    equipment: "Barra",
    image: "/exercises/sentadilla.gif",
    description:
      "Básico de tren inferior para cuádriceps, glúteos y fuerza global.",
    tips: ["Brace abdominal.", "Rodillas siguen pies.", "Peso centrado."],
    mistakes: ["Colapsar rodillas.", "Levantar talones.", "Perder lumbar neutral."],
  }),
  createExercise({
    id: "prensa-piernas",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    level: "Principiante",
    goals: ["Ganar músculo", "Definir"],
    name: "Prensa de piernas",
    equipment: "Máquina",
    image: "/exercises/prensa-piernas.gif",
    description:
      "Ejercicio estable para acumular volumen de piernas con control.",
    tips: ["Pies firmes.", "No bloquees rodillas.", "Bajada cómoda."],
    mistakes: ["Despegar cadera.", "Juntar rodillas.", "Bajar sin control."],
  }),
  createExercise({
    id: "peso-muerto-rumano",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos", "Espalda"],
    level: "Intermedio",
    goals: ["Ganar músculo", "Fuerza"],
    name: "Peso muerto rumano",
    equipment: "Barra o mancuernas",
    image: "/exercises/peso-muerto-rumano.gif",
    description:
      "Bisagra de cadera para femoral, glúteo y cadena posterior.",
    tips: ["Cadera atrás.", "Barra cerca.", "Espalda larga."],
    mistakes: ["Flexionar demasiado rodillas.", "Redondear espalda.", "Alejar la carga."],
  }),
  createExercise({
    id: "zancadas",
    muscle: "Piernas",
    secondaryMuscles: ["Glúteos"],
    level: "Principiante",
    goals: ["Definir", "Ganar músculo"],
    name: "Zancadas",
    equipment: "Mancuernas o peso corporal",
    image: "/exercises/zancadas.gif",
    description:
      "Trabajo unilateral para piernas, glúteo y estabilidad.",
    tips: ["Paso estable.", "Torso alto.", "Empuja con pierna delantera."],
    mistakes: ["Rodilla colapsa.", "Paso muy corto.", "Perder equilibrio por prisa."],
  }),
  createExercise({
    id: "hip-thrust",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    level: "Intermedio",
    goals: ["Ganar músculo", "Fuerza"],
    name: "Hip thrust",
    equipment: "Barra y banco",
    image: "/exercises/hip-thrust.gif",
    description:
      "Ejercicio principal para glúteo con alta tensión en extensión de cadera.",
    tips: ["Pausa arriba.", "Empuja con talones.", "Costillas abajo."],
    mistakes: ["Hiperextender lumbar.", "Pies muy lejos.", "Subir sin bloquear glúteo."],
  }),
  createExercise({
    id: "patada-gluteo",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    level: "Principiante",
    goals: ["Definir", "Ganar músculo"],
    name: "Patada de glúteo",
    equipment: "Polea o banda",
    image: "/exercises/patada-gluteo.gif",
    description:
      "Aislamiento de glúteo para mejorar conexión y acabado de sesión.",
    tips: ["Pelvis estable.", "Pausa final.", "Recorrido controlado."],
    mistakes: ["Girar cadera.", "Arquear lumbar.", "Lanzar la pierna."],
  }),
  createExercise({
    id: "abduccion-cadera",
    muscle: "Glúteos",
    secondaryMuscles: ["Piernas"],
    level: "Principiante",
    goals: ["Definir", "Ganar músculo"],
    name: "Abducción de cadera",
    equipment: "Máquina o banda",
    image: "/exercises/abduccion-cadera.gif",
    description:
      "Trabajo específico de glúteo medio para estabilidad y forma.",
    tips: ["Pausa abierto.", "No rebotes.", "Controla el cierre."],
    mistakes: ["Usar impulso.", "Inclinarse en exceso.", "Recorrido mínimo."],
  }),
  createExercise({
    id: "press-militar",
    muscle: "Hombros",
    secondaryMuscles: ["Tríceps", "Abdomen"],
    level: "Intermedio",
    goals: ["Fuerza", "Ganar músculo"],
    name: "Press militar",
    equipment: "Barra o mancuernas",
    image: "/exercises/press-militar.gif",
    description:
      "Empuje vertical básico para deltoides y estabilidad del core.",
    tips: ["Glúteos activos.", "Trayectoria vertical.", "Costillas abajo."],
    mistakes: ["Arquear lumbar.", "Empujar delante.", "Rebotar abajo."],
  }),
  createExercise({
    id: "elevaciones-laterales",
    muscle: "Hombros",
    secondaryMuscles: [],
    level: "Principiante",
    goals: ["Ganar músculo", "Definir"],
    name: "Elevaciones laterales",
    equipment: "Mancuernas",
    image: "/exercises/elevaciones-laterales.gif",
    description:
      "Aislamiento clave para deltoide lateral y amplitud visual.",
    tips: ["Codos suaves.", "Sube sin impulso.", "Bajada lenta."],
    mistakes: ["Encoger trapecios.", "Usar mucho peso.", "Balancear tronco."],
  }),
  createExercise({
    id: "face-pull",
    muscle: "Hombros",
    secondaryMuscles: ["Espalda"],
    level: "Principiante",
    goals: ["Definir", "Ganar músculo"],
    name: "Face pull",
    equipment: "Polea",
    image: "/exercises/face-pull.gif",
    description:
      "Trabajo de deltoide posterior y salud escapular.",
    tips: ["Tira hacia la cara.", "Codos altos.", "Pausa atrás."],
    mistakes: ["Arquear lumbar.", "Tirar al pecho.", "Perder control."],
  }),
  createExercise({
    id: "curl-biceps",
    muscle: "Bíceps",
    secondaryMuscles: [],
    level: "Principiante",
    goals: ["Ganar músculo", "Definir"],
    name: "Curl de bíceps",
    equipment: "Mancuernas",
    image: "/exercises/curl-biceps.gif",
    description:
      "Flexión de codo básica para bíceps con control y rango completo.",
    tips: ["Codos quietos.", "Supina arriba.", "Bajada lenta."],
    mistakes: ["Balancear espalda.", "Subir hombros.", "Recortar recorrido."],
  }),
  createExercise({
    id: "curl-barra",
    muscle: "Bíceps",
    secondaryMuscles: [],
    level: "Intermedio",
    goals: ["Fuerza", "Ganar músculo"],
    name: "Curl con barra",
    equipment: "Barra Z",
    image: "/exercises/curl-barra.gif",
    description:
      "Variante pesada para bíceps, útil en días de brazos o pull.",
    tips: ["Muñecas firmes.", "Codos pegados.", "Pausa arriba."],
    mistakes: ["Tirar con lumbar.", "Abrir codos.", "Bajar a medias."],
  }),
  createExercise({
    id: "fondos-triceps",
    muscle: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    level: "Avanzado",
    goals: ["Fuerza", "Ganar músculo"],
    name: "Fondos en paralelas",
    equipment: "Paralelas",
    image: "/exercises/fondos-triceps.gif",
    description:
      "Empuje pesado para tríceps con transferencia a press.",
    tips: ["Torso estable.", "Codos atrás.", "Sube fuerte."],
    mistakes: ["Bajar sin control.", "Encoger hombros.", "Abrir codos."],
  }),
  createExercise({
    id: "extension-polea",
    muscle: "Tríceps",
    secondaryMuscles: [],
    level: "Principiante",
    goals: ["Definir", "Ganar músculo"],
    name: "Extensión en polea",
    equipment: "Polea",
    image: "/exercises/extension-polea.gif",
    description:
      "Aislamiento estable para tríceps con tensión constante.",
    tips: ["Codos fijos.", "Aprieta abajo.", "Sube controlado."],
    mistakes: ["Mover hombros.", "Inclinarte demasiado.", "Perder tensión."],
  }),
  createExercise({
    id: "press-frances",
    muscle: "Tríceps",
    secondaryMuscles: [],
    level: "Intermedio",
    goals: ["Ganar músculo", "Fuerza"],
    name: "Press francés",
    equipment: "Barra Z",
    image: "/exercises/press-frances.gif",
    description:
      "Trabajo de cabeza larga del tríceps con gran estímulo de hipertrofia.",
    tips: ["Codos estables.", "Baja detrás de la frente.", "Extiende completo."],
    mistakes: ["Abrir codos.", "Mover hombros.", "Cargar demasiado pronto."],
  }),
  createExercise({
    id: "plancha",
    muscle: "Abdomen",
    secondaryMuscles: ["Glúteos"],
    level: "Principiante",
    goals: ["Definir", "Fuerza"],
    name: "Plancha",
    equipment: "Peso corporal",
    image: "/exercises/plancha.gif",
    description:
      "Base de estabilidad del core y control lumbo-pélvico.",
    tips: ["Costillas abajo.", "Glúteos activos.", "Respira corto."],
    mistakes: ["Hundir lumbar.", "Elevar cadera.", "Aguantar sin respirar."],
  }),
  createExercise({
    id: "crunch-cable",
    muscle: "Abdomen",
    secondaryMuscles: [],
    level: "Intermedio",
    goals: ["Ganar músculo", "Definir"],
    name: "Crunch en polea",
    equipment: "Polea",
    image: "/exercises/crunch-cable.gif",
    description:
      "Flexión resistida del tronco para hipertrofia abdominal.",
    tips: ["Cadera quieta.", "Exhala abajo.", "Vuelve lento."],
    mistakes: ["Tirar con brazos.", "Mover solo cuello.", "Sentarse atrás."],
  }),
  createExercise({
    id: "elevacion-piernas",
    muscle: "Abdomen",
    secondaryMuscles: ["Piernas"],
    level: "Avanzado",
    goals: ["Fuerza", "Definir"],
    name: "Elevación de piernas",
    equipment: "Barra o banco",
    image: "/exercises/elevacion-piernas.gif",
    description:
      "Trabajo avanzado de abdomen inferior y control de pelvis.",
    tips: ["Retroversión pélvica.", "Sube sin balanceo.", "Baja lento."],
    mistakes: ["Impulsarte.", "Arquear lumbar.", "Recortar arriba."],
  }),
];

export const exercises = enrichExercises(exerciseCatalog);
