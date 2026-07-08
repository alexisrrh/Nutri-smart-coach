import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Flame, Zap } from "lucide-react";
import { NavNavigation } from "./NavNavigation";

import dietashome from "../../../public/dietashome.jpeg";
import tortilla from "../../assets/tortilla.jpg";
import bowlpollo from "../../assets/bowlpollo.jpg";
import salmonesparrago from "../../assets/salmonesparrago.jpg";
export function Dietas() {
  const { t } = useTranslation();
  return (
    <div className="h-dvh w-full bg-[var(--app-bg)] flex items-start justify-center overflow-hidden font-sans">
      <main
        className="relative w-full max-w-[430px] h-full md:h-[880px] bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] md:border-8 md:border-[var(--app-border)] flex flex-col overflow-hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%)] pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

        {/* 1. HEADER FIJO */}
        <header className="home-progress-header relative z-20 px-5 pt-4 shrink-0">
          <nav className="home-progress-nav flex items-center justify-between border-b border-[var(--app-border)] pb-3.5">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt={t("home.brandAlt")}
                className="h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-glow)] border border-[var(--app-border)]"
              />
              <div className="leading-none">
                <p className="text-sm font-black italic tracking-tight text-[var(--app-text)]">
                  {t("home.brandPrefix")}<span className="text-[var(--app-primary)]">{t("home.brandSuffix")}</span>
                </p>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  {t("home.headerTagline")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)]">
                {t("home.header.login")}
              </Link>
              <Link to="/registro" className="rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)]">
                {t("home.header.register")}
              </Link>
            </div>
          </nav>
        </header>

               {/* 2. CONTENIDO SCROLLABLE */}
        <section className="relative z-10 flex-1 overflow-visible overflow-x-hidden px-5">
          
          <div className="home-dietas-body flex h-full flex-col gap-4 py-4">
            
            {/* TÍTULO */}
            <div className="text-center">
              <div className="home-home-badge mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-1 text-[9px] font-black uppercase text-[var(--app-primary)] shadow-[0_0_15px_var(--app-glow)]">
                <Zap size={11} className="fill-current" /> {t("home.hero.badge")}
              </div>
              <h1 className="text-[1.7rem] font-black italic uppercase tracking-tighter leading-none text-[var(--app-text)]">
                {t("home.mealPlans.titlePrefix")} <span className="text-[var(--app-primary)]">{t("home.mealPlans.titleAccent")}</span>
              </h1>
              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]">
                {t("home.mealPlans.subtitle")}
              </p>
            </div>

            {/* IMAGEN DE DIETAS */}
            <div className="relative shrink-0">
              <div className="relative h-[150px] w-full overflow-hidden rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_0_30px_var(--app-glow)]">
                <img
                  src={dietashome}
                  alt={t("home.mealPlans.imageAlt")}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)]/65 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* PREVISTAS DE COMIDAS */}
            <div className="grid gap-2 pb-4">
              <MealPreview
                image={tortilla}
                time={t("home.mealPlans.samples.breakfast.time")}
                title={t("home.mealPlans.samples.breakfast.title")}
                info={t("home.mealPlans.samples.breakfast.info")}
              />
              <MealPreview
                image={bowlpollo}
                time={t("home.mealPlans.samples.lunch.time")}
                title={t("home.mealPlans.samples.lunch.title")}
                info={t("home.mealPlans.samples.lunch.info")}
                active
              />
              <MealPreview
                image={salmonesparrago}
                time={t("home.mealPlans.samples.dinner.time")}
                title={t("home.mealPlans.samples.dinner.title")}
                info={t("home.mealPlans.samples.dinner.info")}
              />
            </div>

          </div>
        </section>

        {/* 3. FOOTER FIJO (Restaurado con tus clases originales de Dietas) */}
        <div className="flex flex-col w-full mt-auto shrink-0">
          
          {/* Contenedor del Botón - Volvemos a pb-10 original */}
          <div className="home-dietas-footer-cta px-5 pt-3 pb-10 w-full">
            <Link
              to="/registro"
              className="home-dietas-footer-button group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-3 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all"
            >
              {t("home.mealPlans.cta")} 
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Contenedor del Menú */}
          <div className="home-dietas-footer-nav h-16 w-full flex items-center justify-center">
            <NavNavigation />
          </div>

          {/* Tus estilos responsivos específicos para controlar la distancia en iPhones pequeños */}
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

            @media (max-height: 760px) {
              .home-dietas-footer-cta {
                padding-top: 10px;
              }
              .home-dietas-footer-button {
                padding-top: 10px;
                padding-bottom: 10px;
              }
              .home-dietas-footer-nav {
                height: 56px;
              }
            }
            @media (max-height: 700px) {
              .home-dietas-footer-nav {
                height: 50px;
              }
            }
          `}</style>

        </div>
  
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
