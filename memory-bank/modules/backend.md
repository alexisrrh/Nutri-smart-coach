# Backend

## 1. Responsabilidad
API Express para IA, dietas, comidas, check-ins, premium, referrals, creators, límites de uso, seguridad HTTP y webhooks.

## 2. Estructura real
- `backend/server.js`: arranque HTTP.
- `backend/app.js`: app Express, CORS, rate limiters y montaje de rutas.
- `backend/routes/`: rutas por dominio.
- `backend/middleware/`: autenticación, rate limiting, request logger y error handler.
- `backend/config/`: Supabase, Gemini, CORS, Multer.
- `backend/services/`: Stripe, mobile premium, referrals, creators, storage, email, fallback dieta.
- `backend/prompts/`, `backend/normalizers/`, `backend/utils/`.
- `backend/tests/`: pruebas Vitest de backend.

## 3. Flujo de datos
Frontend envía token Supabase. `verifySupabaseUser` valida el token. Las rutas usan Supabase service role para leer/escribir datos protegidos, aplican rate limits y devuelven JSON. Webhook Stripe entra antes de `express.json()` para conservar cuerpo raw.

## 4. Puntos de entrada
`backend/server.js`, `backend/app.js`, rutas montadas en `backend/app.js`.

## 5. Dependencias principales
Express 5, Supabase JS, `@google/genai`, Stripe, Multer, CORS, dotenv.

## 6. Convenciones existentes
- ESM.
- Rutas por dominio con servicios auxiliares.
- Errores pasados a `next(error)`.
- Validación de mismo usuario con `assertSameUser`.
- Rate limit in-memory por ventana.
- Normalizadores antes de persistir respuestas IA.

## 7. Integraciones externas
Supabase, Gemini, Stripe, Apple/Google premium móvil, Resend/email.

## 8. Variables de entorno
`PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FRONTEND_URL`, `CORS_ORIGINS`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`, `STRIPE_WEBHOOK_SECRET`, `MAIL_FROM`, `RESEND_API_KEY`, `GOOGLE_PLAY_PACKAGE_NAME`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, `APPLE_BUNDLE_ID`, `APPLE_ISSUER_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `APPLE_ENVIRONMENT`, `INFLUENCER_CODE_ALLOWLIST_USER_IDS`, `INFLUENCER_CODE_ALLOWLIST_EMAILS`, `CREATOR_APPLICATION_ADMIN_EMAIL`.

## 9. Comandos confirmados
Desde la raíz: `npm run lint`, `npm run test`, `npm run build`. En `backend/package.json`: `npm run start`, `npm run dev`.

## 10. Riesgos de producción
Modificar orden de middleware puede romper webhooks Stripe o parseo JSON. El rate limiter es en memoria. Las rutas con service role deben mantener comprobaciones de usuario.

## 11. Archivos a revisar antes de modificar
`backend/app.js`, `backend/server.js`, `backend/middleware/auth.js`, `backend/middleware/rateLimit.js`, `backend/middleware/errorHandler.js`, `backend/config/*.js`, ruta y servicio del dominio afectado.
