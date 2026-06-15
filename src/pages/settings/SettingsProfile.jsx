import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BrainCircuit,
  Calendar,
  Save,
  Sparkles,
  Target,
  UserRound,
  Weight,
  Ruler,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";
import { getProfile, saveProfile } from "../../services/profileService";
import { calculateNutritionGoals } from "../../services/nutritionGoalsService";
import { FormField, MetaBadge, StatusBox, SurfaceCard } from "../../components/ui";
import { SettingsScreenShell } from "./SettingsShared";

export function SettingsProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity: "moderate",
    goal: "perder_grasa",
    mealsPerDay: "4",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();
        const currentUser = sessionUser || user;

        if (!currentUser?.id) {
          navigate("/login");
          return;
        }

        const nextProfile = await getProfile(currentUser.id);

        if (!active) return;

        setForm({
          name: nextProfile?.name || "",
          age: nextProfile?.age || "",
          weight: nextProfile?.weight || "",
          height: nextProfile?.height || "",
          gender: nextProfile?.gender || "male",
          activity: nextProfile?.activity_level || "moderate",
          goal: nextProfile?.goal || "perder_grasa",
          mealsPerDay: String(
            nextProfile?.meals_per_day || nextProfile?.preferences?.meals_per_day || 4
          ),
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || t("settings.profile.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [navigate, user, t]);

  const goals = useMemo(
    () =>
      calculateNutritionGoals({
        weight: form.weight,
        height: form.height,
        age: form.age,
        gender: form.gender,
        activity_level: form.activity,
        goal: form.goal,
        preferences: { meals_per_day: Number(form.mealsPerDay) },
      }),
    [form]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;

      if (!currentUser?.id) {
      setError(t("settings.profile.noUser"));
        return;
      }

      await saveProfile({
        id: currentUser.id,
        user_id: currentUser.id,
        email: currentUser.email,
        name: form.name.trim(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        gender: form.gender,
        activity_level: form.activity,
        goal: form.goal,
        meals_per_day: Number(form.mealsPerDay),
        preferences: {
          gender: form.gender,
          activity: form.activity,
          goal: form.goal,
          meals_per_day: Number(form.mealsPerDay),
        },
        updated_at: new Date().toISOString(),
      });

      setSuccess(t("settings.profile.saved"));
      setTimeout(() => navigate("/perfil"), 700);
    } catch (saveError) {
      setError(saveError.message || t("settings.profile.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SettingsScreenShell
        badge={t("settings.profile.badge")}
        title={t("settings.profile.title")}
        subtitle={t("settings.profile.loadingSubtitle")}
        onBack={() => navigate("/perfil")}
      >
        <ProfileCoreSkeleton />
      </SettingsScreenShell>
    );
  }

  return (
      <SettingsScreenShell
      badge={t("settings.profile.badge")}
      title={t("settings.profile.title")}
      subtitle={t("settings.profile.subtitle")}
      onBack={() => navigate("/perfil")}
    >
      {error ? <StatusBox type="error">{error}</StatusBox> : null}
      {success ? <StatusBox type="success">{success}</StatusBox> : null}

      <AIProfileCore
        goal={goalLabel(form.goal, t)}
        activity={activityLabel(form.activity, t)}
        calories={goals.calories}
      />

      <form
        onSubmit={handleSubmit}
      className="space-y-3 pb-1"
      >
        <ProfileModule
          icon={<UserRound size={16} />}
          title={t("settings.profile.data")}
          description={t("settings.profile.dataDesc")}
          tone="base"
          badge={t("settings.profile.compact")}
        >
          <CompactField
            icon={<UserRound size={14} />}
            label={t("settings.profile.name")}
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            placeholder="Ej. Alexis Rodríguez"
          />
          <div className="grid grid-cols-3 gap-1.5">
            <CompactField
              icon={<Calendar size={14} />}
              label={t("settings.profile.age")}
              type="number"
              value={form.age}
              onChange={(value) => setForm((current) => ({ ...current, age: value }))}
            />
            <CompactField
              icon={<Weight size={14} />}
              label={t("settings.profile.weight")}
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(value) => setForm((current) => ({ ...current, weight: value }))}
              suffix="kg"
            />
            <CompactField
              icon={<Ruler size={14} />}
              label={t("settings.profile.height")}
              type="number"
              value={form.height}
              onChange={(value) => setForm((current) => ({ ...current, height: value }))}
              suffix="cm"
            />
          </div>

          <CompactChoiceGroup
            icon={<UserRound size={14} />}
            label={t("settings.profile.gender")}
            value={form.gender}
            options={[
              { id: "male", label: t("settings.profile.genderOptions.male") },
              { id: "female", label: t("settings.profile.genderOptions.female") },
            ]}
            onChange={(value) => setForm((current) => ({ ...current, gender: value }))}
          />
        </ProfileModule>

        <ProfileModule
          icon={<Target size={16} />}
          title={t("settings.profile.system")}
          description={t("settings.profile.systemDesc")}
          tone="metabolic"
          badge={t("settings.profile.core")}
        >
          <CompactChoiceGroup
            icon={<Target size={14} />}
            label={t("settings.profile.goal")}
            value={form.goal}
            options={[
              { id: "perder_grasa", label: t("settings.profile.goalOptions.lose") },
              { id: "ganar_musculo", label: t("settings.profile.goalOptions.gain") },
              { id: "mantener_peso", label: t("settings.profile.goalOptions.maintain") },
            ]}
            onChange={(value) => setForm((current) => ({ ...current, goal: value }))}
          />

          <div className="mt-2">
            <CompactChoiceGroup
              icon={<Activity size={14} />}
              label={t("settings.profile.activity")}
              value={form.activity}
              options={[
              { id: "low", label: t("settings.profile.activityOptions.low") },
              { id: "moderate", label: t("settings.profile.activityOptions.moderate") },
              { id: "high", label: t("settings.profile.activityOptions.high") },
              ]}
              onChange={(value) => setForm((current) => ({ ...current, activity: value }))}
            />
          </div>
        </ProfileModule>

        <ProfileModule
          icon={<Activity size={16} />}
          title={t("settings.profile.nutrition")}
          description={t("settings.profile.nutritionDesc")}
          tone="nutrition"
          badge={t("settings.profile.rhythm")}
        >
          <CompactChoiceGroup
            icon={<Activity size={14} />}
            label={t("settings.profile.mealsPerDay")}
            value={form.mealsPerDay}
            options={[
              { id: "3", label: "3" },
              { id: "4", label: "4" },
              { id: "5", label: "5" },
              { id: "6", label: "6" },
            ]}
            onChange={(value) => setForm((current) => ({ ...current, mealsPerDay: value }))}
          />
        </ProfileModule>

        <div className="pt-1 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="rounded-[1.35rem] border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_82%,transparent)] p-2.5 shadow-[0_18px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <button
            type="submit"
            disabled={saving}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[1.15rem] bg-[var(--app-primary)] px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-surface)] shadow-[0_16px_32px_var(--app-glow)] transition duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Save size={16} />
                {saving ? t("settings.profile.saving") : t("settings.profile.save")}
            </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--app-primary-soft)] to-transparent transition duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </form>
    </SettingsScreenShell>
  );
}

