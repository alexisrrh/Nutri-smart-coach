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
import {
  buildCommissionSubscriptionRef,
  createAffiliateCommissionForPaidInvoice,
  getTrialConfigForAcquisition,
  getPremiumStatusAcquisitionSnapshot,
  markAffiliateCommissionRefunded,
  markReferralPremiumActive,
  normalizeSubscriptionAcquisitionRecord,
  registerSubscriptionAcquisition,
  updateSubscriptionAcquisitionStatus,
} from "../services/acquisition.service.js";
import {
  syncMobilePremiumVerification,
} from "../services/mobilePremium.service.js";

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
      const acquisition = await getLatestAcquisitionByUserId(userId);
      const customerId =
        profile?.stripe_customer_id ||
        (await createAndStoreCustomer({
          userId,
          email: req.authUser.email || profile?.email || "",
        }));
      const trialDays = getEligibleStripeTrialDays(acquisition);

      const session = await createCheckoutSession({
        customerId,
        email: req.authUser.email || profile?.email || "",
        priceId,
        userId,
        plan,
        trialDays,
      });

      return res.json({ url: session.url });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/premium/mobile/verify-receipt",
  express.json({ limit: "2mb" }),
  verifySupabaseUser,
  async (req, res, next) => {
    try {
      const userId = requireAuthenticatedUser(req, res);
      if (!userId) return;

      const result = await syncMobilePremiumVerification(
        {
          userId,
          payload: req.body || {},
        },
        {
          getProfileByUserIdFn: getProfileByUserId,
          upsertProfileSubscriptionFn: upsertProfileSubscription,
        }
      );

      return res.json(result);
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
    const acquisition = await getLatestAcquisitionByUserId(userId);
    const acquisitionSnapshot = getPremiumStatusAcquisitionSnapshot(acquisition);

    return res.json({
      premium: {
        ...serializePremiumProfile(profile),
        ...acquisitionSnapshot,
      },
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

  if (event.type === "invoice.payment_succeeded") {
    await handleInvoicePaymentSucceeded(event.data?.object);
    return;
  }

  if (event.type === "charge.refunded") {
    await handleChargeRefunded(event.data?.object);
    return;
  }

  if (event.type?.startsWith("customer.subscription.")) {
    await handleSubscriptionChanged(event.data?.object);
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session?.client_reference_id || session?.metadata?.user_id;

  if (!userId) return;
  const currentProfile = await getProfileByUserId(userId);

  const update = {
    id: userId,
    stripe_customer_id: getStripeId(session.customer),
    stripe_subscription_id: getStripeId(session.subscription),
    updated_at: new Date().toISOString(),
  };

  const subscription = await retrieveSubscription(update.stripe_subscription_id);
  const existingAcquisition = await getLatestAcquisitionByUserId(userId);
  const trialWindow = getStripeSubscriptionTrialWindow(subscription);
  const trialConfig = getTrialConfigForAcquisition(existingAcquisition);
  const subscriptionUpdate = subscription
    ? buildSubscriptionProfileUpdate(subscription, userId, currentProfile)
    : update;

  await registerSubscriptionAcquisition({
    userId,
    premiumSource: "stripe",
    acquisitionSource: trialConfig.acquisitionSource,
    trialSource:
      subscription?.status === "trialing" ? trialConfig.trialSource : existingAcquisition?.trial_source || "none",
    trialStartedAt: trialWindow.startedAt,
    trialEndsAt: trialWindow.endsAt,
    platformSubscriptionId: update.stripe_subscription_id,
    status: subscription?.status || "active",
  });

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
  const currentProfile = await getProfileByUserId(userId);
  const trialWindow = getStripeSubscriptionTrialWindow(subscription);

  await updateSubscriptionAcquisitionStatus({
    userId,
    platformSubscriptionId: getStripeId(subscription?.id),
    status: subscription?.status || "inactive",
    trialStartedAt: trialWindow.startedAt,
    trialEndsAt: trialWindow.endsAt,
  });

  await upsertProfileSubscription(
    buildSubscriptionProfileUpdate(subscription, userId, currentProfile)
  );
}

async function handleInvoicePaymentSucceeded(invoice) {
  const subscriptionId = getStripeId(invoice?.subscription);
  const userId =
    invoice?.parent?.subscription_details?.metadata?.user_id ||
    invoice?.subscription_details?.metadata?.user_id ||
    (subscriptionId ? await findUserIdByStripeSubscriptionId(subscriptionId) : null) ||
    (await findUserIdByStripeCustomerId(getStripeId(invoice?.customer)));

  if (!userId || !subscriptionId) return;

  const amountPaid = Number(invoice?.amount_paid || 0) / 100;
  if (!(amountPaid > 0) || invoice?.paid !== true) return;

  const paidAt = toInvoicePaidAt(invoice);
  const referralActivation = await markReferralPremiumActive({
    userId,
    premiumSource: "stripe",
    platformSubscriptionId: subscriptionId,
    paidAt,
    status: "active",
  });

  if (referralActivation?.referral?.type !== "influencer") {
    return;
  }

  await createAffiliateCommissionForPaidInvoice({
    influencerUserId: referralActivation.referral.referrer_user_id,
    referredUserId: userId,
    referralId: referralActivation.referral.id,
    subscriptionId: buildCommissionSubscriptionRef({
      platformSubscriptionId: subscriptionId,
      invoiceId: getStripeId(invoice?.id),
    }),
    amount: amountPaid,
    currency: String(invoice?.currency || "eur").toLowerCase(),
    commissionPercent:
      Number(referralActivation.acquisition?.commission_percent || 30) || 30,
    commissionMonthsLimit:
      Number(referralActivation.acquisition?.commission_months_limit || 12) || 12,
    paidAt,
    trialEndsAt: referralActivation.referral.trial_ends_at || null,
    premiumSource: "stripe",
  });
}

async function handleChargeRefunded(charge) {
  const subscriptionId = getStripeId(charge?.invoice);
  if (!subscriptionId) return;

  await markAffiliateCommissionRefunded({
    subscriptionId,
    status: charge?.amount_refunded ? "refunded" : "cancelled",
  });
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
        "premium_source",
        "premium_product_id",
        "premium_platform_transaction_id",
        "premium_expires_at",
        "premium_last_verified_at",
        "premium_started_at",
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

async function getLatestAcquisitionByUserId(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("subscription_acquisitions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return null;

  return normalizeSubscriptionAcquisitionRecord(data?.[0] || null);
}

async function findUserIdByStripeSubscriptionId(subscriptionId) {
  if (!subscriptionId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (error) return null;

  return data?.id || null;
}

function getStripeId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;

  return value.id || null;
}

function toInvoicePaidAt(invoice) {
  const paidAt = invoice?.status_transitions?.paid_at || invoice?.created;
  if (!paidAt) return new Date().toISOString();

  return new Date(Number(paidAt) * 1000).toISOString();
}

function getEligibleStripeTrialDays(acquisition) {
  if (!acquisition) {
    return getTrialConfigForAcquisition(null).trialDays;
  }

  if (acquisition.platform_subscription_id) {
    if (!acquisition.trial_ends_at) return 0;

    const diffMs = new Date(acquisition.trial_ends_at).getTime() - Date.now();
    if (Number.isNaN(diffMs) || diffMs <= 0) return 0;

    return Math.max(Math.ceil(diffMs / (24 * 60 * 60 * 1000)), 0);
  }

  return getTrialConfigForAcquisition(acquisition).trialDays;
}

function getStripeSubscriptionTrialWindow(subscription) {
  if (!subscription || subscription.status !== "trialing") {
    return {
      startedAt: null,
      endsAt: null,
    };
  }

  const startedAt = toStripeTimestampIso(
    subscription.trial_start || subscription.current_period_start || subscription.start_date
  );
  const endsAt = toStripeTimestampIso(
    subscription.trial_end || subscription.current_period_end
  );

  return {
    startedAt,
    endsAt,
  };
}

function toStripeTimestampIso(value) {
  if (!value) return null;

  return new Date(Number(value) * 1000).toISOString();
}

export default router;
