# Google OAuth de Supabase en iOS

## Caracteristica

Inicio de sesion con Google mediante Supabase OAuth y navegador del sistema exclusivamente en iOS nativo.

## Problema que resuelve

El SDK nativo de Google en iOS devuelve un ID token con un nonce cuyo valor original no expone al codigo JavaScript. Supabase no puede validar ese token mediante `signInWithIdToken` sin el nonce original y rechaza el inicio de sesion.

## Alcance

### Incluye

- Bifurcacion exclusiva para `Capacitor.getPlatform() === "ios"`.
- OAuth implicit existente de Supabase con `skipBrowserRedirect: true`.
- Apertura de la URL OAuth con `@capacitor/browser`.
- Recepcion temporal del callback con `@capacitor/app`.
- Validacion del callback y establecimiento de sesion mediante `supabase.auth.setSession`.
- Registro del esquema `com.nutrismartcoach.app` como segundo URL type en iOS.
- Instrucciones para que el responsable iOS registre Browser manualmente desde Mac sin ejecutar sync desde Windows.

### No incluye

- Cambios en Google Sign-In Android o Google OAuth web.
- PKCE ni cambios en `src/lib/supabase.js`.
- Cambios en Apple Sign-In, email/password, Facebook, camara o Android.
- Cambios de Bundle Identifier o eliminacion del esquema nativo existente de Google.

## Archivos relacionados

- `src/services/googleAuthService.js`
- `package.json`
- `package-lock.json`
- `ios/App/App/Info.plist`
- `ios/App/CapApp-SPM/Package.swift` y `ios/App/App/capacitor.config.json` quedan pendientes en Mac y no se modifican desde Windows.
- `memory-bank/features/authentication.md`
- `memory-bank/change-log.md`

## Riesgos y dependencias

- Requiere `@capacitor/browser` compatible con Capacitor 8.
- El callback debe coincidir exactamente con la Redirect URL ya autorizada en Supabase.
- Los tokens solo se leen en memoria desde el fragmento y se entregan a `supabase.auth.setSession`; no se registran ni persisten manualmente.
- Los listeners temporales deben retirarse tanto en exito como en error o cancelacion.
- El arbol tiene un cambio Android previo que no debe tocarse.

## Pasos de implementacion

### Paso 1 - Investigacion

- Confirmar ramas actuales de Google Android, iOS y web, dependencias y configuracion de callbacks.

**Prueba humana:** comprobar que Android usa ID token nativo y web conserva el OAuth actual.

### Paso 2 - Dependencia

- Instalar unicamente `@capacitor/browser` compatible con Capacitor 8.

**Prueba automatica:** comprobar la version resuelta en `package-lock.json`.

### Paso 3 - Cambio minimo funcional

- Iniciar OAuth de Supabase solo en iOS con el redirect confirmado y `skipBrowserRedirect`.
- Abrir `data.url` con Browser.
- Procesar exclusivamente el fragmento del callback esperado y crear la sesion con ambos tokens.

**Prueba humana:** iniciar Google en iPhone, completar la cuenta y comprobar llegada al dashboard con sesion activa.

### Paso 4 - Estados y errores

- Retirar listeners en exito, error, fallo de apertura y cancelacion.
- Cerrar Browser al recibir callback valido o de error.
- No imprimir ni guardar manualmente tokens.

**Prueba humana:** cancelar el navegador y repetir el login; comprobar que no hay listeners duplicados ni navegador residual.

### Paso 5 - Integracion iOS

- Registrar el segundo URL type sin alterar el esquema Google existente.
- Restaurar los cambios colaterales producidos por el intento de sync en Windows.
- Dejar a Daniel el registro manual de Browser en SwiftPM y `packageClassList` desde Mac, conservando Capacitor 8.5.0 y las rutas existentes.

**Prueba automatica:** confirmar que ningun archivo generado iOS queda modificado desde Windows.

### Paso 6 - Validacion y documentacion

- Actualizar autenticacion y change-log.
- Ejecutar build, lint y `git diff --check`.

## Criterios de aceptacion

- [x] Google iOS queda preparado para usar Supabase OAuth en navegador del sistema.
- [x] El callback implicit valida ambos tokens y crea la sesion.
- [x] Cancelacion y errores limpian listeners y navegador.
- [x] Google Android conserva literalmente el flujo nativo actual.
- [x] Google web conserva literalmente su OAuth actual.
- [x] El esquema Google anterior permanece registrado.
- [x] No se modifica camara ni Android.
- [x] Build, lint y `git diff --check` finalizan correctamente.
- [x] Se documenta el cambio.

## Resultado final

- Archivos modificados: `src/services/googleAuthService.js`, `package.json`, `package-lock.json`, `ios/App/App/Info.plist`, `memory-bank/features/authentication.md`, `memory-bank/change-log.md` y este plan.
- Pruebas ejecutadas: `npm run build` y `npm run lint` correctos; `git diff --check` correcto con avisos de conversion LF/CRLF.
- Resultado de la prueba humana: pendiente en iPhone real.
- Pendientes conocidos: Daniel debe registrar Browser manualmente en SwiftPM y `packageClassList` desde Mac, y despues validar fisicamente el callback y la cancelacion en iOS.
