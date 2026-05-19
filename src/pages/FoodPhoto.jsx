import { useEffect, useMemo, useState } from "react";

import AIScanHero from "../components/food/AIScanHero";
import FoodUploadCard from "../components/food/FoodUploadCard";
import FoodScannerLoader from "../components/food/FoodScannerLoader";
import FoodResultCard from "../components/food/FoodResultCard";
import NutritionInsights from "../components/food/NutritionInsights";
import SmartSwapCard from "../components/food/SmartSwapCard";
import DailyGoalCard from "../components/food/DailyGoalCard.jsx";
import { AppShell } from "../components/ui";

import { supabase } from "../lib/supabase";
import {
  analyzeMeal,
  cacheMeal,
  deleteMeal,
  getCachedMeals,
  removeMealFromCache,
} from "../services/mealService";

export default function FoodPhoto() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState(getCachedMeals);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories || 0);
        acc.protein += Number(meal.protein || 0);
        return acc;
      },
      { calories: 0, protein: 0 }
    );
  }, [meals]);

  const goals = {
    calories: 2600,
    protein: 170,
  };

  function resetScanner() {
    if (preview) URL.revokeObjectURL(preview);

    setImage(null);
    setPreview("");
    setDescription("");
    setResult(null);
    setError("");
    setLoading(false);
  }

  async function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    const isValid =
      allowedTypes.includes(file.type) ||
      /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file.name);

    if (!isValid) {
      setError("Formato no compatible. Usa JPG, PNG, WEBP o HEIC.");
      return;
    }

    try {
      setError("");
      setResult(null);

      const preparedImage = await prepareImageForUpload(file);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setImage(preparedImage);
      setPreview(URL.createObjectURL(preparedImage));
    } catch (error) {
      console.error("Error preparando imagen:", error);
      setError("No se pudo preparar la imagen. Intenta con otra foto.");
    }
  }

  async function analyzeFood() {
    const trimmedDescription = description.trim();

    if (!image && !trimmedDescription) {
      setError("Sube una foto o describe tu comida.");

      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setResult(null);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn("No se pudo obtener usuario Supabase:", userError.message);
      }

      const mealToSave = await analyzeMeal({
        image,
        description: trimmedDescription,
        goal: "perder_grasa",
        userId: user?.id,
      });

      setResult(mealToSave);
      setMeals(cacheMeal(mealToSave, preview));
    } catch (error) {
      console.error("Error analizando comida:", error);

      setError(
        error?.message ||
          "No se pudo analizar la comida. Revisa la conexión e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  async function discardAnalysis() {
    if (!result) return;

    try {
      setLoading(true);
      setError("");

      if (result.id) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.warn("No se pudo obtener usuario Supabase:", userError.message);
        }

        if (user?.id) {
          await deleteMeal(result.id, user.id);
        }
      }

      setMeals(removeMealFromCache(result));
      resetScanner();
    } catch (error) {
      console.error("Error descartando análisis:", error);
      setError(
        error?.message ||
          "No se pudo descartar el análisis. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell className="overflow-hidden" contentClassName="px-2 pt-2">
      <div className="flex h-full min-h-0 flex-col gap-2">
        {(!result || loading) && <AIScanHero />}

        {!result && !loading && (
          <FoodUploadCard
            preview={preview}
            description={description}
            onDescriptionChange={setDescription}
            handleImage={handleImage}
            analyzeFood={analyzeFood}
            loading={loading}
          />
        )}

        {error && (
          <div className="shrink-0 rounded-[18px] border border-red-400/20 bg-red-400/10 p-2.5 text-xs leading-4 text-red-200">
            {error}
          </div>
        )}

        {loading && <FoodScannerLoader preview={preview} />}

        {result && !loading && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto pb-[140px] pr-0.5 [scrollbar-width:none] md:pb-[150px] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-2">
                <FoodResultCard result={result} preview={preview} />
                <NutritionInsights result={result} />
                <SmartSwapCard result={result} />
                <DailyGoalCard totals={totals} goals={goals} />

                <div className="mb-6 mt-3 grid grid-cols-2 gap-2 md:mb-10">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="rounded-[18px] border px-3 py-3 text-[10px] font-black uppercase leading-3 tracking-[0.1em] shadow-[0_14px_40px_var(--app-glow)] transition active:scale-[0.98]"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "var(--app-primary)",
                      color: "var(--app-surface)",
                    }}
                  >
                    Analizar otra comida
                  </button>

                  <button
                    type="button"
                    onClick={discardAnalysis}
                    className="rounded-[18px] border px-3 py-3 text-[10px] font-black uppercase leading-3 tracking-[0.1em] transition active:scale-[0.98]"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "var(--app-surface)",
                      color: "var(--app-muted)",
                    }}
                  >
                    Descartar análisis
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

async function prepareImageForUpload(file) {
  const targetSize = 1.2 * 1024 * 1024;

  if (file.size <= targetSize && !isHeicImage(file)) {
    return file;
  }

  if (isHeicImage(file)) {
    return file;
  }

  const compressed = await compressImage(file);

  if (compressed.size > targetSize) {
    throw new Error("La imagen sigue siendo demasiado pesada.");
  }

  return compressed;
}

function isHeicImage(file) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      const maxWidth = 1024;
      const scale = Math.min(1, maxWidth / image.width);

      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo comprimir la imagen."));
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        "image/jpeg",
        0.74
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo cargar la imagen."));
    };

    image.src = objectUrl;
  });
}
