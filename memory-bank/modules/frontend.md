# Frontend

## 1. Responsabilidad
SPA React para onboarding, dashboard, IA nutricional, dietas, progreso, rutinas, premium, referrals, creadores y ajustes.

## 2. Estructura real
- `src/main.jsx`: providers globales, i18n, analytics y service worker en producción.
- `src/App.jsx`: router, lazy loading, rutas públicas/privadas y tracking de creator query.
- `src/pages/`: pantallas principales.
- `src/components/`: UI compartida, home, perfil y componentes de dominio.
- `src/hooks/`: hooks por flujo (`checkin`, `food-photo`, `meals`, `progress`, `workouts`).
- `src/services/`: API, Supabase directo, cache y lógica de dominio.
- `src/config/`: API URL, storage keys y gamificación.
- `src/context/`: Auth y tema.

## 3. Flujo de datos
El usuario autentica con Supabase; `apiClient` añade Bearer token a llamadas Express. Algunos dominios leen Supabase directo desde frontend con RLS (`profiles`, progreso, rutinas, sesiones). Los servicios mantienen caches en localStorage/sessionStorage para recuperación y fallback.

## 4. Puntos de entrada
`index.html`, `src/main.jsx`, `src/App.jsx`.

## 5. Dependencias principales
React 19, React Router 7, Supabase JS, Vite 8, Tailwind 4, Framer Motion, Lucide React, i18next, Capacitor.

## 6. Convenciones existentes
- Páginas lazy-loaded desde `src/App.jsx`.
- Servicios por dominio en `src/services/*Service.js`.
- Hooks por flujo en subcarpetas de `src/hooks/`.
- Tokens visuales CSS en `src/index.css` con variables `--app-*`.
- Errores HTTP normalizados en `src/services/apiClient.js`.

## 7. Integraciones externas
Supabase Auth/DB/Storage, backend Express, Google Analytics via `src/services/analytics.js`, Capacitor en Android.

## 8. Variables de entorno
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL_DEV`, `VITE_API_URL`, `VITE_DEBUG_DASHBOARD_TIMING`, `VITE_PROFILE_API_ENABLED`, `VITE_CREATOR_JOIN_BASE_URL`, `VITE_APP_URL`, `VITE_SITE_URL`.

## 9. Comandos confirmados
`npm run dev`, `npm run build`, `npm run lint`, `npm run preview`, `npm run test`, `npm run cap:sync`, `npm run cap:android`, `npm run android:add`.

## 10. Riesgos de producción
Cambiar rutas rompe enlaces públicos y navegación. Cambiar claves de localStorage o shape de respuestas rompe recuperación offline/parcial. Activar `VITE_PROFILE_API_ENABLED` sin backend `/profiles/:userId` confirmado rompe perfil.

## 11. Archivos a revisar antes de modificar
`src/App.jsx`, `src/main.jsx`, `src/services/apiClient.js`, `src/lib/supabase.js`, `src/config/api.js`, `src/config/storageKeys.js`, `src/index.css`, pagina/hook/servicio de la funcionalidad afectada.
