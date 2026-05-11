import { AlertCircle, CheckCircle2 } from "lucide-react";

export function CheckInAlert({ type = "success", text = "" }) {
  if (!text) return null;

  const isError = type === "error";

  return (
    <div
      className={`rounded-[26px] border p-3 text-xs font-bold ${
        isError
          ? "border-red-400/20 bg-red-500/10 text-red-300"
          : "border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]"
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
        {text}
      </div>
    </div>
  );
}