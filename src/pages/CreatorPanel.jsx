import { ArrowLeft, Clock3, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell, MetaBadge } from "../components/ui";
import CreatorProgramCard from "../components/profile/CreatorProgramCard";

export function CreatorPanel() {
  const navigate = useNavigate();

  return (
    <AppShell
      contentClassName="!px-2 !pt-2 !pb-0"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-27"
    >
      <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-2 overflow-x-hidden rounded-[32px] border border-[var(--app-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] px-2 pb-8 pt-2 shadow-[0_18px_54px_var(--app-glow),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 32%), radial-gradient(circle at 92% 24%, color-mix(in srgb, var(--app-primary) 7%, transparent), transparent 26%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.12)_100%)]" />

        <div className="relative z-10 flex w-full flex-col gap-2.5">
          <header className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,#D4AF37_18%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-card)_94%,#07130f),color-mix(in_srgb,var(--app-surface)_88%,#101008))] p-2.5 shadow-[0_18px_54px_var(--app-glow)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 12%, color-mix(in srgb, var(--app-primary) 16%, transparent), transparent 30%), radial-gradient(circle at 92% 18%, color-mix(in srgb, #D4AF37 10%, transparent), transparent 28%)",
              }}
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
            

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border border-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
                    <Megaphone size={18} />
                  </div>
                  <div className="min-w-0">
                    <MetaBadge variant="neutral">PROGRAMA DE PARTNERS</MetaBadge>
                    <h1 className="mt-1.5 text-[17px] font-black leading-tight text-[var(--app-text)]">
                      Gana dinero recomendando NutriSmart Coach
                    </h1>
                  </div>
                </div>

                <div className="mt-2 w-full mr-5 rounded-[1.05rem] border border-[color-mix(in_srgb,#D4AF37_26%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,#D4AF37_13%,var(--app-surface)),color-mix(in_srgb,var(--app-card)_94%,transparent))] py-2 shadow-[0_0_28px_color-mix(in_srgb,#D4AF37_15%,transparent),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                    <div className="min-w-0">
                      <span className="block text-[46px] font-black leading-none tracking-tight text-[#D4AF37] sm:text-[52px]">
                        30%
                      </span>
                    </div>
                    <p className="min-w-0 break-words text-left text-[11px] font-black leading-4 text-[var(--app-text)] sm:text-[12px]">
                      Comisión por cada suscripción Premium válida
                    </p>
                  </div>
                </div>

                <div className="mt-2 inline-flex ml-10 items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,#38bdf8_18%,var(--app-border))] bg-[color-mix(in_srgb,#38bdf8_8%,var(--app-surface))] px-2 py-1 text-[9px] font-black uppercase tracking-[0.04em] text-[var(--app-muted)]">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,#38bdf8_14%,transparent)] text-[#38bdf8]">
                    <Clock3 size={10} />
                  </span>
                  Solicitudes revisadas en 24-72 horas.
                </div>
              </div>
            </div>
          </header>

          <CreatorProgramCard />
        </div>
      </div>
    </AppShell>
  );
}

export default CreatorPanel;
