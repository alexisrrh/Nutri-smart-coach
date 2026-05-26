import { supabase } from "../lib/supabase";

const TABLE_NAME = "custom_workout_routines";

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

export async function createCustomWorkoutRoutine(userId, routine) {
  if (!userId) {
    throw new Error("Usuario no válido.");
  }

  const payload = {
    user_id: userId,
    name: routine.name,
    description: routine.description || null,
    goal: routine.goal || null,
    level: routine.level || null,
    focus: routine.focus || null,
    days: routine.days || [],
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return data;
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