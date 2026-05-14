import { useEffect, useState } from "react";
import { Calculator as CalculatorIcon, Flame, Ruler, Scale, Target, UserRound } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/useAuth";
import { getProfile } from "../services/profileService";

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
    async function loadProfile() {
      const profile = await getProfile(user.id);

      if (profile) {
        setForm({
          peso: profile.weight || "",
          altura: profile.height || "",
          edad: profile.age || "",
          genero: profile.gender || "male",
          actividad: getActivityFactor(profile.activity_level),
          objetivo: profile.goal || "mantener_peso",
        });
      }
    }

    if (user) loadProfile();
  }, [user]);

  function calcular(e) {
    e.preventDefault();

    const peso = Number(form.peso);
    const altura = Number(form.altura);
    const edad = Number(form.edad);
    const actividad = Number(form.actividad);

    let bmr;

    if (form.genero === "hombre" || form.genero === "male") {
      bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
    } else {
      bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
    }

    let calorias = bmr * actividad;

    if (form.objetivo === "bajar" || form.objetivo === "perder_grasa") {
      calorias -= 400;
    }

    if (form.objetivo === "subir" || form.objetivo === "ganar_musculo") {
      calorias += 300;
    }

    const proteina = peso * 2;

    setResultado({
      calorias: Math.round(calorias),
      proteina: Math.round(proteina),
    });
  }

  return (
    <main className="min-h-screen w-full bg-[#030a08] text-white md:flex md:items-center md:justify-center md:p-6">
      <section className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#06110e] px-4 pb-32 pt-5 md:min-h-[880px] md:rounded-[40px] md:border-8 md:border-[#1f2937] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,#10b98122,transparent_34%),radial-gradient(circle_at_12%_85%,#22d3ee16,transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative z-10">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#86efac]">
                <CalculatorIcon size={14} />
                Perfil
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#10b981]/10 text-[#10b981]">
                <Target size={18} />
              </div>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight">
              Calculadora nutricional
            </h1>

            <p className="mt-3 max-w-[19rem] text-sm leading-6 text-white/64">
              Calcula tus calorías y proteína usando los datos guardados en tu perfil.
            </p>
          </header>

          <form
            onSubmit={calcular}
            className="mt-4 rounded-[28px] border border-white/10 bg-[#091814]/90 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
                  Datos base
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Tu perfil</h2>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.04] text-[#86efac]">
                <UserRound size={20} />
              </div>
            </div>

            <div className="grid gap-3">
              <ReadOnlyField label="Peso" value={form.peso} unit="kg" Icon={Scale} />
              <ReadOnlyField label="Altura" value={form.altura} unit="cm" Icon={Ruler} />
              <ReadOnlyField label="Edad" value={form.edad} unit="años" Icon={UserRound} />
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#03100a] shadow-[0_16px_32px_rgba(16,185,129,0.22)] transition hover:bg-[#86efac] active:scale-[0.98]">
              <CalculatorIcon size={17} />
              Calcular
            </button>
          </form>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
                  Resultado
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Objetivo diario</h2>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                <Flame size={20} />
              </div>
            </div>

            {resultado ? (
              <div className="mt-5 grid gap-3">
                <ResultCard
                  label="Calorías"
                  value={resultado.calorias}
                  unit="kcal"
                  tone="emerald"
                />
                <ResultCard
                  label="Proteína"
                  value={resultado.proteina}
                  unit="g"
                  tone="cyan"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-white/10 bg-[#030a08]/45 p-4">
                <p className="text-sm leading-6 text-white/62">
                  Pulsa calcular para ver tu objetivo diario recomendado.
                </p>
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}

function ReadOnlyField({ label, value, unit, Icon }) {
  return (
    <label className="block rounded-[20px] border border-white/10 bg-white/[0.035] p-3">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-white/48">
        <Icon size={15} className="text-[#86efac]" />
        {label}
      </span>
      <div className="flex items-end gap-2">
        <input
          value={value}
          readOnly
          className="min-w-0 flex-1 bg-transparent text-2xl font-black tracking-tight text-white outline-none"
        />
        <span className="pb-1 text-sm font-bold text-[#86efac]">{unit}</span>
      </div>
    </label>
  );
}

function ResultCard({ label, value, unit, tone }) {
  const color = tone === "cyan" ? "text-cyan-200" : "text-[#86efac]";
  const bg = tone === "cyan" ? "bg-cyan-300/10" : "bg-[#10b981]/10";

  return (
    <div className={`rounded-[22px] border border-white/10 ${bg} p-4`}>
      <p className="text-sm font-semibold text-white/58">{label}</p>
      <p className="mt-2 text-4xl font-black leading-none tracking-tight text-white">
        {value}
        <span className={`ml-1 text-base font-black ${color}`}>{unit}</span>
      </p>
    </div>
  );
}

function getActivityFactor(activityLevel) {
  if (activityLevel === "low" || activityLevel === "sedentaria") return "1.2";
  if (activityLevel === "high" || activityLevel === "alta") return "1.725";

  return "1.55";
}
