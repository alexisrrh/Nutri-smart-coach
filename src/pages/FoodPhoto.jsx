import { useEffect, useMemo, useState } from "react";

import FoodPageLayout from "../components/food/FoodPageLayout";
import AIScanHero from "../components/food/AIScanHero";
import FoodUploadCard from "../components/food/FoodUploadCard";
import FoodScannerLoader from "../components/food/FoodScannerLoader";
import FoodResultCard from "../components/food/FoodResultCard";
import NutritionInsights from "../components/food/NutritionInsights";
import SmartSwapCard from "../components/food/SmartSwapCard";
import DailyGoalCard from "../components/food/DailyGoalCard.jsx";

import {
  saveMealToLocalStorage,
  safeParse,
} from "../components/food/foodUtils";

import { STORAGE_KEYS } from "../config/storageKeys";

export default function FoodPhoto() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const storedMeals = safeParse(localStorage.getItem(STORAGE_KEYS.MEALS), []);
    setMeals(Array.isArray(storedMeals) ? storedMeals : []);
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

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  }

  async function analyzeFood() {
    if (!image || loading) return;

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("http://localhost:3000/analyze-food", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();

      setResult(data);
      saveMealToLocalStorage(data, preview);

      const updatedMeals = safeParse(localStorage.getItem(STORAGE_KEYS.MEALS), []);
      setMeals(Array.isArray(updatedMeals) ? updatedMeals : []);
    } catch (error) {
      console.error("Error analizando comida:", error);
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