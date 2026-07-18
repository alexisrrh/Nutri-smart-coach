# Instrucciones para Codex

NutriSmart Coach es una aplicación estable en producción. Trabaja con cambios mínimos, localizados y comprobables.

Antes de proponer o modificar:

1. Lee primero `memory-bank/`.
2. Lee las reglas aplicables en `.cursor/rules/*.mdc`.
3. Inspecciona el código real relacionado con la tarea.
4. Usa el código, las migraciones y la configuración existente como fuente principal de verdad.

Reglas de trabajo:

- Crea planes en `memory-bank/implementation-plans/` para cambios importantes usando la plantilla existente.
- Modifica únicamente archivos relacionados con la tarea.
- Ejecuta las pruebas, lint y build disponibles cuando sean razonables: `npm run lint`, `npm run test` y `npm run build`.
- No cambies arquitectura, diseño, APIs, esquemas, dependencias ni configuración de despliegue sin solicitud explícita.
- No inventes rutas, servicios, tablas, buckets, variables de entorno ni convenciones.
- Actualiza `memory-bank/change-log.md` cuando corresponda.
- Explica siempre qué archivos modificaste y cómo validar el resultado.
