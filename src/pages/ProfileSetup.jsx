import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserRound, LogOut, ChevronDown } from "lucide-react";
import BottomNav from "../components/BottomNav";

const PROFILE_KEY = "nutricoach_profile";

export function ProfileSetup() {
  const navigate = useNavigate();
  const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;

  const [form, setForm] = useState({
    name: savedProfile?.name || "",
    age: savedProfile?.age || "",
    weight: savedProfile?.weight || "",
    height: savedProfile?.height || "",
    gender: savedProfile?.gender || "male",
    activity: savedProfile?.activity || "moderate",
    goal: savedProfile?.goal || "perder_grasa",
  });

  const [saved, setSaved] = useState(false);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión?")) {
      localStorage.removeItem(PROFILE_KEY);
      navigate("/");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateGoals = () => {
    const weight = Number(form.weight);
    const height = Number(form.height);
    const age = Number(form.age);

    let bmr = form.gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityMap = { low: 1.2, moderate: 1.55, high: 1.75 };
    let calories = bmr * activityMap[form.activity];

    if (form.goal === "perder_grasa") calories -= 350;
    if (form.goal === "ganar_musculo") calories += 250;

    return {
      calories: Math.max(1200, Math.round(calories)),
      protein: Math.round(weight * 2),
      carbs: Math.max(80, Math.round((calories - (weight * 2 * 4) - (weight * 0.8 * 9)) / 4)),
      fat: Math.round(weight * 0.8),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profile = { ...form, goals: calculateGoals(), updatedAt: new Date().toISOString() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => navigate("/dashboard"), 900);
  };

  return (
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white font-mono uppercase">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 border border-emerald-500/40 bg-white/5 px-6 py-3 font-bold text-emerald-300 hover:bg-emerald-500 hover:text-[#06130d] transition-all">
            <ArrowLeft size={18} /> DASHBOARD
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-6 py-3 font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={18} /> LOGOUT
          </button>
        </div>

        <div className="border-2 border-emerald-500/20 bg-white/5 p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.1)]">
          <div className="mb-10 flex items-center gap-6 border-b border-white/10 pb-8">
            <div className="flex h-16 w-16 items-center justify-center border-2 border-emerald-500 text-emerald-400">
              <UserRound size={32} />
            </div>
            <div>
              <p className="text-xs font-black tracking-[0.4em] text-emerald-500">System.Setup</p>
              <h1 className="text-4xl font-black tracking-tighter">Tu Perfil</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-8">
            <Input label="Nombre de Usuario" name="name" value={form.name} onChange={handleChange} />
            <div className="grid gap-6 md:grid-cols-3">
              <Input label="Edad" name="age" type="number" value={form.age} onChange={handleChange} required />
              <Input label="Peso (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} required />
              <Input label="Altura (cm)" name="height" type="number" value={form.height} onChange={handleChange} required />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Select label="Sexo" name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">HOMBRE</option>
                <option value="female">MUJER</option>
              </Select>
              <Select label="Actividad" name="activity" value={form.activity} onChange={handleChange}>
                <option value="low">BAJA</option>
                <option value="moderate">MODERADA</option>
                <option value="high">ALTA</option>
              </Select>
            </div>
            <Select label="Objetivo" name="goal" value={form.goal} onChange={handleChange}>
              <option value="perder_grasa">PERDER GRASA</option>
              <option value="ganar_musculo">GANAR MÚSCULO</option>
              <option value="mantener_peso">MANTENER PESO</option>
            </Select>

            <button type="submit" className="mt-4 flex items-center justify-center gap-3 border-2 border-emerald-500 bg-emerald-500 py-6 text-xl font-black text-[#06130d] hover:bg-transparent hover:text-emerald-500 transition-all">
              <Save size={24} /> GUARDAR CONFIGURACIÓN
            </button>
          </form>
        </div>
      </div>
      <BottomNav />
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <p className="mb-2 text-xs font-bold tracking-widest text-emerald-500/60">{label}</p>
      <input 
        {...props} 
        className="w-full rounded-none border border-white/20 bg-black/40 px-5 py-4 font-bold text-white outline-none focus:border-emerald-500 transition-colors" 
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <p className="mb-2 text-xs font-bold tracking-widest text-emerald-500/60">{label}</p>
      <div className="relative">
        <select 
          {...props} 
          className="w-full appearance-none rounded-none border border-white/20 bg-black/40 px-5 py-4 font-bold text-white outline-none focus:border-emerald-500 transition-colors"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-emerald-500">
          <ChevronDown size={20} />
        </div>
      </div>
    </label>
  );
}
