import { useMemo, useState } from "react";
import {
  Check,
  ClipboardCopy,
  LoaderCircle,
  Search,
  ShieldAlert,
} from "lucide-react";
import { EXERCISE_LIBRARY, englishNameByMediaKey } from "../../data/exerciseLibrary";
import { EXERCISE_MEDIA_MAP as exerciseMediaMap } from "../../data/exerciseMediaMap";
import { getExerciseImageUrl } from "../../services/exerciseDbService";

const ENGLISH_TERM_MAP = {
  "press inclinado mancuerna": "incline dumbbell press",
  "aperturas en cable": "cable fly",
  flexiones: "push up",
  "fondos en paralelas": "dips",
  "jalon al pecho": "lat pulldown",
  "remo sentado": "seated cable row",
  sentadilla: "squat",
  "hip thrust": "hip thrust",
  zancadas: "lunges",
  "curl biceps": "biceps curl",
  "extension triceps": "triceps extension",
};

function normalizeSearchTerm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function spanishToEnglishSearchTerm(value) {
  const normalized = normalizeSearchTerm(value);
  if (!normalized) return "";

  if (ENGLISH_TERM_MAP[normalized]) {
    return ENGLISH_TERM_MAP[normalized];
  }

  if (normalized.includes("press inclinado") && normalized.includes("mancuer")) {
    return "incline dumbbell press";
  }

  if (normalized.includes("apertura") && normalized.includes("cable")) {
    return "cable fly";
  }

  if (normalized.includes("flexion")) return "push up";
  if (normalized.includes("fondos") && normalized.includes("paralela")) return "dips";
  if (normalized.includes("jalon") && normalized.includes("pecho")) return "lat pulldown";
  if (normalized.includes("remo") && normalized.includes("sentad")) return "seated cable row";
  if (normalized.includes("sentadilla")) return "squat";
  if (normalized.includes("hip thrust")) return "hip thrust";
  if (normalized.includes("zancad")) return "lunges";
  if (normalized.includes("curl") && normalized.includes("biceps")) return "biceps curl";
  if (normalized.includes("extension") && normalized.includes("triceps")) return "triceps extension";

  return String(value || "");
}

function getExpectedSearchTerm(exercise) {
  const mediaEntry = exerciseMediaMap[exercise.mediaKey] || {};

  return (
    mediaEntry.expectedName ||
    englishNameByMediaKey[exercise.mediaKey] ||
    exercise.englishName ||
    spanishToEnglishSearchTerm(exercise.name) ||
    exercise.name
  );
}

function buildSnippet(row, result) {
  const mediaKey = row.mediaKey;
  return `"${mediaKey}": {\n  exerciseDbId: "${result.id || ""}",\n  expectedName: "${result.name || row.expectedEnglishName || ""}",\n  target: "${result.target || row.target || ""}",\n  equipment: "${result.equipment || row.equipment || ""}",\n  remoteGifUrl: "",\n},`;
}

