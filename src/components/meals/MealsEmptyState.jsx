import { CalendarDays, Camera } from "lucide-react";
import { PremiumEmptyState } from "../ui";

export function Empty({ onClick }) {
  return (
    <PremiumEmptyState
      icon={CalendarDays}
      title="Analiza tu primera comida"
      description="Tu historial nutricional aparecerá aquí con calorías, macros e insights de cada plato."
      actionLabel={
        <span className="inline-flex items-center gap-2">
          <Camera size={15} />
          Escanear comida
        </span>
      }
      onAction={onClick}
    />
  );
}
