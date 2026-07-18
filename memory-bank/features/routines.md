# Routines

## 1. Proposito
Crear rutinas personalizadas, registrar sesiones de entrenamiento, consultar biblioteca de ejercicios y compartir rutinas o semanas mediante enlaces publicos.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario abre `/rutinas` para listar rutinas.
2. Crea o edita en `/crear-rutina` o `/editar-rutina/:id`.
3. Lanza entrenamientos y guarda sesiones en `workout_sessions`.
4. Puede compartir una rutina con `/rutina/:shareId` o una semana con `/rutinas/semana/:shareId`.
5. Los enlaces publicos permiten guardar rutinas compartidas para el usuario autenticado.

## 4. Rutas frontend
`/rutinas`, `/crear-rutina`, `/editar-rutina/:id`, `/ejercicios`, `/rutina/:shareId`, `/rutinas/semana/:shareId`, `/dashboard`, `/progress`.

## 5. Frontend implicado
`src/pages/WorkoutRoutines.jsx`, `src/pages/CreateRoutine.jsx`, `src/pages/SharedRoutine.jsx`, `src/pages/ExercisesLibrary.jsx`, `src/hooks/workouts/*.js`, `src/services/customWorkoutService.js`, `src/services/workoutSessionService.js`, `src/services/workoutPlannerService.js`, `src/services/strengthProgressService.js`, `src/services/exerciseMediaService.js`, `src/services/exercisePreloadService.js`.

## 6. Endpoints backend
No hay endpoints Express confirmados para rutinas. El frontend usa Supabase directamente y almacenamiento local de respaldo para sesiones.

## 7. Middleware
No aplica en Express. La proteccion depende de Supabase Auth/RLS para tablas privadas; las rutas compartidas son publicas por `share_id`.

## 8. Supabase confirmado
Tablas: `custom_workout_routines`, `custom_workout_routine_week_shares`, `workout_sessions`.

Campos confirmados por servicios: `id`, `user_id`, `name`, `description`, `goal`, `level`, `days`, `routine`, `routines`, `is_public`, `share_id`, `is_active`, `created_at`, `updated_at`, `completed_at`, `duration`, `calories`, `routine_id`, `routine_name`, `completed_exercises`, `muscles`, `records`, `volume`, `best_exercise`.

## 9. IA
No usa Gemini directamente.

## 10. Limites free/premium
No hay limites free/premium confirmados para crear rutinas o sesiones.

## 11. Pruebas
No hay tests dedicados de rutinas confirmados.

## 12. Riesgos y dependencias
Compartir depende de `share_id` publico. Las sesiones usan cache local como fallback, por lo que cambios de sincronizacion pueden duplicar o perder historial percibido.

## 13. Invariantes
- El borrado de rutina personalizado es soft delete con `is_active=false`.
- Las rutas publicas por `share_id` no deben exponer rutinas no publicas.
- No romper compatibilidad de rutinas semanales compartidas.

## 14. Pendientes
La definicion SQL completa de algunas tablas de rutinas no aparece como `create table` en migraciones actuales; su existencia se confirma por auditoria RLS y uso del frontend.

## 15. Archivos relevantes
`src/pages/WorkoutRoutines.jsx`, `src/pages/CreateRoutine.jsx`, `src/pages/SharedRoutine.jsx`, `src/pages/ExercisesLibrary.jsx`, `src/hooks/workouts/useWorkoutConfig.js`, `src/hooks/workouts/useWorkoutHistory.js`, `src/hooks/workouts/useWorkoutSessionLauncher.js`, `src/services/customWorkoutService.js`, `src/services/workoutSessionService.js`, `src/services/workoutPlannerService.js`, `src/services/strengthProgressService.js`, `supabase/migrations/001_rls_security_audit.sql`.
