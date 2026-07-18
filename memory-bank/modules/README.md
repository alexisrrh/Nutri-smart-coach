# Módulos técnicos

Este directorio resume las áreas técnicas transversales del repositorio. Consúltalo antes de cambios que afecten infraestructura, arquitectura, datos, IA, seguridad, pruebas, build, móvil o despliegue.

## Índice

- `frontend.md`: React, rutas, servicios, hooks, cache y convenciones SPA.
- `backend.md`: Express, rutas, middleware, servicios y arranque.
- `supabase.md`: cliente, service role, tablas, migraciones, RLS y buckets.
- `ai.md`: Gemini, prompts, normalizadores, límites y fallbacks.
- `testing.md`: Vitest, ESLint, scripts y cobertura actual.
- `capacitor-android.md`: configuración Capacitor y Android.
- `deployment.md`: Vite build, backend Node y Vercel.
- `observability-security.md`: logs, errores, CORS, auth, rate limiting y datos sensibles.

## Uso

- Para cambios de funcionalidad, empieza en `../features/`.
- Para cambios técnicos compartidos, lee el módulo correspondiente y después inspecciona los archivos reales.
- No documentes capacidades futuras como existentes si no aparecen en código, migraciones o configuración.
