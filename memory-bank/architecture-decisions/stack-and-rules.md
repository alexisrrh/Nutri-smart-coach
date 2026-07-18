# Decisiones de arquitectura y reglas de trabajo

## ADR-001: Frontend con React y Vite

**Estado:** Aceptada

El frontend se mantiene en React con Vite. No se debe migrar a otro framework ni introducir una segunda aplicación frontend para resolver una función aislada.

## ADR-002: Estilos con Tailwind CSS

**Estado:** Aceptada

Los nuevos componentes deben reutilizar las clases, patrones visuales y componentes existentes. Se debe evitar introducir otra librería de estilos salvo que exista una necesidad clara y documentada.

## ADR-003: Autenticación y datos con Supabase

**Estado:** Aceptada

Supabase es la fuente de autenticación y persistencia. Las operaciones privadas del backend deben validar el token Bearer y obtener la identidad real del usuario autenticado. No se debe confiar únicamente en un `userId` enviado desde el cliente.

## ADR-004: Backend con Node.js y Express

**Estado:** Aceptada

La API se mantiene en Node.js y Express. Los endpoints deben reutilizar middleware, validaciones y servicios existentes antes de crear implementaciones paralelas.

## ADR-005: IA con Gemini

**Estado:** Aceptada

Gemini se utiliza para análisis de alimentos y generación de planes. Toda respuesta de IA debe considerarse no determinista y debe validarse antes de almacenarse o mostrarse como dato fiable.

## ADR-006: Aplicación móvil con Capacitor

**Estado:** Aceptada

La aplicación Android reutiliza la compilación web mediante Capacitor. Los cambios visuales deben comprobarse en navegador móvil y, cuando afecten navegación, carga de archivos o zonas seguras, también en Android.

## Reglas para asistentes de IA

1. Leer `memory-bank/app-description.md` antes de proponer cambios.
2. Leer el plan activo dentro de `memory-bank/implementation-plans/`.
3. Inspeccionar los archivos reales relacionados antes de escribir código.
4. No inventar rutas, tablas, columnas, variables de entorno ni endpoints.
5. No reemplazar archivos completos cuando baste un cambio localizado.
6. Mantener compatibilidad con la estructura y convenciones actuales.
7. Indicar qué archivos se modifican y por qué.
8. Añadir o actualizar pruebas cuando la lógica sea comprobable automáticamente.
9. Incluir una prueba humana concreta para cada paso.
10. Actualizar `memory-bank/change-log.md` al completar una tarea.

## Criterios de finalización

Un cambio se considera terminado cuando:

- La aplicación compila sin errores.
- Las pruebas relacionadas pasan.
- No aparecen errores nuevos en la consola.
- El flujo principal se ha comprobado manualmente.
- Los estados de carga, error y ausencia de datos están contemplados.
- No se han expuesto secretos o datos de otros usuarios.
- El registro de cambios está actualizado.
