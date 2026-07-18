# Diets

## 1. Proposito
Generar planes semanales de comida, consultar dietas guardadas, marcar comidas completadas y permitir reescritura premium de una comida.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario completa o reutiliza perfil nutricional.
2. En `/plan-comidas` solicita una dieta.
3. El frontend llama `POST /generate-diet`.
4. El backend valida perfil, limite de IA y genera plan con Gemini o fallback si falta IA.
5. El plan se guarda en `diet_plans` y el perfil se actualiza en `profiles`.
6. El usuario marca comidas; el progreso se guarda en `meal_logs`.
7. Usuarios premium pueden reescribir una comida concreta.

## 4. Rutas frontend
`/plan-comidas`, `/dashboard`, `/resumen`, `/dietahome`.

## 5. Frontend implicado
Paginas/servicios: `src/pages/MealPlan.jsx`, `src/pages/Daily.jsx`, `src/services/dietService.js`, `src/services/profileService.js`, `src/services/aiUsageService.js`, `src/hooks/useAiUsageStatus.js`.

## 6. Endpoints backend
- `POST /generate-diet`
- `GET /diet-plans/:userId`
- `POST /diet-plans/:dietPlanId/rewrite-meal`
- `GET /diet-progress/:userId`
- `PUT /diet-progress/:userId`
- `GET /ai-usage/:userId`

## 7. Middleware
`verifySupabaseUser` en todos los endpoints de dieta. `generateDietRateLimiter` en generacion. `assertSameUser` protege consultas y progreso.

## 8. Supabase confirmado
Tablas: `diet_plans`, `profiles`, `meal_logs`.

Columnas `meal_logs`: `id`, `user_id`, `meal_id`, `diet_plan_id`, `source`, `completed`, `completed_at`, `created_at`, `updated_at`.

Campos usados de `diet_plans`: `id`, `user_id`, `profile`, `preferences`, `week`, `used_fallback`, `warning`, `created_at`.

## 9. IA
`backend/routes/diets.routes.js` usa `gemini-2.5-flash`, `backend/prompts/diet.prompt.js`, `backend/normalizers/diet.normalizer.js` y fallback en `backend/services/dietFallback.service.js`.

## 10. Limites free/premium
Generacion: free 1/semana; premium 5/dia. Reescritura de comida exige perfil premium activo. Hay enfriamiento de 8 segundos por usuario antes de IA.

## 11. Pruebas
`backend/tests/diets.generateDietLanguage.test.js`, `backend/tests/dietPrompt.test.js`, `backend/tests/dietFallback.test.js`, `backend/tests/rewriteMeal.test.js`, `backend/tests/aiUsageLimits.test.js`, `src/services/dietService.test.js`.

## 12. Riesgos y dependencias
Depende de `GEMINI_API_KEY` para generacion IA; si falta, existe fallback. Cambios en estructura de `week` impactan frontend, progreso y reescritura.

## 13. Invariantes
- La dieta no debe generarse para otro usuario.
- `meal_logs.source` debe ser `diet_plan` para progreso de dieta.
- La reescritura premium no debe estar disponible para perfiles no premium.

## 14. Pendientes
La estructura base completa de `diet_plans` no se crea en las migraciones actuales; su existencia se confirma por auditoria RLS y uso en codigo.

## 15. Archivos relevantes
`src/pages/MealPlan.jsx`, `src/services/dietService.js`, `backend/routes/diets.routes.js`, `backend/prompts/diet.prompt.js`, `backend/normalizers/diet.normalizer.js`, `backend/services/dietFallback.service.js`, `backend/utils/aiUsage.js`, `supabase/migrations/001_rls_security_audit.sql`, `supabase/migrations/004_meal_logs_diet_progress.sql`.
