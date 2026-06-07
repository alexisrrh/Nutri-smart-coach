import { createHash } from "node:crypto";
import { supabase } from "../config/supabase.js";
import {
  createCreatorCode,
  createReferralRepository,
  canCreateInfluencerCode,
  getMyReferralStats,
  updateCreatorCode as updateCreatorCodeRecord,
} from "./referral.service.js";
import { sendEmail } from "./email.service.js";

const MINIMUM_CREATOR_FOLLOWERS = 5000;
const CREATOR_SHARING_TRIAL_DAYS = 15;
const CREATOR_PAYOUT_MINIMUM = 25;
const CREATOR_APPLICATION_ADMIN_EMAIL =
  process.env.CREATOR_APPLICATION_ADMIN_EMAIL || "info@nutrismartcoach.com";
const VALID_SOCIAL_PLATFORMS = new Set(["instagram", "tiktok", "youtube", "other"]);
const SOCIAL_PLATFORM_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Otro",
};

export async function getCreatorStatus(userId, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createCreatorRepository(options.supabaseClient || supabase);
  const logger = options.logger || console;
  const referralStatsOptions = {
    ...(options.referralStatsOptions || {}),
    codeType: "creator",
    referralType: "creator",
  };

  if (options.referralRepo) {
    referralStatsOptions.repo = options.referralRepo;
  }

  if (options.supabaseClient && !referralStatsOptions.supabaseClient) {
    referralStatsOptions.supabaseClient = options.supabaseClient;
  }

  const getMyReferralStatsFn =
    options.getMyReferralStatsFn ||
    ((value) => getMyReferralStats(value, referralStatsOptions));

  let application = null;
  try {
    application = normalizeCreatorApplicationRecord(
      await repo.getLatestApplicationByUserId(userId)
    );
  } catch (error) {
    auditLog(logger, {
      event: "creator_status.application_failed",
      userId,
      error: error?.message || String(error),
    });
  }

  let referralStats = getEmptyCreatorReferralStats();
  try {
    referralStats = await getMyReferralStatsFn(userId);
  } catch (error) {
    auditLog(logger, {
      event: "creator_status.metrics_failed",
      userId,
      error: error?.message || String(error),
    });
  }

  let creatorLinkClicks = 0;
  try {
    creatorLinkClicks = Number(
      (await repo.countCreatorLinkClicksByCreatorUserId?.(userId)) || 0
    );
  } catch (error) {
    auditLog(logger, {
      event: "creator_status.metrics_failed",
      userId,
      metric: "clicks",
      error: error?.message || String(error),
    });
  }

  let payoutRequests = [];
  try {
    payoutRequests = await repo.listCreatorPayoutRequestsByCreatorUserId?.(userId);
  } catch (error) {
    auditLog(logger, {
      event: "creator_status.metrics_failed",
      userId,
      metric: "payoutRequests",
      error: error?.message || String(error),
    });
  }

  const creatorCodeRecord = findCreatorCode(referralStats?.codes || []);
  let creatorCode = creatorCodeRecord?.code || null;
  let profileRequired = false;

  auditLog(logger, {
    event: "creator_status.lookup",
    userId,
    applicationStatus: application?.status || null,
    creatorCodeFound: creatorCodeRecord?.code || null,
    creatorCodeType: creatorCodeRecord?.type || null,
    creatorCodeActive: creatorCodeRecord?.is_active !== false,
    creatorCodeCustomized: Boolean(creatorCodeRecord?.customized_at),
    referralCodesCount: Array.isArray(referralStats?.codes) ? referralStats.codes.length : 0,
  });

  if (application?.status === "approved" && !creatorCode) {
    auditLog(logger, {
      event: "creator_status.auto_create_attempt",
      userId,
      applicationStatus: application?.status || null,
      creatorCodeFound: creatorCodeRecord?.code || null,
    });

    let createdCode;
    try {
      createdCode = await createCreatorCode(userId, "", {
        repo: options.referralRepo,
        logger,
        creatorApplication: application,
      });
    } catch (error) {
      const isProfileRequired = Number(error?.statusCode || 0) === 422;
      auditLog(logger, {
        event: "creator_status.auto_create_failed",
        userId,
        applicationStatus: application?.status || null,
        creatorCodeFound: creatorCodeRecord?.code || null,
        error: error?.message || String(error),
        profileRequired: isProfileRequired,
      });

      if (isProfileRequired) {
        profileRequired = true;
        auditLog(logger, {
          event: "creator_status.profile_required",
          userId,
          applicationStatus: application?.status || null,
          message: error?.message || null,
        });
      }

      try {
        if (!isProfileRequired) {
          if (typeof repo.getCodeByUserAndType === "function") {
            createdCode = await repo.getCodeByUserAndType(userId, "creator");
          }
          if (createdCode) {
            auditLog(logger, {
              event: "creator_status.auto_create_result",
              userId,
              applicationStatus: application?.status || null,
              createdCode: createdCode?.code || null,
              createdType: createdCode?.type || null,
              createdId: createdCode?.id || null,
              recovered: true,
            });
          }
        }
      } catch (recoveryError) {
        auditLog(logger, {
          event: "creator_status.auto_create_failed",
          userId,
          applicationStatus: application?.status || null,
          creatorCodeFound: creatorCodeRecord?.code || null,
          error: recoveryError?.message || String(recoveryError),
          recovered: false,
        });
        createdCode = null;
      }
    }
    creatorCode = createdCode?.code || null;

    if (createdCode) {
      auditLog(logger, {
        event: "creator_status.auto_create_result",
        userId,
        applicationStatus: application?.status || null,
        createdCode: createdCode?.code || null,
        createdType: createdCode?.type || null,
        createdId: createdCode?.id || null,
      });
    }

    if (creatorCode) {
      referralStats = {
        ...referralStats,
        codes: [createdCode, ...(referralStats?.codes || [])],
      };

      auditLog(logger, {
        event: "creator_status.auto_create_applied",
        userId,
        applicationStatus: application?.status || null,
        creatorCode,
      });
    }
  }

  const status = creatorCode ? "approved" : application?.status || "none";
  const dashboardMetrics = buildCreatorDashboardMetrics(referralStats, {
    clicks: creatorLinkClicks,
    payoutRequests,
  });

  return {
    application,
    status,
    creatorCode,
    creatorCodeCustomized: Boolean(creatorCodeRecord?.customized_at),
    profileRequired,
    message:
      profileRequired && application?.status === "approved"
        ? "Completa tu perfil para activar tu código de creador."
        : null,
    stats: status === "approved" ? buildCreatorStats(referralStats, dashboardMetrics) : null,
    metrics: status === "approved" ? dashboardMetrics : null,
    payouts: status === "approved" ? buildCreatorPayoutSummary(dashboardMetrics, payoutRequests) : null,
    history:
      status === "approved"
        ? buildCreatorHistory(
            referralStats?.referrals || [],
            referralStats?.commissions || [],
            payoutRequests
          )
        : null,
    commissionHistory:
      status === "approved" ? normalizeCreatorCommissions(referralStats.commissions) : null,
    payoutRequests: status === "approved" ? normalizeCreatorPayoutRequests(payoutRequests) : null,
  };
}

