# NutriSmart Coach — Descripción de la aplicación

## Propósito

NutriSmart Coach es una aplicación web y móvil orientada a nutrición, entrenamiento y seguimiento del progreso físico. Utiliza inteligencia artificial para ayudar al usuario a analizar comidas, generar dietas personalizadas, registrar check-ins corporales y consultar rutinas de entrenamiento.

## Usuarios objetivo

- Personas que quieren perder grasa o ganar masa muscular.
- Usuarios que desean organizar su alimentación y progreso desde una sola aplicación.
- Personas que buscan apoyo de IA para interpretar comidas, hábitos y evolución corporal.

## Funcionalidades principales

- Registro, inicio de sesión y rutas protegidas.
- Configuración inicial del perfil y del objetivo físico.
- Análisis nutricional de comidas mediante imagen o texto.
- Historial de comidas analizadas y acumulación de macronutrientes.
- Generación de dietas semanales personalizadas.
- Check-ins corporales con peso, fotografía y análisis asistido por IA.
- Seguimiento del progreso físico.
- Biblioteca de ejercicios y rutinas por grupo muscular.
- Gestión de límites de uso y funcionalidades premium.
- Aplicación Android mediante Capacitor.

## Stack tecnológico

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- i18next
- Supabase JS
- Capacitor

### Backend

- Node.js
- Express
- Multer
- Supabase
- Google Gemini mediante `@google/genai`

### Servicios externos

- Supabase para autenticación y persistencia de datos.
- Gemini para análisis nutricional y generación de contenido.
- Google Analytics 4 para analítica.

## Objetivos técnicos

- Mantener una arquitectura modular y fácil de ampliar.
- Proteger los endpoints privados verificando el usuario autenticado.
- Evitar que un usuario pueda consultar o modificar datos de otro usuario.
- Mantener una experiencia consistente entre web y Android.
- Crear funcionalidades incrementales, comprobables y fáciles de revertir.
- Revisar y probar siempre el código generado con ayuda de IA.

## Principios del proyecto

1. No modificar funcionalidades ajenas a la tarea actual sin una razón documentada.
2. Reutilizar componentes y servicios existentes antes de crear duplicados.
3. Mantener la lógica de autenticación centralizada.
4. Validar entradas tanto en frontend como en backend.
5. No exponer claves, secretos ni credenciales en el repositorio.
6. Dividir cambios grandes en pasos pequeños con pruebas humanas.
7. Actualizar este banco de memoria cuando cambien decisiones importantes.
