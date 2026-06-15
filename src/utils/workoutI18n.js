import i18n from "../i18n";

const MUSCLE_LABELS = {
  Pecho: { es: "Pecho", en: "Chest" },
  Espalda: { es: "Espalda", en: "Back" },
  Piernas: { es: "Piernas", en: "Legs" },
  Glúteos: { es: "Glúteos", en: "Glutes" },
  Hombros: { es: "Hombros", en: "Shoulders" },
  Bíceps: { es: "Bíceps", en: "Biceps" },
  Tríceps: { es: "Tríceps", en: "Triceps" },
  Abdomen: { es: "Abdomen", en: "Core" },
  Antebrazo: { es: "Antebrazo", en: "Forearms" },
};

const LEVEL_LABELS = {
  Principiante: { es: "Principiante", en: "Beginner" },
  Intermedio: { es: "Intermedio", en: "Intermediate" },
  Avanzado: { es: "Avanzado", en: "Advanced" },
};

const GOAL_LABELS = {
  "Ganar músculo": { es: "Ganar músculo", en: "Gain muscle" },
  Definir: { es: "Definir", en: "Cut" },
  Fuerza: { es: "Fuerza", en: "Strength" },
};

const FOCUS_LABELS = {
  General: { es: "General", en: "General" },
  "Glúteos y piernas": { es: "Glúteos y piernas", en: "Glutes and legs" },
  "Torso y brazos": { es: "Torso y brazos", en: "Torso and arms" },
  "Core/abdomen": { es: "Core/abdomen", en: "Core/abs" },
  "Fuerza completa": { es: "Fuerza completa", en: "Full-body strength" },
};

const EQUIPMENT_LABELS = {
  "Peso corporal": { es: "Peso corporal", en: "Bodyweight" },
  Barra: { es: "Barra", en: "Barbell" },
  Mancuernas: { es: "Mancuernas", en: "Dumbbells" },
  "Mancuerna": { es: "Mancuerna", en: "Dumbbell" },
  "Barra y banco": { es: "Barra y banco", en: "Barbell and bench" },
  "Barra y banco inclinado": { es: "Barra y banco inclinado", en: "Barbell and incline bench" },
  "Mancuernas y banco": { es: "Mancuernas y banco", en: "Dumbbells and bench" },
  "Mancuerna y banco": { es: "Mancuerna y banco", en: "Dumbbell and bench" },
  "Mancuernas y banco inclinado": { es: "Mancuernas y banco inclinado", en: "Dumbbells and incline bench" },
  "Mancuerna o kettlebell": { es: "Mancuerna o kettlebell", en: "Dumbbell or kettlebell" },
  "Mancuernas o peso corporal": { es: "Mancuernas o peso corporal", en: "Dumbbells or bodyweight" },
  "Barra o mancuernas": { es: "Barra o mancuernas", en: "Barbell or dumbbells" },
  "Mancuerna o polea": { es: "Mancuerna o polea", en: "Dumbbell or cable" },
  "Polea": { es: "Polea", en: "Cable" },
  "Polea alta": { es: "Polea alta", en: "High cable" },
  "Polea baja": { es: "Polea baja", en: "Low cable" },
  Máquina: { es: "Máquina", en: "Machine" },
  "Máquina o banda": { es: "Máquina o banda", en: "Machine or band" },
  Bandas: { es: "Bandas", en: "Bands" },
  Banda: { es: "Banda", en: "Band" },
  "Peso corporal o barra": { es: "Peso corporal o barra", en: "Bodyweight or barbell" },
  "Mancuernas ligeras": { es: "Mancuernas ligeras", en: "Light dumbbells" },
  "Máquina Smith": { es: "Máquina Smith", en: "Smith machine" },
  "Barra Z": { es: "Barra Z", en: "EZ bar" },
  "Barra Z o mancuernas": { es: "Barra Z o mancuernas", en: "EZ bar or dumbbells" },
  "Polea o banda": { es: "Polea o banda", en: "Cable or band" },
  "Polea y cuerda": { es: "Polea y cuerda", en: "Cable and rope" },
  "Barra fija": { es: "Barra fija", en: "Pull-up bar" },
  "Banco inclinado y mancuernas": { es: "Banco inclinado y mancuernas", en: "Incline bench and dumbbells" },
  "Banco predicador": { es: "Banco predicador", en: "Preacher bench" },
  "Paralelas": { es: "Paralelas", en: "Dip bars" },
  "Banco": { es: "Banco", en: "Bench" },
  "Banco inclinado": { es: "Banco inclinado", en: "Incline bench" },
  "Banco y mancuernas": { es: "Banco y mancuernas", en: "Bench and dumbbells" },
  "Rueda abdominal": { es: "Rueda abdominal", en: "Ab wheel" },
  Kettlebell: { es: "Kettlebell", en: "Kettlebell" },
  Cardio: { es: "Cardio", en: "Cardio" },
  Movilidad: { es: "Movilidad", en: "Mobility" },
};

