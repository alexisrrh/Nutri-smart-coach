# Camara directa para escaner de comidas

## Caracteristica

Camara directa para el escaner nutricional de `/foto-comida`.

## Problema que resuelve

El flujo actual abre el selector de archivos/galeria al pulsar el area principal de carga. En Android nativo debe abrir directamente la camara trasera, y en web/PWA debe usar un input de captura compatible, manteniendo una opcion secundaria de galeria.

## Alcance

### Incluye

- Boton/area principal para tomar foto.
- Fallback web/PWA con `input accept="image/*" capture="environment"`.
- Accion secundaria visible para seleccionar imagen de galeria.
- Funcion comun para procesar imagenes desde camara y galeria.
- Conversion del resultado de camara a `File`.
- Traducciones necesarias en espanol e ingles.
- Instalacion y sincronizacion de `@capacitor/camera` compatible con Capacitor 8.

### No incluye

- Cambios en backend de analisis.
- Cambios en autenticacion Supabase.
- Cambios en limites diarios, cooldown, hash/reutilizacion, Gemini, storage, `meal_analyses` o Premium.
- Redisenos generales de la pantalla.
- Permisos Android manuales salvo que el plugin o la compilacion los requieran.

## Archivos relacionados

- `src/pages/FoodPhoto.jsx`
- `src/components/food/FoodUploadCard.jsx`
- `src/hooks/food-photo/useFoodPhotoImageUpload.js`
- `src/i18n/es.json`
- `src/i18n/en.json`
- `package.json`
- `package-lock.json`
- `memory-bank/change-log.md`

## Riesgos y dependencias

- Requiere `@capacitor/camera` y `npx cap sync android`.
- La camara web/PWA depende del soporte del navegador para `capture="environment"`.
- La URI nativa debe convertirse de forma fiable a `Blob` y despues a `File`.
- La cancelacion de camara/galeria debe tratarse como accion normal.
- El arbol de trabajo tiene cambios preexistentes; no se deben revertir ni mezclar cambios ajenos.

## Pasos de implementacion

### Paso 1 - Investigacion

- Revisar Memory Bank, reglas Cursor, configuracion Capacitor, manifest Android, pantalla `/foto-comida`, hook de imagen, servicio de analisis y backend.

**Prueba humana:** confirmar que el diagnostico describe el flujo real.

### Paso 2 - Dependencia y sync

- Instalar `@capacitor/camera` compatible con Capacitor 8.
- Ejecutar `npx cap sync android`.

**Prueba automatica:** `npm install @capacitor/camera@^8` y `npm run cap:sync`.

### Paso 3 - Cambio minimo funcional

- Extraer `processImageFile(file)` en el hook existente.
- Mantener `handleImage(event)` para galeria.
- Anadir captura principal con camara nativa Android y fallback web input.
- Convertir resultado de camara a `File` antes de procesarlo.

**Prueba humana:** entrar en `/foto-comida`, pulsar el area principal, tomar foto y ver la preview.

### Paso 4 - Estados y errores

- Tratar cancelacion como no-op.
- Mostrar error solo para permisos denegados, captura fallida, conversion fallida, formato invalido o imagen no procesable.
- Resetear valor de inputs tras seleccion para permitir elegir la misma imagen.

**Prueba humana:** cancelar camara/galeria y confirmar que no aparece error grave.

### Paso 5 - Integracion

- Confirmar que la preview, descripcion opcional y boton de analisis siguen usando el flujo existente.
- Confirmar que no se tocan backend, limites, Premium ni Gemini.

**Prueba automatica:** `npm run lint`, `npm run build`, `npm run cap:sync`.

### Paso 6 - Documentacion

- Actualizar `memory-bank/change-log.md`.

## Criterios de aceptacion

- [x] El boton principal abre camara directa en Android nativo.
- [x] En web/PWA el boton principal usa `accept="image/*"` y `capture="environment"`.
- [x] Existe accion secundaria visible para galeria.
- [x] Camara y galeria llaman a una unica funcion compartida de procesamiento.
- [x] Las imagenes pasan por validacion, compresion, preview y analisis existentes.
- [x] La cancelacion no muestra error grave.
- [x] No se modifica la logica de backend, IA, limites o Premium.
- [x] Compila correctamente.
- [x] Se actualiza el registro documental necesario.

## Resultado final

- Archivos modificados: `src/hooks/food-photo/useFoodPhotoImageUpload.js`, `src/components/food/FoodUploadCard.jsx`, `src/pages/FoodPhoto.jsx`, `src/i18n/es.json`, `src/i18n/en.json`, `package.json`, `package-lock.json`, archivos generados por `cap sync` para registrar `@capacitor/camera`, `memory-bank/change-log.md`.
- Pruebas ejecutadas: `npm run lint`, `npm run build`, `npm run cap:sync`, `npx cap sync android`.
- Resultado de la prueba humana: pendiente en dispositivo/navegador real.
- Pendientes conocidos: validar camara trasera en Android fisico o emulador con camara disponible; validar fallback web/PWA con `capture="environment"`.
