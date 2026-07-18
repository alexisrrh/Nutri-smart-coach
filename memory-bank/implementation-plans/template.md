# Plantilla de plan de implementación

## Característica

Nombre breve de la funcionalidad.

## Problema que resuelve

Explica qué necesita el usuario y por qué es importante.

## Alcance

### Incluye

- Elementos que sí se implementarán.

### No incluye

- Elementos que quedan fuera de esta tarea.

## Archivos relacionados

- `ruta/al/archivo`

## Riesgos y dependencias

- Servicios externos.
- Migraciones de base de datos.
- Variables de entorno.
- Compatibilidad móvil.
- Seguridad y privacidad.

## Pasos de implementación

### Paso 1 — Investigación

- Revisar la implementación actual.
- Confirmar rutas, componentes, endpoints y estructura de datos reales.

**Prueba humana:** explicar el flujo actual y confirmar que no se han inventado dependencias.

### Paso 2 — Cambio mínimo funcional

- Implementar la unidad de trabajo más pequeña que aporte valor.

**Prueba automática:** indicar el comando y el resultado esperado.

**Prueba humana:** describir exactamente dónde entrar, qué pulsar y qué debe ocurrir.

### Paso 3 — Estados y errores

- Añadir estados de carga, vacío, error y éxito cuando el cambio cree o modifique una interacción visible para el usuario.

**Prueba humana:** simular cada estado y verificar que la interfaz informa correctamente.

### Paso 4 — Integración

- Comprobar que el cambio funciona con autenticación, API, base de datos y navegación existentes.

**Prueba automática:** ejecutar pruebas y compilación.

**Prueba humana:** completar el flujo de principio a fin.

### Paso 5 — Documentación

- Actualizar `memory-bank/change-log.md`.
- Registrar una decisión de arquitectura si se tomó una decisión permanente.

## Criterios de aceptación

- [ ] Cumple el objetivo descrito.
- [ ] No rompe flujos existentes.
- [ ] Compila correctamente.
- [ ] Las pruebas pasan.
- [ ] Se verificó en vista móvil.
- [ ] Se verificó la protección de datos del usuario.
- [ ] Se documentó el cambio.

## Resultado final

Completar al cerrar la tarea:

- Archivos modificados:
- Pruebas ejecutadas:
- Resultado de la prueba humana:
- Pendientes conocidos:
