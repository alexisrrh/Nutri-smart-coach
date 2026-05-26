import { supabase } from "../lib/supabase";

const TABLE_NAME = "custom_workout_routines";
const WEEK_SHARE_TABLE = "custom_workout_routine_week_shares";

function buildRoutineInsertPayload(userId, routine, options = {}) {
  const { isPublic = false, shareId = null } = options;

  return {
    user_id: userId,
    name: routine.name,
    description: routine.description || null,
    goal: routine.goal || null,
    level: routine.level || null,
    focus: routine.focus || null,
    days: Array.isArray(routine.days) ? routine.days : [],
    is_active: routine.is_active ?? true,
    is_public: isPublic,
    share_id: shareId,
  };
}

function generateShareId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

function cloneRoutineForShare(routine) {
  return {
    id: routine.id,
    name: routine.name,
    description: routine.description || null,
    goal: routine.goal || null,
    level: routine.level || null,
    focus: routine.focus || null,
    is_active: routine.is_active ?? true,
    is_public: routine.is_public ?? false,
    share_id: routine.share_id || null,
    days: Array.isArray(routine.days)
      ? routine.days.map((day, index) => ({
          ...day,
          id: day.id || `${routine.id}-day-${index}`,
          exercises: Array.isArray(day?.exercises)
            ? day.exercises.map((exercise) => ({ ...exercise }))
            : [],
        }))
      : [],
  };
}

export async function listCustomWorkoutRoutines(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getCustomWorkoutRoutineById(routineId) {
  if (!routineId) {
    throw new Error("Rutina no válida.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", routineId)
    .single();

  if (error) throw error;

  return data;
}

export async function createCustomWorkoutRoutine(userId, routine) {
  if (!userId) {
    throw new Error("Usuario no válido.");
  }

  const payload = buildRoutineInsertPayload(userId, routine);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function shareCustomWorkoutRoutine(routineId) {
  if (!routineId) {
    throw new Error("Rutina no válida.");
  }

  const routine = await getCustomWorkoutRoutineById(routineId);
  const shareId = routine.share_id || generateShareId();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      is_public: true,
      share_id: shareId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", routineId)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function getSharedRoutineByShareId(shareId) {
  if (!shareId) {
    throw new Error("Rutina pública no válida.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("share_id", shareId)
    .eq("is_public", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("Rutina pública no encontrada.");
  }

  return data;
}

export async function saveSharedRoutineToMyRoutines(userId, routine) {
  if (!userId) {
    throw new Error("Usuario no válido.");
  }

  const payload = buildRoutineInsertPayload(userId, routine, {
    isPublic: false,
    shareId: null,
  });

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function shareCustomWorkoutWeek(userId, routines) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const authUserId = authUser?.id || null;
  const sessionUserId = session?.user?.id || null;
  const effectiveUserId = sessionUserId || authUserId || userId || null;

  console.log("[customWorkoutService] shareCustomWorkoutWeek ids", {
    providedUserId: userId || null,
    authUserId,
    sessionUserId,
    effectiveUserId,
  });

  if (!effectiveUserId) {
    throw new Error("Usuario no válido.");
  }

  if (!Array.isArray(routines) || routines.length === 0) {
    throw new Error("No hay rutinas para compartir.");
  }

  const payload = {
    user_id: effectiveUserId,
    title: "Mi semana de entrenamiento",
    description: "Semana completa compartida desde Mis rutinas.",
    share_id: generateShareId(),
    routines: routines.map(cloneRoutineForShare),
    is_public: true,
  };

  const { data, error } = await supabase
    .from(WEEK_SHARE_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("[customWorkoutService] week share insert error", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }

  return data;
}

export async function getSharedWorkoutWeekByShareId(shareId) {
  if (!shareId) {
    throw new Error("Semana compartida no válida.");
  }

  const { data, error } = await supabase
    .from(WEEK_SHARE_TABLE)
    .select("*")
    .eq("share_id", shareId)
    .eq("is_public", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("Semana compartida no encontrada.");
  }

  return data;
}

export async function saveSharedWorkoutWeekToMyRoutines(userId, weekShare) {
  if (!userId) {
    throw new Error("Usuario no válido.");
  }

  const routines = Array.isArray(weekShare?.routines)
    ? weekShare.routines
    : [];

  if (!routines.length) {
    throw new Error("No hay rutinas para guardar.");
  }

  const payload = routines.map((routine) =>
    buildRoutineInsertPayload(userId, routine, {
      isPublic: false,
      shareId: null,
    })
  );

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select("*");

  if (error) throw error;

  return data || [];
}

export async function updateCustomWorkoutRoutine(routineId, updates) {
  if (!routineId) {
    throw new Error("Rutina no válida.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", routineId)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function deleteCustomWorkoutRoutine(routineId) {
  if (!routineId) {
    throw new Error("Rutina no válida.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", routineId);

  if (error) throw error;

  return true;
}
