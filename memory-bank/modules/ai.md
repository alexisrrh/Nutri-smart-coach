# AI

## 1. Responsabilidad
Integrar Gemini para analisis de comida, generacion de dietas, reescritura de comidas y check-ins corporales.

## 2. Estructura real
- `backend/config/gemini.js`: cliente `GoogleGenAI`.
- `backend/prompts/`: prompts de comida, dieta y check-in.
- `backend/normalizers/`: normalizacion de respuestas IA.
- `backend/utils/aiUsage.js`: limites, conteos, premium y cooldown.
- `backend/routes/meals.routes.js`, `diets.routes.js`, `checkins.routes.js`, `aiUsage.routes.js`.

## 3. Flujo de datos
La ruta valida usuario y limite, registra intento/uso, llama `gemini-2.5-flash`, limpia JSON con utilidades, normaliza shape y persiste en Supabase.

## 4. Puntos de entrada
`POST /analyze-food`, `POST /generate-diet`, `POST /diet-plans/:dietPlanId/rewrite-meal`, `POST /checkins`, `GET /ai-usage/:userId`.

## 5. Dependencias principales
`@google/genai`, Supabase, prompts/normalizadores locales, Multer para imagenes.

## 6. Convenciones existentes
- Modelo confirmado: `gemini-2.5-flash`.
- Temperaturas bajas para estabilidad.
- JSON generado siempre pasa por limpieza y normalizador.
- Fallback para dieta/check-in cuando Gemini falta o falla segun ruta.

## 7. Integraciones externas
Google Gemini API, Supabase DB/Storage.

## 8. Variables de entorno
`GEMINI_API_KEY`.

## 9. Comandos confirmados
`npm run test`, `npm run lint`, `npm run build`.

## 10. Riesgos de produccion
Cambiar prompt o normalizador puede romper UI y datos historicos. Saltar limites de IA incrementa coste. Imprimir prompts/imagenes/datos personales en logs es riesgo de privacidad.

## 11. Archivos a revisar antes de modificar
`backend/routes/meals.routes.js`, `backend/routes/diets.routes.js`, `backend/routes/checkins.routes.js`, `backend/prompts/*.prompt.js`, `backend/normalizers/*.normalizer.js`, `backend/utils/aiUsage.js`, `src/services/aiUsageService.js`.

## Limites confirmados
- `food_analysis`: free 3/dia, premium 20/dia.
- `diet_generation`: free 1/semana, premium 5/dia.
- `checkin_analysis`: free 1/semana, premium 1/dia.
