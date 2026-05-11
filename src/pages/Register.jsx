import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

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

    if (!form.nombre.trim() || !form.email.trim() || !form.password) {
      setLoading(false);
      setError("Completa todos los campos.");
      return;
    }

    if (form.password.length < 6) {
      setLoading(false);
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          nombre: form.nombre.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      setError("Error al crear la cuenta: " + error.message);
      return;
    }

    const user = data?.user;

    if (user) {
      const newProfile = {
        id: user.id,
        email: user.email,
        name: form.nombre.trim(),
        age: null,
        weight: null,
        height: null,
        gender: "male",
        activity_level: "moderate",
        goal: "perder_grasa",
        preferences: {
          gender: "male",
          activity: "moderate",
          goal: "perder_grasa",
        },
        updated_at: new Date().toISOString(),
      };

      const { data: createdProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(newProfile, { onConflict: "id" })
        .select()
        .single();

      if (profileError) {
        console.error("Error creando perfil:", profileError);
      }

      if (createdProfile) {
        localStorage.setItem(
          "nutricoach_profile",
          JSON.stringify(createdProfile)
        );
      }
    }

    setLoading(false);
    navigate("/perfil");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06110e] px-4 py-8 text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,#10b98122,transparent_35%),radial-gradient(circle_at_20%_85%,#38bdf822,transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:46px_46px]" />

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <ArrowLeft size={14} />
          Inicio
        </button>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute left-1/2 top-0 h-[2px] w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400 text-[#06110e] shadow-[0_0_35px_#10b98155]">
              <UserPlus size={30} />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">
              <Sparkles size={13} />
              Crea tu cuenta inteligente
            </div>

            <h1 className="text-3xl font-black uppercase italic tracking-tighter sm:text-4xl">
              Únete a <br></br> Nutri Smart Coach
            </h1>

            <p className="mt-4 text-md text-white/50">
              Empieza a construir tu cambio físico con IA.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-200">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre completo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Alexis Rodríguez"
              icon={<User size={18} />}
            />

            <Input
              label="Correo electrónico"
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
              placeholder="Mínimo 6 caracteres"
              icon={<Lock size={18} />}
            />

            <button
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-[0.22em] text-[#06110e] shadow-[0_20px_45px_#10b98122] transition hover:scale-[1.01] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-white/45">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-black text-emerald-300 transition hover:text-white"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/35">
        {label}
      </p>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition focus-within:border-emerald-400/50">
        <span className="text-emerald-300">{icon}</span>

        <input
          {...props}
          className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/20"
        />
      </div>
    </div>
  );
}