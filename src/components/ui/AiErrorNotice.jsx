import { AlertTriangle, Clock3, ImageOff, Sparkles, WifiOff } from "lucide-react";

const NOTICE_TYPES = {
  limit: {
    icon: Sparkles,
    label: "Límite IA",
    title: "Has alcanzado tu límite diario",
    description: "Vuelve mañana o mejora tu plan cuando Premium esté disponible.",
    tone: "from-amber-300/18 via-[var(--app-card)] to-[var(--app-surface)]",
    iconClass: "text-amber-200",
  },
  rate: {
    icon: Clock3,
    label: "Pausa breve",
    title: "Espera unos segundos antes de volver a intentarlo",
    description: "La IA necesita un pequeño margen entre solicitudes.",
    tone: "from-cyan-300/14 via-[var(--app-card)] to-[var(--app-surface)]",
    iconClass: "text-cyan-100",
  },
  image: {
    icon: ImageOff,
    label: "Imagen",
    title: "La imagen es demasiado grande",
    description: "Intenta con una foto más ligera o tomada con menor resolución.",
    tone: "from-emerald-300/14 via-[var(--app-card)] to-[var(--app-surface)]",
    iconClass: "text-[var(--app-primary)]",
  },
  network: {
    icon: WifiOff,
    label: "Conexión",
    title: "La conexión no respondió",
    description: "Revisa tu red o inténtalo de nuevo en unos instantes.",
    tone: "from-red-300/14 via-[var(--app-card)] to-[var(--app-surface)]",
    iconClass: "text-red-200",
  },
  generic: {
    icon: AlertTriangle,
    label: "Aviso",
    title: "No se pudo completar la acción",
    description: "Inténtalo de nuevo en unos segundos.",
    tone: "from-red-300/14 via-[var(--app-card)] to-[var(--app-surface)]",
    iconClass: "text-red-200",
  },
};

export default function AiErrorNotice({ message = "", className = "" }) {
  if (!message) return null;

  const notice = getAiErrorNotice(message);
  const Icon = notice.icon;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-gradient-to-br ${notice.tone} p-3.5 shadow-[0_16px_40px_var(--app-glow)] ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[var(--app-primary)]/12 blur-3xl" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_0_22px_var(--app-glow)]">
          <Icon size={18} className={notice.iconClass} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            {notice.label}
          </div>
          <p className="text-sm font-black leading-5 text-[var(--app-text)]">
            {notice.title}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-[var(--app-muted)]">
            {notice.description}
          </p>
          {notice.showDetail ? (
            <p className="mt-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] font-semibold leading-4 text-[var(--app-text)]/80">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getAiErrorNotice(message) {
  const normalized = String(message || "").toLowerCase();

  if (
    normalized.includes("límite diario") ||
    normalized.includes("limite diario") ||
    normalized.includes("has alcanzado")
  ) {
    return NOTICE_TYPES.limit;
  }

  if (
    normalized.includes("espera") ||
    normalized.includes("segundos") ||
    normalized.includes("rate")
  ) {
    return NOTICE_TYPES.rate;
  }

  if (
    normalized.includes("imagen") &&
    (normalized.includes("grande") ||
      normalized.includes("pesada") ||
      normalized.includes("ligera") ||
      normalized.includes("optimizar") ||
      normalized.includes("preparar"))
  ) {
    return NOTICE_TYPES.image;
  }

  if (
    normalized.includes("conexión") ||
    normalized.includes("conexion") ||
    normalized.includes("red") ||
    normalized.includes("backend") ||
    normalized.includes("servidor") ||
    normalized.includes("timeout") ||
    normalized.includes("tardando")
  ) {
    return NOTICE_TYPES.network;
  }

  return {
    ...NOTICE_TYPES.generic,
    showDetail: true,
  };
}
