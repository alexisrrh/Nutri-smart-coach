import { useEffect, useMemo, useRef } from "react";
import { trackEvent } from "../services/analytics";
import {
  Activity,
  Camera,
  ImagePlus,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { setCheckinProcessState } from "../services/checkinService";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { getWeightDiff } from "../components/checkin/checkinUtils";
import {
  AiErrorNotice,
  AiUsageCard,
  AppShell,
  PremiumEmptyState,
} from "../components/ui";
import { useCheckInLoad } from "../hooks/checkin/useCheckInLoad";
import { useCheckInForm } from "../hooks/checkin/useCheckInForm";
import { useCheckInUpload } from "../hooks/checkin/useCheckInUpload";
import { useCheckInSubmit } from "../hooks/checkin/useCheckInSubmit";
import { useAiUsageStatus } from "../hooks/useAiUsageStatus";

export function CheckIn() {
  const clearMessageRef = useRef(() => {});

  const {
    error,
    history,
    isMountedRef,
    loading,
    profile,
    initialLoading,
    selectedCheckin,
    setError,
    setLoading,
    setSelectedCheckin,
    setSheetMode,
    sheetMode,
    user,
  } = useCheckInLoad();

  const { form, handleChange, resetForm, setShowMeasures, showMeasures } =
    useCheckInForm();
  const { clearUpload, file, handlePhoto, preview } = useCheckInUpload({
    setError,
    setMessage: (...args) => clearMessageRef.current(...args),
  });
  const { refreshUsage, usage } = useAiUsageStatus(
    "checkin_analysis",
    user?.id || ""
  );
  const { clearMessage, message, saveCheckIn } = useCheckInSubmit({
    clearUpload,
    file,
    form,
    isMountedRef,
    resetForm,
    setError,
    setLoading,
    setSelectedCheckin,
    setSheetMode,
    onUsageUpdated: refreshUsage,
    user,
  });
  useEffect(() => {
    clearMessageRef.current = clearMessage;
  }, [clearMessage]);

useEffect(() => {
  if (!message) return;

  trackEvent("checkin_created", {
    goal: profile?.goal || profile?.objetivo || "unknown",
  });
}, [message, profile]);


  const lastCheckin = history[0];
  const previousCheckin = history[1];

  const weightDiff = useMemo(
    () => getWeightDiff(lastCheckin, previousCheckin),
    [lastCheckin, previousCheckin]
  );
  const selectedPreviousCheckin = useMemo(() => {
    if (!selectedCheckin) return null;

    const selectedIndex = history.findIndex(
      (checkin) => String(checkin.id) === String(selectedCheckin.id)
    );

    return selectedIndex >= 0 ? history[selectedIndex + 1] || null : null;
  }, [history, selectedCheckin]);

  function openCheckinSheet(checkin) {
    if (!checkin) return;
    setSheetMode("detail");
    setSelectedCheckin(checkin);
  }

function closeSheet() {
  setSelectedCheckin(null);

  setCheckinProcessState({
    status: "idle",
    result: null,
    updatedAt: new Date().toISOString(),
  });
}
  const goal = profile?.goal || profile?.objetivo || "ganar_musculo";
  const lastImage = getCheckinImage(lastCheckin);
  const previousImage = getCheckinImage(previousCheckin);
  const aiMotivation = getCheckinMotivation({
    lastCheckin,
    previousCheckin,
    weightDiff,
  });
  
  return (
    <AppShell
      contentClassName="px-2 pt-2"
      scrollClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-2.5">
        <header
          className="rounded-[20px] border p-3 shadow-[0_14px_34px_var(--app-glow)]"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-card)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
              style={{
                backgroundColor: "var(--app-primary-soft)",
                color: "var(--app-primary)",
              }}
            >
              <Activity size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[21px] font-black leading-none tracking-tight text-[var(--app-text)]">
                Check-in corporal IA
              </h1>
              <p className="mt-1 text-[11px] font-medium leading-4 text-[var(--app-muted)]">
                Foto, peso, análisis y comparación visual.
              </p>
            </div>

            <span
              className="shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: "var(--app-surface)",
                color: "var(--app-muted)",
              }}
            >
              {formatGoal(goal)}
            </span>
          </div>
        </header>

        <AiUsageCard
          profile={profile}
          type="checkin_analysis"
          usage={usage}
          className="shrink-0"
        />

        <AiErrorNotice message={error} />
        <CheckInAlert type="success" text={message} />

        <main className="space-y-2.5 pr-0.5 pb-2">
          <section
            className="rounded-[22px] border p-2.5 shadow-[0_18px_48px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-card)",
            }}
          >
            <CheckInFlowSteps
              hasPhoto={Boolean(preview)}
              hasWeight={Boolean(form.weight)}
            />

            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  Nuevo análisis
                </p>
                <h2 className="text-[16px] font-black leading-tight text-[var(--app-text)]">
                  {preview ? "Foto lista para analizar" : "Sube tu foto corporal"}
                </h2>
              </div>

              <span
                className="rounded-full border px-2 py-0.5 text-[8px] font-black uppercase"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "var(--app-primary-soft)",
                  color: "var(--app-primary)",
                }}
              >
                Frontal / lateral
              </span>
            </div>

            <div className="grid grid-cols-[112px_1fr] gap-2">
              <div>
                <label
                  htmlFor="checkin-photo"
                  className="group relative block h-[124px] cursor-pointer overflow-hidden rounded-[18px] border border-dashed ring-1 ring-[var(--app-border)] transition active:scale-[0.99]"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "var(--app-surface)",
                  }}
                >
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Foto actual"
                        className="h-full w-full object-contain p-2"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--app-bg)]/35 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div
                      className="grid h-full place-items-center text-center"
                      style={{ backgroundColor: "var(--app-surface)" }}
                    >
                      <div className="px-2">
                        <div
                          className="mx-auto grid h-9 w-9 place-items-center rounded-xl border"
                          style={{
                            borderColor: "var(--app-border)",
                            backgroundColor: "var(--app-primary-soft)",
                            color: "var(--app-primary)",
                          }}
                        >
                          <ImagePlus size={17} />
                        </div>
                        <p className="mt-2 text-[9px] font-black uppercase tracking-wide text-[var(--app-text)]">
                          Foto corporal
                        </p>
                        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
                          Toca para elegir
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    id="checkin-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />

                  {preview && (
                    <div
                      className="absolute inset-x-1.5 bottom-1.5 rounded-full px-2 py-0.5 text-center text-[8px] font-black uppercase tracking-wide backdrop-blur"
                      style={{
                        backgroundColor: "var(--app-primary)",
                        color: "var(--app-surface)",
                      }}
                    >
                      Foto lista
                    </div>
                  )}
                </label>

                <label
                  htmlFor="checkin-photo"
                  className="mt-1.5 block rounded-xl border px-2 py-1.5 text-center text-[8px] font-black uppercase tracking-wide transition active:scale-[0.98]"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "var(--app-primary-soft)",
                    color: "var(--app-primary)",
                  }}
                >
                  {preview ? "Cambiar" : "Subir foto"}
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <InputBox
                  label="Peso"
                  value={form.weight}
                  onChange={(value) => handleChange("weight", value)}
                  placeholder="72.5"
                  suffix="kg"
                />

                <button
                  type="button"
                  onClick={() => setShowMeasures((prev) => !prev)}
                  className="rounded-xl border px-3 py-2 text-left ring-1 ring-[var(--app-border)] transition active:scale-[0.98]"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "var(--app-surface)",
                  }}
                >
                  <p className="text-[9px] font-black uppercase tracking-wide text-[var(--app-primary)]">
                    Medidas
                  </p>
                  <p className="mt-0.5 text-[13px] font-black uppercase text-[var(--app-text)]">
                    Opcional
                  </p>
                </button>

                <div
                  className="rounded-xl border px-2.5 py-2"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "var(--app-primary-soft)",
                  }}
                >
                  <p className="text-[9px] font-bold leading-[1.35] text-[var(--app-muted)]">
                    Añade foto y peso para activar el análisis.
                  </p>
                </div>
              </div>
            </div>

            {showMeasures && (
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <InputBox
                  label="Cint."
                  value={form.waist}
                  onChange={(value) => handleChange("waist", value)}
                  placeholder="80"
                  suffix="cm"
                />
                <InputBox
                  label="Pecho"
                  value={form.chest}
                  onChange={(value) => handleChange("chest", value)}
                  placeholder="95"
                  suffix="cm"
                />
                <InputBox
                  label="Cadera"
                  value={form.hips}
                  onChange={(value) => handleChange("hips", value)}
                  placeholder="90"
                  suffix="cm"
                />
              </div>
            )}

            <button
              type="button"
              onClick={saveCheckIn}
              disabled={loading}
              className="group relative mt-2.5 w-full overflow-hidden rounded-[1.15rem] border px-3 py-3 text-[var(--app-text)] shadow-[0_14px_34px_var(--app-glow)] transition duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: "var(--app-border)",
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--app-primary) 40%, var(--app-surface)) 0%, var(--app-primary-soft) 50%, color-mix(in srgb, var(--app-primary) 48%, var(--app-card)) 100%)",
              }}
            >
              <span className="relative z-10 flex min-h-[48px] items-center justify-center gap-4">
                <span
                  className="relative grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-[0.95rem]"
                  style={{ backgroundColor: "var(--app-surface)" }}
                >
                  <span
                    className="absolute -inset-4 animate-[spin_2.5s_linear_infinite] rounded-full opacity-70"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, transparent 60%, var(--app-primary) 72%, transparent 90%, transparent 100%)",
                    }}
                  />
                  <span
                    className="absolute inset-[2px] rounded-[0.9rem]"
                    style={{ backgroundColor: "var(--app-card)" }}
                  />
                  <img
                    src="/icons/bodyscan-icon.png"
                    alt=""
                    aria-hidden="true"
                    className="relative z-10 h-16 w-20 object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-col items-start justify-center text-left">
                  <span className="text-[12px] font-black uppercase leading-tight tracking-[0.12em]">
                    {loading ? "ANALIZANDO..." : "ANALIZAR CON IA"}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold leading-tight text-[var(--app-muted)]">
                    Foto corporal + progreso
                  </span>
                </span>
              </span>
            </button>
          </section>

          <CheckInLoader loading={loading} />

          {!initialLoading && !loading && history.length === 0 ? (
            <PremiumEmptyState
              icon={Camera}
              title="Tu primer check-in marcará el punto de partida"
              description="Sube una foto y tu peso para activar el análisis corporal y comparar tu evolución."
              actionLabel="Subir foto"
              onAction={() => document.getElementById("checkin-photo")?.click()}
              className="shrink-0 py-4"
            />
          ) : null}

          <section
            className="rounded-[18px] border p-1.5 shadow-[0_12px_30px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-card)",
            }}
          >
            <div className="grid grid-cols-4 gap-1">
              <MiniMetric
                icon={<Scale size={11} />}
                label="Peso"
                value={lastCheckin?.weight ? `${lastCheckin.weight}kg` : "—"}
              />
              <MiniMetric
                icon={<TrendingUp size={11} />}
                label="Cambio"
                value={weightDiff || "—"}
              />
              <MiniMetric
                icon={<Target size={11} />}
                label="Grasa"
                value={shortFatValue(lastCheckin)}
              />
              <MiniMetric
                icon={<Sparkles size={11} />}
                label="Conf."
                value={lastCheckin?.confidence ? `${lastCheckin.confidence}%` : "—"}
              />
            </div>
          </section>

          <section
            className="rounded-[20px] border p-2 shadow-[0_14px_34px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-card)",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  Comparación visual
                </p>
                <h3 className="text-[14px] font-extrabold text-[var(--app-text)]">
                  Anterior vs actual
                </h3>
              </div>

              <span
                className="rounded-full px-2 py-0.5 text-[8px] font-bold uppercase"
                style={{
                  backgroundColor: "var(--app-primary-soft)",
                  color: "var(--app-primary)",
                }}
              >
                IA visual
              </span>
            </div>

            <div className="relative grid grid-cols-2 gap-1.5">
              <CompareTile
                title="Anterior"
                checkin={previousCheckin}
                image={previousImage}
                emptyText={history.length ? "Primer check-in" : "Pendiente"}
                onClick={() => openCheckinSheet(previousCheckin)}
              />
              <CompareTile
                title="Actual"
                checkin={lastCheckin}
                image={preview || lastImage}
                emptyText="Sube foto"
                onClick={() => openCheckinSheet(lastCheckin)}
              />

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[7px] font-bold uppercase backdrop-blur-xl"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--app-surface) 72%, transparent)",
                  color: "var(--app-muted)",
                }}
              >
                VS
              </div>
            </div>

            <div
              className="mt-2 rounded-xl px-2.5 py-2"
              style={{ backgroundColor: "var(--app-primary-soft)" }}
            >
              <div className="flex items-start gap-1.5">
                <Sparkles
                  size={10}
                  className="mt-0.5 shrink-0 text-[var(--app-primary)]"
                />
                <p className="line-clamp-2 text-[9px] font-bold leading-[1.35] text-[var(--app-muted)]">
                  {aiMotivation}
                </p>
              </div>
            </div>

            {previousCheckin && lastCheckin && (
              <WeeklyCompareSummary
                previousCheckin={previousCheckin}
                lastCheckin={lastCheckin}
                weightDiff={weightDiff}
              />
            )}
          </section>
        </main>

        {selectedCheckin && (
          <CheckInResultSheet
            checkin={selectedCheckin}
            previousCheckin={selectedPreviousCheckin}
            mode={sheetMode}
            onClose={closeSheet}
          />
        )}
      </div>
    </AppShell>
  );
}