const TEXT_REPLACEMENTS = [
  [/Biblioteca fitness/g, "Fitness library"],
  [/Entrena por zona muscular/g, "Train by muscle group"],
  [/Explora ejercicios visuales y mejora tu técnica\./g, "Explore visual exercises and improve your technique."],
  [/Selecciona un grupo muscular/g, "Select a muscle group"],
  [/Mis rutinas/g, "My routines"],
  [/Crea tu rutina/g, "Create your routine"],
  [/Selecciona ejercicios de la biblioteca y crea un entrenamiento a tu medida\./g, "Select exercises from the library and build a custom workout."],
  [/Crear rutina/g, "Create routine"],
  [/Ver mis rutinas/g, "View my routines"],
  [/Ejercicios visuales/g, "Visual exercises"],
  [/Recomendado hoy/g, "Recommended today"],
  [/Volver/g, "Back"],
  [/Dashboard/g, "Dashboard"],
  [/Entreno completado/g, "Workout completed"],
  [/Buen trabajo/g, "Well done"],
  [/Volver al dashboard/g, "Back to dashboard"],
  [/Salir del entreno/g, "Exit workout"],
  [/Se perdera el progreso no guardado de esta sesion\./g, "You'll lose unsaved progress from this session."],
  [/Permanecer/g, "Stay"],
  [/Salir/g, "Exit"],
  [/Sesión guardada/g, "Session saved"],
  [/Mejor ejercicio/g, "Best exercise"],
  [/Entrenamiento de hoy/g, "Today's workout"],
  [/Entrenamiento/g, "Workout"],
  [/Entreno/g, "Workout"],
  [/Generada con IA/g, "Generated with AI"],
  [/Rutina semanal IA/g, "AI weekly routine"],
  [/^Rutina$/g, "Workout"],
  [/La app crea una rutina semanal automáticamente según tu nivel, objetivo y progreso\./g, "The app automatically creates a weekly routine based on your level, goal and progress."],
  [/Progreso semanal/g, "Weekly progress"],
  [/Aún no generaste tu rutina automática/g, "You haven't generated your automatic routine yet"],
  [/Continuar rutina/g, "Continue routine"],
  [/Generar rutina IA/g, "Generate AI routine"],
  [/Ajustar plan/g, "Adjust plan"],
  [/Nivel: /g, "Level: "],
  [/Objetivo: /g, "Goal: "],
  [/Enfoque: /g, "Focus: "],
  [/Días: /g, "Days: "],
  [/Serie (\d+) de (\d+)/g, "Set $1 of $2"],
  [/(\d+) días de racha/g, "$1-day streak"],
  [/completadas/g, "completed"],
  [/restantes/g, "remaining"],
  [/Mi semana de entrenamiento/g, "My training week"],
  [/Mira mi semana de entrenamiento personalizada\./g, "Check out my custom training week."],
  [/No hay rutinas para compartir\./g, "No routines to share."],
  [/Necesitas iniciar sesión para compartir esta semana\./g, "You need to sign in to share this week."],
  [/Semana compartida\./g, "Week shared."],
  [/No se pudo copiar el enlace\./g, "Could not copy the link."],
  [/Enlace copiado\. Comparte tu semana\./g, "Link copied. Share your week."],
  [/No se pudo compartir la semana\./g, "Could not share the week."],
  [/Última vez/g, "Last time"],
  [/Hoy recomendado/g, "Recommended today"],
  [/Serie actual/g, "Current set"],
  [/Completar serie/g, "Complete set"],
  [/Ver todas las series/g, "View all sets"],
  [/Ocultar todas las series/g, "Hide all sets"],
  [/Nuevo récord/g, "New record"],
  [/Descanso activo/g, "Active rest"],
  [/Listo para la siguiente serie/g, "Ready for the next set"],
  [/Siguiente serie lista/g, "Next set ready"],
  [/Recuperación inteligente/g, "Smart recovery"],
  [/Respira y prepara la siguiente serie/g, "Breathe and prepare the next set."],
  [/Marca una serie para iniciar el coach/g, "Mark a set to start the coach."],
  [/Saltar/g, "Skip"],
  [/Técnica rápida/g, "Quick technique"],
  [/Consejo/g, "Tip"],
  [/Mantén el control en todo el recorrido\./g, "Keep control through the full range."],
  [/Evita compensar con impulso\./g, "Avoid compensating with momentum."],
  [/Sin datos/g, "No data"],
  [/Última sesión/g, "Last session"],
  [/Nuevo ejercicio/g, "New exercise"],
  [/Serie/g, "Set"],
  [/Reps/g, "Reps"],
  [/Peso/g, "Weight"],
  [/Objetivo/g, "Goal"],
  [/Principal/g, "Main"],
  [/Kcal/g, "Kcal"],
  [/Tiempo/g, "Time"],
  [/Series/g, "Sets"],
  [/Finalizar entreno/g, "Finish workout"],
  [/Anterior/g, "Previous"],
  [/Siguiente/g, "Next"],
  [/Descanso/g, "Rest"],
  [/Pecho/g, "Chest"],
  [/Espalda/g, "Back"],
  [/Piernas/g, "Legs"],
  [/Glúteos/g, "Glutes"],
  [/Hombros/g, "Shoulders"],
  [/Bíceps/g, "Biceps"],
  [/Tríceps/g, "Triceps"],
  [/Abdomen/g, "Core"],
  [/Antebrazo/g, "Forearms"],
  [/Músculo principal/g, "Primary muscle"],
  [/Músculos secundarios/g, "Secondary muscles"],
  [/Sin secundarios/g, "No secondary muscles"],
  [/Sin media/g, "No media"],
  [/Prescripción/g, "Prescription"],
  [/Descripción/g, "Description"],
  [/Consejos/g, "Tips"],
  [/Errores/g, "Mistakes"],
  [/Cerrar ficha/g, "Close sheet"],
  [/Cerrar/g, "Close"],
  [/Hecho/g, "Done"],
  [/Hoy/g, "Today"],
  [/Bloqueado/g, "Locked"],
  [/Pendiente/g, "Pending"],
  [/Glúteos y piernas/g, "Glutes and legs"],
  [/Torso y brazos/g, "Torso and arms"],
  [/Core\/abdomen/g, "Core/abs"],
  [/Fuerza completa/g, "Full-body strength"],
  [/Personalizada/g, "Custom"],
  [/Nivel libre/g, "Free level"],
  [/Aún no usada/g, "Not used yet"],
  [/Aún no generaste tu rutina automática/g, "You haven't generated your automatic routine yet"],
  [/Tu rutina automática/g, "Your automatic routine"],
  [/Adaptado a tu objetivo/g, "Adapted to your goal"],
  [/Último uso/g, "Last used"],
  [/Más frecuencia de tren inferior/g, "More lower-body frequency"],
  [/Torso y brazos con menor pierna/g, "Torso and arms with less leg volume"],
  [/Volumen ajustado a tu actividad/g, "Volume adjusted to your activity"],
  [/Volumen moderado para progresar/g, "Moderate volume to progress"],
  [/Enfoque sugerido en glúteos y pierna/g, "Suggested focus on glutes and legs"],
  [/Enfoque sugerido en torso y espalda/g, "Suggested focus on torso and back"],
  [/Más densidad y progresión semanal/g, "More density and weekly progression"],
  [/Plan de fuerza avanzada/g, "Advanced strength plan"],
  [/Plan de fuerza progresiva/g, "Progressive strength plan"],
  [/Split de glúteos y pierna/g, "Glutes and legs split"],
  [/Rutina glúteos y pierna/g, "Glutes and legs routine"],
  [/Split de torso y brazos/g, "Torso and arms split"],
  [/Torso y brazos estructurado/g, "Structured torso and arms"],
  [/Plan con core frecuente/g, "Plan with frequent core work"],
  [/Base técnica semanal/g, "Weekly technical base"],
  [/Plan semanal de definición/g, "Weekly cut plan"],
  [/Plan equilibrado de definición/g, "Balanced cut plan"],
  [/Plan semanal de hipertrofia/g, "Weekly hypertrophy plan"],
  [/Plan semanal equilibrado/g, "Balanced weekly plan"],
  [/Básicos principales y descanso más largo/g, "Main compound lifts and longer rest"],
  [/Más densidad y superseries/g, "More density and supersets"],
  [/Glúteos y pierna con prioridad/g, "Glutes and legs priority"],
  [/Torso y brazos con más frecuencia/g, "Torso and arms with more frequency"],
  [/Core añadido al cierre de la sesión/g, "Core added at the end of the session"],
  [/Superseries \+ cardio final/g, "Supersets + finishers"],
  [/Básicos pesados/g, "Heavy compounds"],
  [/Volumen de tren inferior/g, "Lower-body volume"],
  [/Core y estabilidad/g, "Core and stability"],
  [/Hipertrofia densa/g, "Dense hypertrophy"],
  [/Plan equilibrado/g, "Balanced plan"],
  [/Hipertrofia split avanzado/g, "Advanced split hypertrophy"],
  [/Hipertrofia Upper\/Lower/g, "Upper/Lower hypertrophy"],
  [/Base atlética semanal/g, "Weekly athletic base"],
  [/Movilidad articular/g, "Joint mobility"],
  [/Movilidad torácica/g, "Thoracic mobility"],
  [/Movilidad lumbar/g, "Lumbar mobility"],
  [/Movilidad de cadera/g, "Hip mobility"],
  [/Movilidad de /g, "Mobility for "],
  [/Movilidad de ([A-Za-zÀ-ÿ]+)/g, "Mobility for $1"],
  [/Activación ligera/g, "Light activation"],
  [/Activación glútea/g, "Glute activation"],
  [/Activación escapular/g, "Scapular activation"],
  [/Activación abdominal/g, "Core activation"],
  [/Estiramiento breve/g, "Short stretch"],
  [/Estiramiento corto/g, "Short stretch"],
  [/Cardio suave/g, "Light cardio"],
  [/Respiración y recuperación/g, "Breathing and recovery"],
  [/Respiración/g, "Breathing"],
  [/Core ligero/g, "Light core"],
  [/Descarga suave/g, "Cool down"],
  [/Movilidad breve/g, "Quick mobility"],
  [/zona principal/g, "main muscle group"],
  [/Ganar músculo/g, "Gain muscle"],
  [/Buenos días/g, "Good mornings"],
  [/Peso muerto rumano/g, "Romanian deadlift"],
  [/Peso muerto con piernas rígidas/g, "Stiff-leg deadlift"],
  [/Peso muerto a una pierna/g, "Single-leg deadlift"],
  [/Peso muerto/g, "Deadlift"],
  [/Press banca/g, "Bench press"],
  [/Press inclinado/g, "Incline press"],
  [/Press militar/g, "Overhead press"],
  [/Press francés/g, "French press"],
  [/Press cerrado/g, "Close-grip press"],
  [/Pecho/g, "Chest"],
  [/Espalda/g, "Back"],
  [/Piernas/g, "Legs"],
  [/Glúteos/g, "Glutes"],
  [/Hombros/g, "Shoulders"],
  [/Bíceps/g, "Biceps"],
  [/Tríceps/g, "Triceps"],
  [/Abdomen/g, "Core"],
  [/Antebrazo/g, "Forearm"],
  [/Mancuernas/g, "Dumbbells"],
  [/Mancuerna/g, "Dumbbell"],
  [/Barra/g, "Barbell"],
  [/Polea/g, "Cable"],
  [/Máquina/g, "Machine"],
  [/Bandas/g, "Bands"],
  [/Banda/g, "Band"],
  [/Peso corporal/g, "Bodyweight"],
  [/Aperturas/g, "Flys"],
  [/Dominadas/g, "Pull-ups"],
  [/Jalón/g, "Pulldown"],
  [/Jalon/g, "Pulldown"],
  [/Remo/g, "Row"],
  [/Sentadilla/g, "Squat"],
  [/Zancadas/g, "Lunges"],
  [/Crunch/g, "Crunch"],
  [/Plancha/g, "Plank"],
  [/Curl/g, "Curl"],
  [/Patada/g, "Kickback"],
  [/Extensión/g, "Extension"],
  [/Extension/g, "Extension"],
  [/Elevación/g, "Raise"],
  [/Elevaciones/g, "Raises"],
  [/Abducción/g, "Abduction"],
  [/Aislamiento/g, "Isolation"],
  [/Empuje/g, "Push"],
  [/Tracción/g, "Pull"],
  [/Básico/g, "Basic"],
  [/Básica/g, "Basic"],
  [/Variante/g, "Variant"],
  [/Trabajo/g, "Work"],
  [/control/g, "control"],
  [/Control/g, "Control"],
  [/estabilidad/g, "stability"],
  [/Estabilidad/g, "Stability"],
  [/tensión/g, "tension"],
  [/Tensión/g, "Tension"],
  [/fuerza/g, "strength"],
  [/Fuerza/g, "Strength"],
  [/masa/g, "mass"],
  [/Masa/g, "Mass"],
  [/parte superior del pecho/g, "upper chest"],
  [/pecho inferior/g, "lower chest"],
  [/pecho/g, "chest"],
  [/espalda alta/g, "upper back"],
  [/espalda media/g, "mid back"],
  [/espalda/g, "back"],
  [/cadena posterior/g, "posterior chain"],
  [/cuádriceps/g, "quadriceps"],
  [/femoral/g, "hamstrings"],
  [/glúteo medio/g, "glute medius"],
  [/glúteo/g, "glute"],
  [/glúteos/g, "glutes"],
  [/abdomen inferior/g, "lower abs"],
  [/abdomen/g, "core"],
  [/cadera/g, "hip"],
  [/torso/g, "torso"],
  [/rodillas/g, "knees"],
  [/rodilla/g, "knee"],
  [/lumbar/g, "low back"],
  [/escápulas/g, "scapulae"],
  [/escápula/g, "scapula"],
  [/codos/g, "elbows"],
  [/codo/g, "elbow"],
  [/muñecas/g, "wrists"],
  [/muñeca/g, "wrist"],
  [/subida/g, "up"],
  [/bajada/g, "down"],
  [/suave/g, "light"],
  [/firme/g, "firm"],
  [/firmes/g, "firm"],
  [/estable/g, "stable"],
  [/establecer/g, "set"],
  [/lento/g, "slow"],
  [/lento/g, "slow"],
  [/rápido/g, "fast"],
  [/rápida/g, "fast"],
  [/recorrido/g, "range"],
  [/rango/g, "range"],
  [/respira/g, "breathe"],
  [/Respira/g, "Breathe"],
  [/pausa/g, "pause"],
  [/Pausa/g, "Pause"],
  [/aprieta/g, "squeeze"],
  [/Aprieta/g, "Squeeze"],
  [/mantén/g, "keep"],
  [/Mantén/g, "Keep"],
  [/baja/g, "lower"],
  [/Baja/g, "Lower"],
  [/sube/g, "raise"],
  [/Sube/g, "Raise"],
  [/evita/g, "avoid"],
  [/Evita/g, "Avoid"],
  [/brazos/g, "arms"],
  [/brazos/gi, "arms"],
  [/brazo/g, "arm"],
  [/pierna/g, "leg"],
  [/piernas/g, "legs"],
  [/hombro/g, "shoulder"],
  [/hombros/g, "shoulders"],
];

