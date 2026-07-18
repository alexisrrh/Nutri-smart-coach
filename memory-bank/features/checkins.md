# Check-ins

## 1. Proposito
Registrar fotos corporales con medidas opcionales, analizar evolucion visual con Gemini y consultar/borrar el historial.

## 2. Estado actual
Operativo.

## 3. Flujo de usuario
1. El usuario abre `/checkin`.
2. Sube una imagen y opcionalmente peso, cintura, pecho, cadera y notas.
3. El frontend envia `FormData` a `POST /checkins`.
4. El backend valida usuario, archivo y limite IA.
5. La imagen se sube al bucket `checkins`.
6. El backend compara con check-ins previos y guarda analisis.
7. El usuario consulta o borra registros desde la misma funcionalidad.

## 4. Rutas frontend
`/checkin`, `/progress`, `/progreso`, `/dashboard`, `/bodyscannerhome`.

## 5. Frontend implicado
`src/pages/CheckIn.jsx`, `src/hooks/checkin/useCheckInForm.js`, `src/hooks/checkin/useCheckInLoad.js`, `src/hooks/checkin/useCheckInSubmit.js`, `src/hooks/checkin/useCheckInUpload.js`, `src/services/checkinService.js`, `src/services/aiUsageService.js`, `src/hooks/useAiUsageStatus.js`.

## 6. Endpoints backend
- `POST /checkins`
- `GET /checkins/:userId`
- `DELETE /checkins/:checkinId`
- `GET /ai-usage/:userId`

## 7. Middleware
`verifySupabaseUser`, `uploadSingleImage("image")`, `checkinsRateLimiter` y comprobacion de mismo usuario.

## 8. Supabase confirmado
Tabla `checkins`: `id`, `user_id`, `image_url`, `weight`, `waist`, `chest`, `hips`, `notes`, `language`, `body_fat_range`, `confidence`, `visual_changes`, `recommendation`, `created_at`.

Bucket: `checkins`.

## 9. IA
`backend/routes/checkins.routes.js` usa Gemini si `GEMINI_API_KEY` existe, prompt en `backend/prompts/checkin.prompt.js` y normalizador `backend/normalizers/checkin.normalizer.js`. Si no hay Gemini, usa fallback.

## 10. Limites free/premium
Check-in IA: free 1/semana; premium 1/dia. Enfriamiento de 8 segundos antes de IA.

## 11. Pruebas
`backend/tests/checkins.language.test.js`, `backend/tests/files.test.js`, `backend/tests/aiUsageLimits.test.js`.

## 12. Riesgos y dependencias
Depende de Storage, Gemini y RLS. Cambios en campos de medidas afectan progreso y graficas.

## 13. Invariantes
- `POST /checkins` requiere imagen.
- No permitir acceso a check-ins de otro usuario.
- Mantener idioma normalizado `es`/`en`.

## 14. Pendientes
No hay endpoint confirmado para editar check-ins existentes.

## 15. Archivos relevantes
`src/pages/CheckIn.jsx`, `src/hooks/checkin/useCheckInForm.js`, `src/hooks/checkin/useCheckInLoad.js`, `src/hooks/checkin/useCheckInSubmit.js`, `src/hooks/checkin/useCheckInUpload.js`, `src/services/checkinService.js`, `backend/routes/checkins.routes.js`, `backend/prompts/checkin.prompt.js`, `backend/normalizers/checkin.normalizer.js`, `supabase/migrations/001_rls_security_audit.sql`, `supabase/migrations/018_checkins_language.sql`.
