import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SmartSwapCard({ result }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!result) return null;

  const improvements = Array.isArray(result.improvements)
    ? result.improvements.slice(0, 1)
    : [];

  if (improvements.length === 0) return null;

  const text = cleanText(improvements[0]);

  return (
    <section
      className="rounded-[20px] border p-2.5"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-card)",
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-[var(--app-primary)]" />

          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
            {t("food.swap.title")}
          </p>
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
          {t("food.swap.badge")}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-[16px] px-2.5 py-2 text-left"
        style={{ backgroundColor: "var(--app-primary-soft)" }}
      >
        <p
          className={`text-xs leading-4 text-[var(--app-muted)] ${
            open ? "" : "line-clamp-2"
          }`}
        >
          {text}
        </p>

        <ArrowRight
          size={12}
          className={`shrink-0 text-[var(--app-primary)] transition ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
    </section>
  );
}

function cleanText(text) {
  if (!text) return "";

  return String(text)
    .replace(/\*\*/g, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}
