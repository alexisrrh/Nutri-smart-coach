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

## 2026-08-07 - Ajustes de layout movil en rutinas

- **Area:** frontend | movil | documentacion
- **Objetivo:** corregir espacios vacios y comportamiento de scroll en `/rutinas`, `WeeklyRoutineSheet` y la sesion activa de entrenamiento sin tocar cards, logica ni datos.
- **Cambios:** en `WorkoutSession` movil la cabecera queda visible bajo safe-area, el contenido central usa `main` scrollable y `FooterControls` permanece abajo fuera del scroll, eliminando espacio inferior artificial. En `/rutinas` movil se mantiene `AppShell` como unico scroll de la pantalla y el contenido final queda visible sobre `BottomNav`. En `WeeklyRoutineSheet` movil el scroll pasa al wrapper exterior, la lista de dias deja de tener scroll interno y la ultima card puede verse completa respetando safe-area y `BottomNav`. Desktop queda intacto mediante breakpoints.
- **Archivos principales:** `src/components/workout/WorkoutSession.jsx`, `src/pages/WorkoutRoutines.jsx`.
- **Pruebas automaticas:** `npm run lint` correcto; `npm run build` correcto con warning existente de Vite sobre import dinamico inefectivo de `src/data/exercises.js`.
- **Prueba humana:** pendiente en iPhone real: comprobar `/rutinas`, abrir "Tu semana de entrenamiento" y ejecutar una sesion para confirmar que no hay huecos inferiores grandes y que `Anterior`, `Siguiente` y `Finalizar entreno` quedan accesibles.
- **Pendientes:** no hubo cambios en logica de entrenamiento, estado, navegacion, backend, Supabase, Gemini ni Premium.
- **Autor:** Codex

## 2026-07-31 — Camara directa para escaner de comidas

- **Area:** frontend | movil | documentacion
- **Objetivo:** abrir directamente la camara al iniciar el escaneo de comida, manteniendo una opcion secundaria de galeria y reutilizando el flujo existente de preview y analisis nutricional.
- **Cambios:** se instalo `@capacitor/camera@8.2.2`, se registro el plugin con Capacitor, se separo la accion principal de camara de la seleccion secundaria de galeria y se centralizo el procesamiento en `processImageFile(file)` para validar, comprimir y generar preview desde ambos origenes. En Android nativo se usa `Camera.takePhoto` con camara trasera y `saveToGallery: false`; en web/PWA se usa `input accept="image/*" capture="environment"`.
- **Archivos principales:** `src/hooks/food-photo/useFoodPhotoImageUpload.js`, `src/components/food/FoodUploadCard.jsx`, `src/pages/FoodPhoto.jsx`, `src/i18n/es.json`, `src/i18n/en.json`, `package.json`, `package-lock.json`, `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`, `android/app/src/main/assets/capacitor.plugins.json`, `memory-bank/implementation-plans/2026-07-31-food-camera-scanner.md`.
- **Pruebas automaticas:** `npm run lint` correcto; `npm run build` correcto con warnings existentes de Vite/Rolldown; `npm run cap:sync` correcto; `npx cap sync android` correcto.
- **Prueba humana:** pendiente en dispositivo/navegador real: entrar en `/foto-comida`, pulsar la accion principal, tomar foto, comprobar preview, descripcion opcional y analisis; cancelar camara/galeria y confirmar que no aparece error grave; elegir imagen desde galeria secundaria.
- **Pendientes:** validar manualmente en Android fisico o emulador con camara disponible y en navegador/PWA. `npm install` reporto 15 vulnerabilidades de auditoria no tratadas porque `npm audit fix` queda fuera del alcance.
- **Autor:** Codex

## 2026-07-25 — Inicio de sesión nativo con Google en Android

- **Área:** frontend | móvil | documentación
- **Objetivo:** evitar que el login con Google en Android abra Chrome y preparar autenticación nativa con Google ID token y Supabase.
- **Cambios:** se añadió `@capawesome/capacitor-google-sign-in`, se creó un servicio `signInWithGoogle()` que separa Android nativo de web, y se documentó `VITE_GOOGLE_WEB_CLIENT_ID` como Client ID público.
- **Archivos principales:** `src/services/googleAuthService.js`, `src/pages/Login.jsx`, `src/pages/Register.jsx`, `.env.example`, `package.json`, `package-lock.json`, `android/capacitor.settings.gradle`, `android/app/src/main/assets/capacitor.plugins.json`, `memory-bank/features/authentication.md`, `memory-bank/modules/capacitor-android.md`.
- **Pruebas automáticas:** `npm run lint` correcto; `npm run build` correcto; `npx cap sync android` correcto; `cmd.exe /c gradlew.bat assembleDebug` correcto con warnings D8 no bloqueantes de `play-services-auth-21.5.0`.
- **Prueba humana:** APK debug instalado y `MainActivity` abre; la prueba interactiva de Google queda pendiente porque falta configurar `VITE_GOOGLE_WEB_CLIENT_ID` real y el emulador actual no acepta taps aunque `uiautomator` ve la UI.
- **Pendientes:** configurar Google Cloud y Supabase, regenerar build/sync/APK, y validar selector nativo, sesión Supabase, persistencia, logout y cancelación.
- **Autor:** Codex

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