export function getWorkoutLanguage(language = i18n.resolvedLanguage || i18n.language || "es") {
  const resolved = String(language || "").toLowerCase();
  return resolved.startsWith("en") ? "en" : "es";
}

function translateByMap(value, map, language) {
  if (!value) return value;
  if (getWorkoutLanguage(language) === "es") return value;
  return map[value]?.en || value;
}

export function translateMuscleLabel(value, language) {
  return translateByMap(value, MUSCLE_LABELS, language);
}

export function translateLevelLabel(value, language) {
  return translateByMap(value, LEVEL_LABELS, language);
}

export function translateGoalLabel(value, language) {
  return translateByMap(value, GOAL_LABELS, language);
}

export function translateFocusLabel(value, language) {
  return translateByMap(value, FOCUS_LABELS, language);
}

export function translateEquipmentLabel(value, language) {
  if (!value) return value;
  if (getWorkoutLanguage(language) === "es") return value;
  return EQUIPMENT_LABELS[value]?.en || translateWorkoutText(value, language);
}

export function translateWorkoutText(text, language = i18n.resolvedLanguage || i18n.language || "es") {
  if (Array.isArray(text)) {
    return text.map((item) => translateWorkoutText(item, language));
  }

  if (typeof text !== "string" || !text.trim()) return text;
  if (getWorkoutLanguage(language) === "es") return text;

  let result = text;

  for (const [pattern, replacement] of TEXT_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  result = result
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\s+,/g, ",")
    .replace(/\s+·\s+/g, " · ")
    .trim();

  return result;
}

export function translateExerciseName(exercise, language = i18n.resolvedLanguage || i18n.language || "es") {
  if (!exercise) return "";
  if (getWorkoutLanguage(language) === "es") {
    return exercise.name || exercise.englishName || "";
  }

  return translateWorkoutText(exercise.englishName || exercise.name || "", language);
}

export function translateExerciseDescription(exercise, language) {
  return translateWorkoutText(exercise?.description || "", language);
}

export function translateExerciseList(items, language) {
  return Array.isArray(items) ? items.map((item) => translateWorkoutText(item, language)) : [];
}

export function translateRoutineDay(day, language) {
  if (!day) return day;

  return {
    ...day,
    name: translateWorkoutText(day.name || "", language),
    brief: translateWorkoutText(day.brief || "", language),
    muscles: Array.isArray(day.muscles)
      ? day.muscles.map((muscle) => translateMuscleLabel(muscle, language))
      : day.muscles,
    warmupItems: translateExerciseList(day.warmupItems, language),
    finalItems: translateExerciseList(day.finalItems, language),
  };
}
