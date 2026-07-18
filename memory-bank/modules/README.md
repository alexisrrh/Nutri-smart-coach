# Modulos tecnicos

Este directorio resume las areas tecnicas transversales del repositorio. Consultalo antes de cambios que afecten infraestructura, arquitectura, datos, IA, seguridad, pruebas, build, movil o despliegue.

## Indice

- `frontend.md`: React, rutas, servicios, hooks, cache y convenciones SPA.
- `backend.md`: Express, rutas, middleware, servicios y arranque.
- `supabase.md`: cliente, service role, tablas, migraciones, RLS y buckets.
- `ai.md`: Gemini, prompts, normalizadores, limites y fallbacks.
- `testing.md`: Vitest, ESLint, scripts y cobertura actual.
- `capacitor-android.md`: configuracion Capacitor y Android.
- `deployment.md`: Vite build, backend Node y Vercel.
- `observability-security.md`: logs, errores, CORS, auth, rate limiting y datos sensibles.

## Uso

- Para cambios de funcionalidad, empieza en `../features/`.
- Para cambios tecnicos compartidos, lee el modulo correspondiente y despues inspecciona los archivos reales.
- No documentes capacidades futuras como existentes si no aparecen en codigo, migraciones o configuracion.
