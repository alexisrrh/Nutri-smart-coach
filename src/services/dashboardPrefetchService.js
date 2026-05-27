import { getCachedCheckins, listCheckins } from "./checkinService";
import { getCachedDietPlans, listDietPlans } from "./dietService";
import { getCachedMeals, listMeals } from "./mealService";
import { getCachedProfile, getProfile } from "./profileService";
import { getCachedProgressLogs, listProgressLogs } from "./progressService";

const DASHBOARD_PREFETCH_FRESH_MS = 15000;

let dashboardChunkPromise = null;
let dashboardDataPromise = null;
let dashboardDataUserId = null;
let dashboardDataLoadedAt = 0;

export function preloadDashboardChunk() {
  if (!dashboardChunkPromise) {
    dashboardChunkPromise = import("../pages/Dashboard");
  }

  return dashboardChunkPromise;
}

export function getCachedDashboardData(userId) {
  const cachedProfile = getCachedProfile();
  const resolvedUserId = userId || cachedProfile?.id || cachedProfile?.user_id || null;

  return {
    profile: cachedProfile,
    meals: getCachedMeals(),
    dietPlans: getCachedDietPlans(),
    checkins: getCachedCheckins(resolvedUserId),
    progressLogs: getCachedProgressLogs(resolvedUserId),
  };
}

export function prefetchDashboardData(userId) {
  return loadDashboardData(userId, {
    fallbackToCache: true,
    maxCacheAgeMs: DASHBOARD_PREFETCH_FRESH_MS,
  });
}

export async function loadDashboardData(
  userId,
  { fallbackToCache = false, maxCacheAgeMs = 0 } = {}
) {
  if (!userId) {
    return {
      ...getCachedDashboardData(userId),
      errors: [new Error("Sesión no válida. Vuelve a iniciar sesión.")],
      fromCache: true,
    };
  }

  const cacheIsFresh =
    dashboardDataUserId === userId &&
    dashboardDataLoadedAt > 0 &&
    Date.now() - dashboardDataLoadedAt < maxCacheAgeMs;

  if (cacheIsFresh) {
    return {
      ...getCachedDashboardData(userId),
      errors: [],
      fromCache: true,
    };
  }

  if (dashboardDataPromise && dashboardDataUserId === userId) {
    return dashboardDataPromise;
  }

  dashboardDataUserId = userId;
  dashboardDataPromise = fetchDashboardData(userId, { fallbackToCache }).finally(
    () => {
      dashboardDataPromise = null;
    }
  );

  return dashboardDataPromise;
}

async function fetchDashboardData(userId, { fallbackToCache }) {
  const [profileRes, mealsRes, dietsRes, checkinsRes, progressRes] =
    await Promise.allSettled([
      getProfile(userId, { fallbackToCache }),
      listMeals(userId, { fallbackToCache }),
      listDietPlans(userId, { fallbackToCache }),
      listCheckins(userId, { fallbackToCache }),
      listProgressLogs(userId, { fallbackToCache }),
    ]);

  dashboardDataLoadedAt = Date.now();

  const cachedData = getCachedDashboardData(userId);
  const errors = [];

  return {
    profile: getSettledValue(profileRes, cachedData.profile, errors),
    meals: getSettledValue(mealsRes, cachedData.meals, errors),
    dietPlans: getSettledValue(dietsRes, cachedData.dietPlans, errors),
    checkins: getSettledValue(checkinsRes, cachedData.checkins, errors),
    progressLogs: getSettledValue(progressRes, cachedData.progressLogs, errors),
    errors,
    fromCache: false,
  };
}

function getSettledValue(result, fallback, errors) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  errors.push(result.reason);
  return fallback;
}
