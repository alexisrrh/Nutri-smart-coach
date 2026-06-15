import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CheckInNotice() {
  const { t } = useTranslation();

  return (
    <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck
          className="mt-0.5 shrink-0 text-amber-300"
          size={16}
        />

        <p className="text-xs leading-5 text-amber-100/80">
          {t("checkin.notice.text")}
        </p>
      </div>
    </div>
  );
}
