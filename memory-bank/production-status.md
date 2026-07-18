# Estado actual del producto

**Última revisión documental:** 2026-07-18

## Estado general

NutriSmart Coach se considera un producto en producción. La prioridad actual no es rehacer el frontend ni el backend, sino proteger la estabilidad, corregir fallos concretos y realizar mejoras pequeñas con riesgo controlado.

## Áreas operativas confirmadas

- Aplicación web con React y Vite.
- Aplicación Android basada en Capacitor.
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

El frontend dispone de rutas públicas, rutas protegidas, carga diferida por página, control de sesión, seguimiento de enlaces de creadores y una interfaz adaptada a móvil. Los últimos cambios de producción se han concentrado en ajustes visuales para iPhone, navegación, botones y espaciado.

### Backend

**Estado:** estable y modularizado.

La API está separada en rutas, middleware, servicios, normalizadores, prompts y utilidades. Incluye verificación del usuario de Supabase, rate limiting global y específico, CORS, registro de solicitudes, manejador central de errores y endpoint de salud.

### Inteligencia artificial

**Estado:** funcional con protecciones y fallback.

Gemini se utiliza para funciones concretas. Las respuestas se normalizan antes de persistirlas. Las dietas cuentan con fallback si Gemini falla o falta la clave. Los check-ins también tienen respuesta alternativa cuando no se puede usar IA.

### Seguridad

**Estado:** implementada, no debe relajarse.

- Token Bearer de Supabase en endpoints privados.
- Comparación del usuario autenticado con el recurso solicitado.
- Rate limiting.
- CORS controlado.
- Límites de tamaño en JSON e imágenes.
- Separación de claves de entorno.

## Política de cambios en producción

A partir de este estado:

1. No rediseñar pantallas completas sin una necesidad aprobada.
2. No reemplazar arquitectura ni librerías principales.
3. No cambiar contratos de API sin revisar todos los consumidores.
4. No alterar tablas, columnas o políticas de Supabase sin migración y plan de reversión.
5. Preferir correcciones pequeñas y localizadas.
6. Mantener compatibilidad web, Android y pantallas pequeñas.
7. Probar autenticación, permisos y estados premium cuando el cambio los afecte.
8. Confirmar que build, lint y pruebas siguen funcionando antes de fusionar.

## Trabajo futuro conocido

El README del proyecto menciona como posibles mejoras futuras:

- Listas de compra inteligentes.
- Analítica avanzada de progreso.
- Compatibilidad con Apple.
- Funciones de comunidad.
- Estimación avanzada de grasa corporal.
- Integración con dispositivos wearables.

Estas ideas no forman parte del núcleo actual y no deben iniciarse sin un plan específico.

## Regla de fuente de verdad

El código de la rama principal, las migraciones de Supabase y la configuración de despliegue son la fuente de verdad. Este documento resume el estado observado, pero debe actualizarse cuando cambie una función de producción.