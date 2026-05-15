import { useEffect, useState } from "react";
import { Activity, Flame, Target, Utensils } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { listMeals } from "../services/mealService";
import { getProfile } from "../services/profileService";
import {
  AppShell,
  MetaBadge,
  PageHeaderCard,
  StatCard,
  SurfaceCard,
} from "../components/ui";

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
    <AppShell>
      <PageHeaderCard
        badge="Hoy"
        badgeIcon={<Activity size={14} />}
        icon={<Utensils size={18} />}
        title="Resumen diario"
        description="Controla lo que debes comer frente a lo que ya has registrado."
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Comidas" value={meals.length} />
        <StatCard label="Objetivo" value={targetCalories || "--"} unit="kcal" />
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
    </AppShell>
  );
}

function Card({ title, target, current, remaining, unit, Icon, accent }) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCyan = accent === "cyan";
  const accentText = isCyan ? "text-cyan-200" : "text-[#86efac]";
  const accentBg = isCyan ? "bg-cyan-300" : "bg-[#10b981]";
  const iconBg = isCyan ? "bg-cyan-300/10 text-cyan-200" : "bg-[#10b981]/10 text-[#86efac]";

  return (
    <SurfaceCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <MetaBadge variant="neutral">Balance</MetaBadge>
          <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
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
    </SurfaceCard>
  );
}

function Row({ label, value, unit, highlight }) {
  return (
    <SurfaceCard variant="soft" radius="sm" className="p-3">
      <span className="text-xs font-bold text-white/48">{label}</span>
      <span
        className={`mt-1 block text-lg font-black ${
          highlight ? "text-[#86efac]" : "text-white"
        }`}
      >
        {value} {unit}
      </span>
    </SurfaceCard>
  );
}
