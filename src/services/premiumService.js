import { request } from "./apiClient";

export async function getPremiumStatus() {
  const data = await request("/premium/status", {}, {
    operation: "consultar el estado premium",
  });

  return data?.premium || null;
}

export async function createPremiumCheckoutSession(plan = "monthly") {
  const data = await request(
    "/stripe/create-checkout-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    },
    {
      operation: "crear la sesión de pago",
    }
  );

  return data?.url || "";
}

export async function createCustomerPortalSession() {
  const data = await request(
    "/stripe/create-portal-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      operation: "abrir el portal de cliente",
    }
  );

  return data?.url || "";
}

export async function verifyMobilePremiumReceipt(payload) {
  const data = await request(
    "/premium/mobile/verify-receipt",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    },
    {
      operation: "verificar la compra móvil",
    }
  );

  return data?.premium || null;
}
