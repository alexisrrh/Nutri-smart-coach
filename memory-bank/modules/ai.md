# AI

## 1. Responsabilidad
Integrar Gemini para análisis de comida, generación de dietas, reescritura de comidas y check-ins corporales.

## 2. Estructura real
- `backend/config/gemini.js`: cliente `GoogleGenAI`.
- `backend/prompts/`: prompts de comida, dieta y check-in.
- `backend/normalizers/`: normalización de respuestas IA.
- `backend/utils/aiUsage.js`: límites, conteos, premium y cooldown.
- `backend/routes/meals.routes.js`, `diets.routes.js`, `checkins.routes.js`, `aiUsage.routes.js`.

## 3. Flujo de datos
La ruta valida usuario y límite, registra intento/uso, llama `gemini-2.5-flash`, limpia JSON con utilidades, normaliza shape y persiste en Supabase.

## 4. Puntos de entrada
`POST /analyze-food`, `POST /generate-diet`, `POST /diet-plans/:dietPlanId/rewrite-meal`, `POST /checkins`, `GET /ai-usage/:userId`.

## 5. Dependencias principales
`@google/genai`, Supabase, prompts/normalizadores locales, Multer para imágenes.

## 6. Convenciones existentes
- Modelo confirmado: `gemini-2.5-flash`.
- Temperaturas bajas para estabilidad.
- JSON generado siempre pasa por limpieza y normalizador.
- Fallback para dieta/check-in cuando Gemini falta o falla según ruta.

## 7. Integraciones externas
Google Gemini API, Supabase DB/Storage.

## 8. Variables de entorno
`GEMINI_API_KEY`.

## 9. Comandos confirmados
`npm run test`, `npm run lint`, `npm run build`.

## 10. Riesgos de producción
Cambiar prompt o normalizador puede romper UI y datos históricos. Saltar límites de IA incrementa coste. Imprimir prompts/imágenes/datos personales en logs es riesgo de privacidad.

## 11. Archivos a revisar antes de modificar
`backend/routes/meals.routes.js`, `backend/routes/diets.routes.js`, `backend/routes/checkins.routes.js`, `backend/prompts/*.prompt.js`, `backend/normalizers/*.normalizer.js`, `backend/utils/aiUsage.js`, `src/services/aiUsageService.js`.

## Límites confirmados
- `food_analysis`: free 3/día, premium 20/día.
- `diet_generation`: free 1/semana, premium 5/día.
- `checkin_analysis`: free 1/semana, premium 1/día.
