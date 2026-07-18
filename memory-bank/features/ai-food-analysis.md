# AI Food Analysis

## 1. Propósito
Analizar comidas desde imagen y/o descripción con Gemini, guardar el resultado nutricional y aplicar límites diarios según plan.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario abre `/foto-comida`.
2. Selecciona una imagen y/o escribe una descripción.
3. El frontend envía `FormData` a `POST /analyze-food`.
4. El backend valida sesión, archivo y límite de IA.
5. Gemini devuelve JSON nutricional normalizado.
6. La imagen se guarda en el bucket `food-photos` y el análisis en `meal_analyses`.
7. El historial se consulta desde `/comidas`.

## 4. Rutas frontend
`/foto-comida`, `/comidas`, `/resumen`, `/dashboard`.

## 5. Frontend implicado
Páginas: `src/pages/FoodPhoto.jsx`, `src/pages/Meals.jsx`, `src/pages/Daily.jsx`.

Hooks/servicios/componentes: `src/hooks/food-photo/useFoodPhotoAnalysis.js`, `src/hooks/food-photo/useFoodPhotoImageUpload.js`, `src/hooks/food-photo/useFoodPhotoRecovery.js`, `src/hooks/meals/*.js`, `src/services/mealService.js`, `src/services/aiUsageService.js`, `src/hooks/useAiUsageStatus.js`, `src/components/ui/AiUsageCard.jsx`, `src/components/ui/AiErrorNotice.jsx`.

## 6. Endpoints backend
- `POST /analyze-food`
- `GET /meal-analyses/:userId`
- `DELETE /meal-analyses/:mealId`
- `DELETE /meal-analyses/user/:userId`
- `GET /ai-usage/:userId`

## 7. Middleware
`POST /analyze-food` usa `verifySupabaseUser`, `uploadSingleImage("image")` y `analyzeFoodRateLimiter`. Las consultas y borrados usan `verifySupabaseUser` y comprobación de mismo usuario.

## 8. Supabase confirmado
Tabla `meal_analyses`: `id`, `user_id`, `image_url`, `image_hash`, `language`, `goal`, `food`, `description`, `portion_estimate`, `ingredients_detected`, `calories`, `protein`, `carbs`, `fat`, `fiber`, `sugar`, `sodium`, `confidence`, `score`, `goal_fit`, `recommendation`, `improvements`, `warning`, `created_at`.

Bucket: `food-photos`.

## 9. IA
`backend/routes/meals.routes.js` usa `gemini-2.5-flash`, `backend/prompts/foodAnalysis.prompt.js`, `backend/normalizers/foodAnalysis.normalizer.js` y `backend/utils/json.js`.

## 10. Límites free/premium
Confirmados en `backend/utils/aiUsage.js` y reflejados en `src/services/aiUsageService.js`: free 3 análisis/día; premium 20 análisis/día. Hay enfriamiento de 8 segundos por usuario antes de llamar a IA.

## 11. Pruebas
`backend/tests/meals.analyzeFoodLanguage.test.js`, `backend/tests/normalizers.test.js`, `backend/tests/files.test.js`, `backend/tests/aiUsageLimits.test.js`, `backend/tests/aiUsageRoute.test.js`, `src/services/aiUsageService.test.js`, `src/components/ui/AiUsageCard.test.jsx`.

## 12. Riesgos y dependencias
Depende de `GEMINI_API_KEY`, Supabase Storage, `SUPABASE_SERVICE_ROLE_KEY` y `VITE_API_URL`. El tamaño máximo de imagen confirmado es 1.5 MB en `backend/config/multer.js`.

## 13. Invariantes
- No guardar análisis para un `user_id` distinto al usuario autenticado.
- Mantener JSON IA normalizado antes de persistir.
- No romper reutilización por `image_hash` del mismo usuario e idioma.

## 14. Pendientes
No hay cola asíncrona confirmada; el endpoint responde en la misma petición.

## 15. Archivos relevantes
`src/pages/FoodPhoto.jsx`, `src/pages/Meals.jsx`, `src/services/mealService.js`, `backend/routes/meals.routes.js`, `backend/prompts/foodAnalysis.prompt.js`, `backend/normalizers/foodAnalysis.normalizer.js`, `backend/config/multer.js`, `backend/utils/aiUsage.js`, `supabase/migrations/001_rls_security_audit.sql`, `supabase/migrations/017_meal_analyses_language.sql`.