export async function submitCreatorApplication(userId, payload = {}, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createCreatorRepository(options.supabaseClient || supabase);
  const normalized = normalizeCreatorApplicationPayload(payload);

  const activeApplication = await repo.getActiveApplicationByUserId(userId);
  if (activeApplication) {
    throw createPublicError(
      "Ya tienes una solicitud activa de creadores de contenido.",
      409
    );
  }

  const application = normalizeCreatorApplicationRecord(
    await repo.insertApplication({
      userId,
      socialPlatform: normalized.socialPlatform,
      socialHandle: normalized.socialHandle,
      followersCount: normalized.followersCount,
      proofUrl: normalized.proofUrl,
      status: "pending",
    })
  );

  await notifyCreatorApplicationSubmitted({
    application,
    authUser: options.authUser,
    emailClient: options.emailClient,
    logger: options.logger,
  });

  const minimumFollowersMet = normalized.followersCount >= MINIMUM_CREATOR_FOLLOWERS;

  return {
    application,
    status: "pending",
    minimumFollowersMet,
    requirementMet: minimumFollowersMet,
    minimumFollowersRequired: MINIMUM_CREATOR_FOLLOWERS,
    message: minimumFollowersMet
      ? "Solicitud enviada para revisión manual."
      : "Puedes enviar la solicitud, pero todavía no llegas al mínimo de seguidores.",
  };
}

export async function notifyCreatorApplicationSubmitted({
  application,
  authUser = null,
  emailClient = sendEmail,
  logger = console,
} = {}) {
  if (!application) return { adminEmail: null, userEmail: null };

  const applicant = buildCreatorApplicant(authUser);
  const auditBase = {
    event: "creator_application.submitted",
    applicationId: application.id,
    userId: application.userId,
    email: applicant.email || null,
    status: application.status,
  };

  auditLog(logger, {
    ...auditBase,
    notification: "started",
  });

  const adminEmail = buildCreatorAdminEmail({ application, applicant });
  const applicantEmail = applicant.email
    ? buildCreatorApplicantEmail({ application, applicant })
    : null;

  const results = {
    adminEmail: null,
    userEmail: null,
  };

  try {
    results.adminEmail = await emailClient(adminEmail);
    auditLog(logger, {
      ...auditBase,
      notification: "admin_email_sent",
      to: adminEmail.to,
    });
  } catch (error) {
    auditLog(logger, {
      ...auditBase,
      notification: "admin_email_failed",
      to: adminEmail.to,
      error: error?.message || String(error),
    });
  }

  if (!applicantEmail) {
    auditLog(logger, {
      ...auditBase,
      notification: "user_email_skipped",
      reason: "missing_user_email",
    });
    return results;
  }

  try {
    results.userEmail = await emailClient(applicantEmail);
    auditLog(logger, {
      ...auditBase,
      notification: "user_email_sent",
      to: applicantEmail.to,
    });
  } catch (error) {
    auditLog(logger, {
      ...auditBase,
      notification: "user_email_failed",
      to: applicantEmail.to,
      error: error?.message || String(error),
    });
  }

  return results;
}

