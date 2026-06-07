import { describe, expect, it, vi } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";

const {
  getCreatorStatus,
  submitCreatorApplication,
} = await import("../services/creator.service.js");

describe("creator service", () => {
  it("returns none when the user has no application or creator code", async () => {
    const repo = createCreatorRepo();

    const result = await getCreatorStatus("user-1", {
      repo,
      getMyReferralStatsFn: async () => ({
        codes: [],
        summary: {},
        commissions: [],
      }),
    });

    expect(result.status).toBe("none");
    expect(result.creatorCode).toBeNull();
    expect(result.stats).toBeNull();
  });

  it("returns approved status, creator code and metrics when the code exists", async () => {
    const repo = createCreatorRepo({
      application: {
        id: "app-1",
        user_id: "user-1",
        social_platform: "instagram",
        social_handle: "@creator",
        followers_count: 12000,
        status: "approved",
      },
    });

    const result = await getCreatorStatus("user-1", {
      repo,
      getMyReferralStatsFn: async () => ({
        codes: [
          {
            code: "USER1234",
            type: "user",
            is_active: true,
          },
          {
            code: "CREATOR30",
            type: "creator",
            is_active: true,
          },
        ],
        summary: {
          totalReferrals: 8,
          trialingReferrals: 2,
          premiumActiveReferrals: 4,
        },
        commissions: [
          { status: "payable" },
          { status: "payable" },
          { status: "paid" },
        ],
      }),
    });

    expect(result.status).toBe("approved");
    expect(result.creatorCode).toBe("CREATOR30");
    expect(result.stats).toEqual({
      registeredUsers: 8,
      trialUsers: 2,
      premiumUsers: 4,
      totalCommissions: 3,
      pendingCommissions: 2,
      paidCommissions: 1,
    });
  });

  it("auto-creates a creator code when the application is approved but no code exists", async () => {
    const repo = createCreatorRepo({
      application: {
        id: "app-1",
        user_id: "user-1",
        social_platform: "instagram",
        social_handle: "@creator",
        followers_count: 12000,
        status: "approved",
      },
    });
    const referralRepo = createCreatorReferralRepo({
      profile: {
        id: "user-1",
        name: "Alexis",
        email: "alexis@example.com",
      },
    });

    const result = await getCreatorStatus("user-1", {
      repo,
      referralRepo,
      getMyReferralStatsFn: async () => ({
        codes: [],
        summary: {},
        commissions: [],
      }),
    });

    expect(result.status).toBe("approved");
    expect(result.creatorCode).toBe("NUTRIALEXIS");
    expect(referralRepo.insertCodeCalls).toHaveLength(1);
    expect(referralRepo.insertCodeCalls[0]).toMatchObject({
      userId: "user-1",
      type: "creator",
      trialDays: 15,
      commissionPercent: 30,
      commissionMonthsLimit: 12,
      isActive: true,
    });
  });

  it("adds a numeric suffix when the preferred creator code is already in use", async () => {
    const repo = createCreatorRepo({
      application: {
        id: "app-1",
        user_id: "user-1",
        social_platform: "instagram",
        social_handle: "@creator",
        followers_count: 12000,
        status: "approved",
      },
    });
    const referralRepo = createCreatorReferralRepo({
      profile: {
        id: "user-1",
        name: "Alexis",
        email: "alexis@example.com",
      },
      codes: [
        {
          id: "code-1",
          user_id: "user-2",
          code: "NUTRIALEXIS",
          type: "creator",
          is_active: true,
        },
      ],
    });

    const result = await getCreatorStatus("user-1", {
      repo,
      referralRepo,
      getMyReferralStatsFn: async () => ({
        codes: [],
        summary: {},
        commissions: [],
      }),
    });

    expect(result.status).toBe("approved");
    expect(result.creatorCode).toBe("NUTRIALEXIS2");
    expect(referralRepo.insertCodeCalls).toHaveLength(1);
    expect(referralRepo.insertCodeCalls[0]).toMatchObject({
      userId: "user-1",
      code: "NUTRIALEXIS2",
      type: "creator",
    });
  });

  it("creates a pending creator application and flags when the requirement is not met", async () => {
    const repo = createCreatorRepo();

    const result = await submitCreatorApplication(
      "user-1",
      {
        socialPlatform: "instagram",
        socialHandle: "@creator",
        followersCount: 3200,
        proofUrl: "https://example.com/creator",
      },
      { repo }
    );

    expect(result.status).toBe("pending");
    expect(result.minimumFollowersMet).toBe(false);
    expect(result.application).toMatchObject({
      socialPlatform: "instagram",
      socialHandle: "@creator",
      followersCount: 3200,
    });
    expect(repo.insertCalls).toHaveLength(1);
  });

  it("saves the creator application and sends admin and applicant emails", async () => {
    const repo = createCreatorRepo();
    const emailClient = vi.fn().mockResolvedValue({ id: "email-1" });
    const logger = { info: vi.fn() };

    const result = await submitCreatorApplication(
      "user-1",
      {
        socialPlatform: "instagram",
        socialHandle: "@creator",
        followersCount: 6200,
        proofUrl: "https://example.com/creator",
      },
      {
        repo,
        emailClient,
        logger,
        authUser: {
          id: "user-1",
          email: "creator@example.com",
          user_metadata: {
            name: "Creator Test",
          },
        },
      }
    );

    expect(result.status).toBe("pending");
    expect(repo.insertCalls).toHaveLength(1);
    expect(repo.insertCalls[0]).toMatchObject({
      userId: "user-1",
      socialPlatform: "instagram",
      socialHandle: "@creator",
      followersCount: 6200,
      status: "pending",
    });

    expect(emailClient).toHaveBeenCalledTimes(2);
    expect(emailClient).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "info@nutrismartcoach.com",
        subject: "Nueva solicitud - Programa de Creadores",
        text: expect.stringContaining("Nombre: Creator Test"),
        html: expect.stringContaining("Nueva solicitud - Programa de Creadores"),
      })
    );
    expect(emailClient.mock.calls[0][0].text).toContain("Estado: Pendiente de revisión");
    expect(emailClient.mock.calls[0][0].text).toContain("User ID: user-1");
    expect(emailClient.mock.calls[0][0].text).toContain("Nombre: Creator Test");
    expect(emailClient.mock.calls[0][0].text).toContain("Email: creator@example.com");
    expect(emailClient.mock.calls[0][0].text).toContain("Plataforma: Instagram");
    expect(emailClient.mock.calls[0][0].text).toContain("Usuario o enlace del perfil: @creator");
    expect(emailClient.mock.calls[0][0].text).toContain("Seguidores declarados: 6200");
    expect(emailClient.mock.calls[0][0].text).toContain("Cumple mínimo de 5.000 seguidores: Sí");
    expect(emailClient.mock.calls[0][0].text).toContain("Prueba o media kit: https://example.com/creator");
    expect(emailClient.mock.calls[0][0].text).toContain("ID de solicitud: app-1");
    expect(emailClient.mock.calls[0][0].text).toContain("Fecha de solicitud:");
    expect(emailClient.mock.calls[0][0].text).toContain("Estado Premium:");
    expect(emailClient.mock.calls[0][0].text).toContain("Fecha de creación de cuenta:");
    expect(emailClient.mock.calls[0][0].html).toContain("Pendiente de revisión");
    expect(emailClient.mock.calls[0][0].html).toContain("Revisar perfil social");
    expect(emailClient.mock.calls[0][0].html).toContain("Validar seguidores");
    expect(emailClient.mock.calls[0][0].html).toContain("Aprobar o rechazar manualmente en Supabase");

    expect(emailClient).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "creator@example.com",
        subject: "Solicitud recibida - Programa de Creadores",
        text: expect.stringContaining("Hemos recibido tu solicitud."),
      })
    );
    expect(emailClient.mock.calls[1][0].text).toContain(
      "Nuestro equipo revisará tu perfil."
    );
    expect(emailClient.mock.calls[1][0].text).toContain(
      "Tiempo estimado de revisión: 24-72 horas."
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("admin_email_sent")
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("user_email_sent")
    );
  });

  it("renders profile handles and proof links as HTML anchors when they look like URLs", async () => {
    const repo = createCreatorRepo();
    const emailClient = vi.fn().mockResolvedValue({ id: "email-1" });

    await submitCreatorApplication(
      "user-1",
      {
        socialPlatform: "youtube",
        socialHandle: "https://youtube.com/@creator",
        followersCount: 8000,
        proofUrl: "https://example.com/media-kit",
      },
      {
        repo,
        emailClient,
        authUser: {
          id: "user-1",
          email: "creator@example.com",
          user_metadata: {
            name: "Creator Test",
          },
        },
      }
    );

    const adminEmail = emailClient.mock.calls[0][0];
    expect(adminEmail.html).toContain('href="https://youtube.com/@creator"');
    expect(adminEmail.html).toContain('href="https://example.com/media-kit"');
  });

  it("keeps the application saved when notification emails fail", async () => {
    const repo = createCreatorRepo();
    const emailClient = vi.fn().mockRejectedValue(new Error("Email provider down"));
    const logger = { info: vi.fn() };

    const result = await submitCreatorApplication(
      "user-1",
      {
        socialPlatform: "youtube",
        socialHandle: "https://youtube.com/@creator",
        followersCount: 9000,
      },
      {
        repo,
        emailClient,
        logger,
        authUser: {
          id: "user-1",
          email: "creator@example.com",
        },
      }
    );

    expect(result.status).toBe("pending");
    expect(repo.insertCalls).toHaveLength(1);
    expect(emailClient).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("admin_email_failed")
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("user_email_failed")
    );
  });

  it("blocks duplicate active creator applications", async () => {
    const repo = createCreatorRepo({
      activeApplication: {
        id: "app-1",
        status: "pending",
      },
    });

    await expect(
      submitCreatorApplication(
        "user-1",
        {
          socialPlatform: "tiktok",
          socialHandle: "@creator",
          followersCount: 6400,
        },
        { repo }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Ya tienes una solicitud activa de creadores de contenido.",
    });
  });

  it("rejects invalid creator platforms", async () => {
    const repo = createCreatorRepo();

    await expect(
      submitCreatorApplication(
        "user-1",
        {
          socialPlatform: "linkedin",
          socialHandle: "@creator",
          followersCount: 6400,
        },
        { repo }
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Selecciona una plataforma válida.",
    });
  });
});

