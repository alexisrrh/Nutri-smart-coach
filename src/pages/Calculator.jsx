import { useEffect, useState } from "react";
import { Calculator as CalculatorIcon, Flame, Ruler, Scale, Target, UserRound } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getProfile } from "../services/profileService";
import {
  AppShell,
  FormField,
  MetaBadge,
  PageHeaderCard,
  PrimaryButton,
  StatCard,
  SurfaceCard,
} from "../components/ui";

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
    <AppShell>
      <PageHeaderCard
        badge="Perfil"
        badgeIcon={<CalculatorIcon size={14} />}
        icon={<Target size={18} />}
        title="Calculadora nutricional"
        description="Calcula tus calorías y proteína usando los datos guardados en tu perfil."
      />

      <SurfaceCard as="form" onSubmit={calcular} className="mt-4 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <MetaBadge variant="neutral">Datos base</MetaBadge>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Tu perfil</h2>
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

        <PrimaryButton type="submit" icon={<CalculatorIcon size={17} />} className="mt-4">
          Calcular
        </PrimaryButton>
      </SurfaceCard>

      <SurfaceCard variant="soft" className="mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <MetaBadge variant="cyan">Resultado</MetaBadge>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Objetivo diario
            </h2>
          </div>

          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <Flame size={20} />
          </div>
        </div>

        {resultado ? (
          <div className="mt-5 grid gap-3">
            <StatCard
              label="Calorías"
              value={resultado.calorias}
              unit="kcal"
              icon={<Flame size={18} />}
              tone="emerald"
            />
            <StatCard
              label="Proteína"
              value={resultado.proteina}
              unit="g"
              icon={<Target size={18} />}
              tone="cyan"
            />
          </div>
        ) : (
          <SurfaceCard variant="soft" radius="md" className="mt-5 p-4">
            <p className="text-sm leading-6 text-white/62">
              Pulsa calcular para ver tu objetivo diario recomendado.
            </p>
          </SurfaceCard>
        )}
      </SurfaceCard>
    </AppShell>
  );
}

function ReadOnlyField({ label, value, unit, Icon }) {
  return (
    <FormField label={label} icon={<Icon size={15} />}>
      <div className="flex items-end gap-2">
        <input
          value={value}
          readOnly
          className="min-w-0 flex-1 bg-transparent text-2xl font-black tracking-tight text-white outline-none"
        />
        <span className="pb-1 text-sm font-bold text-[#86efac]">{unit}</span>
      </div>
    </FormField>
  );
}

function getActivityFactor(activityLevel) {
  if (activityLevel === "low" || activityLevel === "sedentaria") return "1.2";
  if (activityLevel === "high" || activityLevel === "alta") return "1.725";

  return "1.55";
}
