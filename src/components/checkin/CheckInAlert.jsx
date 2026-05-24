import { AlertCircle, CheckCircle2 } from "lucide-react";

export function CheckInAlert({ type = "success", text = "" }) {
  if (!text) return null;

  const isError = type === "error";

  
  return (
    <div
      className={`rounded-[26px] border px-3 py-2 text-[10px] font-bold ${
        isError
          ? "border-red-400/20 bg-red-500/10 text-red-300"
          : "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
        {text}
      </div>
    </div>
  );
}
