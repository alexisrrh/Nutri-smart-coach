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
- **Archivos principales:** `memory-bank/app-description.md`, `memory-bank/architecture-decisions/stack-and-rules.md`, `memory-bank/implementation-plans/template.md` y `memory-bank/change-log.md`.
- **Pruebas automáticas:** no aplica; solo se añadieron archivos Markdown.
- **Prueba humana:** verificar que los documentos se muestran correctamente en GitHub y que sus enlaces y rutas son legibles.
- **Pendientes:** crear un plan específico antes de iniciar la próxima funcionalidad.
- **Autor:** Alexis Rodríguez