export async function approveCreatorApplication(
  { userId, creatorCode, authUser, applicationId = null } = {},
  options = {}
) {
  assertUserId(userId);

  if (!canCreateInfluencerCode({ userId, authUser })) {
    throw createPublicError(
      "No tienes permisos para aprobar paneles de creadores.",
      403
    );
  }

  const repo = options.repo || createCreatorRepository(options.supabaseClient || supabase);
  const application = applicationId
    ? await repo.getApplicationById(applicationId)
    : await repo.getLatestApplicationByUserId(userId);

  if (!application) {
    throw createPublicError("No existe una solicitud de creador para aprobar.", 404);
  }

  const reviewedAt = new Date().toISOString();
  const updatedApplication = normalizeCreatorApplicationRecord(
    await repo.updateApplication(application.id, {
      status: "approved",
      reviewedAt,
      reviewedBy: authUser?.id || null,
      rejectionReason: null,
    })
  );

  if (creatorCode) {
    await createCreatorCode(userId, creatorCode, {
      authUser,
      repo: options.referralRepo,
    });
  }

  return {
    application: updatedApplication,
    status: "approved",
  };
}

export async function updateCreatorPanelCode(userId, code, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createCreatorRepository(options.supabaseClient || supabase);
  const updatedCode = await updateCreatorCodeRecord(userId, code, {
    repo: options.referralRepo || options.repo || undefined,
    creatorRepo: repo,
    logger: options.logger || console,
    authUser: options.authUser || null,
    creatorApplication: options.creatorApplication || null,
  });

  const status = await getCreatorStatus(userId, {
    ...options,
    repo,
    referralRepo: options.referralRepo || options.repo || undefined,
    getMyReferralStatsFn: options.getMyReferralStatsFn,
    logger: options.logger || console,
  });

  return {
    ...status,
    creatorCode: updatedCode?.code || status.creatorCode || null,
    creatorCodeCustomized: Boolean(updatedCode?.customized_at || status.creatorCodeCustomized),
  };
}

export async function trackCreatorLinkClick(
  { code, visitorId = null, userAgent = null, ipHash = null } = {},
  options = {}
) {
  const referralRepo =
    options.referralRepo || createReferralRepository(options.supabaseClient || supabase);
  const creatorRepo = options.repo || createCreatorRepository(options.supabaseClient || supabase);
  const logger = options.logger || console;
  const normalizedCode = normalizeTrackingCreatorCode(code);
  const safeIpHash = hashTrackingIp(ipHash);

  if (!normalizedCode) {
    return { tracked: false };
  }

  try {
    const referralCode = await referralRepo.getCodeByCode(normalizedCode);
    if (
      !referralCode ||
      referralCode.is_active === false ||
      String(referralCode.type || "").toLowerCase() !== "creator"
    ) {
      return { tracked: false };
    }

    const trackedClick = await creatorRepo.insertCreatorLinkClick({
      creatorCode: referralCode.code,
      creatorUserId: referralCode.user_id,
      visitorId,
      ipHash: safeIpHash,
      userAgent,
    });

    auditLog(logger, {
      event: "creator_link_click.tracked",
      code: referralCode.code,
      creatorUserId: referralCode.user_id,
      clickId: trackedClick?.id || null,
    });

    return {
      tracked: true,
      click: trackedClick,
    };
  } catch (error) {
    auditLog(logger, {
      event: "creator_link_click.failed",
      code: normalizedCode,
      error: error?.message || String(error),
    });
    return { tracked: false };
  }
}

