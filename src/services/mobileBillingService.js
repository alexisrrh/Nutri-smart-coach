import { Capacitor } from "@capacitor/core";
import { request } from "./apiClient";
import { verifyMobilePremiumReceipt } from "./premiumService";

export const MOBILE_BILLING_PLUGIN = "@capacitor-community/in-app-purchases";

const MOBILE_PRODUCTS = [
  {
    id: "premium_monthly",
    label: "Premium mensual",
    title: "Premium mensual",
    price: 7.99,
    currency: "EUR",
    billingPeriod: "P1M",
  },
  {
    id: "premium_yearly",
    label: "Premium anual",
    title: "Premium anual",
    price: 59.99,
    currency: "EUR",
    billingPeriod: "P1Y",
  },
];

let cachedCatalog = null;
let cachedCatalogAt = 0;
const CATALOG_TTL_MS = 5 * 60 * 1000;

export function isNativeAndroid() {
  if (typeof window === "undefined") return false;
  return Capacitor.getPlatform?.() === "android";
}

export async function loadProducts({ forceRefresh = false } = {}) {
  if (!isNativeAndroid()) {
    return buildMobileBillingState({
      supported: false,
      configured: false,
      missing: [],
      pluginRequired: false,
      products: MOBILE_PRODUCTS,
    });
  }

  const now = Date.now();
  if (
    !forceRefresh &&
    cachedCatalog &&
    now - cachedCatalogAt < CATALOG_TTL_MS
  ) {
    return cachedCatalog;
  }

  try {
    const config = await request(
      "/premium/mobile/config-check",
      {},
      { operation: "consultar la configuración de Google Play Billing" }
    );

    cachedCatalog = buildMobileBillingState({
      supported: true,
      configured: Boolean(config?.googleConfigured),
      missing: Array.isArray(config?.missing) ? config.missing : [],
      pluginRequired: true,
      products: MOBILE_PRODUCTS,
      backendConfig: config || null,
    });
  } catch (error) {
    cachedCatalog = buildMobileBillingState({
      supported: true,
      configured: false,
      missing: ["config-check"],
      pluginRequired: true,
      products: MOBILE_PRODUCTS,
      error: error?.message || String(error),
    });
  }

  cachedCatalogAt = now;
  return cachedCatalog;
}

export async function purchasePremium(productId) {
  const normalizedProductId = String(productId || "").trim();
  const product = MOBILE_PRODUCTS.find((item) => item.id === normalizedProductId) || null;

  if (!isNativeAndroid()) {
    return {
      started: false,
      status: "not_native",
      plugin: MOBILE_BILLING_PLUGIN,
      product: product || null,
      message: "La compra nativa solo está preparada para Android Capacitor.",
    };
  }

  const catalog = await loadProducts();
  if (!catalog.configured) {
    return {
      started: false,
      status: "not_configured",
      plugin: MOBILE_BILLING_PLUGIN,
      product: product || null,
      message: "Google Play Billing todavía no está configurado.",
      catalog,
    };
  }

  return {
    started: false,
    status: "placeholder",
    plugin: MOBILE_BILLING_PLUGIN,
    product: product || null,
    message:
      `Falta conectar ${MOBILE_BILLING_PLUGIN} para abrir la compra real desde Android.`,
    catalog,
  };
}

export async function restorePurchases() {
  if (!isNativeAndroid()) {
    return {
      restored: false,
      status: "not_native",
      plugin: MOBILE_BILLING_PLUGIN,
      message: "La restauración nativa solo está preparada para Android Capacitor.",
    };
  }

  const catalog = await loadProducts();
  if (!catalog.configured) {
    return {
      restored: false,
      status: "not_configured",
      plugin: MOBILE_BILLING_PLUGIN,
      message: "Google Play Billing todavía no está configurado.",
      catalog,
    };
  }

  return {
    restored: false,
    status: "placeholder",
    plugin: MOBILE_BILLING_PLUGIN,
    message:
      `Falta conectar ${MOBILE_BILLING_PLUGIN} para restaurar compras reales.`,
    catalog,
  };
}

export async function verifyPurchaseWithBackend(purchaseToken, productId) {
  const token = String(purchaseToken || "").trim();
  const product = String(productId || "").trim();

  if (!token) {
    throw new Error("Falta el token de compra.");
  }

  if (!product) {
    throw new Error("Falta el identificador del producto.");
  }

  return verifyMobilePremiumReceipt({
    platform: "google",
    productId: product,
    purchaseToken: token,
    transactionId: token,
  });
}

function buildMobileBillingState({
  supported,
  configured,
  missing,
  pluginRequired,
  products,
  backendConfig = null,
  error = null,
}) {
  return {
    supported: Boolean(supported),
    configured: Boolean(configured),
    pluginRequired: Boolean(pluginRequired),
    missing: Array.isArray(missing) ? missing : [],
    products: Array.isArray(products)
      ? products.map((product) => ({
          ...product,
          available: Boolean(configured),
          status: configured ? "ready" : "coming_soon",
        }))
      : [],
    backendConfig,
    error,
  };
}
