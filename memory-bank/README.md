# Banco de memoria de IA

Esta carpeta conserva el contexto esencial de NutriSmart Coach para que desarrolladores y asistentes de IA trabajen con las mismas reglas, decisiones y objetivos.

## Orden de lectura recomendado

1. `app-description.md`
2. `architecture-decisions/stack-and-rules.md`
3. `features/README.md` y el documento de funcionalidad relacionado.
4. `modules/README.md` y el documento tecnico relacionado.
5. El plan activo dentro de `implementation-plans/`
6. `change-log.md`

## Indice de funcionalidades

- `features/authentication.md`: sesion Supabase, rutas protegidas y consentimiento legal.
- `features/ai-food-analysis.md`: analisis IA de comida con imagen/descripcion.
- `features/diets.md`: generacion de dietas, progreso y reescritura premium.
- `features/meals.md`: historial y borrado de comidas analizadas.
- `features/checkins.md`: check-ins corporales con imagen e IA.
- `features/progress.md`: logs de progreso, resumen y gamificacion.
- `features/routines.md`: rutinas, sesiones y enlaces compartidos.
- `features/premium.md`: Stripe, premium movil y limites ampliados.
- `features/referrals.md`: codigos de invitacion y recompensas.
- `features/creators.md`: programa de creadores, tracking y payouts.
- `features/profile-settings.md`: perfil, preferencias, tema, IA, legal y seguridad.

Consulta `features/` antes de tocar paginas, hooks, servicios o endpoints de una funcionalidad concreta.

## Indice de modulos

- `modules/frontend.md`: estructura React/Vite, rutas, servicios y convenciones.
- `modules/backend.md`: Express, middleware, rutas y servicios.
- `modules/supabase.md`: tablas, buckets, RLS y migraciones.
- `modules/ai.md`: Gemini, prompts, normalizadores y limites.
- `modules/testing.md`: Vitest, ESLint y cobertura actual.
- `modules/capacitor-android.md`: Capacitor y Android.
- `modules/deployment.md`: build, runtime y Vercel.
- `modules/observability-security.md`: logs, errores, CORS, auth y rate limiting.

Consulta `modules/` antes de cambiar infraestructura, arquitectura, seguridad, datos, pruebas, IA, movil o despliegue.

## Flujo de trabajo

1. Crear un nuevo plan copiando `implementation-plans/template.md`.
2. Completar el objetivo, alcance, archivos relacionados, riesgos y criterios de aceptación.
3. Pedir al asistente de IA que lea primero el banco de memoria y después los archivos reales implicados.
4. Implementar un paso pequeño cada vez.
5. Ejecutar pruebas automáticas y una prueba humana después de cada paso.
6. Actualizar `change-log.md` al finalizar.
7. Registrar una decisión nueva en `architecture-decisions/` cuando afecte permanentemente a la arquitectura.

## Prompt inicial recomendado

```text
Antes de modificar código, lee estos archivos:

- memory-bank/app-description.md
- memory-bank/architecture-decisions/stack-and-rules.md
- memory-bank/features/<funcionalidad>.md
- memory-bank/modules/<modulo>.md
- memory-bank/implementation-plans/<plan-activo>.md

Después inspecciona los archivos reales relacionados con la tarea. No inventes rutas, endpoints, tablas ni variables. Propón primero el cambio mínimo, indica los archivos que tocarás y define una prueba automática y una prueba humana.
```

## Regla principal

El banco de memoria orienta el trabajo, pero el código actual del repositorio es la fuente de verdad. Cuando la documentación y el código no coincidan, se debe investigar la diferencia y actualizar la documentación; nunca asumir cuál de los dos es correcto.
