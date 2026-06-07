import { request } from "./apiClient";

const CREATOR_SHARE_TRIAL_DAYS = 15;
const CREATOR_PANEL_CACHE_PREFIX = "creator_panel_cache";
const creatorStatusRequestMap = new Map();

export async function getCreatorStatus() {
  return request("/creators/me", {}, { operation: "cargar tu panel de creadores" });
}

export function getCreatorPanelCacheKey(userId) {
  return userId ? `${CREATOR_PANEL_CACHE_PREFIX}_${userId}` : CREATOR_PANEL_CACHE_PREFIX;
}

export function getCreatorPanelCache(userId) {
  if (typeof localStorage === "undefined" || !userId) return null;

  const raw = localStorage.getItem(getCreatorPanelCacheKey(userId));
  if (!raw) return null;

  try {
    return normalizeCreatorPanelCache(JSON.parse(raw), userId);
  } catch {
    return null;
  }
}

export function setCreatorPanelCache(userId, creatorStatus) {
  if (typeof localStorage === "undefined" || !userId) return null;

  const normalized = normalizeCreatorPanelCache(creatorStatus, userId);
  localStorage.setItem(getCreatorPanelCacheKey(userId), JSON.stringify(normalized));
  return normalized;
}

export function clearCreatorPanelCache(userId) {
  if (typeof localStorage === "undefined") return;

  if (userId) {
    localStorage.removeItem(getCreatorPanelCacheKey(userId));
    return;
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(`${CREATOR_PANEL_CACHE_PREFIX}_`)) {
      localStorage.removeItem(key);
      index -= 1;
    }
  }
}

export async function loadCreatorStatus(userId, { forceRefresh = false } = {}) {
  const cachedStatus = getCreatorPanelCache(userId);
  if (!userId) return cachedStatus;
  if (cachedStatus && !forceRefresh) return cachedStatus;

  const requestKey = getCreatorPanelCacheKey(userId);
  const existingRequest = creatorStatusRequestMap.get(requestKey);
  if (existingRequest) return existingRequest;

  const requestPromise = (async () => {
    const remoteStatus = await getCreatorStatus();
    const normalizedStatus = normalizeCreatorPanelCache(remoteStatus, userId);
    setCreatorPanelCache(userId, normalizedStatus);
    return normalizedStatus;
  })().finally(() => {
    creatorStatusRequestMap.delete(requestKey);
  });

  creatorStatusRequestMap.set(requestKey, requestPromise);
  return requestPromise;
}

export async function submitCreatorApplication(payload) {
  return request(
    "/creators/apply",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        socialPlatform: payload?.socialPlatform,
        socialHandle: payload?.socialHandle,
        followersCount: payload?.followersCount,
        proofUrl: payload?.proofUrl,
      }),
    },
    { operation: "enviar tu solicitud de creador" }
  );
}

export async function updateCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un código de creador para actualizar.");
  }

  return request(
    "/creators/code",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: safeCode,
      }),
    },
    { operation: "actualizar tu código de creador" }
  );
}

export async function requestCreatorPayout() {
  return request(
    "/creators/payouts/request",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { operation: "solicitar un retiro de creador" }
  );
}

export async function copyCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un código de creador para copiar.");
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(safeCode);
    return safeCode;
  }

  throw new Error("No se pudo copiar el código.");
}

export async function copyCreatorLink(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un enlace de creador para copiar.");
  }

  const creatorLink = buildCreatorJoinLink(safeCode);

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(creatorLink);
    return creatorLink;
  }

  throw new Error("No se pudo copiar el enlace.");
}

