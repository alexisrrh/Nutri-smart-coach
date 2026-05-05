import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07130d] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Iniciar sesión</h1>
        <p className="mt-2 text-white/60">Entra a tu cuenta de NutriCoach IA.</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input"
            placeholder="Email"
            type="email"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className="input"
            placeholder="Contraseña"
            type="password"
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-400 py-3 font-bold text-black disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-emerald-300">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}