# Authentication

## 1. Proposito
Gestionar sesion de usuario con Supabase Auth, proteger rutas privadas y sincronizar artefactos pendientes de onboarding como consentimiento legal, codigos de creador y codigos de invitacion.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario entra por `/login`, `/register`, `/registro`, `/join` o una ruta publica.
2. `AuthProvider` carga sesion con `supabase.auth.getSession()` y usuario con `supabase.auth.getUser()`.
3. Si hay token corrupto, se limpia la sesion local de Supabase.
4. Las rutas privadas usan `ProtectedRoute`; sin usuario redirigen a `/login`.
5. Tras autenticarse se sincronizan idioma, consentimiento legal pendiente, codigos de creador y codigos de referral.
6. Un usuario autenticado que entra a rutas publicas principales se redirige a `/dashboard`.

## 4. Rutas frontend
Publicas: `/`, `/login`, `/register`, `/registro`, `/join`, `/reset-password`, `/privacy`, `/terms`, `/creator-terms`, `/delete-account`, `/rutina/:shareId`, `/rutinas/semana/:shareId`, `/bodyscannerhome`, `/progresohome`, `/dietahome`.

Privadas: `/dashboard`, `/premium`, `/foto-comida`, `/resumen`, `/checkin`, `/perfil`, `/calculadora`, `/plan-comidas`, `/progress`, `/progreso`, `/comidas`, `/rutinas`, `/crear-rutina`, `/editar-rutina/:id`, `/ejercicios`, `/creator-panel`, `/creadores`, `/settings/profile`, `/settings/theme`, `/settings/ai`, `/settings/legal`, `/settings/security`.

## 5. Frontend implicado
Paginas: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/ResetPassword.jsx`, `src/pages/ProfileSetup.jsx`, `src/pages/settings/*.jsx`.

Componentes/contextos/servicios: `src/App.jsx`, `src/main.jsx`, `src/context/AuthContext.jsx`, `src/context/useAuth.js`, `src/lib/supabase.js`, `src/services/apiClient.js`, `src/services/profileService.js`, `src/services/legalConsentService.js`, `src/services/referralOnboardingService.js`, `src/services/creatorTrackingService.js`.

## 6. Endpoints backend
No hay rutas `/auth` propias confirmadas en backend. El backend valida tokens Supabase en endpoints protegidos mediante `verifySupabaseUser`.

## 7. Middleware
`backend/middleware/auth.js` exige `Authorization: Bearer <token>`, valida con `supabase.auth.getUser(token)` y adjunta `req.authUser`. `assertSameUser` y `requireAuthenticatedUser` evitan operar sobre usuarios distintos. `authRateLimiter` se aplica a rutas `/auth`, `/login`, `/register` y `/reset-password` si existen.

## 8. Supabase confirmado
Tablas: `profiles`.

Columnas confirmadas por migraciones/servicios: `id`, `email`, `name`, `age`, `weight`, `height`, `gender`, `activity_level`, `goal`, `preferences`, `accepted_terms`, `accepted_terms_at`, `accepted_privacy`, `accepted_privacy_at`, `accepted_data_policy`, `accepted_data_policy_at`, `legal_version`, `updated_at`.

## 9. IA
No usa Gemini directamente.

## 10. Limites free/premium
No hay limite free/premium especifico para autenticacion.

## 11. Pruebas
Backend: `backend/tests/auth-401.test.js`, `backend/tests/auth-hardening.test.js`.

## 12. Riesgos y dependencias
Depende de `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Cambiar nombres de campos de `profiles` rompe perfil, onboarding, premium y preferencias.

## 13. Invariantes
- Las rutas privadas no deben renderizar contenido sin usuario autenticado.
- Las llamadas API autenticadas deben enviar el token desde `src/services/apiClient.js`.
- El backend no debe aceptar operaciones con `user_id` distinto al token.

## 14. Pendientes
No hay endpoints backend de login/register confirmados; la autenticacion se apoya en Supabase Auth desde frontend.

## 15. Archivos relevantes
`src/App.jsx`, `src/main.jsx`, `src/context/AuthContext.jsx`, `src/lib/supabase.js`, `src/services/apiClient.js`, `src/services/profileService.js`, `backend/middleware/auth.js`, `supabase/migrations/002_profile_legal_consent.sql`.
