import { Camera, ScanLine, Utensils } from "lucide-react";
import ActionCard from "./ActionCard";

export default function DashboardActions({ navigate }) {
  return (
    <section className="grid grid-cols-3 gap-2">
      <ActionCard
        icon={<Camera size={18} />}
        label="Scan"
        description="Comida IA"
        onClick={() => navigate("/foto-comida")}
      />

      <ActionCard
        icon={<Utensils size={18} />}
        label="Dieta"
        description="Plan IA"
        onClick={() => navigate("/plan-comidas")}
      />

      <ActionCard
        icon={<ScanLine size={18} />}
        label="Check"
        description="Body scan"
        onClick={() => navigate("/checkin")}
      />
    </section>
  );
}