import { request } from "./apiClient";

export async function getMyReferralStats() {
  return request("/referrals/me", {}, { operation: "cargar tus referidos" });
}

export async function createReferralCode() {
  return request(
    "/referrals/create-code",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "user" }),
    },
    { operation: "crear tu código de referido" }
  );
}

export async function applyReferralCode(code) {
  return request(
    "/referrals/apply-code",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: String(code || "").trim() }),
    },
    { operation: "aplicar código de referido" }
  );
}

export async function claimReferralReward() {
  return request(
    "/referrals/claim-reward",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { operation: "reclamar tu recompensa de referido" }
  );
}

export async function validateReferralCode(code) {
  return request(
    "/referrals/validate-code",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: String(code || "").trim() }),
    },
    { operation: "validar código de referido" }
  );
}
