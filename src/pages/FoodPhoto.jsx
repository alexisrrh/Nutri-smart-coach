import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { API_URL } from "../config/api";
import AIScanHero from "../components/food/AIScanHero";
import FoodUploadCard from "../components/food/FoodUploadCard";
import FoodScannerLoader from "../components/food/FoodScannerLoader";
import FoodResultCard from "../components/food/FoodResultCard";
import FoodTags from "../components/food/FoodTags";
import SmartSwapCard from "../components/food/SmartSwapCard";
import RecentMealsSlider from "../components/food/RecentMealsSlider";
import FoodPageLayout from "../components/food/FoodPageLayout";

import {
  saveMealToLocalStorage,
  safeParse,
} from "../components/food/foodUtils";



const MEALS_KEY = "nutricoach_meals";

export default function FoodPhoto() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const storedMeals = safeParse(localStorage.getItem(MEALS_KEY), []);
    setMeals(storedMeals);
  }, []);

  function handleImage(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  }

  async function analyzeFood() {
    if (!file) {
      setError("Sube una imagen primero.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const formData = new FormData();
      formData.append("image", file);

      if (user?.id) {
        formData.append("user_id", user.id);
      }

      const response = await fetch(`${API_URL}/analyze-food`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Error analizando imagen");
      }

      setResult(data);
      saveMealToLocalStorage(data, preview);

      const updatedMeals = safeParse(localStorage.getItem(MEALS_KEY), []);
      setMeals(updatedMeals);
    } catch (err) {
      console.error("Error frontend:", err);
      setError(err.message || "No se pudo analizar la comida.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FoodPageLayout>
      <AIScanHero />

      {!loading && !result && (
        <FoodUploadCard
          preview={preview}
          handleImage={handleImage}
          analyzeFood={analyzeFood}
          loading={loading}
        />
      )}

      {loading && <FoodScannerLoader preview={preview} />}

      {!loading && result && (
        <>
          <FoodResultCard result={result} preview={preview} />
          <FoodTags result={result} />
          <SmartSwapCard result={result} />
        </>
      )}

      <RecentMealsSlider meals={meals} />

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-[11px] font-bold text-red-300">
          {error}
        </div>
      )}
    </FoodPageLayout>
  );
}