# Mapa funcional y técnico

**Revisión:** 2026-07-18

## Frontend

### Entrada y navegación

- `src/App.jsx` concentra las rutas principales.
- Se usa `BrowserRouter` y carga diferida con `lazy` + `Suspense`.
- `ProtectedRoute` bloquea páginas privadas cuando no existe usuario autenticado.
- El usuario autenticado es redirigido desde entradas públicas hacia `/dashboard`.
- Los enlaces con código de creador se registran y conducen al registro o a Premium según el estado de sesión.

### Rutas públicas principales

- `/`
- `/login`
- `/register`
- `/registro`
- `/join` → redirección a registro
- `/reset-password`
- `/privacy`
- `/terms`
- `/creator-terms`
- `/delete-account`
- `/rutina/:shareId`
- `/rutinas/semana/:shareId`
- Páginas promocionales `/bodyscannerhome`, `/progresohome` y `/dietahome`

### Rutas privadas principales

- `/dashboard`
- `/premium`
- `/foto-comida`
- `/resumen`
- `/checkin`
- `/perfil`
- `/calculadora`
- `/plan-comidas`
- `/progress`
- `/progreso`
- `/comidas`
- `/rutinas`
- `/crear-rutina`
- `/editar-rutina/:id`
- `/ejercicios`
- `/creator-panel` y `/creadores`
- `/settings/profile`
- `/settings/theme`
- `/settings/ai`
- `/settings/legal`
- `/settings/security`

## Backend

### Arranque y composición

- `backend/server.js` inicia el servidor.
- `backend/app.js` compone middleware y módulos de rutas.
- Puerto predeterminado: `3000`, salvo que `PORT` esté configurado.
- Endpoints de estado: `/` y `/health`.

### Middleware global confirmado

- Registro de solicitudes.
- CORS con configuración centralizada.
- `trust proxy` para despliegue detrás de proxy.
- Rate limiter global.
- Límite JSON de 10 MB.
- Manejador central de errores.

### Módulos de rutas

- Check-ins corporales.
- Uso y límites de IA.
- Dietas y reescritura de comidas.
- Comidas analizadas e historial.
- Creadores.
- Pagos y estado premium.
- Referidos.

### Endpoints confirmados durante la revisión

- `POST /checkins`
- `GET /checkins/:userId`
- `DELETE /checkins/:checkinId`
- `GET /ai-usage/:userId`
- `POST /generate-diet`
- `GET /diet-plans/:userId`
- `POST /diet-plans/:dietPlanId/rewrite-meal`
- `GET /health`

Los demás endpoints deben consultarse directamente en `backend/routes/` antes de hacer cambios. No se deben deducir solo por el nombre del archivo.

## IA y límites

- Modelo observado en generación de dietas y análisis de check-in: `gemini-2.5-flash`.
- Los endpoints de IA validan usuario, límite de uso y cooldown.
- El plan y estado premium se consultan desde `profiles`.
- La API devuelve información de consumo, límite, restante y fecha de reinicio.
- Existen respuestas fallback para mantener el flujo cuando Gemini no está disponible.

## Persistencia confirmada

Tablas observadas en el código revisado:

- `profiles`
- `checkins`
- `diet_plans`

También existen módulos de comidas, creadores, pagos y referidos, pero sus tablas y contratos deben verificarse en sus rutas y migraciones antes de modificarlos.

Bucket confirmado:

- `checkins`

## Reglas para trabajar con este mapa

1. Este archivo orienta; no sustituye la lectura del archivo real.
2. Antes de cambiar una ruta, buscar sus consumidores en frontend y backend.
3. Antes de cambiar datos, revisar migraciones y políticas de Supabase.
4. Antes de cambiar Premium, revisar pagos, perfil, límites de IA y referidos.
5. Antes de cambiar navegación, probar usuario sin sesión, usuario autenticado y enlace de creador.
6. No asumir que una ruta promocional y una ruta privada comparten el mismo flujo.