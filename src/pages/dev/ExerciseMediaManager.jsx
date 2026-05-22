import { useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  ExternalLink,
  LoaderCircle,
  Search,
  ShieldAlert,
} from "lucide-react";
import exerciseMediaChecklist from "../../data/exerciseMediaChecklist";
import { EXERCISE_MEDIA_MAP as exerciseMediaMap } from "../../data/exerciseMediaMap";
import {
  downloadRemoteAsset,
  getExerciseById,
  hasExerciseDbCredentials,
  searchExercisesByName,
} from "../../services/exerciseDbService";

export default function ExerciseMediaManager() {
  const initialRows = useMemo(
    () =>
      exerciseMediaChecklist.map((item) => ({
        ...item,
        exerciseDbId: exerciseMediaMap[item.mediaKey]?.exerciseDbId || "",
        localPath: exerciseMediaMap[item.mediaKey]?.localGif || item.localPath,
        preview: null,
        results: [],
        loading: false,
        message: "",
        error: "",
      })),
    []
  );

  const [rows, setRows] = useState(initialRows);
  const [globalMessage, setGlobalMessage] = useState("");
  const apiReady = hasExerciseDbCredentials();

  function patchRow(mediaKey, patch) {
    setRows((current) =>
      current.map((row) => (row.mediaKey === mediaKey ? { ...row, ...patch } : row))
    );
  }

  async function handleSearch(row) {
    if (!apiReady) {
      patchRow(row.mediaKey, { error: "Falta VITE_RAPIDAPI_KEY", message: "", loading: false });
      return;
    }

    patchRow(row.mediaKey, { loading: true, error: "", message: "" });

    try {
      const results = await searchExercisesByName(row.expectedEnglishName);
      const preview = results[0] || null;
      patchRow(row.mediaKey, {
        loading: false,
        results,
        preview,
        exerciseDbId: preview?.id || row.exerciseDbId || "",
        message: results.length
          ? `Encontrados ${results.length} resultados`
          : "No hubo coincidencias",
        error: results.length ? "" : "Sin resultados para esa búsqueda",
      });
      setGlobalMessage(`Buscado: ${row.expectedEnglishName}`);
    } catch (error) {
      patchRow(row.mediaKey, {
        loading: false,
        error: error instanceof Error ? error.message : "Error de búsqueda",
        message: "",
      });
    }
  }

  async function handleLoadById(row) {
    if (!apiReady) {
      patchRow(row.mediaKey, { error: "Falta VITE_RAPIDAPI_KEY", message: "", loading: false });
      return;
    }

    if (!row.exerciseDbId) {
      patchRow(row.mediaKey, { error: "Falta el ID del ejercicio", message: "", loading: false });
      return;
    }

    patchRow(row.mediaKey, { loading: true, error: "", message: "" });

    try {
      const preview = await getExerciseById(row.exerciseDbId);
      patchRow(row.mediaKey, {
        loading: false,
        preview,
        message: preview?.gifUrl || preview?.imageUrl ? "Media disponible" : "Este endpoint no devuelve GIF. Revisa endpoint Images o usa URL manual.",
        error: "",
      });
      setGlobalMessage(`Cargado ID ${row.exerciseDbId}`);
    } catch (error) {
      patchRow(row.mediaKey, {
        loading: false,
        error: error instanceof Error ? error.message : "Error al cargar por ID",
        message: "",
      });
    }
  }

  async function handleDownload(row) {
    const mediaUrl = row.preview?.gifUrl || "";
    if (!mediaUrl) {
      patchRow(row.mediaKey, {
        error: "Este endpoint no devuelve GIF. Revisa endpoint Images o usa URL manual.",
      });
      return;
    }

    await downloadRemoteAsset(mediaUrl, `${row.mediaKey}.gif`);
    patchRow(row.mediaKey, {
      message: "Revisa que coincida antes de guardar.",
      error: "",
    });
  }

  return (
    <div className="min-h-screen bg-[var(--app-surface)] px-3 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3 text-[var(--app-text)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <header className="rounded-[1.2rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_14px_34px_var(--app-glow)]">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">
            Dev tool
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-black leading-none">ExerciseMedia Manager</h1>
              <p className="mt-1 text-[11px] text-[var(--app-muted)]">
                Gestiona GIFs exactos de ExerciseDB y guarda solo lo que coincide.
              </p>
            </div>
            <span
              className={[
                "rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em]",
                apiReady
                  ? "border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "border-[color-mix(in_srgb,var(--app-primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--app-primary)_10%,var(--app-card))] text-[var(--app-muted)]",
              ].join(" ")}
            >
              {apiReady ? "API lista" : "Falta VITE_RAPIDAPI_KEY"}
            </span>
          </div>
          <p className="mt-2 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-[11px] text-[var(--app-muted)]">
            Solo mantenimiento. No conectar a la UI normal.
          </p>
          {globalMessage ? (
            <p className="mt-2 text-[10px] font-bold text-[var(--app-primary)]">{globalMessage}</p>
          ) : null}
        </header>

        <div className="grid gap-3">
          {rows.map((row) => (
            <section
              key={row.mediaKey}
              className="rounded-[1.2rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_10px_28px_var(--app-glow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                    {row.mediaKey}
                  </p>
                  <h2 className="mt-0.5 text-[15px] font-black leading-[1.05]">{row.spanishName}</h2>
                  <p className="mt-1 text-[10px] text-[var(--app-muted)]">
                    {row.expectedEnglishName}
                  </p>
                </div>
                <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
                  {row.status}
                </span>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_280px]">
                <div className="grid gap-2">
                  <InfoRow label="Target" value={row.target} />
                  <InfoRow label="Equipment" value={row.equipment} />
                  <InfoRow label="Local path" value={row.localPath} mono />
                  <label className="grid gap-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      ExerciseDB ID
                    </span>
                    <input
                      value={row.exerciseDbId}
                      onChange={(event) =>
                        patchRow(row.mediaKey, {
                          exerciseDbId: event.target.value,
                          error: "",
                          message: "",
                        })
                      }
                      className="h-10 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[12px] font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                      placeholder="0025"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSearch(row)}
                      disabled={!apiReady || row.loading}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] disabled:opacity-50"
                    >
                      {row.loading ? <LoaderCircle size={12} className="animate-spin" /> : <Search size={12} />}
                      Buscar por nombre
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadById(row)}
                      disabled={!apiReady || row.loading}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] disabled:opacity-50"
                    >
                      {row.loading ? <LoaderCircle size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                      Cargar por ID
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(row)}
                      disabled={!row.preview?.gifUrl || row.loading}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] disabled:opacity-50"
                    >
                      <Download size={12} className="text-[var(--app-primary)]" />
                      Descargar GIF
                    </button>
                  </div>

                  {row.message ? (
                    <p className="text-[10px] font-semibold text-[var(--app-primary)]">
                      {row.message}
                    </p>
                  ) : null}

                  {row.error ? (
                    <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                      <AlertCircle size={11} />
                      {row.error}
                    </p>
                  ) : null}

                  {row.preview?.gifUrl ? (
                    <p className="text-[10px] text-[var(--app-muted)]">
                      Revisa que coincida antes de guardar.
                    </p>
                  ) : null}

                  {Array.isArray(row.results) && row.results.length > 1 ? (
                    <div className="mt-1 grid gap-2">
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
                        Resultados
                      </p>
                      <div className="grid gap-1">
                        {row.results.slice(0, 3).map((item) => (
                          <button
                            type="button"
                            key={item.id || item.name}
                            onClick={() => patchRow(row.mediaKey, { preview: item, exerciseDbId: item.id || row.exerciseDbId })}
                            className="rounded-[0.8rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-left"
                          >
                            <p className="text-[10px] font-black text-[var(--app-text)]">{item.name}</p>
                            <p className="mt-0.5 text-[9px] text-[var(--app-muted)]">
                              {item.target || "Sin target"} · {item.equipment || "Sin equipment"}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <RemotePreview
                  key={`${row.mediaKey}-${row.preview?.gifUrl || row.preview?.imageUrl || "empty"}`}
                  row={row}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className={["mt-0.5 text-[12px] font-bold text-[var(--app-text)]", mono ? "font-mono text-[11px]" : ""].join(" ")}>
        {value || "—"}
      </p>
    </div>
  );
}

function RemotePreview({ row }) {
  const src = row.preview?.gifUrl || row.preview?.imageUrl || "";
  const [loading, setLoading] = useState(Boolean(src));
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[1rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,rgba(7,10,18,0.95),rgba(13,18,30,0.96))]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,var(--app-primary-soft),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.02),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

      {src && !failed ? (
        <>
          <img
            src={src}
            alt={row.preview?.name || row.spanishName}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoading(false)}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
            className={[
              "relative z-10 h-full w-full object-contain transition-[opacity,transform,filter] duration-500 ease-out",
              loading ? "scale-[0.985] opacity-0 blur-[1px]" : "scale-100 opacity-100",
            ].join(" ")}
          />
          {loading ? <PreviewLoading /> : null}
          {row.preview?.gifUrl ? (
            <span className="absolute left-2 top-2 z-20 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_76%,transparent)] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
              GIF REAL
            </span>
          ) : null}
        </>
      ) : (
        <div className="relative grid h-full min-h-[260px] place-items-center">
          <div className="grid place-items-center gap-2 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)]">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
                Sin media
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--app-muted)]">
                {row.preview?.name || row.spanishName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewLoading() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 animate-pulse bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.04)_100%)] bg-[length:200%_100%] opacity-70" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_0_20px_var(--app-glow)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-primary)] border-t-transparent" />
        </div>
      </div>
    </div>
  );
}
