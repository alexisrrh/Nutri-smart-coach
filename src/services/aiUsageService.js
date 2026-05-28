import { request } from "./apiClient";

export const AI_USAGE_TYPES = {
  food_analysis: {
    limit: 6,
    premiumLimit: 100,
    label: "análisis de comida",
    singular: "análisis",
    plural: "análisis",
  },
  diet_generation: {
    limit: 1,
    premiumLimit: 10,
    label: "generación de dietas",
    singular: "generación de dieta",
    plural: "generaciones de dieta",
  },
  checkin_analysis: {
    limit: 1,
    premiumLimit: 7,
    label: "check-in IA",
    singular: "check-in IA",
    plural: "check-ins IA",
  },
};

export function isPremiumUser(profile) {
  return Boolean(profile?.plan === "premium" || profile?.is_premium === true);
}

export async function fetchDailyAiUsage(userId) {
  if (!userId) {
    return { usage: {} };
  }

  const data = await request(`/ai-usage/${userId}`, {}, {
    operation: "consultar el uso diario de IA",
  });

  return {
    usage: data?.usage || {},
    limits: data?.limits || AI_USAGE_TYPES,
  };
}

export function getAiUsageForType(usageByType, type) {
  return usageByType?.[type] || null;
}

export function extractAiUsageFromError(error, type) {
  return error?.data?.usage?.[type] || null;
}

export function formatAiUsageMessage(type, usage, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;

  if (isPremiumUser(profile)) {
    return getPremiumUsageMessage(type, meta);
  }

  if (!usage) {
    return formatAvailableMessage(type, meta.limit);
  }

  if (usage.isLimitReached) {
    return `Límite diario alcanzado · disponible nuevamente en ${formatResetCountdown(
      usage.resetAt
    )}`;
  }

  return formatAvailableMessage(type, usage.remaining);
}

export function formatAiUsageDetail(type, usage, profile) {
  if (isPremiumUser(profile)) {
    return "Uso avanzado para usuarios premium con límites ampliados.";
  }

  if (!usage) {
    return "Sincronizando tu cupo diario...";
  }

  if (usage.isLimitReached) {
    return `Se reinicia en ${formatResetCountdown(usage.resetAt)}`;
  }

  return `Se reinicia hoy a ${formatResetTime(usage.resetAt)}`;
}

export function formatAiUsageCounter(type, usage, profile) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const premiumLimit = getPremiumLimit(type, meta);
  const remaining = Number(usage?.remaining);

  if (isPremiumUser(profile)) {
    const usedToday = Number(usage?.usedToday || 0);
    return `${usedToday}/${premiumLimit}`;
  }

  if (!usage) {
    return `0/${meta.limit}`;
  }

  return `${Math.max(usage.limit - (Number.isNaN(remaining) ? 0 : remaining), 0)}/${usage.limit}`;
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

function formatAvailableMessage(type, remaining) {
  const meta = AI_USAGE_TYPES[type] || AI_USAGE_TYPES.food_analysis;
  const safeRemaining = Math.max(Number(remaining) || 0, 0);

  if (type === "diet_generation") {
    return safeRemaining === 1
      ? `Te queda 1 ${meta.singular} hoy`
      : `Te queda ${safeRemaining} ${meta.plural} hoy`;
  }

  if (type === "checkin_analysis") {
    return `Te queda ${safeRemaining === 1 ? 1 : safeRemaining} ${meta.singular} hoy`;
  }

  return safeRemaining === 1
    ? `Te queda 1 ${meta.singular} hoy`
    : `Te quedan ${safeRemaining} ${meta.plural} hoy`;
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

function getPremiumUsageMessage(type, meta) {
  if (type === "food_analysis") {
    return `Premium activo · hasta ${getPremiumLimit(type, meta)} análisis de comida al día`;
  }

  if (type === "diet_generation") {
    return `Premium activo · hasta ${getPremiumLimit(type, meta)} dietas IA al día`;
  }

  if (type === "checkin_analysis") {
    return `Premium activo · hasta ${getPremiumLimit(type, meta)} check-ins IA al día`;
  }

  return "Premium activo · límites ampliados";
}

function getPremiumLimit(type, meta) {
  return meta?.premiumLimit || meta?.limit || AI_USAGE_TYPES[type]?.limit || 0;
}
