import { createHmac, timingSafeEqual } from "node:crypto";
import { isPremiumProfile } from "../utils/aiUsage.js";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const WEBHOOK_TOLERANCE_SECONDS = 300;
const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export function getConfiguredPriceId(plan) {
  if (plan === "yearly") {
    return process.env.STRIPE_PRICE_ID_YEARLY?.trim() || "";
  }

  return process.env.STRIPE_PRICE_ID_MONTHLY?.trim() || "";
}

export function assertStripeCheckoutConfig() {
  const missing = [];

  if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_PRICE_ID_MONTHLY?.trim()) missing.push("STRIPE_PRICE_ID_MONTHLY");
  if (!process.env.STRIPE_PRICE_ID_YEARLY?.trim()) missing.push("STRIPE_PRICE_ID_YEARLY");
  if (!process.env.FRONTEND_URL?.trim()) missing.push("FRONTEND_URL");

  if (missing.length > 0) {
    const error = new Error(`Missing Stripe checkout configuration: ${missing.join(", ")}`);
    error.statusCode = 503;
    error.expose = true;
    throw error;
  }
}

export function assertStripeWebhookConfig() {
  const missing = [];

  if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) missing.push("STRIPE_WEBHOOK_SECRET");

  if (missing.length > 0) {
    const error = new Error(`Missing Stripe webhook configuration: ${missing.join(", ")}`);
    error.statusCode = 503;
    error.expose = true;
    throw error;
  }
}

export async function createStripeCustomer({ email, userId }) {
  return stripeRequest("/customers", {
    method: "POST",
    params: {
      email: email || undefined,
      "metadata[user_id]": userId,
    },
  });
}

export async function createCheckoutSession({
  customerId,
  email,
  priceId,
  userId,
  plan,
}) {
  const frontendUrl = getFrontendUrl();

  return stripeRequest("/checkout/sessions", {
    method: "POST",
    params: {
      mode: "subscription",
      customer: customerId || undefined,
      customer_email: customerId ? undefined : email || undefined,
      client_reference_id: userId,
      success_url: `${frontendUrl}/premium?checkout=success`,
      cancel_url: `${frontendUrl}/premium?checkout=cancelled`,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[user_id]": userId,
      "metadata[plan]": plan,
      "subscription_data[metadata][user_id]": userId,
      "subscription_data[metadata][plan]": plan,
    },
  });
}

export async function createBillingPortalSession(customerId) {
  return stripeRequest("/billing_portal/sessions", {
    method: "POST",
    params: {
      customer: customerId,
      return_url: `${getFrontendUrl()}/premium`,
    },
  });
}

export async function retrieveSubscription(subscriptionId) {
  if (!subscriptionId) return null;

  return stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "GET",
  });
}

export async function stripeRequest(path, { method = "GET", params = {} } = {}) {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    const error = new Error("Missing Stripe configuration: STRIPE_SECRET_KEY");
    error.statusCode = 503;
    error.expose = true;
    throw error;
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "GET" ? undefined : toFormBody(params),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || "Stripe request failed");
    error.statusCode = response.status >= 400 && response.status < 500 ? 400 : 502;
    error.expose = response.status < 500;
    throw error;
  }

  return data;
}

export function constructStripeWebhookEvent(rawBody, signatureHeader) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const payload = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody || "");

  if (!webhookSecret) {
    const error = new Error("Missing Stripe configuration: STRIPE_WEBHOOK_SECRET");
    error.statusCode = 503;
    error.expose = true;
    throw error;
  }

  const signature = parseStripeSignature(signatureHeader);
  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(`${signature.timestamp}.${payload}`)
    .digest("hex");

  if (!isFreshTimestamp(signature.timestamp) || !hasMatchingSignature(expectedSignature, signature.v1)) {
    const error = new Error("Invalid Stripe webhook signature");
    error.statusCode = 400;
    error.expose = true;
    throw error;
  }

  return JSON.parse(payload);
}

export function serializePremiumProfile(profile) {
  const subscriptionStatus = profile?.subscription_status || "inactive";
  const isPremium = isPremiumProfile(profile);

  return {
    plan: isPremium ? "premium" : "free",
    is_premium: isPremium,
    subscription_status: subscriptionStatus,
    premium_source: profile?.premium_source || null,
    premium_product_id: profile?.premium_product_id || null,
    premium_platform_transaction_id: profile?.premium_platform_transaction_id || null,
    premium_expires_at: profile?.premium_expires_at || profile?.stripe_current_period_end || null,
    premium_last_verified_at: profile?.premium_last_verified_at || null,
    premium_started_at: profile?.premium_started_at || null,
    stripe_current_period_end: profile?.stripe_current_period_end || null,
    stripe_cancel_at_period_end: Boolean(profile?.stripe_cancel_at_period_end),
  };
}

export function buildSubscriptionProfileUpdate(subscription, userId) {
  const status = subscription?.status || "inactive";
  const isPremium = PREMIUM_STATUSES.has(status);
  const periodEnd = toIsoDate(subscription?.current_period_end);
  const priceId = subscription?.items?.data?.[0]?.price?.id || null;
  const now = new Date().toISOString();

  return {
    id: userId,
    plan: isPremium ? "premium" : "free",
    is_premium: isPremium,
    subscription_status: status,
    premium_source: "stripe",
    premium_product_id: priceId,
    premium_platform_transaction_id: getStripeId(subscription?.id),
    premium_last_verified_at: now,
    stripe_customer_id: getStripeId(subscription?.customer),
    stripe_subscription_id: getStripeId(subscription?.id),
    stripe_price_id: priceId,
    stripe_current_period_end: periodEnd,
    stripe_cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
    premium_started_at: isPremium ? new Date().toISOString() : null,
    premium_expires_at: periodEnd,
    updated_at: new Date().toISOString(),
  };
}

function parseStripeSignature(signatureHeader) {
  const parts = String(signatureHeader || "").split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const v1 = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || v1.length === 0) {
    const error = new Error("Invalid Stripe webhook signature");
    error.statusCode = 400;
    error.expose = true;
    throw error;
  }

  return { timestamp, v1 };
}

function isFreshTimestamp(timestamp) {
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));

  return Number.isFinite(ageSeconds) && ageSeconds <= WEBHOOK_TOLERANCE_SECONDS;
}

function hasMatchingSignature(expectedSignature, signatures) {
  const expected = Buffer.from(expectedSignature, "hex");

  return signatures.some((signature) => {
    const actual = Buffer.from(signature, "hex");

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL.trim().replace(/\/$/, "");
}

function toFormBody(params) {
  const body = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  });

  return body;
}

function toIsoDate(timestamp) {
  if (!timestamp) return null;

  return new Date(Number(timestamp) * 1000).toISOString();
}

function getStripeId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;

  return value.id || null;
}
