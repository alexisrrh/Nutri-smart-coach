import { ShieldCheck } from "lucide-react";

export function CheckInNotice() {
  return (
    <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck
          className="mt-0.5 shrink-0 text-amber-300"
          size={16}
        />

        <p className="text-xs leading-5 text-amber-100/80">
          Usa una foto parecida cada semana: misma luz, distancia y postura.
          Así el progreso será más fácil de comparar.
        </p>
      </div>
    </div>
  );
}