import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  Trash2,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { CheckInDetailSheet } from "../components/checkin/CheckInDetailSheet";
import { getWeightDiff } from "../components/checkin/checkinUtils";
import { createCheckin, deleteCheckin, listCheckins } from "../services/checkinService";
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
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [sheetMode, setSheetMode] = useState("detail");
  const [showMeasures, setShowMeasures] = useState(false);
  const [deletingCheckinId, setDeletingCheckinId] = useState(null);
  const [pendingDeleteCheckin, setPendingDeleteCheckin] = useState(null);

  const loadData = useCallback(async () => {
    setLoadingHistory(true);
    setError("");
    setProfile(getCachedProfile());

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Necesitas iniciar sesión para guardar tu check-in físico.");
      setLoadingHistory(false);
      return;
    }

    setUser(user);

    try {
      const checkins = await listCheckins(user.id);
      setHistory(checkins);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el historial de check-ins.");
    } finally {
      setLoadingHistory(false);
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

  function openTimelineAnalysis(checkin) {
    if (!checkin) return;
    setSheetMode("analysis");
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

  function handleSavedCheckinDelete(event, checkin) {
    event.stopPropagation();

    if (!checkin?.id || deletingCheckinId) return;

    setPendingDeleteCheckin(checkin);
  }

  async function confirmDeleteCheckin() {
    if (!pendingDeleteCheckin?.id || !user || deletingCheckinId) return;

    const checkinId = pendingDeleteCheckin.id;

    try {
      setDeletingCheckinId(checkinId);
      setError("");
      setMessage("");

      await deleteCheckin(checkinId, user.id);

      setHistory((prev) =>
        prev.filter((item) => String(item.id) !== String(checkinId))
      );

      if (String(selectedCheckin?.id) === String(checkinId)) {
        closeSheet();
      }

      setMessage("Check-in borrado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo borrar el check-in.");
    } finally {
      setPendingDeleteCheckin(null);
      setDeletingCheckinId(null);
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
    <AppShell contentClassName="px-2 pb-[88px] pt-2">
      <div className="flex h-full min-h-0 flex-col gap-1 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-emerald-300">
            <Sparkles size={11} />
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

        <section className="shrink-0 rounded-[18px] border border-white/10 bg-[#07170f]/95 p-2 shadow-[0_12px_34px_rgba(16,185,129,0.08)]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Activity size={17} />
            </div>

            <div className="min-w-0">
              <h1 className="text-[18px] font-black uppercase italic leading-[0.9] tracking-tight text-white">
                Check-in
              </h1>

              <p className="mt-0.5 text-[9px] leading-3 text-white/50">
                Foto corporal, IA y comparación semanal.
              </p>

              <span className="mt-1 inline-flex rounded-full border border-emerald-400/15 bg-black/20 px-2 py-0.5 text-[7px] font-black uppercase tracking-wide text-emerald-300">
                {formatGoal(goal)}
              </span>
            </div>
          </div>
        </section>

        <CheckInAlert type="error" text={error} />
        <CheckInAlert type="success" text={message} />

        <main className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-h-full flex-col gap-1">
            <section className="shrink-0 overflow-hidden rounded-[22px] border border-emerald-300/15 bg-[#07170f]/95 p-2 shadow-[0_18px_48px_rgba(16,185,129,0.10)] ring-1 ring-white/[0.03]">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-300">
                    Check-in físico
                  </p>
                  <h2 className="text-[15px] font-black uppercase italic leading-none text-white">
                    {preview ? "Foto actual" : "Sube tu foto corporal"}
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-black uppercase text-white/55">
                  Frontal / lateral
                </span>
              </div>

              <div className="grid grid-cols-[112px_1fr] gap-1.5">
                <div className="min-w-0">
                  <label
                    htmlFor="checkin-photo"
                    className="group relative block h-[120px] cursor-pointer overflow-hidden rounded-[18px] border border-dashed border-emerald-300/25 bg-black/25 ring-1 ring-white/[0.04] transition hover:border-emerald-300/45"
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
                      <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top,#10b9811f,transparent_55%)] text-center">
                        <div className="px-2">
                          <div className="mx-auto grid h-9 w-9 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
                            <ImagePlus size={21} />
                          </div>
                          <p className="mt-1.5 text-[9px] font-black uppercase tracking-wide text-white/75">
                            Sube tu foto corporal
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
                      <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-center text-[8px] font-black uppercase tracking-wide text-emerald-200 backdrop-blur">
                        Foto lista
                      </div>
                    )}
                  </label>

                  <div className="mt-1.5">
                    <label
                      htmlFor="checkin-photo"
                      className="block rounded-xl border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-1 text-center text-[8px] font-black uppercase tracking-wide text-emerald-100/80 transition hover:bg-emerald-300/[0.10]"
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
                      className="rounded-2xl border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-left ring-1 ring-white/[0.02]"
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

                  <button
                    type="button"
                    onClick={saveCheckIn}
                    disabled={loading}
                    className="mt-auto rounded-2xl border border-emerald-200/30 bg-gradient-to-r from-emerald-300 to-cyan-200 px-3 py-2.5 text-[9px] font-black uppercase leading-3 tracking-[0.13em] text-[#04110b] shadow-[0_14px_34px_rgba(16,185,129,0.28)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Analizando..." : "Analizar cuerpo con IA"}
                  </button>
                </div>
              </div>
            </section>

            <CheckInLoader loading={loading} />

            <section className="shrink-0 rounded-[18px] border border-white/10 bg-white/[0.035] p-1.5">
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

            <section className="shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-[#07170f]/95 p-2 shadow-[0_16px_44px_rgba(0,0,0,0.20)] ring-1 ring-emerald-300/[0.04]">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-300">
                    Comparación semanal
                  </p>
                  <h3 className="text-[11px] font-black uppercase italic text-white">
                    Anterior vs actual
                  </h3>
                </div>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-300">
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

              <div className="mt-1 rounded-[16px] border border-cyan-200/10 bg-cyan-200/[0.045] px-2 py-1.5 ring-1 ring-white/[0.025]">
                <div className="flex items-start gap-2">
                  <Sparkles size={11} className="mt-0.5 shrink-0 text-cyan-200/80" />
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

            <section className="shrink-0 overflow-hidden rounded-[20px] border border-white/10 bg-[#07170f]/95 p-1.5">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-300">
                    Timeline semanal
                  </p>
                  <h3 className="text-[11px] font-black uppercase italic text-white">
                    {history.length || 0} registros
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

              {loadingHistory ? (
                <p className="py-3 text-center text-[11px] font-bold text-white/45">
                  Cargando historial...
                </p>
              ) : history.length === 0 ? (
                <p className="py-3 text-center text-[11px] font-bold text-white/45">
                  Tu historial aparecerá aquí.
                </p>
              ) : (
                <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {history.map((item, index) => (
                    <div
                      key={item.id || index}
                      onClick={() => openTimelineAnalysis(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openTimelineAnalysis(item);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="relative w-[80px] shrink-0 cursor-pointer overflow-hidden rounded-[15px] bg-white/[0.035] text-left ring-1 ring-white/10 transition hover:ring-emerald-300/25"
                    >
                      <div className="relative h-[48px] overflow-hidden bg-black/25">
                        {getCheckinImage(item) ? (
                          <>
                            <img
                              src={getCheckinImage(item)}
                              alt={`Registro ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="grid h-full place-items-center text-emerald-300">
                            <Camera size={18} />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(event) => handleSavedCheckinDelete(event, item)}
                        aria-label="Borrar check-in guardado"
                        disabled={deletingCheckinId === item.id}
                        className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-black/55 text-white/65 backdrop-blur-xl transition hover:border-red-300/35 hover:bg-red-400/20 hover:text-red-100 disabled:opacity-45"
                      >
                        <Trash2 size={9} />
                      </button>

                      <div className="p-1.25 pt-0.75">
                        <p className="text-[8px] font-black uppercase text-emerald-300">
                          Reg {index + 1}
                        </p>
                        <p className="mt-0.5 truncate text-[8px] font-bold text-white/45">
                          {formatDate(item.created_at || item.createdAt)}
                        </p>
                        <p className="mt-0.5 text-[11px] font-black text-white">
                          {item.weight ? `${item.weight}kg` : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        {selectedCheckin && (
          <CheckInDetailSheet
            checkin={selectedCheckin}
            mode={sheetMode}
            onClose={closeSheet}
          />
        )}

        {pendingDeleteCheckin && (
          <DeleteCheckinConfirmSheet
            loading={deletingCheckinId === pendingDeleteCheckin.id}
            onCancel={() => setPendingDeleteCheckin(null)}
            onConfirm={confirmDeleteCheckin}
          />
        )}
      </div>
    </AppShell>
  );
}

function InputBox({ label, value, onChange, placeholder, suffix }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/20 px-2.5 py-1.5">
      <span className="text-[9px] font-black uppercase tracking-wide text-white/40">
        {label}
      </span>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-black text-white outline-none placeholder:text-white/20"
        />
        {suffix && (
          <span className="text-[9px] font-black uppercase text-emerald-300/70">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function MiniMetric({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-1.5 py-1">
      <div className="mb-0.5 text-emerald-300">{icon}</div>
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
      className="group overflow-hidden rounded-[18px] bg-black/20 text-left ring-1 ring-white/10 transition hover:ring-emerald-300/25 disabled:opacity-70"
    >
      <div className="relative h-[88px] overflow-hidden bg-black/25">
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
            <div className="absolute bottom-2 left-2 rounded-full border border-emerald-100/25 bg-emerald-300/90 px-2 py-0.5 text-[7px] font-black uppercase tracking-wide text-[#04110b] shadow-[0_8px_22px_rgba(16,185,129,0.22)]">
              {checkin ? formatDate(checkin.created_at || checkin.createdAt) : "Sin registro"}
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top,#10b98118,transparent_58%)] text-center">
            <div>
              <div className="mx-auto grid h-7 w-7 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-300">
                <Camera size={16} />
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
    <div className="inline-flex items-center gap-1 rounded-full border border-emerald-300/10 bg-emerald-300/[0.055] px-1.5 py-0.5 ring-1 ring-white/[0.025]">
      <span className="text-[7px] font-black uppercase tracking-wide text-emerald-100/45">
        {label}
      </span>
      <span className="max-w-[104px] truncate text-[8px] font-black text-white">
        {value}
      </span>
    </div>
  );
}

function DeleteCheckinConfirmSheet({ loading, onCancel, onConfirm }) {
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/65 backdrop-blur-sm"
        role="presentation"
        onClick={loading ? undefined : onCancel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Borrar check-in"
        className="fixed inset-x-0 bottom-[112px] z-[9999] mx-auto w-full max-w-[430px] px-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rounded-t-[30px] border border-white/10 bg-[#07170f]/95 p-3 pb-4 shadow-[0_-18px_60px_rgba(0,0,0,0.46)] ring-1 ring-emerald-300/10">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />

          <div className="rounded-[24px] border border-red-400/15 bg-red-400/[0.06] p-3">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-200">
                <Trash2 size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-200/80">
                  Borrar check-in
                </p>
                <h3 className="mt-1 text-xl font-black uppercase italic leading-none text-white">
                  Borrar check-in
                </h3>
                <p className="mt-2 text-xs leading-4 text-white/60">
                  Esta foto y su análisis se eliminarán permanentemente.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-2xl border border-red-300/20 bg-red-400/15 px-3 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-red-100 transition hover:bg-red-400/25 disabled:opacity-50"
            >
              {loading ? "Borrando..." : "Borrar"}
            </button>
          </div>
        </div>
      </section>
    </>,
    document.body
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
