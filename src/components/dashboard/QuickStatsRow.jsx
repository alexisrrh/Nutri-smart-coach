import AIStat from "./AIStat";

export default function QuickStatsRow({ totals, todayMeals }) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      <AIStat
        title="Proteína"
        value={`${Math.round(totals.protein)}g`}
        color="text-[#10b981]"
      />

      <AIStat
        title="Kcal"
        value={Math.round(totals.calories)}
        color="text-orange-400"
      />

      <AIStat
        title="Estado"
        value={todayMeals.length ? "Activo" : "Pend."}
        color="text-cyan-400"
      />
    </div>
  );
}