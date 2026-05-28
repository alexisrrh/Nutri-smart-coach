import { supabase } from "../config/supabase.js";

const rateLimitByUserAndType = new Map();

export const AI_USAGE_LIMITS = {
  food_analysis: 4,
  diet_generation: 1,
  checkin_analysis: 1,
};

export const PREMIUM_AI_USAGE_LIMITS = {
  food_analysis: 100,
  diet_generation: 10,
  checkin_analysis: 7,
};

export class AiUsageError extends Error {
  constructor(message, status = 429) {
    super(message);
    this.name = "AiUsageError";
    this.status = status;
  }
}

export async function checkDailyAiLimit({ userId, type, limit }) {
  const usage = await getDailyAiUsage({ userId, type, limit });

  return {
    allowed: !usage.isLimitReached,
    count: usage.usedToday,
    limit: usage.limit,
    remaining: usage.remaining,
    resetAt: usage.resetAt,
    isLimitReached: usage.isLimitReached,
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

export async function getDailyAiUsage({ userId, type, limit }) {
  const resolvedLimit = await resolveUsageLimit({ userId, type, limit });

  if (!userId) {
    return buildUsageState({
      type,
      usedToday: 0,
      limit: resolvedLimit,
    });
  }

  const usedToday = await countDailyUsage({ userId, type });

  return buildUsageState({
    type,
    usedToday,
    limit: resolvedLimit,
  });
}

export async function getAllDailyAiUsage(userId) {
  const entries = await Promise.all(
    Object.entries(AI_USAGE_LIMITS).map(async ([type, limit]) => [
      type,
      await getDailyAiUsage({ userId, type, limit }),
    ])
  );

  return Object.fromEntries(entries);
}

export async function getAllDailyAiUsageWithProfile(userId, profile) {
  const entries = await Promise.all(
    Object.entries(AI_USAGE_LIMITS).map(async ([type, limit]) => [
      type,
      await getDailyAiUsage({ userId, type, limit, profile }),
    ])
  );

  return Object.fromEntries(entries);
}

export function isPremiumProfile(profileOrPlan) {
  if (!profileOrPlan) return false;

  if (typeof profileOrPlan === "string") {
    return profileOrPlan === "premium";
  }

  return Boolean(
    profileOrPlan?.is_premium === true || profileOrPlan?.plan === "premium"
  );
}

export function getAiUsageLimit(type, profileOrPlan) {
  const baseLimit = AI_USAGE_LIMITS[type] || 0;
  if (!isPremiumProfile(profileOrPlan)) return baseLimit;

  return PREMIUM_AI_USAGE_LIMITS[type] || baseLimit;
}

export function getAiUsageLimits(profileOrPlan) {
  return Object.fromEntries(
    Object.entries(AI_USAGE_LIMITS).map(([type]) => [
      type,
      {
        limit: getAiUsageLimit(type, profileOrPlan),
      },
    ])
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

async function resolveUsageLimit({ userId, type, limit, profile }) {
  if (profile) {
    return getAiUsageLimit(type, profile);
  }

  if (userId) {
    const resolvedProfile = await getUserProfileForAiUsage(userId);
    if (resolvedProfile) {
      return getAiUsageLimit(type, resolvedProfile);
    }
  }

  if (limit) return limit;

  return AI_USAGE_LIMITS[type] || 0;
}

async function getUserProfileForAiUsage(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, is_premium")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error consultando el perfil para límites IA:", error);
    return null;
  }

  return data || null;
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

function getNextResetAt() {
  const { end } = getTodayRange();
  return end;
}

function buildUsageState({ type, usedToday, limit }) {
  const safeLimit = Number(limit) > 0 ? Number(limit) : 0;
  const safeUsed = Number(usedToday) > 0 ? Number(usedToday) : 0;
  const remaining = Math.max(safeLimit - safeUsed, 0);

  return {
    type,
    usedToday: safeUsed,
    limit: safeLimit,
    remaining,
    resetAt: getNextResetAt(),
    isLimitReached: safeLimit > 0 ? safeUsed >= safeLimit : false,
  };
}

function getUsageKey({ userId, type }) {
  return `${userId}:${type}`;
}
