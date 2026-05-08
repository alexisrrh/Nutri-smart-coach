import { Sparkles, TrendingUp } from "lucide-react";

export default function SmartInsightCard({
  smartTip,
  nutritionScore,
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-[26px] border border-[#10b981]/15 bg-[#10b981]/10">
      <div className="relative">
        <div className="absolute right-0 top-0 h-28 w-28 bg-[#10b981]/20 blur-3xl" />

        <div className="relative z-10 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#10b981] text-[#06110c] shadow-[0_0_24px_#10b98155]">
              <Sparkles size={18} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#10b981]">
                  SMART INSIGHT
                </p>

                <div className="flex items-center gap-1 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1">
                  <TrendingUp
                    size={10}
                    className="text-[#10b981]"
                  />

                  <span className="text-[8px] font-black text-[#10b981]">
                    {nutritionScore}/10
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[11px] normal-case leading-5 text-emerald-100/85">
                {smartTip}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#10b981]"
                    style={{
                      width: `${nutritionScore * 10}%`,
                    }}
                  />
                </div>

                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                  AI TRACKING
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}