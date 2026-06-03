import { createHmac } from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";

process.env.SUPABASE_URL = "http://127.0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.GEMINI_API_KEY = "dummy";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

const { default: app } = await import("../app.js");

describe("Stripe webhook", () => {
  it("accepts a webhook with a valid Stripe signature", async () => {
    const payload = JSON.stringify({
      id: "evt_test",
      type: "invoice.created",
      data: { object: { id: "in_test" } },
    });

    const response = await request(app)
      .post("/stripe/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", createStripeSignature(payload))
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
  });

  it("rejects a webhook with an invalid Stripe signature", async () => {
    const payload = JSON.stringify({
      id: "evt_test",
      type: "invoice.created",
      data: { object: { id: "in_test" } },
    });

    const response = await request(app)
      .post("/stripe/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", "t=123,v1=invalid")
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: "Invalid Stripe webhook signature",
    });
    expect(response.body.requestId).toEqual(expect.any(String));
  });
});

function createStripeSignature(payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  return `t=${timestamp},v1=${signature}`;
}
