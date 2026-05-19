import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Camera,
  ImagePlus,
  LogOut,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { getWeightDiff } from "../components/checkin/checkinUtils";
import { createCheckin, listCheckins } from "../services/checkinService";
import {
  clearCachedProfile,
  getCachedProfile,
} from "../services/profileService";
import { AppShell, SecondaryButton } from "../components/ui";

export function CheckIn() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    weight: "",
    waist: "",
    chest: "",
    hips: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [sheetMode, setSheetMode] = useState("detail");
  const [showMeasures, setShowMeasures] = useState(false);

  const loadData = useCallback(async () => {
    setError("");
    setProfile(getCachedProfile());

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Necesitas iniciar sesión para guardar tu check-in físico.");
      return;
    }

    setUser(user);

    try {
      const checkins = await listCheckins(user.id);
      setHistory(checkins);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el historial de check-ins.");
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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

  function openAnalysisSheet() {
    if (!lastCheckin) return;
    setSheetMode("analysis");
    setSelectedCheckin(lastCheckin);
  }

  function openCheckinSheet(checkin) {
    if (!checkin) return;
    setSheetMode("detail");
    setSelectedCheckin(checkin);
  }

  function closeSheet() {
    setSelectedCheckin(null);
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhoto(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Máximo 4MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setError("");
    setMessage("");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function saveCheckIn() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Necesitas iniciar sesión.");
      return;
    }

    if (!file) {
      setError("Sube una foto frontal o lateral de cuerpo completo.");
      return;
    }

    if (!form.weight) {
      setError("Introduce tu peso actual.");
      return;
    }

    try {
      setLoading(true);

      const checkin = await createCheckin({
        userId: user.id,
        image: file,
        weight: form.weight,
        waist: form.waist,
        chest: form.chest,
        hips: form.hips,
        notes: form.notes,
      });

      setHistory((prev) => [checkin, ...prev]);
      setSheetMode("analysis");
      setSelectedCheckin(checkin);

      if (preview) URL.revokeObjectURL(preview);

      setFile(null);
      setPreview(null);

      setForm({
        weight: "",
        waist: "",
        chest: "",
        hips: "",
        notes: "",
      });

      setMessage("Check-in guardado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar el check-in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    clearCachedProfile();
    navigate("/");
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
    <AppShell contentClassName="px-2 pb-[84px] pt-1.5">
      <div className="flex h-full min-h-0 flex-col gap-1 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/50">
            <Sparkles size={10} />
            AI Body Analysis
          </div>

          <SecondaryButton
            type="button"
            onClick={handleLogout}
            icon={<LogOut size={13} />}
            className="w-auto border-white/10 bg-white/[0.025] px-2 py-0.5 text-[0px] text-white/45 hover:border-red-300/25 hover:bg-red-400/10 hover:text-red-200 [&_svg]:h-3 [&_svg]:w-3"
          >
            Salir
          </SecondaryButton>
        </div>

        <section className="shrink-0 rounded-2xl border border-white/10 bg-[#080f0d]/95 p-2 shadow-none">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-emerald-100/80">
              <Activity size={14} />
            </div>

            <div className="min-w-0">
              <h1 className="text-[17px] font-black uppercase italic leading-[0.9] tracking-tight text-white">
                Check-in
              </h1>

              <p className="mt-0.5 text-[9px] leading-3 text-white/50">
                Foto corporal, IA y comparación semanal.
              </p>

              <span className="mt-1 inline-flex rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[7px] font-black uppercase tracking-wide text-white/45">
                {formatGoal(goal)}
              </span>
            </div>
          </div>
        </section>

        <CheckInAlert type="error" text={error} />
        <CheckInAlert type="success" text={message} />

        <main className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-h-full flex-col gap-1.5">
            <section className="shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#080f0d]/95 p-2 shadow-none">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/38">
                    Check-in físico
                  </p>
                  <h2 className="text-[15px] font-black uppercase italic leading-none text-white">
                    {preview ? "Foto actual" : "Sube tu foto corporal"}
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[8px] font-black uppercase text-white/45">
                  Frontal / lateral
                </span>
              </div>

              <div className="grid grid-cols-[104px_1fr] gap-1.5">
                <div className="min-w-0">
                  <label
                    htmlFor="checkin-photo"
                    className="group relative block h-[112px] cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/15 bg-black/25 transition hover:border-white/30"
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="Foto actual"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="grid h-full place-items-center bg-white/[0.025] text-center">
                        <div className="px-2">
                          <div className="mx-auto grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-emerald-100/80">
                            <ImagePlus size={16} />
                          </div>
                          <p className="mt-1.5 text-[8px] font-black uppercase tracking-wide text-white/70">
                            Foto corporal
                          </p>
                          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-white/35">
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
                      <div className="absolute inset-x-1.5 bottom-1.5 rounded-full bg-black/55 px-2 py-0.5 text-center text-[8px] font-black uppercase tracking-wide text-emerald-100/85 backdrop-blur">
                        Foto lista
                      </div>
                    )}
                  </label>

                  <div className="mt-1.5">
                    <label
                      htmlFor="checkin-photo"
                      className="block rounded-xl border border-white/10 bg-white/[0.045] px-2 py-1 text-center text-[8px] font-black uppercase tracking-wide text-white/60 transition hover:bg-white/[0.07]"
                    >
                      {preview ? "Cambiar" : "Subir"}
                    </label>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
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
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-left"
                    >
                      <p className="text-[9px] font-black uppercase tracking-wide text-white/40">
                        Medidas
                      </p>
                      <p className="mt-0.5 text-[13px] font-black uppercase text-white">
                        Opcional
                      </p>
                    </button>
                  </div>

                  {showMeasures && (
                    <div className="grid grid-cols-3 gap-1">
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

                  <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2">
                    <div className="flex items-start gap-1.5">
                      <Sparkles size={11} className="mt-0.5 shrink-0 text-emerald-100/70" />
                      <p className="line-clamp-2 text-[9px] font-bold leading-[1.35] text-white/55">
                        Sube una foto y tu peso para generar el análisis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <CheckInLoader loading={loading} />

            <section className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
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

            <section className="shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#080f0d]/95 p-2 shadow-none">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/38">
                    Comparación semanal
                  </p>
                  <h3 className="text-[11px] font-black uppercase italic text-white">
                    Anterior vs actual
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[8px] font-black uppercase text-white/45">
                  IA visual
                </span>
              </div>

              <div className="relative grid grid-cols-2 gap-1">
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

                <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/35 text-[7px] font-black uppercase text-emerald-100/55 backdrop-blur-xl">
                  VS
                </div>
              </div>

              <div className="mt-1 rounded-xl border border-white/10 bg-white/[0.035] px-2 py-1.5">
                <div className="flex items-start gap-2">
                  <Sparkles size={11} className="mt-0.5 shrink-0 text-emerald-100/70" />
                  <p className="line-clamp-2 text-[9px] font-bold leading-[1.35] text-white/70">
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

            <section className="shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#080f0d]/95 p-1.5">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/38">
                    Evolución completa
                  </p>
                  <h3 className="text-[11px] font-black uppercase italic text-white">
                    Progreso corporal
                  </h3>
                </div>

                {lastCheckin && (
                  <button
                    onClick={openAnalysisSheet}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[7px] font-black uppercase tracking-wide text-white/45 transition hover:text-white/70"
                  >
                    Ver análisis
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/progreso")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-[9px] font-black uppercase tracking-[0.13em] text-white/70 transition hover:bg-white/[0.07] active:scale-[0.98]"
              >
                Ver progreso completo
              </button>
            </section>
          </div>
        </main>

        {selectedCheckin && (
          <CheckInResultSheet
            checkin={selectedCheckin}
            previousCheckin={selectedPreviousCheckin}
            mode={sheetMode}
            onClose={closeSheet}
          />
        )}

        <div className="fixed inset-x-0 bottom-[72px] z-[90] mx-auto w-full max-w-[430px] px-3">
          <button
            type="button"
            onClick={saveCheckIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#07110d] shadow-[0_12px_34px_rgba(0,0,0,0.36)] transition active:scale-[0.985] disabled:opacity-60"
          >
            <Sparkles size={13} />
            {loading ? "Analizando..." : "Analizar con IA"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function InputBox({ label, value, onChange, placeholder, suffix }) {
  return (
    <label className="block rounded-xl border border-white/10 bg-black/25 px-2 py-1.5 focus-within:border-white/20">
      <span className="text-[9px] font-black uppercase tracking-wide text-white/40">
        {label}
      </span>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-black text-white outline-none placeholder:text-white/18"
        />
        {suffix && (
          <span className="text-[9px] font-black uppercase text-white/35">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function MiniMetric({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-1.5 py-1">
      <div className="mb-0.5 text-emerald-100/70">{icon}</div>
      <p className="truncate text-[8px] font-black uppercase tracking-wide text-white/35">
        {label}
      </p>
      <p className="truncate text-[10px] font-black text-white">{value}</p>
    </div>
  );
}

function CompareTile({ title, checkin, image, emptyText, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!checkin && !image}
      className="group overflow-hidden rounded-xl bg-black/20 text-left ring-1 ring-white/10 transition hover:ring-white/20 disabled:opacity-70"
    >
      <div className="relative h-[82px] overflow-hidden bg-black/25">
        {image ? (
          <>
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
            <div className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[7px] font-black uppercase tracking-wide text-white/80 backdrop-blur">
              {title}
            </div>
            <div className="absolute bottom-1.5 left-1.5 rounded-full border border-white/15 bg-white/90 px-2 py-0.5 text-[7px] font-black uppercase tracking-wide text-[#07110d]">
              {checkin ? formatDate(checkin.created_at || checkin.createdAt) : "Sin registro"}
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center bg-white/[0.025] text-center">
            <div>
              <div className="mx-auto grid h-7 w-7 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-emerald-100/70">
                <Camera size={14} />
              </div>
              <p className="mt-1 text-[8px] font-black uppercase text-white/55">
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
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-1.5 py-0.5">
      <span className="text-[7px] font-black uppercase tracking-wide text-white/35">
        {label}
      </span>
      <span className="max-w-[104px] truncate text-[8px] font-black text-white">
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
  const [expandedChanges, setExpandedChanges] = useState(false);
  const [expandedRecommendation, setExpandedRecommendation] = useState(false);

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
  const metricChips = [
    { label: "Peso", value: checkin.weight ? `${checkin.weight} kg` : "" },
    { label: "Grasa", value: checkin.body_fat_range || "" },
    { label: "Confianza", value: checkin.confidence ? `${checkin.confidence}%` : "" },
    { label: "Cintura", value: checkin.waist ? `${checkin.waist} cm` : "" },
    { label: "Pecho", value: checkin.chest ? `${checkin.chest} cm` : "" },
    { label: "Cadera", value: checkin.hips ? `${checkin.hips} cm` : "" },
  ].filter((metric) => metric.value);
  const showChangesMore = visualChanges.length > 150;
  const showRecommendationMore = recommendation.length > 150;
  const timeline = getCheckinTimelineSummary(checkin, previousCheckin);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 px-2 pb-[calc(76px+env(safe-area-inset-bottom))] pt-8 backdrop-blur-[6px]"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Análisis IA"
        className="flex max-h-[75vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#080f0d]/98 shadow-[0_-14px_44px_rgba(0,0,0,0.36)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-3 pb-1.5 pt-2">
          <div className="mb-1.5 flex items-center justify-center">
            <div className="h-1 w-10 rounded-full bg-white/14" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-[12px] font-black uppercase tracking-[0.08em] text-white">
                {date}
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white/45">
                {hasAiResult ? "IA lista" : "IA base"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar análisis"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-white/55 transition hover:bg-white/[0.07] hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {image ? (
            <div className="relative mb-2 max-h-[180px] overflow-hidden rounded-[20px] border border-white/10 bg-black/25">
              <img
                src={image}
                alt={mode === "analysis" ? "Resultado del análisis IA" : "Check-in corporal"}
                className="h-[168px] max-h-[180px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="mb-2 grid h-[92px] place-items-center rounded-[20px] border border-white/10 bg-white/[0.035] text-center">
              <div>
                <Camera className="mx-auto mb-1 text-emerald-100/70" size={16} />
                <p className="text-[9px] font-black uppercase text-white/45">
                  Sin foto
                </p>
              </div>
            </div>
          )}

          {metricChips.length > 0 && (
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {metricChips.map((metric) => (
                <ResultMetricChip
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))}
            </div>
          )}

          <TimelineMiniSummary timeline={timeline} />

          <CompactInsightBlock
            title="Cambios detectados"
            text={visualChanges}
            expanded={expandedChanges}
            showMore={showChangesMore}
            onToggle={() => setExpandedChanges((prev) => !prev)}
          />

          <CompactInsightBlock
            title="Recomendación"
            text={recommendation}
            expanded={expandedRecommendation}
            showMore={showRecommendationMore}
            onToggle={() => setExpandedRecommendation((prev) => !prev)}
          />

          {checkin.notes ? (
            <CompactInsightBlock
              title="Nota"
              text={checkin.notes}
              expanded={false}
              showMore={false}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ResultMetricChip({ label, value }) {
  return (
    <div className="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1">
      <span className="text-[8px] font-black uppercase tracking-wide text-white/35">
        {label}
      </span>
      <span className="max-w-[112px] truncate text-[9px] font-black text-white/82">
        {value}
      </span>
    </div>
  );
}

function TimelineMiniSummary({ timeline }) {
  return (
    <div className="mb-2 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
      <TimelinePill label="Tiempo" value={timeline.timeAgo} />
      <TimelinePill label="Peso" value={timeline.weightChange} />
      <TimelinePill label="Estado" value={timeline.status} />
    </div>
  );
}

function TimelinePill({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-black/18 px-2 py-1">
      <p className="truncate text-[7px] font-black uppercase tracking-wide text-white/30">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[9px] font-black text-white/72">
        {value}
      </p>
    </div>
  );
}

function CompactInsightBlock({ title, text, expanded, showMore, onToggle }) {
  return (
    <div className="mt-1.5 rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/35">
          {title}
        </p>

        {showMore && (
          <button
            type="button"
            onClick={onToggle}
            className="text-[8px] font-black uppercase tracking-wide text-white/55"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      <p
        className={`mt-1 text-[11px] font-medium leading-4 text-white/72 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {text}
      </p>
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
