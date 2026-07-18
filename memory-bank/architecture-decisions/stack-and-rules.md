# Decisiones de arquitectura y reglas de producción

## Contexto

NutriSmart Coach está en producción. La arquitectura existente es la referencia y la estrategia principal es **mantenimiento conservador**: cambios pequeños, localizados y comprobables.

## ADR-001: Frontend con React y Vite

**Estado:** aceptada y en producción.

El frontend se mantiene en React 19 con Vite 8. Las páginas usan carga diferida con `React.lazy` y `Suspense`. No migrar a Next.js, Vue, Angular u otro framework sin una decisión formal.

## ADR-002: Estilos con Tailwind CSS y variables del tema

**Estado:** aceptada y en producción.

Se deben reutilizar componentes, clases Tailwind y variables CSS existentes. No introducir otra librería visual ni realizar un rediseño general para resolver una incidencia aislada. Comprobar especialmente pantallas móviles pequeñas, safe areas y Android.

## ADR-003: Navegación con React Router

**Estado:** aceptada y en producción.

Las rutas públicas, privadas, legales, de creador y de rutinas compartidas están centralizadas en `src/App.jsx`. No renombrar ni eliminar rutas sin comprobar enlaces, navegación, analítica, referidos y compatibilidad con usuarios existentes.

## ADR-004: Autenticación y datos con Supabase

**Estado:** aceptada y en producción.

Supabase gestiona autenticación, perfiles, persistencia y almacenamiento. El backend debe verificar el token Bearer y obtener el usuario real mediante el middleware existente. Nunca confiar únicamente en un `user_id` enviado por el cliente. Toda consulta privada debe limitarse al usuario autenticado.

## ADR-005: Backend modular con Node.js y Express

**Estado:** aceptada y en producción.

La API usa Express 5 y separa rutas, middleware, normalizadores, prompts, servicios y utilidades. `backend/app.js` registra CORS, logging, limitadores, pagos, referidos, creadores, check-ins, uso de IA, dietas y comidas. No volver a concentrar la lógica en `server.js` ni crear rutas paralelas.

## ADR-006: IA con Gemini y respuestas de respaldo

**Estado:** aceptada y en producción.

Gemini se utiliza para análisis de comida, dietas y check-ins. Las respuestas deben normalizarse y validarse antes de guardarse. Los fallbacks existentes son parte de la estabilidad del producto y no deben eliminarse. La IA no debe presentar estimaciones como diagnósticos médicos.

## ADR-007: Límites, premium y monetización

**Estado:** aceptada y en producción.

El consumo de IA se controla por usuario y tipo de operación. El perfil de Supabase determina plan, estado de suscripción, fuente premium y vigencia. No modificar límites, reglas premium, pagos, referidos o creadores sin revisar conjuntamente frontend, backend y datos.

## ADR-008: Aplicación móvil con Capacitor

**Estado:** aceptada y en producción.

Android reutiliza la compilación web mediante Capacitor 8. Los cambios que afecten navegación, imágenes, permisos, teclado, scroll, safe areas o enlaces deben comprobarse en contexto móvil.

## ADR-009: Internacionalización

**Estado:** aceptada y en producción.

La aplicación usa i18next y react-i18next. No introducir textos nuevos visibles al usuario directamente en componentes cuando exista el sistema de traducciones. Mantener como mínimo español e inglés cuando el flujo ya sea bilingüe.

## Regla de cambio mínimo

Antes de editar código:

1. Reproducir o definir exactamente el problema.
2. Leer el banco de memoria.
3. Inspeccionar los archivos reales implicados.
4. Localizar el componente, servicio o middleware existente que ya gestiona el flujo.
5. Proponer el cambio mínimo.
6. Identificar riesgos de producción y una forma de revertirlo.
7. Ejecutar pruebas y una comprobación humana concreta.

## Prohibiciones para asistentes de IA

- No inventar rutas, endpoints, tablas, columnas, buckets ni variables de entorno.
- No modificar archivos ajenos a la tarea para “mejorar” el código.
- No reescribir componentes completos cuando baste un parche localizado.
- No cambiar contratos de API sin revisar consumidores.
- No eliminar fallbacks, validaciones, autenticación, rate limits o controles de propiedad.
- No cambiar el diseño general sin aprobación explícita.
- No añadir dependencias sin justificar necesidad, peso, seguridad y mantenimiento.
- No usar datos médicos categóricos a partir de estimaciones visuales de IA.

## Criterios de finalización

Un cambio de producción se considera terminado cuando:

- `npm run build` finaliza correctamente.
- Las pruebas relacionadas pasan con `npm run test` cuando corresponda.
- El backend inicia y `/health` responde correctamente cuando se modifica la API.
- No aparecen errores nuevos en consola o registros.
- Se verifica el flujo principal y al menos un estado de error.
- Se comprueba móvil cuando el cambio visual o de navegación lo requiera.
- Se mantiene aislamiento de datos entre usuarios.
- Existe una estrategia clara de reversión.
- `memory-bank/change-log.md` se actualiza si el cambio es funcional o arquitectónico.