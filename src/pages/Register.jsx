import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError("Error al crear la cuenta: " + error.message);
      return;
    }

    // Nota: Dependiendo de tu config de Supabase, quizás necesite verificar el correo
    // o puedes redirigir directo si tienes habilitado el autoconfirm
    navigate("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060b13] px-6 text-slate-200 font-sans tracking-tight">
      {/* Tarjeta con efecto Cristal (Glassmorphism) */}
      <div className="relative w-full max-w-md border border-white/10 bg-[#ffffff03] p-10 backdrop-blur-2xl shadow-2xl rounded-2xl">
        
        {/* Línea de gradiente decorativa superior (estilo Home) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

        <div className="mb-10 text-center">
          {/* Icono circular con brillo esmeralda */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <UserPlus size={30} />
          </div>
          
          {/* Título con el gradiente característico */}
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-emerald-500/40 uppercase">
            Únete a la IA
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400/80">
            Empieza tu cambio físico hoy mismo
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400 animate-in fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <Input 
            label="Nombre Completo" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            placeholder="Ej. Alexis R."
            icon={<User size={18} />}
          />

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
            label="Contraseña del Sistema" 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="••••••••"
            icon={<Lock size={18} />}
          />

          {/* Botón Principal (Estilo 'Comenzar' del Home) */}
          <button
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl border border-emerald-500/50 bg-emerald-500/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-[#060b13] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Registrando..." : "Crear Mi Cuenta"}
            </span>
          </button>
        </form>

        <div className="mt-10 border-t border-white/5 pt-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            ¿Ya tienes acceso?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

// Componente Reutilizable de Input (Mismo estilo que Perfil y Login)
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
