# Registro de cambios del banco de memoria

Este archivo registra cambios funcionales y decisiones relevantes del proyecto. No sustituye el historial de Git; añade contexto comprensible para desarrolladores y asistentes de IA.

## Formato

```md
## AAAA-MM-DD — Nombre del cambio

- **Área:** frontend | backend | base de datos | móvil | documentación
- **Objetivo:** problema que se quería resolver.
- **Cambios:** resumen de lo realizado.
- **Archivos principales:** rutas modificadas.
- **Pruebas automáticas:** comandos ejecutados y resultado.
- **Prueba humana:** flujo comprobado y resultado.
- **Pendientes:** limitaciones o trabajo futuro.
- **Autor:** nombre o usuario.
```

---

## 2026-07-20 — Ajuste de inicio de sesión con Apple

- **Área:** frontend
- **Objetivo:** completar la integración inicial de Sign in with Apple sin cambiar la arquitectura de autenticación basada en Supabase.
- **Cambios:** se conectó el botón Apple en login con las dependencias reales, se corrigió el client ID a `com.nutrismartcoach.nutrismart`, se añadió OAuth web de Supabase, se usa nonce/state dinámico para iOS nativo y se preparan consentimiento/referral antes de iniciar el flujo Apple en registro.
- **Archivos principales:** `src/components/Home/AppleSignInButton.jsx`, `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/i18n/es.json`, `src/i18n/en.json`.
- **Pruebas automáticas:** JSON i18n correcto con `node`; `npx eslint src/components/Home/AppleSignInButton.jsx src/pages/Login.jsx src/pages/Register.jsx` correcto; `npm run build` correcto tras ejecutar `npm install` para instalar la dependencia ya declarada `@capacitor-community/apple-sign-in`; `npm run test -- src/services/referralOnboardingService.test.js src/services/creatorTrackingService.test.js` falla por el mock hoisted existente en `src/services/creatorTrackingService.test.js`, mientras `src/services/referralOnboardingService.test.js` pasa con 12 tests.
- **Prueba humana:** pendiente; validar login/registro Apple en web con provider Supabase configurado y en iOS cuando exista proyecto iOS/capability.
- **Pendientes:** confirmar configuración externa en Supabase Auth y Apple Developer.
- **Autor:** Codex

## 2026-07-18 — Documentación de funcionalidades y módulos

- **Área:** documentación
- **Objetivo:** documentar las funcionalidades y módulos técnicos actuales de NutriSmart Coach dentro del banco de memoria para guiar cambios futuros con contexto verificable.
- **Cambios:** se añadieron índices y documentos en `memory-bank/features/` y `memory-bank/modules/`; se actualizó `memory-bank/README.md` y `AGENTS.md` para exigir su lectura antes de cambios funcionales o técnicos. La revisión posterior corrigió tildes, aclaró frases ambiguas y precisó que `vercel.json` confirma el despliegue/configuración del frontend, mientras que el alojamiento real del backend queda pendiente de verificar en el repositorio.
- **Archivos principales:** `memory-bank/features/*.md`, `memory-bank/modules/*.md`, `memory-bank/README.md`, `AGENTS.md` y `memory-bank/change-log.md`.
- **Pruebas automáticas:** `git diff --check` falla en el diff local completo por cambios previos fuera de alcance; el diff documental acotado a `AGENTS.md`, `memory-bank/README.md`, `memory-bank/change-log.md`, `memory-bank/features/` y `memory-bank/modules/` pasa correctamente. `npm run lint` correcto. `npm run build` correcto con warnings existentes de Vite/Rolldown. `npm run test` falla: 15 archivos fallidos, 57 tests fallidos y 36 errores, principalmente `listen EPERM 0.0.0.0` en tests Supertest, mock hoisted en `src/services/creatorTrackingService.test.js`, aserciones de `backend/tests/mobilePremiumService.test.js` y fallos existentes en componentes. En la revisión de pulido se ejecutaron de nuevo `git diff --check -- AGENTS.md memory-bank` correcto, `npm run lint` correcto y `npm run build` correcto con los mismos warnings existentes.
- **Prueba humana:** revisar enlaces relativos y confirmar que rutas, endpoints, tablas, buckets y archivos mencionados existen en el repositorio.
- **Pendientes:** mantener estos documentos sincronizados cuando cambien funcionalidades, módulos, APIs o esquema de datos.
- **Autor:** Codex

## 2026-07-18 — Reglas de contexto para asistentes

- **Área:** documentación
- **Objetivo:** incorporar reglas operativas para Cursor y Codex que protejan la estabilidad de producción y obliguen a verificar el código real antes de proponer cambios.
- **Cambios:** se creó `.cursor/rules/` con reglas por área y se añadió `AGENTS.md` en la raíz con instrucciones de trabajo para Codex.
- **Archivos principales:** `.cursor/rules/*.mdc`, `AGENTS.md` y `memory-bank/change-log.md`.
- **Pruebas automáticas:** `npm run lint` correcto; `npm run build` correcto; `npm run test` falla en el entorno local con `listen EPERM 0.0.0.0` en tests de Supertest y fallos existentes de mocks/componentes no relacionados con esta documentación.
- **Prueba humana:** revisar que las reglas tienen frontmatter válido, ejemplos correctos e incorrectos, y no documentan patrones inexistentes.
- **Pendientes:** mantener estas reglas sincronizadas cuando cambien arquitectura, rutas, datos, IA, móvil o despliegue.
- **Autor:** Codex

## 2026-07-18 — Creación del banco de memoria de IA

- **Área:** documentación
- **Objetivo:** conservar el contexto técnico y funcional de NutriSmart Coach para trabajar de forma consistente con asistentes de IA.
- **Cambios:** se añadieron la descripción de la aplicación, las decisiones de arquitectura, una plantilla para planes de implementación y este registro de cambios.
- **Archivos principales:** `memory-bank/app-description.md`, `memory-bank/architecture-decisions/stack-and-rules.md` y `memory-bank/implementation-plans/template.md` y `memory-bank/change-log.md`.
- **Pruebas automáticas:** no aplica; solo se añadieron archivos Markdown.
- **Prueba humana:** verificar que los documentos se muestran correctamente en GitHub y que sus enlaces y rutas son legibles.
- **Pendientes:** crear un plan específico antes de iniciar la próxima funcionalidad.
- **Autor:** Alexis Rodríguez