function ResultCard({ result, onUse }) {
  const previewUrl = getExerciseImageUrl(result.id);

  return (
    <article className="rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {result.id || "sin-id"}
          </p>
          <h4 className="truncate text-[12px] font-black text-[var(--app-text)]">
            {result.name || "Sin nombre"}
          </h4>
          <p className="mt-0.5 text-[10px] text-[var(--app-muted)]">
            {result.target || "—"} · {result.equipment || "—"}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold text-[var(--app-muted)]">
            bodyPart: {result.bodyPart || result.target || "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUse(result)}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2.5 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]"
        >
          <Check size={10} />
          USAR ESTE
        </button>
      </div>

      <div className="mt-2 overflow-hidden rounded-[0.9rem] border border-[var(--app-border)] bg-[var(--app-card)]">
        <img
          src={previewUrl}
          alt={result.name || "ExerciseDB preview"}
          loading="lazy"
          decoding="async"
          className="h-32 w-full object-contain"
        />
      </div>
    </article>
  );
}

function MatchRow({ exercise, searchTerm, setSearchTerm }) {
  const existingId = exerciseMediaMap[exercise.mediaKey]?.exerciseDbId || "";
  const defaultTerm = getExpectedSearchTerm(exercise);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState(
    existingId ? buildSnippet({ mediaKey: exercise.mediaKey }, { id: existingId, name: exercise.name, target: exercise.muscle, equipment: exercise.equipment }) : ""
  );

  async function handleSearch(term) {
    console.log("search term used", term);

    if (!term.trim()) {
      setError("Escribe un nombre para buscar");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3000/search-exercise?q=${encodeURIComponent(term.trim())}`);
      if (!response.ok) {
        throw new Error(`Backend respondió ${response.status}`);
      }

      const payload = await response.json();
      const found = Array.isArray(payload) ? payload : payload.results || [];
      setResults(found.slice(0, 6));
      setMessage(found.length ? `Encontrados ${found.length} resultados` : "Sin resultados");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de búsqueda");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchSpanish() {
    const spanishTerm = exercise.name;
    setSearchTerm(spanishTerm);
    await handleSearch(spanishTerm);
  }

  async function handleUse(result) {
    const snippet = buildSnippet(exercise, result);
    setSelectedSnippet(snippet);
    setSearchTerm(result.name || "");
    await navigator.clipboard.writeText(snippet);
    setMessage(`Copiado ${result.id || ""} para ${exercise.mediaKey}`);
  }

  async function handleCopySnippet() {
    if (!selectedSnippet) return;
    await navigator.clipboard.writeText(selectedSnippet);
    setMessage(`Snippet copiado para ${exercise.mediaKey}`);
  }

  console.log("default term", exercise.mediaKey, defaultTerm);

  return (
    <section className="rounded-[1.15rem] border border-[var(--app-border)] bg-[var(--app-card)] p-3 shadow-[0_10px_28px_var(--app-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            {exercise.mediaKey}
          </p>
          <h3 className="truncate text-[14px] font-black text-[var(--app-text)]">{exercise.name}</h3>
          <p className="mt-0.5 text-[10px] text-[var(--app-muted)]">
            {exercise.muscle} · {exercise.equipment}
          </p>
          <p className="mt-1 text-[9px] font-semibold text-[var(--app-muted)]">
            Buscando como: "{searchTerm}"
          </p>
        </div>
        <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-muted)]">
          {existingId ? "ID listo" : "Pendiente"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
        <label className="grid gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
            Buscar ejercicio
          </span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 rounded-[0.85rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[12px] font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            placeholder={exercise.name}
          />
        </label>

        <button
          type="button"
          onClick={() => handleSearch(searchTerm)}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)] disabled:opacity-50"
        >
          {loading ? <LoaderCircle size={12} className="animate-spin" /> : <Search size={12} />}
          Buscar
        </button>

        <button
          type="button"
          onClick={handleSearchSpanish}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--app-text)] disabled:opacity-50"
        >
          <Search size={12} />
          Buscar ES
        </button>
      </div>

      {message ? (
        <p className="mt-2 text-[10px] font-semibold text-[var(--app-primary)]">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
          <ShieldAlert size={11} />
          {error}
        </p>
      ) : null}

      {selectedSnippet ? (
        <div className="mt-3 rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Snippet listo
            </p>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-text)]"
            >
              <ClipboardCopy size={10} />
              Copiar
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-[0.8rem] bg-black/20 p-2 text-[9px] leading-4 text-[var(--app-text)]">
            {selectedSnippet}
          </pre>
        </div>
      ) : null}

      {results.length ? (
        <div className="mt-3 grid gap-2">
          {results.map((result) => (
            <ResultCard
              key={result.id || result.name}
              result={result}
              onUse={handleUse}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function ExerciseMatchManager() {
  const exercises = useMemo(() => EXERCISE_LIBRARY.slice(), []);
  const [searchTerms, setSearchTerms] = useState(() =>
    Object.fromEntries(
      exercises.map((exercise) => [exercise.mediaKey || exercise.id, getExpectedSearchTerm(exercise)])
    )
  );

  function handleAutocompleteEnglish() {
    setSearchTerms(
      Object.fromEntries(
        exercises.map((exercise) => {
          const mediaKey = exercise.mediaKey || exercise.id;
          return [mediaKey, englishNameByMediaKey[exercise.mediaKey] || exercise.englishName || getExpectedSearchTerm(exercise)];
        })
      )
    );
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
              <h1 className="text-[22px] font-black leading-none">ExerciseDB Match</h1>
              <p className="mt-1 text-[11px] text-[var(--app-muted)]">
                Busca, valida y copia IDs exactos para ExerciseDB.
              </p>
            </div>
            <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[var(--app-primary)]">
              Proxy local
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutocompleteEnglish}
            className="mt-3 inline-flex h-8 items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--app-text)]"
          >
            <ClipboardCopy size={10} />
            Autocompletar inglés
          </button>
        </header>

        <div className="grid gap-3">
          {exercises.map((exercise) => (
            <MatchRow
              key={exercise.mediaKey || exercise.id}
              exercise={exercise}
              searchTerm={searchTerms[exercise.mediaKey || exercise.id] || getExpectedSearchTerm(exercise)}
              setSearchTerm={(value) =>
                setSearchTerms((current) => ({
                  ...current,
                  [exercise.mediaKey || exercise.id]: value,
                }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
