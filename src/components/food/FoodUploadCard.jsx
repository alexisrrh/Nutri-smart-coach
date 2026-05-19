import { ImagePlus } from "lucide-react";

export default function FoodUploadCard({
  preview,
  description,
  onDescriptionChange,
  handleImage,
  analyzeFood,
  loading,
}) {
  const canAnalyze = Boolean(preview || description?.trim());

  return (
    <section className="min-h-0">
      <label className="group block cursor-pointer overflow-hidden rounded-[24px] bg-[var(--app-surface)] p-1.5 transition active:scale-[0.99]">
        <div className="relative h-[168px] max-h-[180px] overflow-hidden rounded-[20px] bg-[var(--app-surface)]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)] via-[var(--app-surface)]/20 to-transparent" />

              <div className="absolute left-2 top-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--app-primary)] backdrop-blur-xl">
                Foto lista
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-base font-black uppercase italic text-[var(--app-text)]">
                  Imagen preparada
                </p>

                <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                  Toca la imagen para cambiarla.
                </p>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="theme-icon-tile mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_30px_var(--app-glow)]">
                  <ImagePlus size={28} />
                </div>

                <p className="text-lg font-black uppercase italic text-[var(--app-text)]">
                  Sube tu comida
                </p>

                <p className="mx-auto mt-1.5 max-w-[220px] text-xs leading-4 text-[var(--app-muted)]">
                  Usa buena luz y que el plato se vea completo.
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handleImage}
            className="hidden"
          />
        </div>
      </label>

      <div className="mt-2 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-card)] p-3">
        <div className="mb-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--app-primary)]">
            Descripción opcional
          </p>
          <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-muted)]">
            Añade detalles para mejorar la precisión
          </p>
        </div>

        <textarea
          value={description}
          onChange={(event) => onDescriptionChange?.(event.target.value)}
          placeholder="Ej: 2 arepas pequeñas con queso, pollo a la plancha, salsa y ensalada"
          rows={3}
          className="min-h-[84px] w-full resize-none rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-[12px] leading-5 text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)]"
        />
      </div>

      <button
        type="button"
        onClick={analyzeFood}
        disabled={!canAnalyze || loading}
        className="group relative mt-2 w-full overflow-hidden rounded-[1.15rem] border border-[var(--app-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--app-primary)_24%,var(--app-surface))] via-[color-mix(in_srgb,var(--app-primary)_40%,var(--app-surface))] to-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-card))] px-3 py-3 text-[var(--app-text)] shadow-[0_16px_36px_var(--app-glow)] transition duration-300 hover:border-[var(--app-border)] hover:shadow-[0_18px_42px_var(--app-glow)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
       <span className="relative z-10 flex min-h-[48px] items-center justify-center gap-9">
              <span className="theme-icon-tile-soft relative grid h-18 w-19 shrink-0 place-items-center overflow-hidden rounded-[0.95rem] border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_0_30px_var(--app-glow)]">
                <span className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,var(--app-primary)_72%,transparent_90%,transparent_100%)] opacity-70 animate-[spin_2.5s_linear_infinite]" />
                <span className="absolute inset-[2px] rounded-[0.9rem] bg-[var(--app-primary)] theme-icon-tile-inner" />
                <img
                  src="/icons/scan-comida-icon.png"
                  alt=""
                  aria-hidden="true"
                  className="relative z-10 h-18 w-25 object-contain"
                />
              </span>

          <span className="min-w-0 text-left">
            <span className="block text-[12px] font-black uppercase leading-tight tracking-[0.12em] text-[var(--app-text)]">
              {loading ? "ANALIZANDO..." : "ANALIZAR COMIDA"}
            </span>
            <span className="mt-0.5 block text-[10px] font-bold leading-tight text-[var(--app-text)]/82">
              IA nutricional + macros
            </span>
            <span className="mt-1 block text-[9px] font-medium leading-tight text-[var(--app-muted)]">
              Detecta calorías, proteína y calidad nutricional
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}
