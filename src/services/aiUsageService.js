import { request } from "./apiClient";

const LEGACY_AI_USAGE_STORAGE_KEYS = [
  "nutricoach_ai_usage",
  "nutricoach_ai_usage_v1",
  "nutricoach_ai_usage_cache",
  "nutricoach_ai_usage_v2",
  "ai_usage",
];

export const AI_USAGE_TYPES = {
  food_analysis: {
    limit: 3,
    premiumLimit: 20,
    period: "day",
    premiumPeriod: "day",
    label: "análisis de comida",
    singular: "análisis",
    plural: "análisis",
  },
  diet_generation: {
    limit: 1,
    premiumLimit: 5,
    period: "week",
    premiumPeriod: "day",
    label: "generación de dietas",
    singular: "generación de dieta",
    plural: "generaciones de dieta",
  },
  checkin_analysis: {
    limit: 1,
    premiumLimit: 1,
    period: "week",
    premiumPeriod: "day",
    label: "check-in IA",
    singular: "check-in IA",
    plural: "check-ins IA",
  },
};

export function isPremiumUser(profile) {
  return Boolean(
    profile?.plan === "premium" &&
      profile?.is_premium === true &&
      ["active", "trialing"].includes(profile?.subscription_status)
  );
}

export function isPremiumUsage(usage, profile) {
  if (usage?.plan) return usage.plan === "premium";

  return isPremiumUser(profile);
}

export function getAiUsageLimitForProfile(type, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;

  if (isPremiumUser(profile)) {
    return meta.premiumLimit || meta.limit;
  }

  return meta.limit;
}

export function getAiUsagePlanLabel(profile) {
  return isPremiumUser(profile) ? "Premium activo" : "Plan Free";
}