function CheckInFlowSteps({ hasPhoto, hasWeight }) {
  const steps = [
    { label: "Foto", active: hasPhoto },
    { label: "Datos", active: hasWeight },
    { label: "IA", active: hasPhoto && hasWeight },
  ];

  return (
   
    <div className="mb-2 grid grid-cols-3 gap-1 rounded-full bg-[var(--app-surface)] p-0.5">

      {steps.map((step) => (
        <div
          key={step.label}
          className={`rounded-full px-2 py-1 text-center text-[9px] font-medium transition ${
            step.active
              ? "bg-[var(--app-primary)] text-[var(--app-surface)]"
              : "bg-[var(--app-primary-soft)] text-[var(--app-muted)]"
          }`}
        >
          {step.label}
        </div>
      ))}
    </div>
  );
}

function InputBox({ label, value, onChange, placeholder, suffix }) {
  return (
    <label className="block rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 ring-1 ring-[var(--app-border)] focus-within:border-[var(--app-border)]">
      <span className="text-[9px] font-black uppercase tracking-wide text-[var(--app-primary)]">
        {label}
      </span>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-black text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
        />
        {suffix && (
          <span className="text-[9px] font-black uppercase text-[var(--app-text)]/50">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function MiniMetric({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-1.5 py-1">
      <div className="mb-0.5 text-[var(--app-primary)]">{icon}</div>
      <p className="truncate text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>
      <p className="truncate text-[10px] font-black text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function CompareTile({ title, checkin, image, emptyText, onClick }) {
  const date = checkin
    ? formatDate(checkin.created_at || checkin.createdAt)
    : "Sin registro";
  const weight = checkin?.weight ? `${checkin.weight}kg` : "—";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!checkin && !image}
      className="group min-h-[94px] overflow-hidden rounded-xl bg-[var(--app-surface)] p-1.5 text-left ring-1 ring-[var(--app-primary)]/10 transition hover:bg-[var(--app-primary-soft)] hover:ring-[var(--app-border)] disabled:opacity-70"
    >
      <div className="flex h-full items-center gap-2">
        {image ? (
          <>
            <div className="relative grid h-[84px] w-[56px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[var(--app-surface)] ring-1 ring-[var(--app-border)]">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-contain p-0.5 transition duration-300 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--app-bg)]/45 to-transparent" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-bold tracking-[0.12em] text-[var(--app-primary)]/80">
                {title}
              </p>
              <p className="mt-1 truncate text-[15px] font-extrabold leading-none text-[var(--app-text)]">
                {weight}
              </p>
              <p className="mt-1 truncate text-[8px] font-medium text-[var(--app-text)]/48">
                {date}
              </p>
            </div>
          </>
        ) : (
          <div className="grid h-[84px] w-full place-items-center rounded-[14px] bg-[var(--app-surface)] text-center">
            <div>
              <div className="mx-auto grid h-7 w-7 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <Camera size={14} />
              </div>
              <p className="mt-1 text-[8px] font-black uppercase text-[var(--app-muted)]">
                {emptyText}
              </p>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

function WeeklyCompareSummary({ previousCheckin, lastCheckin, weightDiff }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <CompareChip
        label="Peso"
        value={`${formatKg(previousCheckin?.weight)} → ${formatKg(lastCheckin?.weight)}`}
      />
      <CompareChip label="Cambio" value={weightDiff || "—"} />
      <CompareChip
        label="Confianza"
        value={lastCheckin?.confidence ? `${lastCheckin.confidence}%` : "—"}
      />
      <CompareChip label="Grasa" value={shortFatValue(lastCheckin)} />
      <CompareChip
        label="Definición"
        value={getDefinitionTrend(lastCheckin)}
      />
    </div>
  );
}

function CompareChip({ label, value }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-1.5 py-0.5">
      <span className="text-[7px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </span>
      <span className="max-w-[104px] truncate text-[8px] font-black text-[var(--app-text)]">
        {value}
      </span>
    </div>
  );
}

function CheckInResultSheet({
  checkin,
  previousCheckin = null,
  mode = "detail",
  onClose,
}) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!checkin) return null;

  const image = getCheckinImage(checkin);
  const date = formatDate(checkin.created_at || checkin.createdAt);
  const hasAiResult = Boolean(
    checkin.visual_changes ||
      checkin.recommendation ||
      checkin.body_fat_range ||
      checkin.confidence
  );
  const visualChanges =
    checkin.visual_changes ||
    "La IA revisa grasa corporal, definición y consistencia entre semanas.";
  const recommendation =
    checkin.recommendation ||
    "Mantén la misma luz, postura y distancia para comparar mejor la evolución.";
  const timeline = getCheckinTimelineSummary(checkin, previousCheckin);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[var(--app-surface)] px-2 pb-[calc(156px+env(safe-area-inset-bottom))] pt-8 backdrop-blur-[6px]"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Análisis IA"
        className="flex max-h-[calc(100dvh-214px)] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-16px_48px_var(--app-glow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-3 pb-1.5 pt-2">
          <div className="mb-1.5 flex items-center justify-center">
            <div className="h-1 w-10 rounded-full bg-[var(--app-primary-soft)]" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-[12px] font-semibold text-[var(--app-text)]">
                {date}
              </p>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-[var(--app-primary)]">
                {hasAiResult ? "IA lista" : "IA base"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar análisis"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] transition hover:bg-[var(--app-primary-soft)]"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-2 flex gap-2">
            {image ? (
              <div className="relative h-[124px] w-[112px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)]">
                <img
                  src={image}
                  alt={mode === "analysis" ? "Resultado del análisis IA" : "Check-in corporal"}
                  className="h-full w-full object-contain p-2"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--app-bg)]/38 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="grid h-[124px] w-[112px] shrink-0 place-items-center rounded-[18px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-center">
                <div>
                  <Camera className="mx-auto mb-1 text-[var(--app-primary)]" size={16} />
                  <p className="text-[9px] font-black uppercase text-[var(--app-muted)]">
                    Sin foto
                  </p>
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <SheetStatRow label="Tiempo" value={timeline.timeAgo} />
              <SheetStatRow label="Cambio peso" value={timeline.weightChange} />
              <SheetStatRow label="Estado" value={timeline.status} />
              <SheetStatRow
                label="Confianza"
                value={checkin.confidence ? `${checkin.confidence}%` : "—"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Cambios detectados
              </p>
              <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-[var(--app-muted)]">
                {visualChanges}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Recomendación
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--app-muted)]">
                {recommendation}
              </p>
            </div>

            {checkin.notes ? (
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                  Nota
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--app-muted)]">
                  {checkin.notes}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function SheetStatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5">
      <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
        {label}
      </span>
      <span className="truncate text-[10px] font-black text-[var(--app-text)]">
        {value}
      </span>
    </div>
  );
}

