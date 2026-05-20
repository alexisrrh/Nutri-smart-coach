import { Award, Check, Flame, Sparkles, Trophy } from "lucide-react";

export default function DailyProgressCard({ gamification }) {
  const unlockedAchievements = gamification.achievements.filter(
    (achievement) => achievement.unlocked
  );
  const visibleAchievements =
    unlockedAchievements.length > 0
      ? unlockedAchievements.slice(0, 3)
      : gamification.achievements.slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-3 shadow-[0_18px_54px_var(--app-glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,var(--app-primary-soft),transparent_42%),radial-gradient(circle_at_94%_38%,color-mix(in_srgb,var(--app-primary)_16%,transparent),transparent_34%)]" />
      <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-[var(--app-primary)]/55 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--app-primary)]/70">
              Daily Progress
            </p>
            <h2 className="mt-1 text-[18px] font-black leading-none text-[var(--app-text)]">
              Tu progreso de hoy
            </h2>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_24px_var(--app-glow)]">
            <Flame size={20} />
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-[var(--app-muted)]">
              Progreso
            </p>
            <p className="mt-0.5 text-[30px] font-black leading-none text-[var(--app-text)]">
              {gamification.progressPercent}
              <span className="ml-1 text-sm text-[var(--app-primary)]">%</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
              Nivel {gamification.level}
            </p>
            <p className="mt-0.5 text-[12px] font-black text-[var(--app-text)]">
              {gamification.xp} XP
            </p>
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-primary),color-mix(in_srgb,var(--app-primary)_72%,white))] shadow-[0_0_18px_var(--app-glow)] transition-all duration-700 ease-out"
            style={{ width: `${gamification.progressPercent}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {gamification.dailyItems.map((item) => (
            <DailyProgressItem key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <div className="min-w-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/70 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[var(--app-primary)]">
              <Sparkles size={12} />
              <p className="text-[8px] font-black uppercase tracking-[0.16em]">
                Resumen
              </p>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-snug text-[var(--app-muted)]">
              {gamification.dailySummary}
            </p>
          </div>

          <div className="grid min-w-[82px] place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-2 text-center">
            <p className="text-[18px] font-black leading-none text-[var(--app-text)]">
              {gamification.currentStreak}
            </p>
            <p className="mt-0.5 text-[8px] font-black uppercase leading-3 tracking-[0.14em] text-[var(--app-primary)]">
              días seguidos
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleAchievements.map((achievement) => (
            <AchievementChip
              achievement={achievement}
              key={achievement.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyProgressItem({ item }) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-2xl border px-2.5 py-2 transition-all duration-300",
        item.completed
          ? "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-text)] shadow-[0_0_18px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)]/70 text-[var(--app-muted)]",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-5 w-5 shrink-0 place-items-center rounded-lg border text-[11px]",
          item.completed
            ? "border-[var(--app-primary)]/30 bg-[var(--app-primary)] text-[var(--app-surface)]"
            : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)]",
        ].join(" ")}
      >
        {item.completed ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 truncate text-[11px] font-black">
        {item.label}
      </span>
    </div>
  );
}

function AchievementChip({ achievement }) {
  return (
    <div
      className={[
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black transition",
        achievement.unlocked
          ? "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)]/70 text-[var(--app-muted)] opacity-70",
      ].join(" ")}
    >
      {achievement.unlocked ? <Trophy size={11} /> : <Award size={11} />}
      <span className="truncate">{achievement.label}</span>
    </div>
  );
}
