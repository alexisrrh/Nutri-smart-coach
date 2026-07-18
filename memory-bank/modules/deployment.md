# Deployment

## 1. Responsabilidad
Construir el frontend Vite y documentar cómo se arranca el backend Node/Express sin asumir un proveedor de alojamiento no confirmado.

## 2. Estructura real
- `package.json`: scripts de frontend/build/test/lint y dependencias raíz.
- `backend/package.json`: scripts de backend.
- `vercel.json`: configuración de despliegue del frontend confirmada en repositorio.
- `vite.config.js`: build Vite con React y Tailwind.
- `backend/server.js`: arranca Express con `process.env.PORT || 3000`.

## 3. Flujo de datos
Frontend usa `VITE_API_URL` en producción y `VITE_API_URL_DEV` o fallback local en desarrollo. Backend permite orígenes configurados por CORS y responde `/health` para estado básico. El alojamiento real del backend es externo/no confirmado en el repositorio.

## 4. Puntos de entrada
`npm run build`, `backend/server.js`, `backend/app.js`, `vercel.json`.

## 5. Dependencias principales
Vite, React plugin, Tailwind Vite plugin, Node/Express y configuración frontend en Vercel.

## 6. Convenciones existentes
No cambiar configuración de despliegue sin solicitud. `backend/server.js` está preparado para cualquier runtime Node que proporcione `PORT`; si el runtime no define `PORT`, usa `3000`.

## 7. Integraciones externas
Supabase, Gemini, Stripe, dominios permitidos de CORS y clientes Capacitor.

## 8. Variables de entorno
Frontend: `VITE_API_URL`, `VITE_API_URL_DEV`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

Backend: ver `backend.md`.

## 9. Comandos confirmados
`npm run build`, `npm run preview`, `npm run dev`, `npm run lint`, `npm run test`; backend: `npm run start`, `npm run dev`.

## 10. Riesgos de producción
Cambios en `vercel.json`, CORS o URLs de API pueden dejar el frontend sin conexión al backend. Build produce `dist`, usado también por Capacitor. El proveedor de alojamiento backend debe verificarse fuera del repositorio antes de documentarlo o modificarlo.

## 11. Archivos a revisar antes de modificar
`package.json`, `backend/package.json`, `vite.config.js`, `vercel.json`, `backend/server.js`, `backend/config/cors.js`, `capacitor.config.ts`.
