# Deployment

## 1. Responsabilidad
Construir frontend Vite y exponer backend Node/Express en produccion.

## 2. Estructura real
- `package.json`: scripts de frontend/build/test/lint y dependencias raiz.
- `backend/package.json`: scripts de backend.
- `vercel.json`: configuracion de despliegue confirmada en repositorio.
- `vite.config.js`: build Vite con React y Tailwind.
- `backend/server.js`: escucha `PORT`.

## 3. Flujo de datos
Frontend usa `VITE_API_URL` en produccion y `VITE_API_URL_DEV` o fallback local en desarrollo. Backend permite origenes configurados por CORS y responde `/health` para estado basico.

## 4. Puntos de entrada
`npm run build`, `backend/server.js`, `backend/app.js`, `vercel.json`.

## 5. Dependencias principales
Vite, React plugin, Tailwind Vite plugin, Node/Express, Vercel config.

## 6. Convenciones existentes
No cambiar configuracion de despliegue sin solicitud. El backend usa `process.env.PORT || 3000`.

## 7. Integraciones externas
Supabase, Gemini, Stripe, dominios permitidos de CORS y clientes Capacitor.

## 8. Variables de entorno
Frontend: `VITE_API_URL`, `VITE_API_URL_DEV`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

Backend: ver `backend.md`.

## 9. Comandos confirmados
`npm run build`, `npm run preview`, `npm run dev`, `npm run lint`, `npm run test`; backend: `npm run start`, `npm run dev`.

## 10. Riesgos de produccion
Cambios en `vercel.json`, CORS o URLs de API pueden dejar la app sin backend. Build produce `dist`, usado tambien por Capacitor.

## 11. Archivos a revisar antes de modificar
`package.json`, `backend/package.json`, `vite.config.js`, `vercel.json`, `backend/server.js`, `backend/config/cors.js`, `capacitor.config.ts`.
