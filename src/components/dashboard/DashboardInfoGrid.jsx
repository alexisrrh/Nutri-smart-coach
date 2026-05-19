import { Camera, CalendarCheck, History, Trophy } from "lucide-react";

export default function DashboardInfoGrid({
  lastMeal,
  lastCheckin,
  navigate,
  shortText,
}) {
  const hasMeal = Boolean(lastMeal);
  const hasCheckin = Boolean(lastCheckin);

  return (
    <section className="space-y-3">
      <div className="px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-primary)]/60">
          Resumen rápido
        </p>

        <h3 className="mt-1 text-lg font-black text-[var(--app-text)]">
          Tus últimos registros
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <InfoRow
          icon={<Camera size={18} />}
          title="Última comida escaneada"
          value={hasMeal ? shortText(lastMeal?.food || "Comida registrada", 34) : "Aún no has escaneado comida"}
          detail={
            hasMeal
              ? `${Math.round(lastMeal.calories || 0)} kcal · ${Math.round(
                  lastMeal.protein || 0
                )}g proteína`
              : "Sube una foto para empezar a completar tus calorías de hoy."
          }
          badge={hasMeal ? "Registrada" : "Pendiente"}
          active={hasMeal}
          onClick={() => navigate(hasMeal ? "/comidas" : "/foto-comida")}
        />

        <InfoRow
          icon={<Trophy size={18} />}
          title="Último check-in corporal"
          value={hasCheckin ? `${lastCheckin.weight || "-"} kg` : "Sin check-in todavía"}
          detail={
            hasCheckin
              ? `${formatDate(lastCheckin.created_at)} · ${
                  lastCheckin.body_fat_range || "sin estimación de grasa"
                }`
              : "Registra una foto para comparar tu check-in físico."
          }
          badge={hasCheckin ? "Actualizado" : "Pendiente"}
          active={hasCheckin}
          onClick={() => navigate("/checkin")}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/comidas")}
          className="rounded-2xl border p-4 text-left transition hover:bg-[var(--app-primary-soft)]"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
        >
            <History size={18} className="text-[var(--app-primary)]" />
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[var(--app-text)]">
              Historial
            </p>
            <p className="mt-1 text-[11px] text-[var(--app-muted)]">
              Ver comidas
            </p>
          </button>

          <button
            onClick={() => navigate("/progreso")}
          className="rounded-2xl border p-4 text-left transition hover:bg-[var(--app-primary-soft)]"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
        >
            <CalendarCheck size={18} className="text-[var(--app-primary)]" />
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[var(--app-text)]">
              Peso y medidas
            </p>
            <p className="mt-1 text-[11px] text-[var(--app-muted)]">
              Ver evolución
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, title, value, detail, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[1.7rem] border p-4 text-left transition hover:bg-[var(--app-primary-soft)]"
      style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
    >
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: "var(--app-primary-soft)" }} />

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={`theme-icon-tile grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            active
              ? "bg-[var(--app-primary)] text-[var(--app-surface)]"
              : "border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--app-muted)]">
              {title}
            </p>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-widest ${
                active
                  ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "bg-yellow-400/10 text-yellow-300"
              }`}
            >
              {badge}
            </span>
          </div>

          <p className="truncate text-base font-black text-[var(--app-text)]">
            {value}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-muted)]">
            {detail}
          </p>
        </div>
      </div>
    </button>
  );
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}
