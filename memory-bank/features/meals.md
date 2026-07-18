# Meals

## 1. Proposito
Mostrar, filtrar, sumar y borrar analisis de comidas guardados por usuario.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario analiza comida desde `/foto-comida`.
2. El historial se carga en `/comidas` con `GET /meal-analyses/:userId`.
3. Los hooks calculan totales y filtros locales.
4. El usuario puede borrar una comida concreta o todas sus comidas.
5. El backend elimina registros y, cuando corresponde, imagenes de `food-photos`.

## 4. Rutas frontend
`/comidas`, `/foto-comida`, `/resumen`, `/dashboard`.

## 5. Frontend implicado
`src/pages/Meals.jsx`, `src/hooks/meals/useMealsHistory.js`, `src/hooks/meals/useMealDeletion.js`, `src/hooks/meals/useMealFiltering.js`, `src/hooks/meals/useMealTotals.js`, `src/services/mealService.js`, `src/services/cacheService.js`, `src/config/storageKeys.js`.

## 6. Endpoints backend
- `GET /meal-analyses/:userId`
- `DELETE /meal-analyses/:mealId`
- `DELETE /meal-analyses/user/:userId`
- `POST /analyze-food` como origen de datos.

## 7. Middleware
`verifySupabaseUser` y validacion de mismo usuario. Los borrados validan pertenencia antes de eliminar.

## 8. Supabase confirmado
Tabla `meal_analyses` y bucket `food-photos`. Ver detalles de columnas en `ai-food-analysis.md`.

## 9. IA
No usa IA directamente salvo que el usuario inicie un nuevo analisis; ver `ai-food-analysis.md`.

## 10. Limites free/premium
Los limites aplican al analisis, no al historial: free 3/dia y premium 20/dia.

## 11. Pruebas
`backend/tests/meals.analyzeFoodLanguage.test.js`, `backend/tests/files.test.js`, `src/services/normalizers.test.js`.

## 12. Riesgos y dependencias
Los borrados deben mantener sincronizados Supabase DB, Storage y cache local. Cambiar forma de respuesta rompe hooks de totales/filtros.

## 13. Invariantes
- Un usuario solo puede listar o borrar sus propias comidas.
- El borrado de imagenes no debe bloquear indebidamente el borrado del registro si la ruta no existe.
- Los datos cacheados no deben sustituir la fuente remota cuando hay red disponible.

## 14. Pendientes
No se confirmo una tabla separada de comidas manuales; el historial documentado procede de `meal_analyses`.

## 15. Archivos relevantes
`src/pages/Meals.jsx`, `src/hooks/meals/useMealsHistory.js`, `src/hooks/meals/useMealDeletion.js`, `src/hooks/meals/useMealFiltering.js`, `src/hooks/meals/useMealTotals.js`, `src/services/mealService.js`, `backend/routes/meals.routes.js`.
