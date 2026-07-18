# NutriSmart Coach — Descripción actual de la aplicación

## Estado del producto

**Estado:** producción y mantenimiento.

NutriSmart Coach ya no se encuentra en una fase inicial de construcción. La aplicación cuenta con frontend, API, autenticación, persistencia, funciones de IA, sistema premium, referidos, analítica, internacionalización y soporte Android. La prioridad actual es mantener la estabilidad, corregir errores concretos y realizar mejoras pequeñas y justificadas.

No se deben proponer rediseños generales, migraciones de tecnología ni reestructuraciones amplias sin una necesidad real y aprobación explícita.

## Propósito

NutriSmart Coach es una plataforma web y móvil de nutrición, entrenamiento y seguimiento físico. Utiliza inteligencia artificial para analizar comidas, generar dietas personalizadas, registrar check-ins corporales y apoyar el seguimiento de hábitos y objetivos.

## Usuarios objetivo

- Personas que quieren perder grasa, ganar masa muscular o mantener su peso.
- Usuarios que desean organizar alimentación, rutinas y progreso en una sola aplicación.
- Personas que buscan orientación automatizada mediante IA sin sustituir asesoramiento médico profesional.

## Funcionalidades implementadas

### Cuenta y seguridad

- Registro, inicio de sesión y recuperación de contraseña.
- Autenticación con Supabase.
- Rutas privadas mediante `ProtectedRoute`.
- Configuración y edición del perfil.
- Ajustes de perfil, tema, IA, seguridad y aspectos legales.
- Página para solicitar la eliminación de la cuenta.

### Nutrición e inteligencia artificial

- Análisis nutricional de comidas mediante fotografía.
- Identificación de alimentos, estimación de calorías y macronutrientes.
- Historial de comidas analizadas.
- Resumen diario de alimentación.
- Generación de dietas semanales personalizadas.
- Reescritura de comidas de un plan existente.
- Respuesta alternativa de respaldo cuando Gemini no está disponible.
- Límites de uso de IA y tiempos de espera entre solicitudes.

### Progreso corporal

- Check-ins con imagen, peso, medidas y notas.
- Análisis corporal asistido por Gemini.
- Historial y eliminación de check-ins.
- Comparación con registros anteriores.
- Centro de progreso y visualización de evolución.

### Entrenamiento

- Biblioteca de ejercicios por grupos musculares.
- Rutinas de entrenamiento.
- Creación y edición de rutinas.
- Enlaces públicos para compartir rutinas.

### Negocio y crecimiento

- Plan gratuito y funciones premium.
- Consulta del consumo y límites de IA por usuario.
- Pagos y verificación del estado premium.
- Sistema de referidos.
- Panel y seguimiento para creadores.
- Enlaces con código de creador.

### Plataforma

- Interfaz responsive adaptada a móvil y pantallas pequeñas de iPhone.
- Soporte multiidioma con i18next.
- Analítica con Google Analytics 4.
- Aplicación Android mediante Capacitor.
- Carga diferida de páginas con `React.lazy` y `Suspense`.

## Stack confirmado en el repositorio

### Frontend

- React `19.2.5`
- React DOM `19.2.5`
- Vite `8.0.10`
- Tailwind CSS `4.2.4`
- React Router DOM `7.14.2`
- Framer Motion `12.38.0`
- Supabase JS `2.105.3`
- i18next y react-i18next
- Lucide React
- React GA4
- Vitest y ESLint

### Backend

- Node.js con módulos ES
- Express `5.2.1`
- Supabase JS `2.105.3`
- Google Gemini mediante `@google/genai`
- Multer para carga de imágenes
- CORS, rate limiting, validación JWT y manejo centralizado de errores

### Móvil

- Capacitor `8.4.0`
- Android

## Servicios externos

- Supabase: autenticación, perfiles, datos y almacenamiento de imágenes.
- Gemini: análisis de alimentos, generación de dietas y análisis de check-ins.
- Google Analytics 4: analítica.
- Servicios de pago integrados desde el backend.

## Objetivo actual

Mantener una aplicación estable en producción. Los cambios deben ser mínimos, localizados, reversibles y comprobables.

## Reglas de mantenimiento

1. No modificar frontend o backend fuera del alcance solicitado.
2. No cambiar diseños que ya funcionan salvo que exista un fallo reproducible.
3. No renombrar rutas, tablas, columnas o variables de entorno sin plan de migración.
4. No reemplazar servicios existentes por alternativas nuevas sin aprobación.
5. Inspeccionar primero el código real y reutilizar componentes, hooks, servicios y middleware existentes.
6. Mantener compatibilidad web, móvil y Android.
7. Probar autenticación, permisos y aislamiento de datos cuando el cambio afecte usuarios.
8. Mantener respuestas alternativas cuando Gemini falle.
9. No exponer claves, tokens, credenciales ni datos de otros usuarios.
10. Actualizar este banco únicamente cuando cambie el estado real del producto.