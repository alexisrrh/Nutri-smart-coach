import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nutrismartcoach.app",
  appName: "NutriSmart Coach",
  webDir: "dist",
  ios: {
    infoPlist: {
      NSPhotoLibraryUsageDescription: "NutriSmart Coach necesita acceso a tu galería para que puedas subir imágenes de tus comidas y analizarlas con nuestra Inteligencia Artificial.",
      NSCameraUsageDescription: "NutriSmart Coach necesita acceso a la cámara para tomar fotos de tus platos y calcular tus calorías y macronutrientes al instante.",
      NSPhotoLibraryAddUsageDescription: "NutriSmart Coach necesita permiso para guardar imágenes de tus progresos o menús en tu carrete."
    }
  }
};

export default config;
