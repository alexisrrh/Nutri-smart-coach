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
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { CheckInDetailSheet } from "../components/checkin/CheckInDetailSheet";
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
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [sheetMode, setSheetMode] = useState("detail");
  const [showMeasures, setShowMeasures] = useState(false);

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

  return (
    <AppShell contentClassName="px-2 pb-[92px] pt-2">
      <div className="flex h-[calc(100dvh-100px)] min-h-0 flex-col gap-2 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
            <Sparkles size={12} />
            AI Body Analysis
          </div>

          <SecondaryButton
            type="button"
            onClick={handleLogout}
            icon={<LogOut size={13} />}
            className="w-auto border-red-400/15 bg-red-400/10 px-3 py-2 text-[10px] text-red-300 hover:border-red-300/30 hover:bg-red-400/15 hover:text-red-200"
          >
            Salir
          </SecondaryButton>
        </div>

        <section className="shrink-0 rounded-[28px] border border-white/10 bg-[#07170f]/95 p-3 shadow-[0_18px_50px_rgba(16,185,129,0.10)]">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Activity size={25} />
            </div>

            <div className="min-w-0">
              <h1 className="text-[28px] font-black uppercase italic leading-[0.9] tracking-tight text-white">
                Check-in
                <br />
                corporal
              </h1>

              <p className="mt-1.5 text-xs leading-4 text-white/55">
                Analiza tu físico y compara tu progreso semanal con IA.
              </p>

              <span className="mt-2 inline-flex rounded-full border border-emerald-400/15 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                {formatGoal(goal)}
              </span>
            </div>
          </div>
        </section>

        <CheckInAlert type="error" text={error} />
        <CheckInAlert type="success" text={message} />

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col gap-2">
            <section className="shrink-0 rounded-[28px] border border-emerald-400/15 bg-[#07170f]/95 p-3 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    Check-in físico
                  </p>
                  <h2 className="text-lg font-black uppercase italic leading-none text-white">
                    {preview ? "Foto actual" : "Sube tu foto corporal"}
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase text-white/55">
                  Frontal / lateral
                </span>
              </div>

              <div className="grid grid-cols-[116px_1fr] gap-2">
                <label className="group relative h-[146px] cursor-pointer overflow-hidden rounded-[22px] border border-dashed border-emerald-400/25 bg-black/20">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Foto actual"
                      className="h-full w-full object-cover"
                    />
                  ) : lastImage ? (
                    <img
                      src={lastImage}
                      alt="Último check-in"
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-center">
                      <div>
                        <ImagePlus className="mx-auto text-emerald-300" size={30} />
                        <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-white/65">
                          Subir foto
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />

                  <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/55 px-2 py-1 text-center text-[10px] font-black uppercase text-emerald-200 backdrop-blur">
                    {preview ? "Cambiar" : "Foto"}
                  </div>
                </label>

                <div className="flex min-w-0 flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
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
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left"
                    >
                      <p className="text-[10px] font-black uppercase tracking-wide text-white/40">
                        Medidas
                      </p>
                      <p className="mt-1 text-sm font-black uppercase text-white">
                        Opcional
                      </p>
                    </button>
                  </div>

                  {showMeasures && (
                    <div className="grid grid-cols-3 gap-1.5">
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
                    className="mt-auto rounded-2xl bg-emerald-400 px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#04110b] shadow-[0_12px_35px_rgba(16,185,129,0.22)] transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Analizando..." : "Analizar cuerpo con IA"}
                  </button>
                </div>
              </div>
            </section>

            <CheckInLoader loading={loading} />

            <section className="shrink-0 rounded-[24px] border border-white/10 bg-white/[0.035] p-2.5">
              <div className="grid grid-cols-4 gap-1.5">
                <MiniMetric
                  icon={<Scale size={12} />}
                  label="Peso"
                  value={lastCheckin?.weight ? `${lastCheckin.weight}kg` : "—"}
                />
                <MiniMetric
                  icon={<TrendingUp size={12} />}
                  label="Cambio"
                  value={weightDiff || "—"}
                />
                <MiniMetric
                  icon={<Target size={12} />}
                  label="Grasa"
                  value={shortFatValue(lastCheckin)}
                />
                <MiniMetric
                  icon={<Sparkles size={12} />}
                  label="Conf."
                  value={lastCheckin?.confidence ? `${lastCheckin.confidence}%` : "—"}
                />
              </div>
            </section>

            <section className="shrink-0 rounded-[26px] border border-white/10 bg-[#07170f]/95 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    Comparación semanal
                  </p>
                  <h3 className="text-sm font-black uppercase italic text-white">
                    Anterior vs actual
                  </h3>
                </div>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-300">
                  IA visual
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <CompareTile
                  title="Anterior"
                  checkin={previousCheckin}
                  image={previousImage}
                  emptyText={history.length ? "Sin foto previa" : "Pendiente"}
                  onClick={() => openCheckinSheet(previousCheckin)}
                />
                <CompareTile
                  title="Actual"
                  checkin={lastCheckin}
                  image={preview || lastImage}
                  emptyText="Sube foto"
                  onClick={() => openCheckinSheet(lastCheckin)}
                />
              </div>
            </section>

            <section className="min-h-0 flex-1 overflow-hidden rounded-[26px] border border-white/10 bg-[#07170f]/95 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    Timeline semanal
                  </p>
                  <h3 className="text-sm font-black uppercase italic text-white">
                    {history.length || 0} registros
                  </h3>
                </div>

                {lastCheckin && (
                  <button
                    onClick={openAnalysisSheet}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase text-white/60"
                  >
                    Ver análisis
                  </button>
                )}
              </div>

              {loadingHistory ? (
                <p className="py-6 text-center text-xs font-bold text-white/45">
                  Cargando historial...
                </p>
              ) : history.length === 0 ? (
                <p className="py-6 text-center text-xs font-bold text-white/45">
                  Tu historial aparecerá aquí.
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {history.map((item, index) => (
                    <button
                      key={item.id || index}
                      onClick={() => openCheckinSheet(item)}
                      className="w-[108px] shrink-0 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] text-left"
                    >
                      <div className="h-[86px] bg-black/25">
                        {getCheckinImage(item) ? (
                          <img
                            src={getCheckinImage(item)}
                            alt={`Registro ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-emerald-300">
                            <Camera size={22} />
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <p className="text-[10px] font-black uppercase text-emerald-300">
                          Reg {index + 1}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-bold text-white/45">
                          {formatDate(item.created_at || item.createdAt)}
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {item.weight ? `${item.weight}kg` : "—"}
                        </p>
                      </div>
                    </button>
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
      </div>
    </AppShell>
  );
}

function InputBox({ label, value, onChange, placeholder, suffix }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-[10px] font-black uppercase tracking-wide text-white/40">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-black text-white outline-none placeholder:text-white/20"
        />
        {suffix && (
          <span className="text-[10px] font-black uppercase text-emerald-300/70">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function MiniMetric({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
      <div className="mb-1 text-emerald-300">{icon}</div>
      <p className="truncate text-[10px] font-black uppercase tracking-wide text-white/35">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function CompareTile({ title, checkin, image, emptyText, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!checkin && !image}
      className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20 text-left disabled:opacity-70"
    >
      <div className="h-[118px] bg-black/25">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Camera className="mx-auto text-emerald-300" size={22} />
              <p className="mt-1 text-[10px] font-black uppercase text-white/45">
                {emptyText}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="text-[10px] font-black uppercase tracking-wide text-emerald-300">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-bold text-white/45">
          {checkin ? formatDate(checkin.created_at || checkin.createdAt) : "Sin registro"}
        </p>
      </div>
    </button>
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