function CompactField({ icon, label, suffix, onChange, ...props }) {
  return (
    <FormField label={label} icon={icon}>
      <div className="flex items-center gap-2 rounded-[1.1rem] border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--app-border)] transition duration-200 focus-within:border-[var(--app-primary)]/35 focus-within:bg-[var(--app-primary-soft)]/35 focus-within:shadow-[0_0_0_1px_var(--app-primary),0_0_18px_var(--app-glow)]">
        <input
          {...props}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-w-0 bg-transparent text-[13px] font-medium text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
        />
        {suffix ? (
          <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_92%,transparent)] px-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--app-muted)] shadow-[inset_0_0_0_1px_var(--app-border)]">
            {suffix}
          </span>
        ) : null}
      </div>
    </FormField>
  );
}

function CompactChoiceGroup({ icon, label, options, onChange, value }) {
  return (
    <FormField label={label} icon={icon}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`relative inline-flex min-h-9 items-center justify-center rounded-full border px-3.5 py-2 text-[11px] font-medium transition duration-200 active:scale-[0.98] touch-manipulation ${
                active
                  ? "border-[var(--app-primary)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary-soft)_78%,transparent),color-mix(in_srgb,var(--app-primary-soft)_48%,transparent))] text-[var(--app-text)] shadow-[0_10px_24px_var(--app-glow),inset_0_0_0_1px_color-mix(in_srgb,var(--app-primary)_18%,transparent)] ring-1 ring-[var(--app-primary)]/20 translate-y-[-1px]"
                  : "border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] text-[var(--app-muted)] hover:bg-[var(--app-primary-soft)]/40 active:bg-[var(--app-primary-soft)]/40"
              }`}
              aria-pressed={active}
            >
              <span
                className={`absolute inset-0 rounded-full transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background:
                    "linear-gradient(180deg,color-mix(in srgb,var(--app-primary-soft) 24%, transparent), transparent)",
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    active
                      ? "bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]"
                      : "bg-[var(--app-muted)]/50"
                  }`}
                />
                <span className={active ? "font-semibold text-[var(--app-text)]" : ""}>
                  {option.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}

function AIProfileCore({ activity, calories, goal }) {
  const { t } = useTranslation();
  return (
    <SurfaceCard
      as="section"
      radius="xl"
      className="relative overflow-hidden border border-[var(--app-border)]/80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] p-3 shadow-[0_22px_64px_var(--app-glow)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--app-primary) 18%, transparent), transparent 28%), radial-gradient(circle at 86% 16%, color-mix(in srgb, var(--app-primary) 10%, transparent), transparent 22%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--app-primary) 8%, transparent), transparent 36%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--app-primary)_36%,transparent),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--app-primary)_10%,transparent))]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MetaBadge variant="neutral" icon={<BrainCircuit size={11} />}>
            {t("settings.profile.corePanel.badge")}
          </MetaBadge>
          <h2 className="mt-2 text-[20px] font-semibold leading-tight tracking-tight text-[var(--app-text)]">
            {t("settings.profile.corePanel.title")}
          </h2>
          <p className="mt-2 max-w-[24rem] text-[13px] font-medium leading-5 text-[var(--app-muted)]">
            {t("settings.profile.corePanel.subtitle")}
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]" />
          {t("settings.profile.corePanel.live")}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-1.5">
        <ProfileCoreMetric label={t("settings.profile.corePanel.objective")} value={goal} />
        <ProfileCoreMetric label={t("settings.profile.corePanel.kcalObjective")} value={calories} unit="kcal" accent />
        <ProfileCoreMetric label={t("settings.profile.corePanel.activity")} value={activity} />
        <ProfileCoreMetric label={t("settings.profile.corePanel.status")} value={t("settings.profile.corePanel.synced")} />
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-3 rounded-[1.1rem] border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_84%,transparent)] px-3 py-2.5">
        <div className="flex h-8 items-end gap-1">
          <span className="h-2 w-1 rounded-full bg-[var(--app-primary)]/40" />
          <span className="h-3 w-1 rounded-full bg-[var(--app-primary)]/60" />
          <span className="h-4 w-1 rounded-full bg-[var(--app-primary)]/80" />
          <span className="h-5 w-1 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--app-text)]">
            <Sparkles size={11} className="text-[var(--app-primary)]" />
            {t("settings.profile.corePanel.coreActive")}
          </p>
          <p className="text-[10px] font-medium leading-4 text-[var(--app-muted)]">
            {t("settings.profile.corePanel.coreBody")}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

