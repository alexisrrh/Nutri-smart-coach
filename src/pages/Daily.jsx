import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import { listMeals } from "../services/mealService";

export function Daily() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    async function loadData() {
      // perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setMeals(await listMeals(user.id));
    }

    if (user) loadData();
  }, [user]);

  // 🔥 cálculos
  const totalCalories = meals.reduce(
    (acc, m) => acc + Number(m.calories || 0),
    0
  );

  const totalProtein = meals.reduce(
    (acc, m) => acc + Number(m.protein || 0),
    0
  );

  function getTargetCalories() {
    if (!profile) return 0;

    const peso = Number(profile.peso);
    const altura = Number(profile.altura);
    const edad = Number(profile.edad);

    let bmr =
      profile.genero === "mujer"
        ? 10 * peso + 6.25 * altura - 5 * edad - 161
        : 10 * peso + 6.25 * altura - 5 * edad + 5;

    let factor = 1.55;

    if (profile.actividad === "sedentaria") factor = 1.2;
    if (profile.actividad === "ligera") factor = 1.375;
    if (profile.actividad === "moderada") factor = 1.55;
    if (profile.actividad === "alta") factor = 1.725;

    let calorias = bmr * factor;

    if (profile.objetivo === "bajar") calorias -= 400;
    if (profile.objetivo === "subir") calorias += 300;

    return Math.round(calorias);
  }

  const targetCalories = getTargetCalories();
  const targetProtein = profile ? Math.round(profile.peso * 2) : 0;

  const remainingCalories = targetCalories - totalCalories;
  const remainingProtein = targetProtein - totalProtein;

  return (
    <main className="min-h-screen bg-[#07130d] text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <h1 className="text-4xl font-bold md:text-6xl">
          Resumen diario
        </h1>

        <p className="mt-4 text-white/60">
          Controla lo que debes comer vs lo que ya has comido.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* CALORÍAS */}
          <Card
            title="Calorías"
            target={targetCalories}
            current={totalCalories}
            remaining={remainingCalories}
            unit="kcal"
          />

          {/* PROTEÍNA */}
          <Card
            title="Proteína"
            target={targetProtein}
            current={totalProtein}
            remaining={remainingProtein}
            unit="g"
          />
        </div>
      </section>
    </main>
  );
}

function Card({ title, target, current, remaining, unit }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="mt-6 space-y-4">
        <Row label="Objetivo" value={target} unit={unit} />
        <Row label="Consumido" value={current} unit={unit} />
        <Row
          label="Restante"
          value={remaining}
          unit={unit}
          highlight
        />
      </div>
    </div>
  );
}

function Row({ label, value, unit, highlight }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/60">{label}</span>
      <span
        className={`font-bold ${
          highlight ? "text-emerald-300" : ""
        }`}
      >
        {value} {unit}
      </span>
    </div>
  );
}
