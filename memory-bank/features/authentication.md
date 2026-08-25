# Authentication

## 1. Propósito
Gestionar sesión de usuario con Supabase Auth, proteger rutas privadas y sincronizar artefactos pendientes de onboarding como consentimiento legal, códigos de creador y códigos de invitación.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario entra por `/login`, `/register`, `/registro`, `/join` o una ruta pública.
2. `AuthProvider` carga sesión con `supabase.auth.getSession()` y usuario con `supabase.auth.getUser()`.
3. Si hay token corrupto, se limpia la sesión local de Supabase.
4. Las rutas privadas usan `ProtectedRoute`; sin usuario redirigen a `/login`.
5. Tras autenticarse se sincronizan idioma, consentimiento legal pendiente, códigos de creador y códigos de referral.
6. Un usuario autenticado que entra a rutas públicas principales se redirige a `/dashboard`.

### Google Sign-In

- Web mantiene Supabase OAuth mediante `supabase.auth.signInWithOAuth({ provider: "google" })`.
- Android nativo usa `@capawesome/capacitor-google-sign-in` para obtener un Google ID token y crea la sesión con `supabase.auth.signInWithIdToken({ provider: "google", token })`.
- iOS nativo usa Supabase OAuth implicit desde `src/services/googleAuthService.js`: obtiene la URL con `skipBrowserRedirect`, la abre mediante `@capacitor/browser`, recibe el custom scheme con `@capacitor/app` y establece la sesión mediante `supabase.auth.setSession`.
- El Client ID usado por el plugin es público y debe venir de `VITE_GOOGLE_WEB_CLIENT_ID`; no se guarda Client Secret en la app.
- `VITE_GOOGLE_WEB_CLIENT_ID` debe existir en `.env.local` o en el entorno de build antes de ejecutar `npm run build`; Vite lo inserta en compilación. `.env.local` debe permanecer ignorado por Git y nunca subirse al repositorio.
- El listener central de `AuthProvider` sigue siendo la única fuente de actualización de sesión.
- Google Login Android fue validado físicamente en un Redmi tras reconstruir la APK con `VITE_GOOGLE_WEB_CLIENT_ID` presente.
- Google Login iOS queda pendiente de que el responsable de iOS registre `@capacitor/browser` en SwiftPM desde Mac y valide el flujo completo en un iPhone.

## 4. Rutas frontend
Públicas: `/`, `/login`, `/register`, `/registro`, `/join`, `/reset-password`, `/privacy`, `/terms`, `/creator-terms`, `/delete-account`, `/rutina/:shareId`, `/rutinas/semana/:shareId`, `/bodyscannerhome`, `/progresohome`, `/dietahome`.

Privadas: `/dashboard`, `/premium`, `/foto-comida`, `/resumen`, `/checkin`, `/perfil`, `/calculadora`, `/plan-comidas`, `/progress`, `/progreso`, `/comidas`, `/rutinas`, `/crear-rutina`, `/editar-rutina/:id`, `/ejercicios`, `/creator-panel`, `/creadores`, `/settings/profile`, `/settings/theme`, `/settings/ai`, `/settings/legal`, `/settings/security`.

## 5. Frontend implicado
Páginas: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/ResetPassword.jsx`, `src/pages/ProfileSetup.jsx`, `src/pages/settings/*.jsx`.

Componentes/contextos/servicios: `src/App.jsx`, `src/main.jsx`, `src/context/AuthContext.jsx`, `src/context/useAuth.js`, `src/lib/supabase.js`, `src/services/googleAuthService.js`, `src/services/apiClient.js`, `src/services/profileService.js`, `src/services/legalConsentService.js`, `src/services/referralOnboardingService.js`, `src/services/creatorTrackingService.js`.

## 6. Endpoints backend
No hay rutas `/auth` propias confirmadas en backend. El backend valida tokens Supabase en endpoints protegidos mediante `verifySupabaseUser`.

## 7. Middleware
`backend/middleware/auth.js` exige `Authorization: Bearer <token>`, valida con `supabase.auth.getUser(token)` y adjunta `req.authUser`. `assertSameUser` y `requireAuthenticatedUser` evitan operar sobre usuarios distintos. `backend/app.js` registra `authRateLimiter` sobre `/auth`, `/login`, `/register` y `/reset-password`, pero no se confirmaron routers Express propios para esas rutas en `backend/routes/`; revisar `backend/app.js` antes de cambiarlas.

## 8. Supabase confirmado
Tablas: `profiles`.

Columnas confirmadas por migraciones/servicios: `id`, `email`, `name`, `age`, `weight`, `height`, `gender`, `activity_level`, `goal`, `preferences`, `accepted_terms`, `accepted_terms_at`, `accepted_privacy`, `accepted_privacy_at`, `accepted_data_policy`, `accepted_data_policy_at`, `legal_version`, `updated_at`.

## 9. IA
No usa Gemini directamente.

## 10. Límites free/premium
No hay límite free/premium específico para autenticación.

## 11. Pruebas
Backend: `backend/tests/auth-401.test.js`, `backend/tests/auth-hardening.test.js`.

Pruebas manuales confirmadas en Android físico: inicio de sesión con Google correcto tras reconstruir con el Client ID web disponible en el entorno de build.

## 12. Riesgos y dependencias
Depende de `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_WEB_CLIENT_ID`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Cambiar nombres de campos de `profiles` rompe perfil, onboarding, premium y preferencias.

## 13. Invariantes
- Las rutas privadas no deben renderizar contenido sin usuario autenticado.
- Las llamadas API autenticadas deben enviar el token desde `src/services/apiClient.js`.
- El backend no debe aceptar operaciones con `user_id` distinto al token.
- Apple Sign-In, email/password, Google Android y Google web no deben modificarse al corregir Google iOS salvo necesidad demostrada.
- No subir `.env`, `.env.local`, `backend/.env` ni variantes locales al repositorio.
- No modificar archivos iOS generados o configuración Xcode desde Windows. La integración SwiftPM de nuevos plugins debe completarse y validarse desde Mac por el responsable de builds Apple.

## 14. Pendientes
- Registrar `CapacitorBrowser` y `CAPBrowserPlugin` desde Mac conservando Capacitor SwiftPM 8.5.0 y la configuración iOS existente.
- Validar Google OAuth en un iPhone, incluyendo éxito, cancelación y repetición sin listeners residuales.

## 15. Archivos relevantes
`src/App.jsx`, `src/main.jsx`, `src/context/AuthContext.jsx`, `src/lib/supabase.js`, `src/services/googleAuthService.js`, `src/services/apiClient.js`, `src/services/profileService.js`, `backend/middleware/auth.js`, `supabase/migrations/002_profile_legal_consent.sql`.
