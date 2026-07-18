# Supabase

## 1. Responsabilidad
Autenticacion, base de datos Postgres, RLS y Storage para fotos de comida/check-ins.

## 2. Estructura real
- `src/lib/supabase.js`: cliente frontend con anon key.
- `backend/config/supabase.js`: cliente backend con service role.
- `supabase/migrations/*.sql`: migraciones versionadas.

## 3. Flujo de datos
El frontend usa anon key y sesion del usuario para Supabase directo en perfiles/progreso/rutinas. El backend usa service role despues de validar Bearer token para operaciones de IA, pagos, referrals y creators.

## 4. Puntos de entrada
`src/lib/supabase.js`, `backend/config/supabase.js`, `supabase/migrations/`.

## 5. Dependencias principales
`@supabase/supabase-js`, Supabase Auth, Postgres, Storage.

## 6. Convenciones existentes
- RLS habilitada para tablas sensibles.
- Politicas de usuario propietario en datos privados.
- Service role limitado a backend.
- Migraciones incrementales numeradas.

## 7. Integraciones externas
Frontend React, backend Express, Stripe/acquisitions, Gemini mediante tablas de uso.

## 8. Variables de entorno
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## 9. Comandos confirmados
No hay scripts Supabase en `package.json`. Validaciones disponibles: `npm run lint`, `npm run test`, `npm run build`.

## 10. Riesgos de produccion
Cambios en RLS, columnas premium, buckets o claves foraneas afectan seguridad y facturacion. No crear tablas/columnas nuevas sin migracion explicita y pruebas.

## 11. Archivos a revisar antes de modificar
`supabase/migrations/*.sql`, `src/lib/supabase.js`, `backend/config/supabase.js`, servicios frontend que consultan tablas directas y rutas backend del dominio.

## Tablas y buckets confirmados
Tablas: `profiles`, `meal_analyses`, `diet_plans`, `checkins`, `progress_logs`, `workout_sessions`, `custom_workout_routines`, `custom_workout_routine_week_shares`, `meal_logs`, `referral_codes`, `referrals`, `affiliate_commissions`, `subscription_acquisitions`, `referral_rewards`, `influencer_applications`, `creator_link_clicks`, `creator_payout_requests`.

Buckets: `food-photos`, `checkins`.