export async function shareCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw new Error("No existe un código de creador para compartir.");
  }

  const creatorLink = buildCreatorJoinLink(safeCode);
  const payload = {
    title: "NutriSmart Coach",
    text: buildCreatorShareText(safeCode),
    url: creatorLink,
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share(payload);
    return payload;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${payload.text} ${payload.url}`);
    return payload;
  }

  throw new Error("No se pudo compartir el código.");
}

export function buildCreatorShareText(code) {
  const safeCode = normalizeCreatorCode(code);
  return `Únete a NutriSmart Coach con mi código ${safeCode} y consigue ${CREATOR_SHARE_TRIAL_DAYS} días Premium gratis.`;
}

export function buildCreatorJoinLink(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) return "https://nutrismartcoach.com/join";

  const baseUrl = String(
    import.meta.env.VITE_CREATOR_JOIN_BASE_URL ||
      import.meta.env.VITE_APP_URL ||
      import.meta.env.VITE_SITE_URL ||
      "https://nutrismartcoach.com"
  ).replace(/\/+$/, "");

  return `${baseUrl}/join?creator=${encodeURIComponent(safeCode)}`;
}

export function normalizeCreatorPanelCache(creatorStatus, userId = null) {
  const source = creatorStatus || {};
  const creatorCode = normalizeCreatorCode(
    source.creatorCode || source.creator_code || source.code || ""
  );
  const metrics = normalizeCreatorMetrics(source.metrics || source.stats);
  const stats = normalizeCreatorStats(source.stats || metrics);
  const payouts = normalizeCreatorPayouts(source.payouts || metrics, metrics);
  const joinUrl = source.joinUrl || source.join_url || buildCreatorJoinLink(creatorCode);
  const commissionHistory = normalizeCreatorHistory(
    source.commissionHistory || source.history || []
  );
  const payoutRequests = normalizeCreatorHistory(
    source.payoutRequests || source.paymentHistory || []
  );
  const history = normalizeCreatorHistory(source.history || [
    ...commissionHistory,
    ...payoutRequests,
  ]);

  return {
    application: source.application ?? null,
    creatorCode,
    creatorCodeCustomized: Boolean(
      source.creatorCodeCustomized ||
        source.creator_code_customized ||
        source.customizedAt ||
        source.customized_at
    ),
    joinUrl,
    message: source.message || source.creatorMessage || source.creator_message || null,
    payouts,
    stats,
    metrics,
    profileRequired: Boolean(
      source.profileRequired ||
        source.profile_required ||
        source.needsProfile ||
        source.needs_profile
    ),
    commissionHistory,
    payoutRequests,
    history,
    status: String(source.status || "none"),
    updatedAt: source.updatedAt || source.updated_at || new Date().toISOString(),
    userId: userId || source.userId || source.user_id || null,
  };
}

function normalizeCreatorStats(stats) {
  if (!stats || typeof stats !== "object") {
    return null;
  }

  return stats;
}

function normalizeCreatorMetrics(metrics) {
  if (!metrics || typeof metrics !== "object") {
    return null;
  }

  return {
    clicks: Number(metrics.clicks ?? metrics.linkClicks ?? metrics.linkClicksCount ?? 0),
    usersWithCode: Number(metrics.usersWithCode ?? metrics.registeredUsers ?? 0),
    premiumActive: Number(metrics.premiumActive ?? metrics.premiumUsers ?? 0),
    conversionRate: Number(metrics.conversionRate ?? 0),
    commissionAccumulated: Number(
      metrics.commissionAccumulated ??
        metrics.totalCommissionAmount ??
        metrics.totalEarnings ??
        0
    ),
    pendingAmount: Number(metrics.pendingAmount ?? metrics.pendingCommissionAmount ?? 0),
    availableToWithdraw: Number(
      metrics.availableToWithdraw ?? metrics.availableCommissionAmount ?? 0
    ),
    paidAmount: Number(metrics.paidAmount ?? 0),
    pendingPayoutRequestsCount: Number(metrics.pendingPayoutRequestsCount ?? 0),
    hasPendingPayoutRequest: Boolean(metrics.hasPendingPayoutRequest),
    withdrawalThreshold: Number(metrics.withdrawalThreshold ?? 25),
  };
}

function normalizeCreatorPayouts(payouts, metrics) {
  const source = payouts && typeof payouts === "object" ? payouts : {};
  const availableCommissionAmount = Number(
    source.availableCommissionAmount ??
      source.withdrawableCommissionAmount ??
      source.commissionBalance ??
      source.availableAmount ??
      metrics?.availableToWithdraw ??
      0
  );
  const pendingCommissionAmount = Number(
    source.pendingCommissionAmount ??
      source.pendingCommissionsAmount ??
      source.pendingAmount ??
      metrics?.pendingAmount ??
      0
  );
  const withdrawalThreshold = Number(
    source.withdrawalThreshold ??
      source.minimumWithdrawal ??
      metrics?.withdrawalThreshold ??
      25
  );
  const hasPendingPayoutRequest = Boolean(
    source.hasPendingPayoutRequest ??
      source.pendingPayoutRequestsCount ??
      metrics?.hasPendingPayoutRequest ??
      metrics?.pendingPayoutRequestsCount
  );

  return {
    availableCommissionAmount,
    canRequestWithdrawal:
      availableCommissionAmount >= withdrawalThreshold && !hasPendingPayoutRequest,
    pendingCommissionAmount,
    withdrawalThreshold,
    hasPendingPayoutRequest,
    pendingPayoutRequestsCount: Number(
      source.pendingPayoutRequestsCount ?? metrics?.pendingPayoutRequestsCount ?? 0
    ),
  };
}

function normalizeCreatorHistory(items) {
  if (!Array.isArray(items)) return [];

  return items;
}

function normalizeCreatorCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}