function ProfileCoreSkeleton() {
  return (
    <SurfaceCard
      as="section"
      radius="xl"
      className="relative overflow-hidden border border-[var(--app-border)]/80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-card)_94%,#06110e),var(--app-card))] p-3"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,color-mix(in_srgb,var(--app-primary)_16%,transparent),transparent_28%),radial-gradient(circle_at_86%_16%,color-mix(in_srgb,var(--app-primary)_10%,transparent),transparent_22%)]" />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-full bg-[var(--app-surface)] animate-pulse" />
            <div className="h-6 w-44 rounded-2xl bg-[var(--app-surface)] animate-pulse" />
            <div className="h-4 w-60 rounded-full bg-[var(--app-surface)] animate-pulse" />
          </div>
          <div className="h-7 w-20 rounded-full bg-[var(--app-surface)] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-16 rounded-2xl bg-[var(--app-surface)] animate-pulse" />
          <div className="h-16 rounded-2xl bg-[var(--app-surface)] animate-pulse" />
          <div className="h-16 rounded-2xl bg-[var(--app-surface)] animate-pulse" />
          <div className="h-16 rounded-2xl bg-[var(--app-surface)] animate-pulse" />
        </div>
      </div>
    </SurfaceCard>
  );
}

function ProfileCoreMetric({ accent = false, label, unit = "", value }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.05rem] border px-2.5 py-2.5 shadow-[inset_0_0_0_1px_var(--app-border)] ${
        accent
          ? "border-[var(--app-primary)]/25 bg-[var(--app-primary-soft)] shadow-[0_0_18px_var(--app-glow)]"
          : "border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)]"
      }`}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold leading-tight text-[var(--app-text)]">
        {value}
        {unit ? <span className="ml-1 text-[10px] font-medium text-[var(--app-primary)]/70">{unit}</span> : null}
      </p>
      {accent ? (
        <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-glow)]" />
      ) : null}
    </div>
  );
}

function ProfileModule({ badge, children, description, icon, title, tone = "base" }) {
  const toneDecorations = {
    base:
      "radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--app-primary) 10%, transparent), transparent 28%), radial-gradient(circle at 92% 10%, color-mix(in srgb, var(--app-primary) 6%, transparent), transparent 20%)",
    metabolic:
      "radial-gradient(circle at 12% 12%, color-mix(in srgb, var(--app-primary) 12%, transparent), transparent 28%), radial-gradient(circle at 84% 4%, color-mix(in srgb, var(--app-primary) 6%, transparent), transparent 22%)",
    nutrition:
      "radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--app-primary) 11%, transparent), transparent 24%), radial-gradient(circle at 18% 100%, color-mix(in srgb, var(--app-primary) 6%, transparent), transparent 28%)",
  };

  return (
    <SurfaceCard
      as="section"
      radius="lg"
      className="relative overflow-hidden border border-[var(--app-border)]/80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-surface)_90%,transparent),var(--app-card))] p-0 shadow-[0_16px_36px_rgba(0,0,0,0.16)]"
      variant="soft"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: toneDecorations[tone] }}
      />
      <div className="relative z-10 flex items-start justify-between gap-3 px-3 pt-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_18px_var(--app-glow)]">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold leading-tight text-[var(--app-text)]">
              {title}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium leading-4 text-[var(--app-muted)]">
              {description}
            </span>
          </span>
        </span>
        {badge ? (
          <MetaBadge variant="neutral">{badge}</MetaBadge>
        ) : null}
      </div>

      <div className="relative z-10 border-t border-[var(--app-border)]/60 px-2.5 pb-2.5 pt-2.5">
        {children}
      </div>
    </SurfaceCard>
  );
}

function goalLabel(goal, t) {
  if (goal === "ganar_musculo") return t("settings.profile.goals.gain");
  if (goal === "mantener_peso") return t("settings.profile.goals.maintain");
  return t("settings.profile.goals.lose");
}

function activityLabel(activity, t) {
  if (activity === "low") return t("settings.profile.activityValues.low");
  if (activity === "high") return t("settings.profile.activityValues.high");
  return t("settings.profile.activityValues.moderate");
}
