import { useEffect, useMemo, useState } from "react";

import FoodPageLayout from "../components/food/FoodPageLayout";
import AIScanHero from "../components/food/AIScanHero";
import FoodUploadCard from "../components/food/FoodUploadCard";
import FoodScannerLoader from "../components/food/FoodScannerLoader";
import FoodResultCard from "../components/food/FoodResultCard";
import NutritionInsights from "../components/food/NutritionInsights";
import SmartSwapCard from "../components/food/SmartSwapCard";
import DailyGoalCard from "../components/food/DailyGoalCard.jsx";

import { API_URL } from "../config/api";
import { STORAGE_KEYS } from "../config/storageKeys";
import { supabase } from "../lib/supabase";

import {
  saveMealToLocalStorage,
  safeParse,
} from "../components/food/foodUtils";

export default function FoodPhoto() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const storedMeals = safeParse(localStorage.getItem(STORAGE_KEYS.MEALS), []);
    setMeals(Array.isArray(storedMeals) ? storedMeals : []);

    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []);

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

  function handleImage(event) {
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

    if (file.size > 4 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Usa una imagen menor de 4MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  async function analyzeFood() {
    if (!image || loading) return;

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

      const formData = new FormData();
      formData.append("image", image);
      formData.append("goal", "perder_grasa");

      if (user?.id) {
        formData.append("user_id", user.id);
      }

      const response = await fetch(`${API_URL}/analyze-food`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            data?.detail ||
            `Error del servidor: ${response.status}`
        );
      }

      if (!data) {
        throw new Error("No se recibió respuesta válida del servidor.");
      }

      const mealToSave = {
        ...data,
        user_id: user?.id || null,
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
      };

      setResult(mealToSave);
      saveMealToLocalStorage(mealToSave, preview);

      const updatedMeals = safeParse(
        localStorage.getItem(STORAGE_KEYS.MEALS),
        []
      );

      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
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

  return (
    <FoodPageLayout>
      <div className="space-y-2">
        <AIScanHero />

        {!result && !loading && (
          <FoodUploadCard
            preview={preview}
            handleImage={handleImage}
            analyzeFood={analyzeFood}
            loading={loading}
          />
        )}

        {error && (
          <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-3 text-[11px] leading-4 text-red-200">
            {error}
          </div>
        )}

        {loading && <FoodScannerLoader preview={preview} />}

        {result && !loading && (
          <>
            <FoodResultCard result={result} preview={preview} />
            <NutritionInsights result={result} />
            <SmartSwapCard result={result} />
            <DailyGoalCard totals={totals} goals={goals} />
          </>
        )}
      </div>
    </FoodPageLayout>
  );
}