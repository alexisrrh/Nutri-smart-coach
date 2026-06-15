import { Camera, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate } from "./checkinUtils";

export function CheckInHistory({ history = [], loading = false, onSelect }) {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[var(--app-border)] bg-[#091710] px-3 py-3 shadow-2xl shadow-black/20">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />

      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History size={15} className="text-[var(--app-primary)]" />
          <h3 className="text-sm font-black uppercase italic leading-none">
            {t("checkin.history.title")}
          </h3>
        </div>

        <span className="text-[10px] font-black text-slate-500">
          {t("checkin.history.records", { count: history.length })}
        </span>
      </div>

      {loading ? (
        <p className="relative z-10 text-[10px] text-slate-400">
          {t("checkin.history.loading")}
        </p>
      ) : history.length === 0 ? (
        <div className="relative z-10 rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-4 text-center">
          <Camera className="mx-auto mb-2 text-[var(--app-primary)]" size={22} />

          <p className="text-[10px] font-black uppercase text-[var(--app-text)]">
            {t("checkin.history.emptyTitle")}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {t("checkin.history.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {history.map((item, index) => (
            <HistoryCard
              key={item.id || index}
              item={item}
              index={index}
              onClick={() => onSelect?.(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item, index, onClick }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[112px] shrink-0 overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] text-left transition hover:border-[var(--app-border)]"
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={t("checkin.history.alt")}
          className="h-[78px] w-full object-cover"
        />
      ) : (
        <div className="grid h-[78px] place-items-center bg-[var(--app-surface)] text-[10px] text-slate-500">
          {t("checkin.history.noPhoto")}
        </div>
      )}

      <div className="p-2">
        <p className="text-[10px] font-black uppercase text-[var(--app-primary)]">
          {t("checkin.history.recordLabel", { index: index + 1 })}
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          {formatDate(item.created_at)}
        </p>
      </div>
    </button>
  );
}
