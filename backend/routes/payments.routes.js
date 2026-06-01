import express, { Router } from "express";
import { supabase } from "../config/supabase.js";
import { requireAuthenticatedUser, verifySupabaseUser } from "../middleware/auth.js";
import {
  assertStripeCheckoutConfig,
  assertStripeWebhookConfig,
  buildSubscriptionProfileUpdate,
  constructStripeWebhookEvent,
  createBillingPortalSession,
  createCheckoutSession,
  createStripeCustomer,
  getConfiguredPriceId,
  retrieveSubscription,
  serializePremiumProfile,
} from "../services/stripe.service.js";

const router = Router();

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res, next) => {
    try {
      assertStripeWebhookConfig();

      const event = constructStripeWebhookEvent(
        req.body,
        req.get("Stripe-Signature")
      );

      await handleStripeEvent(event);

      return res.json({ received: true });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/stripe/create-checkout-session",
  express.json({ limit: "1mb" }),
  verifySupabaseUser,
  async (req, res, next) => {
    try {
      assertStripeCheckoutConfig();

      const userId = requireAuthenticatedUser(req, res);

      if (!userId) return;
      const plan = req.body?.plan === "yearly" ? "yearly" : "monthly";
      const priceId = getConfiguredPriceId(plan);

      if (!priceId) {
        return res.status(400).json({ error: "Plan de pago no disponible." });
      }

      const profile = await getProfileByUserId(userId);
      const customerId =
        profile?.stripe_customer_id ||
        (await createAndStoreCustomer({
          userId,
          email: req.authUser.email || profile?.email || "",
        }));

      const session = await createCheckoutSession({
        customerId,
        email: req.authUser.email || profile?.email || "",
        priceId,
        userId,
        plan,
      });

      return res.json({ url: session.url });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/stripe/create-portal-session",
  express.json({ limit: "1mb" }),
  verifySupabaseUser,
  async (req, res, next) => {
    try {
      assertStripeCheckoutConfig();

      const userId = requireAuthenticatedUser(req, res);

      if (!userId) return;

      const profile = await getProfileByUserId(userId);

      if (!profile?.stripe_customer_id) {
        return res.status(400).json({
          error: "No existe una suscripción para gestionar.",
        });
      }

      const session = await createBillingPortalSession(profile.stripe_customer_id);

      return res.json({ url: session.url });
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/premium/status", verifySupabaseUser, async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUser(req, res);

    if (!userId) return;

    const profile = await getProfileByUserId(userId);

    return res.json({
      premium: serializePremiumProfile(profile),
    });
  } catch (error) {
    return next(error);
  }
});

async function createAndStoreCustomer({ userId, email }) {
  const customer = await createStripeCustomer({ userId, email });

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email || null,
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    const wrappedError = new Error("No se pudo guardar el cliente de Stripe.");
    wrappedError.statusCode = 500;
    throw wrappedError;
  }

  return customer.id;
}

async function handleStripeEvent(event) {
  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data?.object);
    return;
  }

  if (event.type?.startsWith("customer.subscription.")) {
    await handleSubscriptionChanged(event.data?.object);
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session?.client_reference_id || session?.metadata?.user_id;

  if (!userId) return;

  const update = {
    id: userId,
    stripe_customer_id: getStripeId(session.customer),
    stripe_subscription_id: getStripeId(session.subscription),
    updated_at: new Date().toISOString(),
  };

  const subscription = await retrieveSubscription(update.stripe_subscription_id);
  const subscriptionUpdate = subscription
    ? buildSubscriptionProfileUpdate(subscription, userId)
    : update;

  await upsertProfileSubscription({
    ...subscriptionUpdate,
    ...update,
  });
}

async function handleSubscriptionChanged(subscription) {
  const userId =
    subscription?.metadata?.user_id ||
    (await findUserIdByStripeCustomerId(getStripeId(subscription?.customer)));

  if (!userId) return;

  await upsertProfileSubscription(
    buildSubscriptionProfileUpdate(subscription, userId)
  );
}

async function upsertProfileSubscription(payload) {
  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    const wrappedError = new Error("No se pudo actualizar la suscripción.");
    wrappedError.statusCode = 500;
    throw wrappedError;
  }
}

async function getProfileByUserId(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "email",
        "plan",
        "is_premium",
        "subscription_status",
        "premium_started_at",
        "premium_expires_at",
        "stripe_customer_id",
        "stripe_subscription_id",
        "stripe_current_period_end",
        "stripe_cancel_at_period_end",
      ].join(", ")
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    const wrappedError = new Error("No se pudo consultar el estado premium.");
    wrappedError.statusCode = 500;
    throw wrappedError;
  }

  return data;
}

async function findUserIdByStripeCustomerId(customerId) {
  if (!customerId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) return null;

  return data?.id || null;
}

function getStripeId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;

  return value.id || null;
}

export default router;
