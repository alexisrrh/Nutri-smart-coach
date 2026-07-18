# Capacitor Android

## 1. Responsabilidad
Empaquetar la SPA Vite como aplicacion Android Capacitor.

## 2. Estructura real
- `capacitor.config.ts`: `appId`, `appName`, `webDir`.
- `android/`: proyecto Android generado, Gradle, manifest, recursos, MainActivity.
- `src/services/mobileBillingService.js`: deteccion Android nativo y estado de billing.

## 3. Flujo de datos
La app web se compila a `dist`. Capacitor sincroniza `dist` al proyecto Android. En runtime, `mobileBillingService` detecta `Capacitor.getPlatform() === "android"` y consulta backend para configuracion premium movil.

## 4. Puntos de entrada
`capacitor.config.ts`, `android/app/src/main/java/com/nutrismartcoach/app/MainActivity.java`, `android/app/src/main/AndroidManifest.xml`.

## 5. Dependencias principales
`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.

## 6. Convenciones existentes
`webDir` es `dist`; appId confirmado `com.nutrismartcoach.app`; appName confirmado `NutriSmart Coach`.

## 7. Integraciones externas
Google Play Billing esta preparado desde backend/configuracion movil, pero la compra/restauracion frontend esta en estado placeholder.

## 8. Variables de entorno
`GOOGLE_PLAY_PACKAGE_NAME`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, `APPLE_BUNDLE_ID`, `APPLE_ISSUER_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `APPLE_ENVIRONMENT`.

## 9. Comandos confirmados
`npm run cap:sync`, `npm run cap:android`, `npm run android:add`, `npm run build`.

## 10. Riesgos de produccion
No tocar Android, Gradle, iconos, splash ni `capacitor.config.ts` sin solicitud explicita. Cambios de `webDir` o appId afectan builds publicados.

## 11. Archivos a revisar antes de modificar
`capacitor.config.ts`, `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, `android/variables.gradle`, `src/services/mobileBillingService.js`, `backend/services/mobilePremium.service.js`.
