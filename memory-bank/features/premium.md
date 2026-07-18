# Premium

## 1. Propósito
Gestionar estado Premium, suscripciones Stripe, verificación móvil y acceso a límites ampliados de IA.

## 2. Estado actual
Operativo con compra Android nativa parcial: el frontend tiene catálogo y verificación backend, pero `src/services/mobileBillingService.js` marca la compra/restauración real como `placeholder` hasta conectar el plugin.

## 3. Flujo de usuario
1. El usuario abre `/premium`.
2. El frontend consulta `GET /premium/status`.
3. Para web, solicita checkout con `POST /stripe/create-checkout-session`.
4. Stripe confirma cambios por `POST /stripe/webhook`.
5. El usuario puede abrir portal con `POST /stripe/create-portal-session`.
6. En Android Capacitor, el frontend consulta configuración móvil; la verificación backend requiere que el cliente entregue `purchaseToken` y `productId`.

## 4. Rutas frontend
`/premium`, `/settings/ai`, `/creator-panel`, `/creadores`.

## 5. Frontend implicado
`src/pages/Premium.jsx`, `src/pages/premiumReferralBanner.jsx`, `src/pages/premiumReferralBannerCopy.js`, `src/services/premiumService.js`, `src/services/mobileBillingService.js`, `src/services/aiUsageService.js`, `src/components/ui/PremiumEmptyState.jsx`.

## 6. Endpoints backend
- `POST /stripe/webhook`
- `POST /stripe/create-checkout-session`
- `POST /stripe/create-portal-session`
- `GET /premium/status`
- `GET /premium/mobile/config-check`
- `POST /premium/mobile/verify-receipt`

## 7. Middleware
Checkout, portal, premium status y verificación móvil usan `verifySupabaseUser`. Webhook usa `express.raw` y validación de firma Stripe, no token Supabase. Los endpoints de pago usan límites globales.

## 8. Supabase confirmado
Tabla `profiles`: `plan`, `is_premium`, `premium_started_at`, `premium_expires_at`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `stripe_price_id`, `stripe_current_period_end`, `stripe_cancel_at_period_end`, `premium_source`, `premium_product_id`, `premium_platform_transaction_id`, `premium_last_verified_at`.

Tabla `subscription_acquisitions`: `user_id`, `premium_source`, `acquisition_source`, `referral_code_id`, `referrer_user_id`, `influencer_user_id`, `trial_source`, `trial_started_at`, `trial_ends_at`, `commission_percent`, `commission_months_limit`, `platform_subscription_id`, `status`.

## 9. IA
No llama a Gemini, pero define acceso a límites premium consumidos por `backend/utils/aiUsage.js`.

## 10. Límites free/premium
Premium amplía límites de IA: comida 20/día, dieta 5/día, check-in 1/día. Free: comida 3/día, dieta 1/semana, check-in 1/semana.

## 11. Pruebas
`backend/tests/payments.routes.test.js`, `backend/tests/stripeWebhook.test.js`, `backend/tests/stripeService.test.js`, `backend/tests/mobilePremiumService.test.js`, `backend/tests/premiumProfileState.test.js`, `src/pages/PremiumReferralBanner.test.jsx`.

## 12. Riesgos y dependencias
Depende de `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`, `STRIPE_WEBHOOK_SECRET`, variables Apple/Google Play y columnas premium de `profiles`.

## 13. Invariantes
- Webhooks deben validar firma antes de cambiar estado premium.
- `isPremiumProfile` debe seguir considerando expiración y estado de suscripción.
- No habilitar compra nativa real sin completar plugin y verificación de store.

## 14. Pendientes
Compra y restauración nativa Android están preparadas como placeholder en frontend.

## 15. Archivos relevantes
`src/pages/Premium.jsx`, `src/services/premiumService.js`, `src/services/mobileBillingService.js`, `backend/routes/payments.routes.js`, `backend/services/stripe.service.js`, `backend/services/mobilePremium.service.js`, `backend/services/acquisition.service.js`, `backend/utils/aiUsage.js`, `supabase/migrations/003_profiles_premium.sql`, `005_profiles_stripe_subscription.sql`, `006_profiles_premium_multiplatform.sql`, `009_subscription_trials.sql`, `010_normalize_trial_source.sql`.
