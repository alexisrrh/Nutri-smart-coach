# Banco de memoria de IA

Esta carpeta conserva el contexto esencial de NutriSmart Coach para que desarrolladores y asistentes de IA trabajen con las mismas reglas, decisiones y objetivos.

## Orden de lectura recomendado

1. `app-description.md`
2. `architecture-decisions/stack-and-rules.md`
3. El plan activo dentro de `implementation-plans/`
4. `change-log.md`

## Flujo de trabajo

1. Crear un nuevo plan copiando `implementation-plans/template.md`.
2. Completar el objetivo, alcance, archivos relacionados, riesgos y criterios de aceptación.
3. Pedir al asistente de IA que lea primero el banco de memoria y después los archivos reales implicados.
4. Implementar un paso pequeño cada vez.
5. Ejecutar pruebas automáticas y una prueba humana después de cada paso.
6. Actualizar `change-log.md` al finalizar.
7. Registrar una decisión nueva en `architecture-decisions/` cuando afecte permanentemente a la arquitectura.

## Prompt inicial recomendado

```text
Antes de modificar código, lee estos archivos:

- memory-bank/app-description.md
- memory-bank/architecture-decisions/stack-and-rules.md
- memory-bank/implementation-plans/<plan-activo>.md

Después inspecciona los archivos reales relacionados con la tarea. No inventes rutas, endpoints, tablas ni variables. Propón primero el cambio mínimo, indica los archivos que tocarás y define una prueba automática y una prueba humana.
```

## Regla principal

El banco de memoria orienta el trabajo, pero el código actual del repositorio es la fuente de verdad. Cuando la documentación y el código no coincidan, se debe investigar la diferencia y actualizar la documentación; nunca asumir cuál de los dos es correcto.
