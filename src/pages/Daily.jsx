import { useEffect, useState } from "react";
import { Activity, Flame, Target, Utensils } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/useAuth";
import { listMeals } from "../services/mealService";
import { getProfile } from "../services/profileService";

export function Daily() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    async function loadData() {
      const profileData = await getProfile(user.id);

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
      profile.genero === "female" || profile.genero === "mujer"
        ? 10 * peso + 6.25 * altura - 5 * edad - 161
        : 10 * peso + 6.25 * altura - 5 * edad + 5;

    let factor = 1.55;

    if (profile.actividad === "low" || profile.actividad === "sedentaria") factor = 1.2;
    if (profile.actividad === "ligera") factor = 1.375;
    if (profile.actividad === "moderate" || profile.actividad === "moderada") factor = 1.55;
    if (profile.actividad === "high" || profile.actividad === "alta") factor = 1.725;

    let calorias = bmr * factor;

    if (profile.objetivo === "bajar" || profile.objetivo === "perder_grasa") calorias -= 400;
    if (profile.objetivo === "subir" || profile.objetivo === "ganar_musculo") calorias += 300;

    return Math.round(calorias);
  }

  const targetCalories = getTargetCalories();
  const targetProtein = profile ? Math.round(profile.peso * 2) : 0;

  const remainingCalories = targetCalories - totalCalories;
  const remainingProtein = targetProtein - totalProtein;

  return (
    <main className="min-h-screen w-full bg-[#030a08] text-white md:flex md:items-center md:justify-center md:p-6">
      <section className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#06110e] px-4 pb-32 pt-5 md:min-h-[880px] md:rounded-[40px] md:border-8 md:border-[#1f2937] md:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,#10b98122,transparent_34%),radial-gradient(circle_at_10%_82%,#38bdf815,transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative z-10">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#86efac]">
                <Activity size={14} />
                Hoy
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#10b981]/10 text-[#10b981]">
                <Utensils size={18} />
              </div>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight">
              Resumen diario
            </h1>

            <p className="mt-3 max-w-[19rem] text-sm leading-6 text-white/64">
              Controla lo que debes comer frente a lo que ya has registrado.
            </p>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Comidas" value={meals.length} />
            <MiniStat label="Objetivo" value={targetCalories || "--"} unit="kcal" />
          </div>

          <div className="mt-4 space-y-3">
            <Card
              title="Calorías"
              target={targetCalories}
              current={totalCalories}
              remaining={remainingCalories}
              unit="kcal"
              Icon={Flame}
              accent="emerald"
            />

            <Card
              title="Proteína"
              target={targetProtein}
              current={totalProtein}
              remaining={remainingProtein}
              unit="g"
              Icon={Target}
              accent="cyan"
            />
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}

function MiniStat({ label, value, unit }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
      <p className="text-xs font-bold text-white/48">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-white">
        {value}
        {unit && <span className="ml-1 text-sm font-bold text-[#86efac]">{unit}</span>}
      </p>
    </div>
  );
}

function Card({ title, target, current, remaining, unit, Icon, accent }) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCyan = accent === "cyan";
  const accentText = isCyan ? "text-cyan-200" : "text-[#86efac]";
  const accentBg = isCyan ? "bg-cyan-300" : "bg-[#10b981]";
  const iconBg = isCyan ? "bg-cyan-300/10 text-cyan-200" : "bg-[#10b981]/10 text-[#86efac]";

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#091814]/90 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
            Balance
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
        </div>

        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${iconBg}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white/52">Consumido</p>
            <p className="mt-1 text-4xl font-black leading-none tracking-tight">
              {current}
              <span className={`ml-1 text-base font-black ${accentText}`}>{unit}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-white/52">Objetivo</p>
            <p className="mt-1 text-lg font-black text-white">{target || 0} {unit}</p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full ${accentBg} shadow-[0_0_18px_rgba(16,185,129,0.35)]`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Row label="Progreso" value={Math.round(progress)} unit="%" />
          <Row
            label={remaining >= 0 ? "Restante" : "Exceso"}
            value={Math.abs(remaining)}
            unit={unit}
            highlight
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, unit, highlight }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
      <span className="text-xs font-bold text-white/48">{label}</span>
      <span
        className={`mt-1 block text-lg font-black ${
          highlight ? "text-[#86efac]" : "text-white"
        }`}
      >
        {value} {unit}
      </span>
    </div>
  );
}
