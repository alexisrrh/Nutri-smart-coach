import { useEffect, useMemo, useRef } from "react";
import { trackEvent } from "../services/analytics";
import {
  Camera,
  BrainCircuit,
  ImagePlus,
  ScanLine,
  TrendingUp,
  X,
} from "lucide-react";
import { setCheckinProcessState } from "../services/checkinService";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { getWeightDiff } from "../components/checkin/checkinUtils";
import {
  AiErrorNotice,
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
  const { refreshUsage } = useAiUsageStatus(
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
          className="relative overflow-hidden rounded-[24px] border px-2.5 py-2 shadow-[0_18px_42px_var(--app-glow)]"
          style={{
            borderColor: "var(--app-border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--app-card) 96%, #08131b), var(--app-card))",
          }}
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[var(--app-primary)]/15 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--app-primary)]/35 to-transparent" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                <ScanLine size={10} />
                CHECK-IN IA
              </p>

              <h1 className="mt-1.5 whitespace-nowrap text-[21px] font-black leading-none tracking-tight text-[var(--app-text)]">
                BODY AI SCAN
              </h1>

              <p className="mt-1.25 text-[14px] font-black leading-4 text-[var(--app-primary)]">
                Haz tu check-in semanal
              </p>

              <p className="mt-1 max-w-[25rem] text-[11px] font-medium leading-4 text-[var(--app-muted)]">
                La IA compara tu cuerpo y detecta tu evolución física.
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <HeroChip icon={<Camera size={10} />} label="Foto corporal" />
                <HeroChip icon={<TrendingUp size={10} />} label="Evolución" />
                <HeroChip icon={<BrainCircuit size={10} />} label="IA" />
              </div>
            </div>

            <div className="ml-auto flex flex-col items-center gap-1">
              <div className="relative grid h-24 w-24 place-items-center rounded-full border border-[var(--app-border)] bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--app-primary)_42%,transparent),var(--app-card)_55%,#08131b)] shadow-[0_0_48px_var(--app-glow)]">
                <div className="absolute inset-0 rounded-full border border-[var(--app-primary)]/20" />
                <div className="absolute inset-[6px] rounded-full border border-[var(--app-primary)]/28 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-[13px] rounded-full border border-[var(--app-primary)]/18 bg-[radial-gradient(circle_at_50%_50%,var(--app-primary)28,transparent_62%)]" />
                <div className="absolute inset-[18px] rounded-full border border-[var(--app-border)] bg-[var(--app-card)]/85" />
                <div className="absolute left-1/2 top-2 h-[44%] w-px -translate-x-1/2 rounded-full bg-gradient-to-b from-[var(--app-primary)] via-[var(--app-primary)]/80 to-transparent shadow-[0_0_16px_var(--app-glow)]" />
                <div className="absolute left-1/2 top-[30%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--app-primary)] shadow-[0_0_14px_var(--app-glow)]" />
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-[18px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--app-primary)_24%,var(--app-surface)),var(--app-primary-soft))] text-[var(--app-primary)] shadow-[0_0_26px_var(--app-glow)]">
                  <ScanLine size={24} />
                </div>
              </div>
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-0.5 text-[7px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                AI BODY SCAN
              </span>
            </div>
          </div>
        </header>

        <AiErrorNotice message={error} />
        <CheckInAlert type="success" text={message} />

        <main className="space-y-2.5 pr-0.5 pb-2">
          <section
            className="rounded-[28px] border p-2.5 shadow-[0_18px_48px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--app-card) 96%, #08131b), var(--app-card))",
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  Paso 1
                </p>
                <h2 className="text-[16px] font-black leading-tight text-[var(--app-text)]">
                  FOTO SEMANAL
                </h2>
              </div>
            </div>

            <label
              htmlFor="checkin-photo"
              className="group relative block h-[152px] cursor-pointer overflow-hidden rounded-[26px] border border-dashed ring-1 ring-[var(--app-border)] transition active:scale-[0.99]"
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
                    className="h-full w-full object-contain p-3"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--app-bg)]/42 via-transparent to-transparent" />
                </>
              ) : (
                <div
                  className="grid h-full place-items-center px-2 text-center"
                  style={{ backgroundColor: "var(--app-surface)" }}
                >
                  <div className="px-1">
                    <div
                      className="mx-auto grid h-12 w-12 place-items-center rounded-[22px] border"
                      style={{
                        borderColor: "var(--app-border)",
                        backgroundColor: "var(--app-primary-soft)",
                        color: "var(--app-primary)",
                      }}
                    >
                      <ImagePlus size={22} />
                    </div>
                    <p className="mt-2 text-[12px] font-black uppercase tracking-wide text-[var(--app-text)]">
                      SUBE TU FOTO SEMANAL
                    </p>
                    <p className="mx-auto mt-0.5 max-w-[220px] text-[10px] font-medium leading-4 text-[var(--app-muted)]">
                      Toca para subir tu foto corporal
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

              <div
                className="absolute inset-x-3 bottom-2.5 rounded-full px-2 py-1 text-center text-[8px] font-black uppercase tracking-wide backdrop-blur"
                style={{
                  backgroundColor: preview
                    ? "var(--app-primary)"
                    : "color-mix(in srgb, var(--app-surface) 78%, transparent)",
                  color: preview ? "var(--app-surface)" : "var(--app-primary)",
                }}
              >
                {preview ? "Foto lista" : " "}
              </div>
            </label>

            <div className="rounded-[24px] border border-[var(--app-border)] bg-[var(--app-card)] p-2 shadow-[0_12px_30px_var(--app-glow)]">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                    Paso 2
                  </p>
                  <h3 className="text-[13px] font-black leading-tight text-[var(--app-text)]">
                    PESO ACTUAL
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <InputBox
                  label="Peso"
                  value={form.weight}
                  onChange={(value) => handleChange("weight", value)}
                  placeholder="72.5"
                  suffix="kg"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMeasures((prev) => !prev)}
                className="mt-1.5 inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] transition active:scale-[0.98]"
              >
                <span>{showMeasures ? "−" : "+"}</span>
                <span>{showMeasures ? "Ocultar medidas" : "Añadir medidas (opcional)"}</span>
              </button>

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
            </div>

            <button
              type="button"
              onClick={saveCheckIn}
              disabled={loading}
              className="group relative mt-2 w-full overflow-hidden rounded-[1.25rem] border px-3 py-3 text-[var(--app-text)] shadow-[0_18px_42px_var(--app-glow)] transition duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: "var(--app-border)",
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--app-primary) 46%, var(--app-surface)) 0%, var(--app-primary-soft) 48%, color-mix(in srgb, var(--app-primary) 54%, var(--app-card)) 100%)",
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
                      {loading ? "ANALIZANDO..." : "GENERAR INFORME IA"}
                    </span>
                    <span className="mt-0.5 text-[10px] font-bold leading-tight text-[var(--app-muted)]">
                    Informe IA semanal
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
            className="rounded-[28px] border p-3 shadow-[0_18px_48px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--app-card) 96%, #08131b), var(--app-card))",
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  3. Genera tu informe
                </p>
                <h3 className="text-[17px] font-black leading-tight text-[var(--app-text)]">
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
                BLOQUE PRINCIPAL
              </span>
            </div>

            <div className="relative grid grid-cols-2 gap-2">
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
          </section>

          <section
            className="rounded-[22px] border p-3 shadow-[0_14px_34px_var(--app-glow)]"
            style={{
              borderColor: "var(--app-border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--app-card) 95%, #08131b), var(--app-card))",
            }}
          >
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
              BODY AI REPORT
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <ReportMetric
                label="Estado corporal"
                value={lastCheckin ? "Progreso registrado" : "Sin base"}
              />
              <ReportMetric
                label="Cambio detectado"
                value={lastCheckin ? `${weightDiff || "0kg"}` : "—"}
              />
            </div>

            <div className="mt-2 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-2.5 shadow-[0_0_24px_var(--app-glow)]">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Recomendación IA
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--app-muted)]">
                {aiMotivation}
              </p>
            </div>
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

function HeroChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-text)]">
      <span className="text-[var(--app-primary)]">{icon}</span>
      {label}
    </span>
  );
}

function ReportMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
      <p className="text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-black leading-4 text-[var(--app-text)]">
        {value}
      </p>
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
      className="group min-h-[174px] overflow-hidden rounded-2xl bg-[var(--app-surface)] p-1.5 text-left ring-1 ring-[var(--app-primary)]/10 transition hover:bg-[var(--app-primary-soft)] hover:ring-[var(--app-border)] disabled:opacity-70"
    >
      <div className="flex h-full flex-col gap-2">
        {image ? (
          <>
            <div className="relative grid h-[130px] w-full shrink-0 place-items-center overflow-hidden rounded-[16px] bg-[var(--app-surface)] ring-1 ring-[var(--app-border)]">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-contain p-1.5 transition duration-300 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--app-bg)]/45 to-transparent" />
            </div>

            <div className="min-w-0 px-0.5">
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
          <div className="grid h-full w-full place-items-center rounded-[16px] bg-[var(--app-surface)] text-center">
            <div>
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <Camera size={18} />
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
  const confidenceValue = Number(checkin.confidence || 0);
  const hasConfidence = Number.isFinite(confidenceValue) && confidenceValue > 0;
  const score = hasConfidence
    ? Math.max(0, Math.min(Math.round(confidenceValue), 100))
    : null;
  const confidenceLabel =
    score === null
      ? "Confianza pendiente"
      : score >= 70
      ? "Confianza alta"
      : score >= 40
      ? "Confianza media"
      : "Confianza baja";
  const isLowConfidence = score !== null && score < 20;
  const isFirstCheckin = !previousCheckin;
  const previousConfidenceValue = Number(previousCheckin?.confidence || 0);
  const hasPreviousScore =
    Number.isFinite(previousConfidenceValue) && previousConfidenceValue > 0;
  const previousScore = hasPreviousScore
    ? Math.max(0, Math.min(Math.round(previousConfidenceValue), 100))
    : null;
  const scoreDelta =
    score !== null && previousScore !== null ? score - previousScore : null;
  const scoreClass = getScoreClass(score);
  const trend = getVisualTrend(scoreDelta);
  const streakWeeks = previousCheckin ? 2 : checkin ? 1 : 0;
  const visualChanges =
    checkin.visual_changes ||
    "La IA revisa grasa corporal, definición y consistencia entre semanas.";
  const recommendation =
    checkin.recommendation ||
    "Mantén la misma luz, postura y distancia para comparar mejor la evolución.";
  const timeline = getCheckinTimelineSummary(checkin, previousCheckin);
  const detectionText = `${visualChanges} ${recommendation}`.toLowerCase();
  const hasImageIssue =
    isLowConfidence ||
    detectionText.includes("no válida") ||
    detectionText.includes("invalida") ||
    detectionText.includes("borrosa") ||
    detectionText.includes("no pudo") ||
    detectionText.includes("confianza baja");
  const detectionBullets = buildDetectionBullets(visualChanges, {
    hasImageIssue,
    isLowConfidence,
    previousCheckin,
    weightDiff: timeline.weightChange,
  });
  const issueReason = getLowConfidenceReason(visualChanges, recommendation);

  function buildDetectionBullets(text, context) {
    if (context.hasImageIssue) {
      return [
        { text: context.isLowConfidence ? "Confianza baja" : "Foto no válida", warning: true },
        { text: "La imagen necesita mejores condiciones", warning: true },
      ];
    }

    const normalized = String(text || "")
      .replace(/\n/g, ".")
      .split(/[.;]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (normalized.length > 0) {
      return normalized.map((item) => ({
        text: item.charAt(0).toUpperCase() + item.slice(1),
        warning: false,
      }));
    }

    return [
      { text: "Mejor definición corporal", warning: false },
      {
        text:
          context.previousCheckin && context.weightDiff !== "Sin base"
            ? "Comparación semanal registrada"
            : "Punto inicial creado",
        warning: false,
      },
      { text: "Consistencia positiva", warning: false },
    ];
  }

  function getLowConfidenceReason(changes, nextRecommendation) {
    const source = String(changes || nextRecommendation || "").trim();
    if (!source) {
      return "La imagen no ofrece suficiente información visual para un análisis fiable.";
    }

    return source.length > 120 ? `${source.slice(0, 117)}...` : source;
  }

  function getScoreClass(nextScore) {
    if (nextScore === null) return "Sin clasificar";
    if (nextScore <= 39) return "Inicial";
    if (nextScore <= 59) return "En progreso";
    if (nextScore <= 79) return "Bueno";
    if (nextScore <= 89) return "Excelente";
    return "Élite";
  }

  function getVisualTrend(delta) {
    if (delta === null) return "Completa más check-ins para ver tu evolución";
    if (delta > 2) return "📈 Mejorando";
    if (delta < -2) return "📉 Retroceso";
    return "➖ Estable";
  }

  function formatDelta(delta) {
    if (delta === null) return "—";
    if (delta === 0) return "0";
    return `${delta > 0 ? "+" : ""}${delta}`;
  }

  function renderEvolutionStat(label, value, active = false) {
    return (
      <div
        key={label}
        className="rounded-2xl border px-2 py-2"
        style={{
          borderColor: "var(--app-border)",
          backgroundColor: active ? "var(--app-primary-soft)" : "var(--app-surface)",
        }}
      >
        <p className="truncate text-[7px] font-black uppercase tracking-wide text-[var(--app-muted)]">
          {label}
        </p>
        <p
          className="mt-1 truncate text-[14px] font-black leading-none"
          style={{ color: active ? "var(--app-primary)" : "var(--app-text)" }}
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-[var(--app-surface)] px-2 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(var(--bottom-nav-space)+env(safe-area-inset-bottom)+24px)] backdrop-blur-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Análisis IA"
        className="flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[30px] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_-18px_56px_var(--app-glow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-3 pt-2">
          <div className="flex items-center justify-center">
            <div className="h-1 w-10 rounded-full bg-[var(--app-primary-soft)]" />
          </div>
        </div>

        <div className="px-3 pb-5 pt-2">
          <section
            className="mb-2 overflow-hidden rounded-[22px] border border-[var(--app-border)] px-3 py-2 shadow-[0_12px_32px_var(--app-glow)]"
            style={{ backgroundColor: "var(--app-surface)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
                  Body Score IA
                </p>
                <div className="mt-1 flex min-w-0 items-end gap-2">
                  <div className="flex shrink-0 items-end gap-1">
                    <span className="text-[32px] font-black leading-none text-[var(--app-text)]">
                      {score ?? "--"}
                    </span>
                    <span className="pb-0.5 text-[11px] font-black text-[var(--app-muted)]">
                      / 100
                    </span>
                  </div>
                  <span className="mb-0.5 truncate text-[10px] font-black uppercase tracking-wide text-[var(--app-muted)]">
                    {scoreClass}
                  </span>
                </div>
                <p
                  className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide"
                  style={{
                    backgroundColor: "var(--app-primary-soft)",
                    color: "var(--app-primary)",
                  }}
                >
                  {confidenceLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar análisis"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] transition hover:bg-[var(--app-primary-soft)]"
              >
                <X size={14} />
              </button>
            </div>
          </section>

          <section
            className="mb-2 rounded-[22px] border border-[var(--app-border)] p-2 shadow-[0_14px_34px_var(--app-glow)]"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                  Evolución corporal
                </p>
                <h3 className="text-[14px] font-black leading-tight text-[var(--app-text)]">
                  {previousScore === null
                    ? "Completa más check-ins para ver tu evolución"
                    : trend}
                </h3>
              </div>
              <span
                className="rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wide"
                style={{
                  backgroundColor: "var(--app-primary-soft)",
                  color: "var(--app-primary)",
                }}
              >
                🔥 {streakWeeks} semana{streakWeeks === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {renderEvolutionStat(
                "Score anterior",
                previousScore === null ? "—" : `${previousScore}`
              )}
              {renderEvolutionStat("Score actual", score === null ? "—" : `${score}`)}
              {renderEvolutionStat(
                "Diferencia visual",
                formatDelta(scoreDelta),
                scoreDelta !== null
              )}
            </div>

            {previousScore === null ? (
              <p className="mt-1.5 rounded-xl bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-bold leading-3 text-[var(--app-muted)]">
                Completa más check-ins para ver tu evolución.
              </p>
            ) : null}
          </section>

          <section className="mb-2">
            {image ? (
              <div className="relative h-[246px] overflow-hidden rounded-[26px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_18px_50px_var(--app-glow)]">
                <img
                  src={image}
                  alt={mode === "analysis" ? "Resultado del análisis IA" : "Check-in corporal"}
                  className="h-full w-full object-contain p-3"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--app-bg)]/42 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full border border-[var(--app-border)] bg-[var(--app-card)]/86 px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-[var(--app-primary)] backdrop-blur">
                  Imagen analizada
                </span>
              </div>
            ) : (
              <div className="grid h-[240px] place-items-center rounded-[26px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-center">
                <div>
                  <Camera className="mx-auto mb-2 text-[var(--app-primary)]" size={24} />
                  <p className="text-[10px] font-black uppercase text-[var(--app-muted)]">
                    Sin foto
                  </p>
                </div>
              </div>
            )}
          </section>

          {!isFirstCheckin ? (
            <div className="mb-2 grid grid-cols-3 gap-1.5">
              <SheetStatRow label="Tiempo" value={timeline.timeAgo} />
              <SheetStatRow label="Cambio" value={timeline.weightChange} />
              <SheetStatRow label="Estado" value={timeline.status} />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Lo que detectó la IA
              </p>
              <div className="mt-2 space-y-1.5">
                {detectionBullets.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5"
                  >
                    <span
                      className="mt-0.5 text-[10px] font-black"
                      style={{ color: item.warning ? "#fbbf24" : "var(--app-primary)" }}
                    >
                      {item.warning ? "⚠" : "✓"}
                    </span>
                    <p className="text-[11px] font-bold leading-4 text-[var(--app-text)]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Qué significa este resultado
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--app-muted)]">
                {recommendation}
              </p>
            </div>

            {isLowConfidence ? (
              <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 px-2.5 py-2 shadow-[0_12px_28px_rgba(251,191,36,0.12)]">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-200">
                  ⚠ La IA no pudo analizar correctamente esta imagen.
                </p>
                <div className="mt-2 rounded-xl bg-[var(--app-card)] px-2 py-1.5">
                  <p className="text-[8px] font-black uppercase tracking-wide text-[var(--app-muted)]">
                    Motivo
                  </p>
                  <p className="mt-1 text-[11px] font-bold leading-4 text-[var(--app-text)]">
                    {issueReason}
                  </p>
                </div>
                <div className="mt-2 grid gap-1">
                  {["Sube una foto real", "Buena iluminación", "Cuerpo completo"].map(
                    (step) => (
                      <p
                        key={step}
                        className="rounded-xl bg-[var(--app-card)] px-2 py-1 text-[10px] font-black text-[var(--app-text)]"
                      >
                        ✓ {step}
                      </p>
                    )
                  )}
                </div>
              </div>
            ) : null}

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

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-primary)]">
                Próximo paso
              </p>
              <div className="mt-2 grid gap-1">
                {[
                  "Realiza un nuevo check-in en 7 días",
                  "Mantén la misma postura para comparar mejor",
                  "Sigue tu plan actual",
                ].map((step) => (
                  <p
                    key={step}
                    className="rounded-xl bg-[var(--app-primary-soft)] px-2 py-1 text-[10px] font-black text-[var(--app-text)]"
                  >
                    ✓ {step}
                  </p>
                ))}
              </div>
            </div>
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
