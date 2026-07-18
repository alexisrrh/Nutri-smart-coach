# Testing

## 1. Responsabilidad
Validar frontend y backend con Vitest, React Testing Library y ESLint.

## 2. Estructura real
- `src/**/*.test.js`, `src/**/*.test.jsx`: servicios/componentes frontend.
- `backend/tests/*.test.js`: rutas, servicios y utilidades backend.
- `eslint.config.js`: ESLint flat config para `src` y `backend`.
- `vite.config.js`: plugins React/Tailwind.

## 3. Flujo de datos
Las pruebas importan módulos reales y usan mocks locales de Supabase, fetch, rutas o servicios según el caso. Backend prueba rutas Express con Supertest donde aplica.

## 4. Puntos de entrada
`npm run test`, `npm run lint`, `npm run build`.

## 5. Dependencias principales
Vitest, Testing Library, jsdom, ESLint, Supertest.

## 6. Convenciones existentes
- Tests junto a servicios/páginas en frontend.
- Tests backend centralizados en `backend/tests/`.
- No hay script separado para backend; `vitest run` cubre todo desde raíz.

## 7. Integraciones externas
Las integraciones externas se mockean en tests relevantes; no depender de credenciales reales para pruebas unitarias.

## 8. Variables de entorno
Las pruebas pueden necesitar nombres de variables de Supabase/API/Stripe/Gemini, pero no deben requerir valores reales.

## 9. Comandos confirmados
`npm run lint`, `npm run test`, `npm run build`.

## 10. Riesgos de producción
Un cambio documental no debe tocar tests. Para cambios de código, no aceptar fallos nuevos; si un fallo es previo, documentar archivo, test y error.

## 11. Archivos a revisar antes de modificar
`package.json`, `eslint.config.js`, `vite.config.js`, tests del dominio afectado y reglas en `.cursor/rules/testing.mdc`.