function getCheckinImage(checkin) {
  return (
    checkin?.image_url ||
    checkin?.imageUrl ||
    checkin?.photo_url ||
    checkin?.photoUrl ||
    checkin?.preview ||
    checkin?.image ||
    ""
  );
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

function formatGoal(goal) {
  if (goal === "ganar_musculo") return "Objetivo · Ganar músculo";
  if (goal === "mantener_peso") return "Objetivo · Mantener";
  return "Objetivo · Perder grasa";
}

function getCheckinTimelineSummary(checkin, previousCheckin) {
  const currentDate = checkin?.created_at || checkin?.createdAt;
  const previousDate = previousCheckin?.created_at || previousCheckin?.createdAt;
  const timeAgo = previousDate
    ? formatDaysBetween(currentDate, previousDate)
    : "Primer dato";
  const currentWeight = Number(checkin?.weight) || 0;
  const previousWeight = Number(previousCheckin?.weight) || 0;
  const weightChange =
    currentWeight && previousWeight
      ? formatSignedKg(Number((currentWeight - previousWeight).toFixed(1)))
      : "Sin base";
  const status =
    currentWeight && previousWeight && currentWeight < previousWeight
      ? "Consistencia positiva"
      : previousCheckin
      ? "Ritmo estable"
      : "Punto inicial";

  return { timeAgo, weightChange, status };
}

function formatDaysBetween(currentDate, previousDate) {
  const currentTime = currentDate ? new Date(currentDate).getTime() : Number.NaN;
  const previousTime = previousDate ? new Date(previousDate).getTime() : Number.NaN;

  if (Number.isNaN(currentTime) || Number.isNaN(previousTime)) {
    return "Hace días";
  }

  const diffDays = Math.max(
    1,
    Math.round(Math.abs(currentTime - previousTime) / 86400000)
  );

  return `Hace ${diffDays} día${diffDays === 1 ? "" : "s"}`;
}

function formatSignedKg(value) {
  if (!value) return "0kg";

  return `${value > 0 ? "+" : ""}${value}kg`;
}

function getCheckinMotivation({ lastCheckin, previousCheckin, weightDiff }) {
  if (!lastCheckin) {
    return "Tu primer registro marcará el punto de partida.";
  }

  const visualText = String(lastCheckin.visual_changes || "").toLowerCase();

  if (visualText.includes("mejor")) {
    return "Tu constancia empieza a reflejarse visualmente.";
  }

  if (previousCheckin && weightDiff && weightDiff !== "—") {
    return "Buen progreso semanal. Mantén el mismo ritmo.";
  }

  if (previousCheckin) {
    return "Se empieza a formar una referencia clara de evolución.";
  }

  return "Primer check-in guardado. La constancia hará visible el progreso.";
}

function formatKg(value) {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return `${number}kg`;
}

function getDefinitionTrend(checkin) {
  const text = String(checkin?.visual_changes || "").toLowerCase();

  if (!text) return "No estim.";
  if (text.includes("mejor")) return "Mejorando";
  if (text.includes("defin")) return "Observada";
  if (text.includes("sin cambio") || text.includes("estable")) return "Estable";

  return "Registrada";
}

function shortFatValue(checkin) {
  const value =
    checkin?.bodyFat ||
    checkin?.body_fat ||
    checkin?.fatPercentage ||
    checkin?.fat_percentage ||
    checkin?.analysis?.bodyFat;

  if (!value) return "—";

  if (typeof value === "number") return `${value}%`;

  const text = String(value);

  if (text.length > 12) return "No estim.";
  return text;
}
