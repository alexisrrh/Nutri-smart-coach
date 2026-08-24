# Estado actual del producto

**Última revisión documental:** 2026-08-24

## Estado general

NutriSmart Coach se considera un producto en producción y actualmente estable tras las correcciones de cámara y autenticación móvil de agosto de 2026. La prioridad no es rehacer frontend/backend ni realizar mantenimiento preventivo amplio, sino proteger la estabilidad, corregir fallos concretos y realizar mejoras pequeñas, aisladas y reversibles.

## Áreas operativas confirmadas

- Aplicación web con React y Vite.
- Aplicación Android basada en Capacitor.
- Aplicación iOS basada en Capacitor, cuya configuración nativa se considera estable y queda fuera del mantenimiento ordinario de este flujo.
- Autenticación y persistencia con Supabase.
- Backend Node.js + Express desplegable como API independiente.
- Análisis de comidas con Gemini.
- Generación de dietas personalizadas con Gemini y sistema de fallback.
- Check-ins corporales con imagen, almacenamiento en Supabase y análisis asistido por IA.
- Historial de comidas, dietas y check-ins.
- Biblioteca de ejercicios y creación/edición de rutinas.
- Rutinas compartidas mediante enlaces públicos.
- Seguimiento de progreso y resumen diario.
- Sistema premium, límites de uso de IA, pagos, referidos y panel de creadores.
- Internacionalización en español e inglés.
- Páginas legales, eliminación de cuenta y ajustes de seguridad, perfil, tema e IA.
- Google Analytics 4.

## Nivel actual de madurez

### Frontend

**Estado:** estable y cercano a cierre funcional.

El frontend dispone de rutas públicas, rutas protegidas, carga diferida por página, control de sesión, seguimiento de enlaces de creadores y una interfaz adaptada a móvil.

### Android

**Estado:** correcciones críticas validadas en dispositivo físico.

- El crash de cámara en release se corrigió preservando las anotaciones runtime de Capacitor mediante reglas R8/ProGuard.
- El flujo de escaneo se validó físicamente: apertura de cámara, permiso, captura y análisis correctos.
- Google Sign-In nativo se validó físicamente después de reconstruir el frontend con `VITE_GOOGLE_WEB_CLIENT_ID` presente en el entorno local de build.
- La versión Android preparada tras estas correcciones es `versionCode 26`, `versionName 1.2.5`.

### iOS

**Estado:** configuración nativa protegida.

- `ios/` NO debe modificarse durante mantenimiento normal.
- No ejecutar cambios, sync, CocoaPods, Info.plist, AppDelegate, entitlements ni configuración Xcode sin solicitud explícita y coordinación con el responsable de iOS.
- Google Sign-In en JS fue preparado para usar el plugin nativo exclusivamente cuando la plataforma es iOS; Apple Sign-In, email/password, Google Android y Google web permanecen separados.
- La validación final de Google Sign-In en iPhone depende de que la configuración nativa requerida ya esté preparada por el responsable de iOS.

### Backend

**Estado:** estable y modularizado.

La API está separada en rutas, middleware, servicios, normalizadores, prompts y utilidades. Incluye verificación del usuario de Supabase, rate limiting global y específico, CORS, registro de solicitudes, manejador central de errores y endpoint de salud.

### Inteligencia artificial

**Estado:** funcional con protecciones y fallback.

Gemini se utiliza para funciones concretas. Las respuestas se normalizan antes de persistirlas. Las dietas cuentan con fallback si Gemini falla o falta la clave. Los check-ins también tienen respuesta alternativa cuando no se puede usar IA.

### Seguridad y variables de entorno

**Estado:** endurecido; no debe relajarse.

- Token Bearer de Supabase en endpoints privados.
- Comparación del usuario autenticado con el recurso solicitado.
- Rate limiting y límites persistentes de uso de IA.
- CORS controlado.
- Límites de tamaño en JSON e imágenes.
- Separación de claves y variables de entorno.
- Los archivos locales de entorno y sus valores reales NO deben subirse a GitHub.
- No hacer `git add` de `.env`, `.env.local`, `backend/.env`, `backend/.env.local` ni variantes equivalentes.
- Los archivos `.env.example` pueden documentar nombres de variables, pero nunca valores secretos reales.
- `VITE_GOOGLE_WEB_CLIENT_ID` es necesario durante `npm run build` para Google Sign-In móvil. Debe proporcionarse desde el entorno local/CI correspondiente sin versionar el archivo que contiene el valor.
- No imprimir, copiar a documentación ni registrar secretos, Client Secrets, service-role keys o API keys.
- No modificar variables de entorno existentes durante mantenimiento ordinario salvo solicitud explícita y necesidad diagnosticada.

## Política de cambios en producción

A partir de este estado:

1. Corregir bugs de uno en uno con cambios mínimos y aislados.
2. Antes de editar, identificar causa, archivo y alcance; validar el cambio antes de avanzar.
3. No realizar refactors, limpiezas, actualizaciones de dependencias o cambios colaterales sin una necesidad concreta.
4. No ejecutar `npm audit fix` automáticamente sobre el proyecto estable; las vulnerabilidades deben auditarse de forma controlada y separada.
5. No rediseñar pantallas completas sin una necesidad aprobada.
6. No reemplazar arquitectura ni librerías principales.
7. No cambiar contratos de API sin revisar todos los consumidores.
8. No alterar tablas, columnas o políticas de Supabase sin migración y plan de reversión.
9. Mantener compatibilidad web y Android; cualquier cambio iOS nativo requiere aprobación específica.
10. Probar autenticación, permisos y estados premium cuando el cambio los afecte.
11. Confirmar build, lint y pruebas relevantes antes de fusionar.
12. No tocar `ios/` salvo solicitud explícita o necesidad de plataforma iOS previamente diagnosticada y aprobada.
13. No modificar, versionar ni subir variables/archivos de entorno reales a GitHub.

## Trabajo futuro conocido

El README del proyecto menciona como posibles mejoras futuras:

- Listas de compra inteligentes.
- Analítica avanzada de progreso.
- Funciones de comunidad.
- Estimación avanzada de grasa corporal.
- Integración con dispositivos wearables.

Estas ideas no forman parte del núcleo actual y no deben iniciarse sin un plan específico.

## Pendientes de validación

- Confirmar Google Sign-In nativo en un iPhone real cuando el responsable de iOS genere una nueva build con su configuración nativa estable.
- Validar la distribución Android `1.2.5` desde Google Play una vez completada la revisión, especialmente cámara y Google Sign-In.
- Las vulnerabilidades reportadas por `npm audit` quedan como auditoría futura separada; no aplicar correcciones masivas mientras el producto esté estable.

## Regla de fuente de verdad

El código de la rama activa de producción, las migraciones de Supabase y la configuración de despliegue son la fuente de verdad. Este documento resume el estado observado y debe actualizarse cuando cambie una función de producción.
