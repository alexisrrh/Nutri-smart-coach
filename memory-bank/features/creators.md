# Creators

## 1. Proposito
Gestionar programa de creadores: solicitudes, codigo personalizado, tracking de enlaces, estadisticas y solicitudes de pago.

## 2. Estado actual
Operativo para flujo de usuario. La aprobacion/rechazo administrativa de solicitudes queda pendiente de verificar porque no hay endpoint administrativo confirmado.

## 3. Flujo de usuario
1. El usuario abre `/creator-panel` o `/creadores`.
2. Consulta estado con `GET /creators/me`.
3. Si no tiene solicitud activa, envia formulario con plataforma, usuario social, seguidores y prueba.
4. Un enlace de creador usa query `creator`; `App.jsx` guarda el codigo, registra clic y redirige a registro o premium.
5. Un creador aprobado puede cambiar codigo y pedir payout si supera el minimo.

## 4. Rutas frontend
`/creator-panel`, `/creadores`, `/join`, `/register`, `/premium`.

## 5. Frontend implicado
`src/pages/CreatorPanel.jsx`, `src/services/creatorService.js`, `src/services/creatorTrackingService.js`, `src/components/profile/CreatorProgramCard.jsx`, `src/components/profile/creatorCodeEditValidation.js`, `src/context/AuthContext.jsx`, `src/App.jsx`.

## 6. Endpoints backend
- `GET /creators/routes`
- `POST /creators/track-click`
- `GET /creators/me`
- `POST /creators/apply`
- `PATCH /creators/code`
- `POST /creators/payouts/request`

## 7. Middleware
`GET /me`, apply, code y payouts usan `verifySupabaseUser`. `track-click` es publico con rate limiter local de 30 peticiones/15 min. Hay limite global en `backend/app.js`.

## 8. Supabase confirmado
Tablas: `influencer_applications`, `referral_codes`, `creator_link_clicks`, `creator_payout_requests`, `affiliate_commissions`, `subscription_acquisitions`.

Columnas clave: `social_platform`, `social_handle`, `followers_count`, `proof_url`, `status`, `reviewed_at`, `reviewed_by`, `rejection_reason`, `creator_code`, `creator_user_id`, `visitor_id`, `ip_hash`, `user_agent`, `amount`, `currency`, `requested_at`, `paid_at`, `notes`, `source_code`, `payment_reference`.

## 9. IA
No usa Gemini.

## 10. Limites free/premium
Constantes confirmadas: minimo 5000 seguidores para solicitud, prueba de creador 15 dias, comision 30%, limite de 12 meses, payout minimo 25 EUR.

## 11. Pruebas
`backend/tests/creatorService.test.js`, `backend/tests/creators.routes.test.js`, `src/pages/CreatorPanel.test.jsx`, `src/services/creatorService.test.js`, `src/services/creatorTrackingService.test.js`, `src/components/profile/CreatorProgramCard.test.jsx`.

## 12. Riesgos y dependencias
El tracking publico debe mantener deduplicacion y hash de IP. Cambios de codigo afectan enlaces existentes. Payouts dependen de comisiones calculadas y estado aprobado.

## 13. Invariantes
- No permitir payout bajo minimo o con solicitud pendiente duplicada.
- No guardar IP en claro; el servicio guarda `ip_hash`.
- Mantener normalizacion de codigos a mayusculas alfanumericas.

## 14. Pendientes
No hay endpoint administrativo confirmado para revisar `influencer_applications`.

## 15. Archivos relevantes
`src/pages/CreatorPanel.jsx`, `src/services/creatorService.js`, `src/services/creatorTrackingService.js`, `src/components/profile/CreatorProgramCard.jsx`, `backend/routes/creators.routes.js`, `backend/services/creator.service.js`, `backend/services/referral.service.js`, `supabase/migrations/012_creator_applications.sql`, `013_separate_creator_codes.sql`, `014_creator_code_customization.sql`, `015_creator_tracking_and_payouts.sql`, `016_rls_monetization_creators.sql`.
