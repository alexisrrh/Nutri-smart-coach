import { useState, useEffect, useRef } from "react";
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
    if (window.confirm("¿CONFIRMAR CIERRE DE SESIÓN?")) {
      localStorage.removeItem(PROFILE_KEY);
      navigate("/");
    }
  };

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...form, updatedAt: new Date().toISOString() }));
    setSaved(true);
    setTimeout(() => navigate("/dashboard"), 900);
  };

  return (
    <section className="min-h-screen bg-[#060b13] px-4 py-8 pb-32 text-slate-200 tracking-tight font-sans">
      <div className="mx-auto max-w-2xl">
        
        {/* HEADER ESTILO HOME */}
        <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400/70 hover:text-emerald-400 transition-all"
          >
            <ArrowLeft size={16} /> Volver al dashboard
          </button>
          <button 
            onClick={handleLogout} 
            className="text-xs font-bold uppercase tracking-widest text-red-500/50 hover:text-red-400 transition-all"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="relative border border-white/10 bg-[#ffffff03] p-10 backdrop-blur-2xl shadow-2xl rounded-sm">
          {/* Acento visual del home */}
          <div className="absolute top-0 left-0 h-[2px] w-20 bg-gradient-to-r from-emerald-500 to-transparent"></div>
          
          <div className="mb-12">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <UserRound size={28} />
            </div>
            
            {/* Título con gradiente como el home */}
            <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-emerald-500/50">
              Perfil Personal
            </h1>
            <p className="mt-2 text-sm font-medium text-emerald-500/60 uppercase tracking-widest">
              Configuración de usuario_
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <Input 
              label="Nombre y Apellido" 
              name="name" 
              value={form.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder="EJ. DANIEL DAVID"
            />
            
            <div className="grid gap-8 md:grid-cols-3">
              <Input label="Edad" name="age" type="number" value={form.age} onChange={(e) => handleChange("age", e.target.value)} required />
              <Input label="Peso (kg)" name="weight" type="number" value={form.weight} onChange={(e) => handleChange("weight", e.target.value)} required />
              <Input label="Altura (cm)" name="height" type="number" value={form.height} onChange={(e) => handleChange("height", e.target.value)} required />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <CustomSelect 
                label="Género" 
                value={form.gender} 
                options={[ {id: "male", label: "HOMBRE"}, {id: "female", label: "MUJER"} ]}
                onChange={(val) => handleChange("gender", val)}
              />
              <CustomSelect 
                label="Nivel de Actividad" 
                value={form.activity} 
                options={[ 
                  {id: "low", label: "SEDENTARIO"}, 
                  {id: "moderate", label: "MODERADA (3-5 DÍAS)"}, 
                  {id: "high", label: "ALTA (ATLETA)"} 
                ]}
                onChange={(val) => handleChange("activity", val)}
              />
            </div>

            <CustomSelect 
              label="Objetivo Fitness" 
              value={form.goal} 
              options={[ 
                {id: "perder_grasa", label: "PERDER GRASA"}, 
                {id: "ganar_musculo", label: "GANAR MÚSCULO"}, 
                {id: "mantener_peso", label: "MANTENER PESO"} 
              ]}
              onChange={(val) => handleChange("goal", val)}
            />

            {/* Botón con el estilo de "Comenzar" del Home */}
            <button 
              type="submit" 
              className="group relative w-full overflow-hidden border border-emerald-500/50 bg-emerald-500/10 py-5 text-sm font-black uppercase tracking-[0.4em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Save size={18} />
                Guardar Cambios
              </div>
            </button>

            {saved && (
              <div className="text-center text-xs font-black uppercase tracking-widest text-emerald-400 animate-pulse">
                PERFIL ACTUALIZADO CON ÉXITO_
              </div>
            )}
          </form>
        </div>
      </div>
      <BottomNav />
    </section>
  );
}

function CustomSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group" ref={containerRef}>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within:text-emerald-500 transition-colors">{label}</p>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between border-b py-3 cursor-pointer transition-all ${isOpen ? 'border-emerald-500 bg-white/5' : 'border-white/10 hover:border-white/30'}`}
      >
        <span className="font-bold text-white text-sm uppercase">{selectedOption?.label}</span>
        <ChevronDown size={16} className={`text-emerald-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0d141f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-in fade-in slide-in-from-top-2">
          {options.map((opt) => (
            <div 
              key={opt.id}
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
              className={`px-5 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-emerald-500 hover:text-black transition-all ${value === opt.id ? 'text-emerald-400 bg-white/5' : 'text-slate-400'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="group">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/30 group-focus-within:text-emerald-500 transition-colors">{label}</p>
      <input 
        {...props} 
        className="w-full border-b border-white/10 bg-transparent py-3 font-bold text-white text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-white/5" 
      />
    </div>
  );
}
