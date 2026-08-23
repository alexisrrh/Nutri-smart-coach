import { supabase } from "../config/supabase.js";

const rateLimitByUserAndType = new Map();
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export const AI_USAGE_RULES = {
  food_analysis: {
    freeLimit: 3,
    premiumLimit: 20,
    freePeriod: "day",
    premiumPeriod: "day",
  },
  diet_generation: {
    freeLimit: 1,
    premiumLimit: 5,
    freePeriod: "week",
    premiumPeriod: "day",
  },
  checkin_analysis: {
    freeLimit: 1,
    premiumLimit: 1,
    freePeriod: "week",
    premiumPeriod: "day",
  },
  rewrite_meal: {
    freeLimit: 0,
    premiumLimit: 12,
    freePeriod: "day",
    premiumPeriod: "day",
  },
};

export class AiUsageError extends Error {
  constructor(message, status = 429) {
    super(message);
    this.name = "AiUsageError";
    this.status = status;
  }
}

export async function checkDailyAiLimit({ userId, type, limit, profile }) {
  const usage = await getDailyAiUsage({ userId, type, limit, profile });

  return {
    allowed: !usage.isLimitReached,
    count: usage.usedToday,
    limit: usage.limit,
    plan: usage.plan,
    upgradeAvailable: usage.upgradeAvailable,
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

export async function recordAiUsageEvent({ userId, type, metadata = {} }) {
  if (!userId || !type) return;

  const { error } = await supabase
    .from("ai_usage_events")
    .insert({
      user_id: userId,
      type,
      metadata,
    });

  if (error) {
    console.error("Error registrando uso IA", {
      type,
      code: error?.code || "AI_USAGE_EVENT_INSERT_FAILED",
    });
    throw new Error("No se pudo registrar el uso de IA");
  }
}

export async function getDailyAiUsage({ userId, type, limit, profile }) {
  const resolvedLimit = await resolveUsageLimit({ userId, type, limit, profile });
  const limitValue = resolvedLimit.limit;
  const resolvedProfile = resolvedLimit.profile;
  const resolvedPlan = getAiUsagePlan(resolvedProfile);
  const usageWindow = getUsageWindow(type, resolvedPlan);

  if (!userId) {
    return buildUsageState({
      type,
      usedToday: 0,
      limit: limitValue,
      plan: "free",
      period: usageWindow.period,
    });
  }

  const usedToday = await countPeriodUsage({
    userId,
    type,
    profile: resolvedProfile,
  });

  return buildUsageState({
    type,
    usedToday,
    limit: limitValue,
    plan: resolvedPlan,
    period: usageWindow.period,
  });
}

export async function getAllDailyAiUsage(userId) {
  const entries = await Promise.all(
    Object.entries(AI_USAGE_RULES).map(async ([type, rule]) => [
      type,
      await getDailyAiUsage({ userId, type, limit: rule.freeLimit }),
    ])
  );

  return Object.fromEntries(entries);
}

export async function getAllDailyAiUsageWithProfile(userId, profile) {
  const entries = await Promise.all(
    Object.entries(AI_USAGE_RULES).map(async ([type, rule]) => [
      type,
      await getDailyAiUsage({ userId, type, limit: rule.freeLimit, profile }),
    ])
  );

  return Object.fromEntries(entries);
}

export function isPremiumProfile(profileOrPlan) {
  if (!profileOrPlan) return false;

  const subscriptionStatus = String(profileOrPlan?.subscription_status || "inactive").toLowerCase();
  const premiumExpiresAt = parsePremiumDate(profileOrPlan?.premium_expires_at);
  const now = Date.now();

  return Boolean(
    profileOrPlan?.is_premium === true &&
      profileOrPlan?.plan === "premium" &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) &&
      (premiumExpiresAt === null || premiumExpiresAt > now)
  );
}

export function getAiUsagePlan(profileOrPlan) {
  return isPremiumProfile(profileOrPlan) ? "premium" : "free";
}

export function getAiUsageLimit(type, profileOrPlan) {
  const rule = AI_USAGE_RULES[type];
  if (!rule) return 0;
  if (!isPremiumProfile(profileOrPlan)) return rule.freeLimit;

  return rule.premiumLimit;
}

export function getAiUsageLimits(profileOrPlan) {
  return Object.fromEntries(
    Object.entries(AI_USAGE_RULES).map(([type]) => [
      type,
      {
        limit: getAiUsageLimit(type, profileOrPlan),
        plan: getAiUsagePlan(profileOrPlan),
        period: getAiUsagePeriod(type, profileOrPlan),
      },
    ])
  );
}

export function getAiUsagePeriod(type, profileOrPlan) {
  return getUsageWindow(type, getAiUsagePlan(profileOrPlan)).period;
}

async function countPeriodUsage({ userId, type, profile }) {
  const plan = getAiUsagePlan(profile);
  const usageWindow = getUsageWindow(type, plan);

  if (type === "food_analysis") {
    return countDailyFoodAnalysis(userId);
  }

  if (type === "checkin_analysis") {
    return countRowsInRange({
      table: "checkins",
      userId,
      period: usageWindow.period,
    });
  }

  if (type === "diet_generation") {
    return countRowsInRange({
      table: "diet_plans",
      userId,
      period: usageWindow.period,
    });
  }

  if (type === "rewrite_meal") {
    return countRowsInRange({
      table: "ai_usage_events",
      userId,
      period: usageWindow.period,
      filters: {
        type,
      },
    });
  }

  throw new Error(`Tipo de uso IA no soportado: ${type}`);
}

async function resolveUsageLimit({ userId, type, limit, profile }) {
  if (profile) {
    return {
      limit: getAiUsageLimit(type, profile),
      profile,
    };
  }

  if (userId) {
    const resolvedProfile = await getUserProfileForAiUsage(userId);
    if (resolvedProfile) {
      return {
        limit: getAiUsageLimit(type, resolvedProfile),
        profile: resolvedProfile,
      };
    }
  }

  if (limit) {
    return {
      limit,
      profile: null,
    };
  }

  return {
    limit: AI_USAGE_RULES[type]?.freeLimit || 0,
    profile: null,
  };
}

async function getUserProfileForAiUsage(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      [
        "plan",
        "is_premium",
        "subscription_status",
        "premium_source",
        "premium_product_id",
        "premium_platform_transaction_id",
        "premium_expires_at",
        "premium_last_verified_at",
      ].join(", ")
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error consultando el perfil para límites IA", {
      code: error?.code || "AI_USAGE_PROFILE_FAILED",
    });
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
    console.error("Error contando análisis diarios", {
      code: todayError?.code || "AI_USAGE_DAILY_COUNT_FAILED",
    });
    throw new Error("No se pudo comprobar el límite de análisis IA");
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
      console.error("Error revisando hashes previos", {
        code: previousError?.code || "AI_USAGE_HASH_LOOKUP_FAILED",
      });
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

