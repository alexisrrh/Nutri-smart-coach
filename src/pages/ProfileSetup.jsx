import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

const PROFILE_KEY = "nutricoach_profile";

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;

  const [form, setForm] = useState({
    name: savedProfile?.name || savedProfile?.nombre || "",
    age: savedProfile?.age || savedProfile?.edad || "",
    weight: savedProfile?.weight || savedProfile?.peso || "",
    height: savedProfile?.height || savedProfile?.altura || "",
    gender: savedProfile?.gender || savedProfile?.genero || "male",
    activity: savedProfile?.activity || savedProfile?.actividad || "moderate",
    goal: savedProfile?.goal || savedProfile?.objetivo || "perder_grasa",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const calculateGoals = () => {
    const weight = Number(form.weight);
    const height = Number(form.height);
    const age = Number(form.age);

    let bmr =
      form.gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityMap = {
      low: 1.2,
      moderate: 1.55,
      high: 1.75,
    };

    let calories = bmr * activityMap[form.activity];

    if (form.goal === "perder_grasa") calories -= 350;
    if (form.goal === "ganar_musculo") calories += 250;

    const protein = weight * 2;
    const fat = weight * 0.8;
    const carbs = (calories - protein * 4 - fat * 9) / 4;

    return {
      calories: Math.max(1200, Math.round(calories)),
      protein: Math.round(protein),
      carbs: Math.max(80, Math.round(carbs)),
      fat: Math.round(fat),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Usuario no autenticado");
      return;
    }

    try {
      setSaving(true);

      const goals = calculateGoals();

      const localProfile = {
        name: form.name,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        gender: form.gender,
        activity: form.activity,
        goal: form.goal,
        goals,
        updatedAt: new Date().toISOString(),
      };

      const supabaseProfile = {
        id: user.id,
        nombre: form.name,
        edad: Number(form.age),
        peso: Number(form.weight),
        altura: Number(form.height),
        genero: form.gender,
        actividad: form.activity,
        objetivo: form.goal,
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(localProfile));

      const { error } = await supabase
        .from("profiles")
        .upsert(supabaseProfile, { onConflict: "id" });

      if (error) {
        console.error("Error Supabase:", error);
        alert("Error guardando perfil en Supabase");
        return;
      }

      setSaved(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (error) {
      console.error("Error general:", error);
      alert("Error inesperado guardando el perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 transition hover:bg-white/15"
        >
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400/20 text-emerald-300">
              <UserRound size={30} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
                NutriCoach iA
              </p>
              <h1 className="text-3xl font-black">Configura tu perfil</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <Input
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alexis"
              required
            />

            <div className="grid gap-5 md:grid-cols-3">
              <Input
                label="Edad"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                required
              />

              <Input
                label="Peso (kg)"
                name="weight"
                type="number"
                value={form.weight}
                onChange={handleChange}
                required
              />

              <Input
                label="Altura (cm)"
                name="height"
                type="number"
                value={form.height}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                label="Sexo"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </Select>

              <Select
                label="Actividad"
                name="activity"
                value={form.activity}
                onChange={handleChange}
              >
                <option value="baja">Baja</option>
                <option value="moderada">Moderada</option>
                <option value="alta">Alta</option>
              </Select>
            </div>

            <Select
              label="Objetivo principal"
              name="goal"
              value={form.goal}
              onChange={handleChange}
            >
              <option value="perder_grasa">Perder grasa</option>
              <option value="ganar_musculo">Ganar músculo</option>
              <option value="mantener_peso">Mantener peso</option>
            </Select>

            <button
              type="submit"
              disabled={saving}
              className="mt-3 flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <Save size={22} />
              {saving ? "Guardando..." : "Guardar perfil"}
            </button>

            {saved && (
              <p className="rounded-2xl bg-green-400/10 p-4 text-center font-bold text-green-300">
                ✅ Perfil guardado
              </p>
            )}
          </form>
        </div>
      </div>
      <BottomNav />
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <label>
      <p className="mb-2 font-bold text-white/80">{label}</p>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label>
      <p className="mb-2 font-bold text-white/80">{label}</p>
      <select
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-semibold text-white outline-none focus:border-emerald-400"
      >
        {children}
      </select>
    </label>
  );
}