export function purgeLegacyAiUsageCache() {
  if (typeof localStorage === "undefined") return;

  for (const key of LEGACY_AI_USAGE_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export async function fetchDailyAiUsage(userId) {
  if (!userId) {
    return { usage: {} };
  }

  const data = await request(`/ai-usage/${userId}`, {}, {
    operation: "consultar el uso de IA",
  });

  return {
    usage: normalizeAiUsageSummary(data?.usage || {}),
    limits: normalizeAiUsageLimits(data?.limits || AI_USAGE_TYPES, data?.plan || "free"),
    plan: data?.plan || "free",
  };
}

export function getAiUsageForType(usageByType, type) {
  return normalizeAiUsageState(type, usageByType?.[type] || null);
}

export function createFallbackAiUsageState(type, usedToday = 0, profile = null) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const safeUsed = Math.max(Number(usedToday) || 0, 0);
  const premium = isPremiumUser(profile) || profile === "premium";
  const safeLimit = premium ? meta.premiumLimit || meta.limit || 0 : meta.limit || 0;
  const safePeriod = premium
    ? meta.premiumPeriod || meta.period || "day"
    : meta.period || "day";

  return {
    type,
    usedToday: safeUsed,
    limit: safeLimit,
    plan: premium ? "premium" : "free",
    upgradeAvailable: premium ? false : true,
    remaining: Math.max(safeLimit - safeUsed, 0),
    period: safePeriod,
    resetAt: null,
    isLimitReached: safeLimit > 0 ? safeUsed >= safeLimit : false,
    isFallback: true,
  };
}

export function extractAiUsageFromError(error, type) {
  return normalizeAiUsageState(type, error?.data?.usage?.[type] || null);
}

export function formatAiUsageMessage(type, usage, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const normalizedUsage = normalizeAiUsageState(type, usage, profile);
  const period = getUsagePeriod(type, normalizedUsage, profile, meta);
  const periodLabel = getPeriodLabel(period);

  if (isPremiumUsage(normalizedUsage, profile)) {
    return getPremiumUsageMessage(type, meta, periodLabel);
  }

  if (!normalizedUsage) {
    return formatAvailableMessage(type, meta.limit, periodLabel);
  }

  if (normalizedUsage.isLimitReached) {
    return `Límite ${periodLabel} alcanzado · disponible nuevamente en ${formatResetCountdown(
      normalizedUsage.resetAt
    )}`;
  }

  return formatAvailableMessage(type, normalizedUsage.remaining, periodLabel);
}

export function formatAiUsageDetail(type, usage, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const normalizedUsage = normalizeAiUsageState(type, usage, profile);
  const period = getUsagePeriod(type, normalizedUsage, profile, meta);
  const periodLabel = getPeriodLabel(period);
  const cadenceLabel = getCadenceLabel(period);

  if (isPremiumUsage(normalizedUsage, profile)) {
    return `Uso avanzado para usuarios premium con cupos ${periodLabel === "día" ? "diarios" : "semanales"} ampliados.`;
  }

  if (normalizedUsage?.isFallback) {
    return `No se pudo sincronizar tu cupo ${cadenceLabel}. Se muestran límites Free de respaldo.`;
  }

  if (!normalizedUsage) {
    return `Sincronizando tu cupo ${cadenceLabel}...`;
  }

  if (normalizedUsage.isLimitReached) {
    return `Se reinicia en ${formatResetCountdown(normalizedUsage.resetAt)}`;
  }

  return `Se reinicia ${period === "week" ? "la próxima semana" : "hoy"} a ${formatResetTime(
    normalizedUsage.resetAt
  )}`;
}

export function formatAiUsageCounter(type, usage, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const normalizedUsage = normalizeAiUsageState(type, usage, profile);
  const premiumLimit = getPremiumLimit(type, meta);
  const remaining = Number(normalizedUsage?.remaining);

  if (isPremiumUsage(normalizedUsage, profile)) {
    const usedToday = Number(normalizedUsage?.usedToday || 0);
    return `${usedToday}/${normalizedUsage?.limit || premiumLimit}`;
  }

  if (!normalizedUsage) {
    return `0/${meta.limit}`;
  }

  return `${Math.max(normalizedUsage.limit - (Number.isNaN(remaining) ? 0 : remaining), 0)}/${normalizedUsage.limit}`;
}

export function getAiUsagePeriodLabel(type, usage, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const period = getUsagePeriod(type, normalizeAiUsageState(type, usage, profile), profile, meta);
  return period === "week" ? "semanal" : "diario";
}

export function normalizeAiUsageState(type, usage, profile = null) {
  if (!usage) return null;

  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const premium = isPremiumUsage(usage, profile);
  const expectedLimit = premium ? meta.premiumLimit || meta.limit : meta.limit;
  const expectedPeriod = premium
    ? meta.premiumPeriod || meta.period || "day"
    : meta.period || "day";
  const safeUsed = Math.max(Number(usage?.usedToday) || 0, 0);
  const derivedRemaining = Math.max(expectedLimit - safeUsed, 0);
  const safeRemaining = Math.max(
    Math.min(
      Number.isFinite(Number(usage?.remaining)) ? Number(usage.remaining) : derivedRemaining,
      expectedLimit
    ),
    0
  );

  return {
    ...usage,
    type,
    limit: expectedLimit,
    period: expectedPeriod,
    remaining: safeRemaining,
    isLimitReached:
      typeof usage?.isLimitReached === "boolean"
        ? usage.isLimitReached || safeUsed >= expectedLimit
        : safeUsed >= expectedLimit,
    usedToday: safeUsed,
  };
}

function normalizeAiUsageSummary(usageByType = {}) {
  return Object.fromEntries(
    Object.keys(usageByType).map((type) => [type, normalizeAiUsageState(type, usageByType[type])])
  );
}

function normalizeAiUsageLimits(limitsByType = {}, plan = "free") {
  return Object.fromEntries(
    Object.keys(AI_USAGE_TYPES).map((type) => {
      const meta = AI_USAGE_TYPES[type];
      const premium = plan === "premium";
      const source = limitsByType?.[type] || {};

      return [
        type,
        {
          ...source,
          limit: premium ? meta.premiumLimit || meta.limit : meta.limit,
          period: premium ? meta.premiumPeriod || meta.period || "day" : meta.period || "day",
          plan: premium ? "premium" : "free",
        },
      ];
    })
  );
}

export function formatResetCountdown(resetAt) {
  if (!resetAt) return "mañana";

  const resetMs = Date.parse(resetAt);
  if (Number.isNaN(resetMs)) return "mañana";

  const diffMs = resetMs - Date.now();
  if (diffMs <= 0) return "ahora";

  const totalMinutes = Math.max(Math.ceil(diffMs / 60000), 1);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  if (minutes <= 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatAvailableMessage(type, remaining, periodLabel = "día") {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const safeRemaining = Math.max(Number(remaining) || 0, 0);
  const periodText = periodLabel === "semana" ? "esta semana" : "hoy";

  if (type === "food_analysis") {
    return safeRemaining === 1
      ? "Te queda 1 análisis IA hoy"
      : `Te quedan ${safeRemaining} análisis IA ${periodText}`;
  }

  if (type === "diet_generation") {
    return safeRemaining === 1
      ? `Te queda 1 ${meta.singular} ${periodText}`
      : `Te quedan ${safeRemaining} ${meta.plural} ${periodText}`;
  }

  if (type === "checkin_analysis") {
    return `Te queda ${safeRemaining === 1 ? 1 : safeRemaining} ${meta.singular} ${periodText}`;
  }

  return safeRemaining === 1
    ? `Te queda 1 ${meta.singular} ${periodText}`
    : `Te quedan ${safeRemaining} ${meta.plural} ${periodText}`;
}

function formatResetTime(resetAt) {
  if (!resetAt) return "mañana";

  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return "mañana";

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPremiumUsageMessage(type, meta, periodLabel) {
  const cadence = periodLabel === "semana" ? "a la semana" : "al día";

  if (type === "food_analysis") {
    return `Premium activo · hasta ${getPremiumLimit(type, meta)} análisis IA ${cadence}`;
  }

  if (type === "diet_generation") {
    return `Premium activo · hasta ${getPremiumLimit(type, meta)} dietas IA ${cadence}`;
  }

  if (type === "checkin_analysis") {
    return `Premium activo · ${getPremiumLimit(type, meta)} check-in IA ${cadence}`;
  }

  return "Premium activo · límites ampliados";
}

function getPremiumLimit(type, meta) {
  return meta?.premiumLimit || meta?.limit || AI_USAGE_TYPES[type]?.limit || 0;
}

function getUsagePeriod(type, usage, profile, meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis) {
  if (usage?.period) return usage.period;
  if (isPremiumUsage(usage, profile)) return meta.premiumPeriod || meta.period || "day";
  return meta.period || "day";
}

function getPeriodLabel(period) {
  return period === "week" ? "semana" : "día";
}

function getCadenceLabel(period) {
  return period === "week" ? "semanal" : "diario";
}
