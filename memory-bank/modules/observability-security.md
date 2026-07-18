# Observability And Security

## 1. Responsabilidad
Registrar peticiones con metadatos seguros, manejar errores sin filtrar secretos, restringir CORS, validar sesion y limitar abuso.

## 2. Estructura real
- `backend/middleware/requestLogger.js`
- `backend/middleware/errorHandler.js`
- `backend/middleware/auth.js`
- `backend/middleware/rateLimit.js`
- `backend/config/cors.js`
- `backend/config/multer.js`
- `src/services/apiClient.js`
- `src/services/analytics.js`

## 3. Flujo de datos
Cada request backend recibe `X-Request-Id`, CORS se evalua por origen, rate limit se aplica antes de rutas principales, auth valida Bearer token y errores se transforman a respuestas seguras. El frontend normaliza errores de red, timeout, sesion y 429.

## 4. Puntos de entrada
`backend/app.js`, `src/services/apiClient.js`, `src/main.jsx`.

## 5. Dependencias principales
Express, CORS, Supabase Auth, crypto Node, fetch/browser APIs, Google Analytics.

## 6. Convenciones existentes
- No loggear tokens ni datos sensibles.
- Hash de identificadores para rate limiting/tracking.
- Respuestas 401/403 genericas para sesion invalida.
- Imagenes en memoria con limite 1.5 MB.

## 7. Integraciones externas
Supabase Auth, Stripe webhooks, Gemini, GA4.

## 8. Variables de entorno
`FRONTEND_URL`, `CORS_ORIGINS`, credenciales Supabase, Stripe, Gemini y stores moviles por nombre.

## 9. Comandos confirmados
`npm run lint`, `npm run test`, `npm run build`.

## 10. Riesgos de produccion
Ampliar CORS, relajar auth o exponer errores internos puede filtrar datos. El rate limiter in-memory no coordina multiples instancias.

## 11. Archivos a revisar antes de modificar
`backend/app.js`, `backend/middleware/*.js`, `backend/config/cors.js`, `backend/config/multer.js`, `src/services/apiClient.js`, `backend/tests/auth-hardening.test.js`, `backend/tests/observability.test.js`, `backend/tests/rateLimit.test.js`, `backend/tests/cors.test.js`.