export async function requestCreatorPayout(userId, options = {}) {
  assertUserId(userId);

  const repo = options.repo || createCreatorRepository(options.supabaseClient || supabase);
  const status = await getCreatorStatus(userId, options);

  if (status.status !== "approved") {
    throw createPublicError("Tu panel de creadores aún no está aprobado.", 403);
  }

  const metrics = status.metrics || {};
  const availableAmount = Number(
    metrics.availableToWithdraw ?? metrics.availableCommissionAmount ?? 0
  );
  if (availableAmount < CREATOR_PAYOUT_MINIMUM) {
    throw createPublicError(
      `Necesitas al menos ${formatCurrency(CREATOR_PAYOUT_MINIMUM)} para solicitar retiro.`,
      409
    );
  }

  const pendingRequest = await repo.getPendingCreatorPayoutRequestByCreatorUserId(userId);
  if (pendingRequest) {
    throw createPublicError("Ya tienes una solicitud de retiro pendiente.", 409);
  }

  const requestedAt = new Date().toISOString();
  const requestedAmount = Number(availableAmount.toFixed(2));
  const payoutRequest = normalizeCreatorPayoutRequestRecord(
    await repo.insertCreatorPayoutRequest({
      creatorUserId: userId,
      amount: requestedAmount,
      currency: "eur",
      status: "pending",
      requestedAt,
      notes: null,
    })
  );

  auditLog(options.logger || console, {
    event: "creator_payout.requested",
    userId,
    amount: requestedAmount,
    requestId: payoutRequest?.id || null,
  });

  return {
    ...status,
    payoutRequest,
    message: "Solicitud de retiro enviada.",
  };
}

export function buildCreatorShareText(code) {
  const safeCode = normalizeCreatorCode(code);
  return `Únete a NutriSmart Coach con mi código ${safeCode} y consigue ${CREATOR_SHARING_TRIAL_DAYS} días Premium gratis.`;
}

export async function copyCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw createPublicError("No existe un código de creador para copiar.", 400);
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(safeCode);
    return safeCode;
  }

  throw createPublicError("No se pudo copiar el código.", 500);
}

