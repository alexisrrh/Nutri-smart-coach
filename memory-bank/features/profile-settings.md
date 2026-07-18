# Profile Settings

## 1. Propósito
Gestionar datos de perfil, preferencias nutricionales, tema visual, ajustes de IA, legales y seguridad de cuenta.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario completa perfil inicial en `/perfil`.
2. Edita datos en `/settings/profile`.
3. Cambia tema en `/settings/theme`.
4. Consulta límites IA en `/settings/ai`.
5. Revisa consentimientos/legal en `/settings/legal`.
6. Gestiona opciones de seguridad en `/settings/security`.

## 4. Rutas frontend
`/perfil`, `/settings/profile`, `/settings/theme`, `/settings/ai`, `/settings/legal`, `/settings/security`, `/privacy`, `/terms`, `/creator-terms`, `/delete-account`.

## 5. Frontend implicado
`src/pages/ProfileSetup.jsx`, `src/pages/settings/SettingsProfile.jsx`, `src/pages/settings/SettingsTheme.jsx`, `src/pages/settings/SettingsAi.jsx`, `src/pages/settings/SettingsLegal.jsx`, `src/pages/settings/SettingsSecurity.jsx`, `src/pages/settings/SettingsShared.jsx`, `src/context/ThemeContext.jsx`, `src/services/profileService.js`, `src/services/legalConsentService.js`, `src/services/aiUsageService.js`.

## 6. Endpoints backend
No hay endpoints Express de perfil confirmados. `src/services/profileService.js` usa Supabase directo por defecto. Existe una ruta API `/profiles/:userId` detrás de `VITE_PROFILE_API_ENABLED`, pero no hay backend correspondiente confirmado; tratarla como pendiente de verificar antes de activar esa variable.

## 7. Middleware
Para perfil directo aplica Supabase Auth/RLS. Para endpoints de IA usados en settings aplican `verifySupabaseUser`.

## 8. Supabase confirmado
Tabla `profiles` con datos personales, preferencias, consentimiento legal y estado premium. Ver detalles de auth y premium en `authentication.md` y `premium.md`.

## 9. IA
`/settings/ai` consulta límites/uso, pero no llama a Gemini directamente.

## 10. Límites free/premium
La pantalla de IA refleja límites confirmados por `src/services/aiUsageService.js` y `backend/utils/aiUsage.js`.

## 11. Pruebas
Pruebas relacionadas: `src/services/aiUsageService.test.js`, `src/components/profile/ReferralInviteCard.test.jsx`, `src/components/profile/CreatorProgramCard.test.jsx`.

## 12. Riesgos y dependencias
Cambios en `profiles.preferences` pueden impactar dieta, idioma, dashboard y calculadora. Cambiar claves de tema afecta `src/index.css` y `ThemeContext`.

## 13. Invariantes
- Guardar consentimiento con `legal_version`.
- No activar ruta API de perfil sin backend real confirmado.
- Mantener compatibilidad de cache `STORAGE_KEYS.PROFILE`.

## 14. Pendientes
Pendiente de verificar: confirmar si se planea implementar backend `/profiles/:userId` antes de activar `VITE_PROFILE_API_ENABLED`.

## 15. Archivos relevantes
`src/pages/ProfileSetup.jsx`, `src/pages/settings/SettingsProfile.jsx`, `src/pages/settings/SettingsTheme.jsx`, `src/pages/settings/SettingsAi.jsx`, `src/pages/settings/SettingsLegal.jsx`, `src/pages/settings/SettingsSecurity.jsx`, `src/pages/settings/SettingsShared.jsx`, `src/context/ThemeContext.jsx`, `src/services/profileService.js`, `src/services/legalConsentService.js`, `src/services/aiUsageService.js`, `src/index.css`, `supabase/migrations/002_profile_legal_consent.sql`, `supabase/migrations/003_profiles_premium.sql`.
