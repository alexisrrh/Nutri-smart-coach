import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function Calculator() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    peso: "",
    altura: "",
    edad: "",
    genero: "hombre",
    actividad: "1.55",
    objetivo: "mantener",
  });

  const [resultado, setResultado] = useState(null);

  // 🔥 CARGAR DATOS DEL PERFIL
  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setForm({
          peso: data.peso || "",
          altura: data.altura || "",
          edad: data.edad || "",
          genero: data.genero || "hombre",
          actividad: "1.55",
          objetivo: data.objetivo || "mantener",
        });
      }
    }

    if (user) getProfile();
  }, [user]);

  function calcular(e) {
    e.preventDefault();

    const peso = Number(form.peso);
    const altura = Number(form.altura);
    const edad = Number(form.edad);
    const actividad = Number(form.actividad);

    let bmr;

    if (form.genero === "hombre") {
      bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
    } else {
      bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
    }

    let calorias = bmr * actividad;

    if (form.objetivo === "bajar") calorias -= 400;
    if (form.objetivo === "subir") calorias += 300;

    const proteina = peso * 2;

    setResultado({
      calorias: Math.round(calorias),
      proteina: Math.round(proteina),
    });
  }

  return (
    <main className="min-h-screen bg-[#07130d] text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-32">
        <h1 className="text-4xl font-bold md:text-6xl">
          Calculadora nutricional
        </h1>

        <p className="mt-4 text-white/60">
          Calculado automáticamente según tu perfil.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <form
            onSubmit={calcular}
            className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <input value={form.peso} readOnly className="input" />
            <input value={form.altura} readOnly className="input" />
            <input value={form.edad} readOnly className="input" />

            <button className="w-full rounded-xl bg-emerald-400 py-3 font-bold text-black">
              Calcular
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Resultado</h2>

            {resultado ? (
              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-white/50">Calorías</p>
                  <h3 className="text-5xl font-bold text-emerald-300">
                    {resultado.calorias}
                  </h3>
                </div>

                <div>
                  <p className="text-white/50">Proteína</p>
                  <h3 className="text-5xl font-bold text-emerald-300">
                    {resultado.proteina}g
                  </h3>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-white/60">
                Pulsa calcular para ver resultados.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}