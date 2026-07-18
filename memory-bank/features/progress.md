# Progress

## 1. Proposito
Registrar progreso corporal, resumir actividad del usuario y calcular indicadores de gamificacion a partir de comidas, check-ins, dietas y entrenos.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario entra en `/progress` o `/progreso`.
2. El frontend carga logs de progreso desde `progress_logs`.
3. Tambien carga comidas, check-ins, dietas y sesiones de entrenamiento para resumen.
4. El usuario puede crear un log con peso y nota.
5. El resumen calcula XP, nivel, rachas y logros en cliente.

## 4. Rutas frontend
`/progress`, `/progreso`, `/dashboard`, `/resumen`, `/progresohome`.

## 5. Frontend implicado
`src/pages/ProgressHub.jsx`, `src/pages/Progress.jsx`, `src/pages/Daily.jsx`, `src/hooks/progress/useProgressData.js`, `src/hooks/progress/useProgressSubmission.js`, `src/hooks/progress/useProgressDeletion.js`, `src/hooks/progress/useProgressStats.js`, `src/hooks/progress/useProgressSummary.js`, `src/services/progressService.js`, `src/services/gamificationService.js`, `src/config/gamification.js`.

## 6. Endpoints backend
No hay endpoints Express confirmados para `progress_logs`. El frontend usa Supabase directamente para logs y combina datos desde servicios existentes.

## 7. Middleware
No aplica a `progress_logs` porque se consultan desde cliente con Supabase Auth y RLS. Los datos relacionados de comidas/check-ins/dietas usan sus middleware propios.

## 8. Supabase confirmado
Tabla `progress_logs`: `id`, `user_id`, `peso`, `nota`, `created_at` confirmados por uso en `src/services/progressService.js` y auditoria RLS.

Tambien lee `meal_analyses`, `checkins`, `diet_plans` y `workout_sessions`.

## 9. IA
No usa Gemini directamente.

## 10. Limites free/premium
No hay limites free/premium confirmados para crear logs de progreso. La puntuacion XP confirmada incluye comida 10, entreno 15, check-in 20 y proteina 5.

## 11. Pruebas
No hay test dedicado de `progressService.js` confirmado. Pruebas relacionadas: `src/services/normalizers.test.js` y tests de servicios que alimentan el resumen.

## 12. Riesgos y dependencias
El resumen depende de varias fuentes y caches locales; cambios en claves de storage o forma de datos pueden producir metricas inconsistentes.

## 13. Invariantes
- Los logs deben pertenecer al usuario autenticado.
- El resumen debe tolerar fallos parciales de datos remotos usando caches existentes.
- No cambiar recompensas XP sin revisar `src/config/gamification.js`.

## 14. Pendientes
No se confirmo endpoint backend para borrar o editar `progress_logs`; verificar antes de documentarlo como API.

## 15. Archivos relevantes
`src/pages/ProgressHub.jsx`, `src/pages/Progress.jsx`, `src/hooks/progress/useProgressData.js`, `src/hooks/progress/useProgressSubmission.js`, `src/hooks/progress/useProgressDeletion.js`, `src/hooks/progress/useProgressStats.js`, `src/hooks/progress/useProgressSummary.js`, `src/services/progressService.js`, `src/services/gamificationService.js`, `src/config/gamification.js`, `supabase/migrations/001_rls_security_audit.sql`.
