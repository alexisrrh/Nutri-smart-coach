import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);
    if (error) {
      setError("El correo o la contraseña no son válidos");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060b13] px-6 text-slate-200 font-sans tracking-tight">
      {/* Contenedor con Glassmorphism (Efecto Cristal) */}
      <div className="relative w-full max-w-md border border-white/10 bg-[#ffffff03] p-10 backdrop-blur-2xl shadow-2xl rounded-2xl">
        
        {/* Línea de gradiente decorativa superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

        <div className="mb-10 text-center">
          {/* Icono con brillo esmeralda */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <LogIn size={30} />
          </div>
          
          {/* Título con el gradiente del Home */}
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-emerald-500/40">
            Bienvenido de nuevo
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400/80">
            Entra a tu cuenta de NutriCoach iA
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input 
            label="Correo Electrónico" 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="tu@email.com"
            icon={<Mail size={18} />}
          />

          <Input 
            label="Contraseña" 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="••••••••"
            icon={<Lock size={18} />}
          />

          {/* Botón con el estilo "Comenzar" del Home */}
          <button
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl border border-emerald-500/50 bg-emerald-500/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-[#060b13] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </span>
          </button>
        </form>

        <div className="mt-10 border-t border-white/5 pt-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

// Componente de Input estilizado igual que el Perfil del Home
function Input({ label, icon, ...props }) {
  return (
    <div className="group">
      <p className="mb-2 ml-1 text-[11px] font-black uppercase tracking-widest text-white/30 group-focus-within:text-emerald-400 transition-colors">
        {label}
      </p>
      <div className="relative flex items-center">
        <div className="absolute left-0 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors">
          {icon}
        </div>
        <input 
          {...props} 
          className="w-full border-b border-white/10 bg-transparent pl-8 py-3 font-semibold text-white text-base outline-none focus:border-emerald-500 transition-all placeholder:text-white/5" 
        />
      </div>
    </div>
  );
}