function createCreatorRepo(initial = {}) {
  const insertCalls = [];
  const application = initial.application || null;
  const activeApplication = initial.activeApplication || null;

  return {
    insertCalls,
    async getLatestApplicationByUserId() {
      return application;
    },
    async getActiveApplicationByUserId() {
      return activeApplication;
    },
    async insertApplication(payload) {
      insertCalls.push(payload);
      return {
        id: `app-${insertCalls.length}`,
        user_id: payload.userId,
        social_platform: payload.socialPlatform,
        social_handle: payload.socialHandle,
        followers_count: payload.followersCount,
        proof_url: payload.proofUrl,
        status: payload.status,
        created_at: new Date("2026-06-05T08:00:00.000Z").toISOString(),
      };
    },
    async updateApplication() {
      return application;
    },
  };
}

function createCreatorReferralRepo(initial = {}) {
  const insertCodeCalls = [];
  const state = {
    codes: initial.codes ? [...initial.codes] : [],
    profile: initial.profile || null,
  };

  return {
    insertCodeCalls,
    async getActiveCodeByUserAndType(userId, type) {
      return (
        state.codes.find(
          (code) =>
            code.user_id === userId &&
            code.type === type &&
            code.is_active === true
        ) || null
      );
    },
    async getCodeByCode(code) {
      return state.codes.find((item) => item.code === code) || null;
    },
    async getCodeByUserAndType(userId, type) {
      return (
        state.codes.find((code) => code.user_id === userId && code.type === type) || null
      );
    },
    async getProfileByUserId() {
      return state.profile;
    },
    async insertCode(payload) {
      insertCodeCalls.push(payload);
      const row = {
        id: `code-${state.codes.length + 1}`,
        user_id: payload.userId,
        code: payload.code,
        type: payload.type,
        trial_days: payload.trialDays,
        commission_percent: payload.commissionPercent,
        commission_months_limit: payload.commissionMonthsLimit,
        is_active: payload.isActive,
      };
      state.codes.push(row);
      return row;
    },
    async updateCode(id, payload) {
      const row = state.codes.find((code) => code.id === id);
      Object.assign(row, {
        user_id: payload.userId,
        code: payload.code,
        type: payload.type,
        trial_days: payload.trialDays,
        commission_percent: payload.commissionPercent,
        commission_months_limit: payload.commissionMonthsLimit,
        is_active: payload.isActive,
      });
      return row;
    },
  };
}
