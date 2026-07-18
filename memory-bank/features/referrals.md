# Referrals

## 1. Propósito
Permitir invitaciones entre usuarios, validación de códigos, aplicación durante onboarding y reclamación de recompensas.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. Un usuario autenticado consulta `/referrals/me`.
2. Si necesita código, crea uno con `/referrals/create-code`.
3. Un visitante llega con código o lo introduce; frontend valida y guarda el código pendiente.
4. Tras autenticarse, `AuthProvider` aplica el código pendiente.
5. El usuario puede reclamar recompensa si backend la marca disponible.

## 4. Rutas frontend
`/premium`, `/register`, `/registro`, `/join`, `/settings/profile`, `/creator-panel`.

## 5. Frontend implicado
`src/services/referralService.js`, `src/services/referralOnboardingService.js`, `src/components/profile/ReferralInviteCard.jsx`, `src/components/profile/referralInviteCardViewModel.js`, `src/context/AuthContext.jsx`, `src/pages/premiumReferralBanner.jsx`.

## 6. Endpoints backend
- `GET /referrals/me`
- `POST /referrals/create-code`
- `POST /referrals/validate-code`
- `POST /referrals/apply-code`
- `POST /referrals/claim-reward`

## 7. Middleware
`GET /me`, crear, aplicar y reclamar usan `verifySupabaseUser`. Validar código es público. Las rutas usan límite global.

## 8. Supabase confirmado
Tablas: `referral_codes`, `referrals`, `referral_rewards`, `subscription_acquisitions`, `profiles`.

Columnas principales: `code`, `type`, `trial_days`, `commission_percent`, `commission_months_limit`, `is_active`, `referrer_user_id`, `referred_user_id`, `status`, `reward_available`, `claimed_at`, `trial_source`, `trial_started_at`, `trial_ends_at`.

## 9. IA
No usa Gemini.

## 10. Límites free/premium
No hay límite de uso free/premium confirmado para crear código de usuario. Los códigos de usuario tienen `trial_days` 0 en `backend/services/referral.service.js`.

## 11. Pruebas
`backend/tests/referralService.test.js`, `backend/tests/acquisitionService.test.js`, `backend/tests/trialSourceMigration.test.js`, `src/services/referralService.test.js`, `src/services/referralOnboardingService.test.js`, `src/components/profile/ReferralInviteCard.test.jsx`.

## 12. Riesgos y dependencias
Depende de integridad entre `referrals`, `referral_rewards`, `subscription_acquisitions` y estado premium. Evitar autoreferencias.

## 13. Invariantes
- Un usuario no debe aplicarse su propio código.
- Un referido solo debe tener un referral único confirmado por índice único.
- La validación pública no debe revelar datos sensibles.

## 14. Pendientes
No se confirmó interfaz administrativa para modificar recompensas manualmente.

## 15. Archivos relevantes
`src/services/referralService.js`, `src/services/referralOnboardingService.js`, `src/components/profile/ReferralInviteCard.jsx`, `backend/routes/referrals.routes.js`, `backend/services/referral.service.js`, `backend/services/acquisition.service.js`, `supabase/migrations/007_referrals_acquisitions_affiliates.sql`, `008_referral_rewards.sql`, `011_referral_reward_claims.sql`, `016_rls_monetization_creators.sql`.
