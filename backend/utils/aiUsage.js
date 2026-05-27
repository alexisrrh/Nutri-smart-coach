import { supabase } from "../config/supabase.js";

const rateLimitByUserAndType = new Map();

export class AiUsageError extends Error {
  constructor(message, status = 429) {
    super(message);
    this.name = "AiUsageError";
    this.status = status;
  }
}

export async function checkDailyAiLimit({ userId, type, limit }) {
  if (!userId) {
    return { allowed: true, count: 0, limit };
  }

  const count = await countDailyUsage({ userId, type });

  return {
    allowed: count < limit,
    count,
    limit,
  };
}

export function enforceRateLimit({ userId, type, seconds }) {
  if (!userId || !seconds) return { allowed: true, waitSeconds: 0 };

  const key = getUsageKey({ userId, type });
  const lastUsageAt = rateLimitByUserAndType.get(key) || 0;
  const elapsed = Date.now() - lastUsageAt;
  const cooldownMs = seconds * 1000;

  if (elapsed >= cooldownMs) {
    return { allowed: true, waitSeconds: 0 };
  }

  return {
    allowed: false,
    waitSeconds: Math.ceil((cooldownMs - elapsed) / 1000),
  };
}

export function registerAiUsage({ userId, type }) {
  if (!userId) return;

  rateLimitByUserAndType.set(
    getUsageKey({ userId, type }),
    Date.now()
  );
}

async function countDailyUsage({ userId, type }) {
  if (type === "food_analysis") {
    return countDailyFoodAnalysis(userId);
  }

  if (type === "checkin_analysis") {
    return countRowsToday({
      table: "checkins",
      userId,
    });
  }

  if (type === "diet_generation") {
    return countRowsToday({
      table: "diet_plans",
      userId,
    });
  }

  throw new Error(`Tipo de uso IA no soportado: ${type}`);
}

async function countDailyFoodAnalysis(userId) {
  const { start, end } = getTodayRange();
  const { data: todayAnalyses, error: todayError } = await supabase
    .from("meal_analyses")
    .select("id, image_hash, created_at")
    .eq("user_id", userId)
    .gte("created_at", start)
    .lt("created_at", end);

  if (todayError) {
    console.error("Error contando análisis diarios:", todayError);
    throw new Error("No se pudo comprobar el límite diario de análisis");
  }

  const imageHashes = [
    ...new Set(
      (todayAnalyses || [])
        .map((analysis) => analysis.image_hash)
        .filter(Boolean)
    ),
  ];
  const priorHashes = new Set();

  if (imageHashes.length > 0) {
    const { data: previousAnalyses, error: previousError } = await supabase
      .from("meal_analyses")
      .select("image_hash")
      .eq("user_id", userId)
      .in("image_hash", imageHashes)
      .lt("created_at", start);

    if (previousError) {
      console.error("Error revisando hashes previos:", previousError);
      throw new Error("No se pudo comprobar el historial de análisis");
    }

    for (const analysis of previousAnalyses || []) {
      if (analysis.image_hash) priorHashes.add(analysis.image_hash);
    }
  }

  const textOnlyCount = (todayAnalyses || []).filter(
    (analysis) => !analysis.image_hash
  ).length;
  const newImageAnalysisCount = imageHashes.filter(
    (imageHash) => !priorHashes.has(imageHash)
  ).length;

  return textOnlyCount + newImageAnalysisCount;
}

async function countRowsToday({ table, userId }) {
  const { start, end } = getTodayRange();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) {
    console.error(`Error contando uso IA en ${table}:`, error);
    throw new Error("No se pudo comprobar el límite diario de IA");
  }

  return count || 0;
}

function getTodayRange() {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

function getUsageKey({ userId, type }) {
  return `${userId}:${type}`;
}
