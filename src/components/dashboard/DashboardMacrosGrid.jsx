import {
  Beef,
  Droplets,
  Flame,
  Wheat,
} from "lucide-react";

import MacroCard from "./MacroCard";

export default function DashboardMacrosGrid({
  totals,
  goals,
}) {
  return (
    <section className="grid grid-cols-4 gap-2">
      <MacroCard
        icon={<Flame size={14} />}
        label="Kcal"
        current={totals.calories}
        goal={goals.calories}
      />

      <MacroCard
        icon={<Beef size={14} />}
        label="Prot"
        current={totals.protein}
        goal={goals.protein}
        unit="g"
      />

      <MacroCard
        icon={<Wheat size={14} />}
        label="Carb"
        current={totals.carbs}
        goal={goals.carbs}
        unit="g"
      />

      <MacroCard
        icon={<Droplets size={14} />}
        label="Fat"
        current={totals.fat}
        goal={goals.fat}
        unit="g"
      />
    </section>
  );
}