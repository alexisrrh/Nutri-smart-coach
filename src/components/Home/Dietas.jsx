import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Flame } from "lucide-react";
import { NavNavigation } from "./NavNavigation";

import dietashome from "../../../public/dietashome.jpeg";
import tortilla from "../../assets/tortilla.jpg";
import bowlpollo from "../../assets/bowlpollo.jpg";
import salmonesparrago from "../../assets/salmonesparrago.jpg";
export function Dietas() {
  return (
    <div className="h-dvh w-full bg-[var(--app-bg)] flex items-start justify-center overflow-hidden font-sans">
      <main
        className="relative w-full max-w-[430px] h-full md:h-[880px] bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[var(--app-border)] flex flex-col overflow-hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%)] pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

        <header className="relative z-20 px-5 pt-3 shrink-0">
          <nav className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="Logo"
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-glow)] border border-[var(--app-border)]"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight text-[var(--app-text)]">
                  NUTRI<span className="text-[var(--app-primary)]">SMART</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  Coach IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)]"
              >
                INICIAR SESIÓN
              </Link>
              <Link
                to="/registro"
                className="rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)] transition-transform active:scale-95"
              >
                REGÍSTRATE
              </Link>
            </div>
          </nav>
        </header>

        <section className="relative z-10 flex flex-1 flex-col overflow-hidden px-5">
          <div className="shrink-0 pt-3 pb-2 text-center">
            <h1 className="text-[1.7rem] font-black italic uppercase tracking-tighter text-[var(--app-text)]">
              Mi Dieta <span className="text-[var(--app-primary)]">Hoy</span>
            </h1>
            <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">
              Generamos tu dieta en segundos con IA
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2.5 pb-2">
            <div className="relative shrink-0">
              <div className="relative h-[150px] w-full overflow-hidden rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_0_30px_var(--app-glow)]">
                <img
                  src={dietashome}
                  alt="Dieta personalizada"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/65 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="grid gap-2">
              <MealPreview
                image={tortilla}
                time="08:30 AM"
                title="Tortilla de claras y avena"
                info="340 kcal • 30g Pro"
              />
              <MealPreview
                image={bowlpollo}
                time="02:30 PM"
                title="Bowl de pollo y quinoa"
                info="680 kcal • 44g Pro"
                active
              />
              <MealPreview
                image={salmonesparrago}
                time="09:35 PM"
                title="Salmón con espárragos"
                info="520 kcal • 38g Pro"
              />
            </div>
          </div>
        </section>

        <footer className="relative z-30 shrink-0 bg-[var(--app-surface)]/95 backdrop-blur-2xl border-t border-[var(--app-border)]/20 pb-[env(safe-area-inset-bottom)]">
          <div className="flex flex-col w-full">
            <div className="px-5 pt-2 pb-1.5 w-full">
              <Link
                to="/registro"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-3 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all"
              >
                Iniciar Dietas
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="h-16 w-full flex items-center justify-center">
              <NavNavigation />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function MealPreview({ image, time, title, info, active = false }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
        active
          ? "border-[var(--app-border)] bg-[var(--app-primary-soft)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)]/80"
      }`}
    >
      <img
        src={image}
        alt={title}
        className="h-12 w-12 shrink-0 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1 text-left">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--app-muted)]">
          {time}
        </p>
        <h3 className="mt-0.5 truncate text-[12px] font-black uppercase italic text-[var(--app-text)]">
          {title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[var(--app-muted)]">
          <Flame size={11} className="text-amber-400" />
          {info}
        </p>
      </div>

      <CheckCircle2 size={17} className="shrink-0 text-[var(--app-primary)]" />
    </div>
  );
}