export async function shareCreatorCode(code) {
  const safeCode = normalizeCreatorCode(code);
  if (!safeCode) {
    throw createPublicError("No existe un código de creador para compartir.", 400);
  }

  const sharePayload = {
    title: "NutriSmart Coach",
    text: buildCreatorShareText(safeCode),
    url:
      typeof globalThis !== "undefined" && globalThis.window?.location?.origin
        ? globalThis.window.location.origin
        : "/perfil",
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share(sharePayload);
    return sharePayload;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${sharePayload.text} ${sharePayload.url}`);
    return sharePayload;
  }

  throw createPublicError("No se pudo compartir el código.", 500);
}

export function createCreatorRepository(supabaseClient) {
  return {
    async getLatestApplicationByUserId(userId) {
      const { data, error } = await supabaseClient
        .from("influencer_applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw wrapDbError("No se pudo consultar la solicitud.", error);
      return (data || [])[0] || null;
    },

    async getApplicationById(applicationId) {
      const { data, error } = await supabaseClient
        .from("influencer_applications")
        .select("*")
        .eq("id", applicationId)
        .maybeSingle();

      if (error) throw wrapDbError("No se pudo consultar la solicitud.", error);
      return data || null;
    },

    async getActiveApplicationByUserId(userId) {
      const { data, error } = await supabaseClient
        .from("influencer_applications")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw wrapDbError("No se pudo consultar la solicitud.", error);
      return (data || [])[0] || null;
    },

    async insertApplication(payload) {
      const { data, error } = await supabaseClient
        .from("influencer_applications")
        .insert(toDbApplicationPayload(payload, { includeCreatedAt: true }))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo registrar la solicitud.", error);
      return data;
    },

    async updateApplication(id, payload) {
      const { data, error } = await supabaseClient
        .from("influencer_applications")
        .update(toDbApplicationPayload(payload))
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo actualizar la solicitud.", error);
      return data;
    },

    async countCreatorLinkClicksByCreatorUserId(userId) {
      const { count, error } = await supabaseClient
        .from("creator_link_clicks")
        .select("id", { count: "exact", head: true })
        .eq("creator_user_id", userId);

      if (error) throw wrapDbError("No se pudieron contar los clics.", error);
      return count || 0;
    },

    async insertCreatorLinkClick(payload) {
      const { data, error } = await supabaseClient
        .from("creator_link_clicks")
        .insert(toDbCreatorLinkClickPayload(payload))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo registrar el clic.", error);
      return data;
    },

    async listCreatorPayoutRequestsByCreatorUserId(userId) {
      const { data, error } = await supabaseClient
        .from("creator_payout_requests")
        .select("*")
        .eq("creator_user_id", userId)
        .order("requested_at", { ascending: false });

      if (error) throw wrapDbError("No se pudieron listar los retiros.", error);
      return data || [];
    },

    async getPendingCreatorPayoutRequestByCreatorUserId(userId) {
      const { data, error } = await supabaseClient
        .from("creator_payout_requests")
        .select("*")
        .eq("creator_user_id", userId)
        .eq("status", "pending")
        .order("requested_at", { ascending: false })
        .limit(1);

      if (error) throw wrapDbError("No se pudo consultar el retiro.", error);
      return (data || [])[0] || null;
    },

    async insertCreatorPayoutRequest(payload) {
      const { data, error } = await supabaseClient
        .from("creator_payout_requests")
        .insert(toDbCreatorPayoutRequestPayload(payload))
        .select("*")
        .single();

      if (error) throw wrapDbError("No se pudo crear el retiro.", error);
      return data;
    },
  };
}

function buildCreatorStats(referralStats = {}, metrics = {}) {
  const summary = referralStats.summary || {};
  const commissions = Array.isArray(referralStats.commissions)
    ? referralStats.commissions
    : [];

  return {
    registeredUsers: Number(summary.totalReferrals || 0),
    trialUsers: Number(summary.trialingReferrals || 0),
    premiumUsers: Number(summary.premiumActiveReferrals || 0),
    totalCommissions: commissions.length,
    pendingCommissions: commissions.filter((commission) =>
      ["pending", "payable"].includes(String(commission.status || "").toLowerCase())
    ).length,
    paidCommissions: commissions.filter(
      (commission) => String(commission.status || "").toLowerCase() === "paid"
    ).length,
    clicks: Number(metrics.clicks || 0),
    usersWithCode: Number(metrics.usersWithCode || 0),
    premiumActive: Number(metrics.premiumActive || 0),
    conversionRate: Number(metrics.conversionRate || 0),
    commissionAccumulated: Number(metrics.commissionAccumulated || 0),
    pendingAmount: Number(metrics.pendingAmount || 0),
    availableToWithdraw: Number(metrics.availableToWithdraw || 0),
    paidAmount: Number(metrics.paidAmount || 0),
    pendingPayoutRequestsCount: Number(metrics.pendingPayoutRequestsCount || 0),
    hasPendingPayoutRequest: Boolean(metrics.hasPendingPayoutRequest),
    withdrawalThreshold: Number(metrics.withdrawalThreshold || CREATOR_PAYOUT_MINIMUM),
  };
}

function buildCreatorDashboardMetrics(referralStats = {}, { clicks = 0, payoutRequests = [] } = {}) {
  const referrals = Array.isArray(referralStats.referrals) ? referralStats.referrals : [];
  const commissions = Array.isArray(referralStats.commissions) ? referralStats.commissions : [];
  const requestedPayouts = Array.isArray(payoutRequests) ? payoutRequests : [];

  const usersWithCode = referrals.length;
  const premiumActive = referrals.filter((referral) =>
    ["premium_active", "rewarded"].includes(String(referral.status || "").toLowerCase())
  ).length;
  const commissionAccumulated = sumCommissionAmounts(commissions);
  const pendingAmount = sumCommissionAmounts(commissions, ["pending"]);
  const availableToWithdraw = sumCommissionAmounts(commissions, ["payable"]);
  const paidAmount = sumCommissionAmounts(commissions, ["paid"]);
  const conversionRate =
    usersWithCode > 0 ? Number(((premiumActive / usersWithCode) * 100).toFixed(2)) : 0;
  const pendingPayoutRequestsCount = requestedPayouts.filter(
    (request) => String(request.status || "").toLowerCase() === "pending"
  ).length;
  const hasPendingPayoutRequest = pendingPayoutRequestsCount > 0;
  const history = buildCreatorHistory(referrals, commissions, requestedPayouts);

  return {
    clicks: Number(clicks || 0),
    usersWithCode,
    premiumActive,
    conversionRate,
    commissionAccumulated,
    pendingAmount,
    availableToWithdraw,
    paidAmount,
    pendingPayoutRequestsCount,
    hasPendingPayoutRequest,
    withdrawalThreshold: CREATOR_PAYOUT_MINIMUM,
    commissionHistory: commissions.map(normalizeCreatorCommissionRecord),
    payoutRequests: requestedPayouts.map(normalizeCreatorPayoutRequestRecord),
    history,
  };
}

function buildCreatorPayoutSummary(metrics = {}, payoutRequests = []) {
  const payoutRows = Array.isArray(payoutRequests) ? payoutRequests : [];
  return {
    availableCommissionAmount: Number(metrics.availableToWithdraw || 0),
    pendingCommissionAmount: Number(metrics.pendingAmount || 0),
    withdrawalThreshold: Number(metrics.withdrawalThreshold || CREATOR_PAYOUT_MINIMUM),
    canRequestWithdrawal:
      Number(metrics.availableToWithdraw || 0) >= Number(metrics.withdrawalThreshold || CREATOR_PAYOUT_MINIMUM) &&
      !(metrics.hasPendingPayoutRequest || payoutRows.some((request) => String(request.status || "").toLowerCase() === "pending")),
    pendingPayoutRequestsCount: Number(metrics.pendingPayoutRequestsCount || 0),
    hasPendingPayoutRequest: Boolean(metrics.hasPendingPayoutRequest),
  };
}

function buildCreatorHistory(referrals = [], commissions = [], payoutRequests = []) {
  const referralHistory = referrals.map((referral) => ({
    id: referral.id,
    type: "referral",
    label:
      String(referral.status || "").toLowerCase() === "premium_active"
        ? "Usuario Premium"
        : String(referral.status || "").toLowerCase() === "rewarded"
          ? "Recompensa aplicada"
          : "Usuario registrado",
    amount: 0,
    status: referral.status || "pending",
    date: referral.premium_started_at || referral.created_at || null,
    createdAt: referral.created_at || null,
    sourceCode: null,
  }));

  const commissionHistory = commissions.map((commission) =>
    normalizeCreatorCommissionRecord(commission)
  );
  const payoutHistory = payoutRequests.map((request) =>
    normalizeCreatorPayoutRequestRecord(request)
  );

  return [...commissionHistory, ...payoutHistory, ...referralHistory].sort((left, right) => {
    const leftTime = new Date(left.date || left.createdAt || 0).getTime();
    const rightTime = new Date(right.date || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function normalizeCreatorCommissionRecord(commission) {
  if (!commission) return null;

  return {
    id: commission.id,
    type: "commission",
    label:
      String(commission.status || "").toLowerCase() === "paid"
        ? "Comisión pagada"
        : String(commission.status || "").toLowerCase() === "pending"
          ? "Comisión pendiente"
          : "Comisión disponible",
    amount: Number(commission.amount || 0),
    currency: commission.currency || "eur",
    status: commission.status || "pending",
    date: commission.created_at || null,
    createdAt: commission.created_at || null,
    sourceCode: commission.source_code || null,
    paymentReference: commission.payment_reference || commission.subscription_id || null,
  };
}

function normalizeCreatorCommissions(commissions = []) {
  if (!Array.isArray(commissions)) return [];

  return commissions.map(normalizeCreatorCommissionRecord).filter(Boolean);
}

function normalizeCreatorPayoutRequestRecord(request) {
  if (!request) return null;

  return {
    id: request.id,
    type: "payout",
    label:
      String(request.status || "").toLowerCase() === "paid"
        ? "Retiro pagado"
        : String(request.status || "").toLowerCase() === "rejected"
          ? "Retiro rechazado"
          : "Retiro solicitado",
    amount: Number(request.amount || 0),
    currency: request.currency || "eur",
    status: request.status || "pending",
    date: request.requested_at || request.created_at || null,
    createdAt: request.requested_at || request.created_at || null,
    notes: request.notes || null,
  };
}

function normalizeCreatorPayoutRequests(payoutRequests = []) {
  if (!Array.isArray(payoutRequests)) return [];

  return payoutRequests.map(normalizeCreatorPayoutRequestRecord).filter(Boolean);
}

function sumCommissionAmounts(commissions = [], statuses = []) {
  const normalizedStatuses = statuses.map((status) => String(status || "").toLowerCase());
  return Number(
    commissions
      .filter((commission) =>
        normalizedStatuses.length === 0
          ? true
          : normalizedStatuses.includes(String(commission.status || "").toLowerCase())
      )
      .reduce((total, commission) => total + Number(commission.amount || 0), 0)
      .toFixed(2)
  );
}

function getEmptyCreatorReferralStats() {
  return {
    codes: [],
    summary: {},
    commissions: [],
    rewards: [],
    referrals: [],
  };
}

function findCreatorCode(codes = []) {
  return (
    codes.find(
      (code) =>
        String(code?.type || "").toLowerCase() === "creator" &&
        code?.is_active !== false
    ) || codes.find((code) => String(code?.type || "").toLowerCase() === "creator") || null
  );
}

function buildCreatorApplicant(authUser = {}) {
  const metadata = authUser?.user_metadata || {};
  const email = String(authUser?.email || "").trim();
  const createdAt = authUser?.created_at || authUser?.createdAt || null;
  const premiumStatus =
    authUser?.premium_status ||
    metadata.premium_status ||
    metadata.premiumStatus ||
    authUser?.app_metadata?.premium_status ||
    authUser?.app_metadata?.premiumStatus ||
    null;
  const name = String(
    metadata.full_name ||
      metadata.name ||
      metadata.nombre ||
      metadata.display_name ||
      email.split("@")[0] ||
      "Usuario"
  ).trim();

  return {
    name,
    email,
    createdAt,
    premiumStatus,
  };
}

function buildCreatorAdminEmail({ application, applicant }) {
  const submittedAt = formatAuditDate(application.createdAt);
  const minimumFollowersMet = Number(application.followersCount || 0) >= MINIMUM_CREATOR_FOLLOWERS;
  const socialHandleLooksLikeUrl = looksLikeUrl(application.socialHandle);
  const proofLooksLikeUrl = looksLikeUrl(application.proofUrl);
  const socialHandle = socialHandleLooksLikeUrl
    ? buildHtmlLink(application.socialHandle, application.socialHandle)
    : escapeHtml(application.socialHandle || "No disponible");
  const proofUrl = proofLooksLikeUrl
    ? buildHtmlLink(application.proofUrl, application.proofUrl)
    : escapeHtml(application.proofUrl || "No disponible");
  const lines = [
    "Nueva solicitud - Programa de Creadores",
    "",
    "Estado: Pendiente de revisión",
    "",
    "Datos del usuario:",
    `- Nombre: ${applicant.name || "No disponible"}`,
    `- Email: ${applicant.email || "No disponible"}`,
    `- User ID: ${application.userId}`,
    `- Fecha de solicitud: ${submittedAt}`,
    `- Estado Premium: ${formatPremiumStatus(application, applicant)}`,
    `- Fecha de creación de cuenta: ${formatAccountCreatedAt(application, applicant)}`,
    "",
    "Datos de la solicitud:",
    `- Plataforma: ${platformLabel(application.socialPlatform)}`,
    `- Usuario o enlace del perfil: ${stripHtml(socialHandleLooksLikeUrl ? application.socialHandle : application.socialHandle)}`,
    `- Seguidores declarados: ${formatCount(application.followersCount)}`,
    `- Cumple mínimo de 5.000 seguidores: ${minimumFollowersMet ? "Sí" : "No"}`,
    `- Prueba o media kit: ${stripHtml(application.proofUrl || "No disponible")}`,
    `- ID de solicitud: ${application.id}`,
    "",
    "Acciones sugeridas:",
    "- Revisar perfil social",
    "- Validar seguidores",
    "- Aprobar o rechazar manualmente en Supabase",
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;background:#0f1115;color:#f5f7fa;padding:24px">
      <div style="max-width:640px;margin:0 auto;border:1px solid #2a2f39;border-radius:20px;overflow:hidden;background:#141821">
        <div style="padding:20px 22px;border-bottom:1px solid #2a2f39;background:linear-gradient(135deg,#1b2030,#141821)">
          <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d4af37">Nueva solicitud - Programa de Creadores</div>
          <h1 style="margin:10px 0 4px;font-size:26px;line-height:1.1;color:#ffffff">Pendiente de revisión</h1>
          <p style="margin:0;color:#a8b0c0;font-size:14px">Revisar ahora para decidir si se aprueba o rechaza manualmente.</p>
        </div>
        <div style="padding:20px 22px">
          ${renderEmailSection("Datos del usuario", [
            ["Nombre", applicant.name || "No disponible"],
            ["Email", applicant.email || "No disponible"],
            ["User ID", application.userId],
            ["Fecha de solicitud", submittedAt],
            ["Estado Premium", formatPremiumStatus(application, applicant)],
            ["Fecha de creación de cuenta", formatAccountCreatedAt(application, applicant)],
          ])}
          ${renderEmailSection("Datos de la solicitud", [
            ["Plataforma", platformLabel(application.socialPlatform)],
            ["Usuario o enlace del perfil", socialHandle],
            ["Seguidores declarados", formatCount(application.followersCount)],
            ["Cumple mínimo de 5.000 seguidores", minimumFollowersMet ? "Sí" : "No"],
            ["Prueba o media kit", proofUrl],
            ["ID de solicitud", application.id],
          ])}
          <div style="margin-top:18px;padding:16px;border:1px solid #2a2f39;border-radius:16px;background:#10141d">
            <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#d4af37;margin-bottom:10px">Acciones sugeridas</div>
            <ul style="margin:0;padding-left:18px;color:#d8deea;font-size:14px;line-height:1.5">
              <li>Revisar perfil social</li>
              <li>Validar seguidores</li>
              <li>Aprobar o rechazar manualmente en Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `.trim();

  return {
    to: CREATOR_APPLICATION_ADMIN_EMAIL,
    subject: "Nueva solicitud - Programa de Creadores",
    text: lines.join("\n"),
    html,
  };
}

function buildCreatorApplicantEmail({ applicant }) {
  const greeting = applicant.name ? `Hola ${applicant.name},` : "Hola,";

  return {
    to: applicant.email,
    subject: "Solicitud recibida - Programa de Creadores",
    text: [
      greeting,
      "",
      "Hemos recibido tu solicitud.",
      "Nuestro equipo revisará tu perfil.",
      "Tiempo estimado de revisión: 24-72 horas.",
      "",
      "NutriSmart Coach",
    ].join("\n"),
  };
}

function renderEmailSection(title, rows) {
  const body = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 0;color:#a8b0c0;font-size:13px;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:6px 0 6px 12px;color:#f5f7fa;font-size:13px;vertical-align:top">${value}</td>
        </tr>
      `.trim()
    )
    .join("");

  return `
    <div style="margin-bottom:18px">
      <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#d4af37;margin-bottom:8px">${escapeHtml(title)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${body}</table>
    </div>
  `.trim();
}

function formatPremiumStatus(application = {}, applicant = {}) {
  const value =
    application.premiumStatus ||
    application.premium_status ||
    application.premiumState ||
    applicant.premiumStatus ||
    applicant.premium_status ||
    applicant.premiumState;
  if (!value) return "No disponible";
  return String(value);
}

function formatAccountCreatedAt(application = {}, applicant = {}) {
  const value = application.accountCreatedAt || application.account_created_at || applicant.createdAt || applicant.created_at || applicant.userCreatedAt || applicant.user_created_at;
  if (!value) return "No disponible";
  return formatAuditDate(value);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .trim() || "No disponible";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtmlLink(text, href) {
  const safeHref = escapeHtml(String(href || "").trim());
  const safeText = escapeHtml(String(text || "").trim());
  return `<a href="${safeHref}" target="_blank" rel="noreferrer" style="color:#8ab4ff;text-decoration:underline">${safeText}</a>`;
}

function looksLikeUrl(value) {
  const safeValue = String(value || "").trim();
  return /^https?:\/\//i.test(safeValue) || /^www\./i.test(safeValue);
}

function auditLog(logger, payload) {
  const entry = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  logger?.info?.(JSON.stringify(entry));
}

function formatAuditDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function platformLabel(platform) {
  return SOCIAL_PLATFORM_LABELS[platform] || platform || "No disponible";
}

function formatCount(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "0";
  return String(Math.trunc(numeric));
}

function normalizeCreatorApplicationPayload(payload = {}) {
  const socialPlatform = String(payload.socialPlatform || "")
    .trim()
    .toLowerCase();
  const socialHandle = String(payload.socialHandle || "")
    .trim()
    .replace(/\s+/g, " ");
  const proofUrl = String(payload.proofUrl || "")
    .trim();
  const followersCount = Number(payload.followersCount);

  if (!VALID_SOCIAL_PLATFORMS.has(socialPlatform)) {
    throw createPublicError("Selecciona una plataforma válida.", 400);
  }

  if (!socialHandle) {
    throw createPublicError("Indica tu usuario o enlace del perfil.", 400);
  }

  if (!Number.isFinite(followersCount)) {
    throw createPublicError("Indica un número válido de seguidores.", 400);
  }

  return {
    socialPlatform,
    socialHandle,
    followersCount: Math.max(0, Math.trunc(followersCount)),
    proofUrl: proofUrl || null,
  };
}

function normalizeCreatorApplicationRecord(record) {
  if (!record) return null;

  return {
    id: record.id,
    userId: record.user_id,
    socialPlatform: record.social_platform,
    socialHandle: record.social_handle,
    followersCount: Number(record.followers_count || 0),
    proofUrl: record.proof_url || null,
    status: normalizeCreatorApplicationStatus(record.status),
    reviewedAt: record.reviewed_at || null,
    reviewedBy: record.reviewed_by || null,
    rejectionReason: record.rejection_reason || null,
    createdAt: record.created_at || null,
  };
}

function normalizeCreatorApplicationStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function normalizeCreatorCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

function normalizeTrackingCreatorCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function hashTrackingIp(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  return createHash("sha256").update(raw).digest("hex");
}

function toDbCreatorLinkClickPayload(payload = {}) {
  return {
    creator_code: payload.creatorCode,
    creator_user_id: payload.creatorUserId,
    visitor_id: payload.visitorId || null,
    ip_hash: payload.ipHash || null,
    user_agent: payload.userAgent || null,
  };
}

function toDbCreatorPayoutRequestPayload(payload = {}) {
  return {
    creator_user_id: payload.creatorUserId,
    amount: Number(payload.amount || 0),
    currency: payload.currency || "eur",
    status: payload.status || "pending",
    requested_at: payload.requestedAt || new Date().toISOString(),
    paid_at: payload.paidAt || null,
    notes: payload.notes || null,
  };
}

function formatCurrency(value) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function toDbApplicationPayload(payload = {}, { includeCreatedAt = false } = {}) {
  const next = {
    user_id: payload.userId,
    social_platform: payload.socialPlatform,
    social_handle: payload.socialHandle,
    followers_count: Number(payload.followersCount || 0),
    proof_url: payload.proofUrl || null,
    status: payload.status || "pending",
    reviewed_at: payload.reviewedAt || null,
    reviewed_by: payload.reviewedBy || null,
    rejection_reason: payload.rejectionReason || null,
  };

  if (includeCreatedAt) {
    next.created_at = new Date().toISOString();
  }

  return next;
}

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function wrapDbError(message, error) {
  const wrapped = new Error(message);
  wrapped.statusCode = 500;
  wrapped.cause = error;
  return wrapped;
}

function assertUserId(userId) {
  if (!userId) {
    throw createPublicError("Usuario no válido.", 400);
  }
}
