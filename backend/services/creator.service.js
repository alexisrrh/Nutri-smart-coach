import { supabase } from "../config/supabase.js";
import {
  canCreateInfluencerCode,
  createInfluencerCode,
  getMyReferralStats,
} from "./referral.service.js";
import { sendEmail } from "./email.service.js";

const MINIMUM_CREATOR_FOLLOWERS = 5000;
const CREATOR_SHARING_TRIAL_DAYS = 15;
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
  const referralStatsOptions = {
    ...(options.referralStatsOptions || {}),
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

  const application = normalizeCreatorApplicationRecord(
    await repo.getLatestApplicationByUserId(userId)
  );
  const referralStats = await getMyReferralStatsFn(userId);
  const creatorCodeRecord = findCreatorCode(referralStats?.codes || []);
  const creatorCode = creatorCodeRecord?.code || null;
  const status = creatorCode ? "approved" : application?.status || "none";

  return {
    application,
    status,
    creatorCode,
    stats: status === "approved" ? buildCreatorStats(referralStats) : null,
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
    await createInfluencerCode(userId, creatorCode, {
      authUser,
      repo: options.referralRepo,
    });
  }

  return {
    application: updatedApplication,
    status: "approved",
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
  };
}

function buildCreatorStats(referralStats = {}) {
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
  };
}

function findCreatorCode(codes = []) {
  return (
    codes.find(
      (code) =>
        String(code?.type || "").toLowerCase() === "influencer" &&
        code?.is_active !== false
    ) || codes.find((code) => String(code?.type || "").toLowerCase() === "influencer") || null
  );
}

function buildCreatorApplicant(authUser = {}) {
  const metadata = authUser?.user_metadata || {};
  const email = String(authUser?.email || "").trim();
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
  };
}

function buildCreatorAdminEmail({ application, applicant }) {
  const submittedAt = formatAuditDate(application.createdAt);
  const lines = [
    "Nueva solicitud del Programa de Creadores.",
    "",
    `Nombre: ${applicant.name || "No disponible"}`,
    `Email: ${applicant.email || "No disponible"}`,
    `User ID: ${application.userId}`,
    `Plataforma: ${platformLabel(application.socialPlatform)}`,
    `Perfil: ${application.socialHandle}`,
    `Seguidores: ${formatCount(application.followersCount)}`,
    `Fecha: ${submittedAt}`,
    `Estado: ${application.status || "pending"}`,
  ];

  return {
    to: CREATOR_APPLICATION_ADMIN_EMAIL,
    subject: "Nueva solicitud - Programa de Creadores",
    text: lines.join("\n"),
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
