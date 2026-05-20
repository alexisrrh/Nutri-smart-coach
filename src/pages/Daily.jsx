import { useEffect, useState } from "react";
import { Activity, Flame, Target, Utensils } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { listMeals } from "../services/mealService";
import { calculateNutritionGoals } from "../services/nutritionGoalsService";
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

  const goals = calculateNutritionGoals(profile);
  const targetCalories = goals.calories;
  const targetProtein = goals.protein;

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
  const accentText = isCyan ? "text-cyan-200" : "text-[var(--app-primary)]";
  const accentBg = isCyan ? "bg-cyan-300" : "bg-[var(--app-primary)]";
  const iconBg = isCyan ? "bg-cyan-300/10 text-cyan-200" : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]";

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
            <p className="text-sm font-semibold text-[var(--app-muted)]">Consumido</p>
            <p className="mt-1 text-4xl font-black leading-none tracking-tight">
              {current}
              <span className={`ml-1 text-base font-black ${accentText}`}>{unit}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--app-muted)]">Objetivo</p>
            <p className="mt-1 text-lg font-black text-[var(--app-text)]">{target || 0} {unit}</p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--app-surface)]">
          <div
            className={`h-full rounded-full ${accentBg} shadow-[0_0_18px_var(--app-glow)]`}
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
      <span className="text-xs font-bold text-[var(--app-muted)]">{label}</span>
      <span
        className={`mt-1 block text-lg font-black ${
          highlight ? "text-[var(--app-primary)]" : "text-[var(--app-text)]"
        }`}
      >
        {value} {unit}
      </span>
    </SurfaceCard>
  );
}