async function countRowsInRange({ table, userId, period, filters = {} }) {
  const { start, end } = getUsageRange(period);
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start);

  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }

  const { count, error } = await query.lt("created_at", end);

  if (error) {
    console.error("Error contando uso IA", {
      table,
      code: error?.code || "AI_USAGE_COUNT_FAILED",
    });
    throw new Error("No se pudo comprobar el límite de uso IA");
  }

  return count || 0;
}

function getUsageRange(period = "day") {
  if (period === "week") {
    return getWeekRange();
  }

  return getTodayRange();
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

function getWeekRange() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const day = startDate.getDay();
  const diffToMonday = (day + 6) % 7;
  startDate.setDate(startDate.getDate() - diffToMonday);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

function getNextResetAt(period = "day") {
  const { end } = getUsageRange(period);
  return end;
}

function buildUsageState({ type, usedToday, limit, plan, period = "day" }) {
  const safeLimit = Number(limit) > 0 ? Number(limit) : 0;
  const safeUsed = Number(usedToday) > 0 ? Number(usedToday) : 0;
  const remaining = Math.max(safeLimit - safeUsed, 0);
  const resolvedPlan = plan === "premium" ? "premium" : "free";

  return {
    type,
    usedToday: safeUsed,
    limit: safeLimit,
    plan: resolvedPlan,
    upgradeAvailable: resolvedPlan === "free",
    remaining,
    period,
    resetAt: getNextResetAt(period),
    isLimitReached: safeLimit > 0 ? safeUsed >= safeLimit : false,
  };
}

function parsePremiumDate(value) {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function getUsageKey({ userId, type }) {
  return `${userId}:${type}`;
}

function getUsageWindow(type, plan) {
  const rule = AI_USAGE_RULES[type];
  if (!rule) {
    return { period: "day" };
  }

  if (plan === "premium") {
    return {
      period: rule.premiumPeriod,
    };
  }

  return {
    period: rule.freePeriod,
  };
}
