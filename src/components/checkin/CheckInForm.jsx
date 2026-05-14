import {
  Camera,
  ChevronRight,
  ChevronDown,
  ImagePlus,
  ScanFace,
} from "lucide-react";

export function CheckInForm({
  preview,
  handlePhoto,
  form,
  handleChange,
  saveCheckIn,
  loading,
}) {
  const hasPreview = Boolean(preview);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#091710] shadow-2xl shadow-black/20">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10 p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
              <Camera size={20} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#10b981]">
                Check-in físico
              </p>

              <h2 className="text-lg font-black uppercase italic">
                Sube tu foto corporal
              </h2>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-[#0d2218] px-3 py-1 text-[10px] font-black text-slate-400">
            Frontal / lateral
          </span>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="checkin-photo"
            className="group relative grid min-h-[210px] cursor-pointer place-items-center overflow-hidden rounded-[28px] border border-dashed border-[#10b981]/35 bg-white/[0.035] text-center transition hover:border-[#10b981]/70 hover:bg-[#10b981]/5"
          >
            {hasPreview ? (
              <>
                <img
                  src={preview}
                  alt="Vista previa check-in"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/92 via-[#06110c]/25 to-transparent" />

                <div className="relative z-10 self-end p-4">
                  <p className="text-base font-black uppercase italic">
                    Foto actual
                  </p>

                  <p className="mt-1 text-[10px] text-white/60">
                    Toca para cambiarla.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
                  <ImagePlus size={30} />
                </div>

                <p className="text-base font-black uppercase italic">
                  Sube una foto frontal o lateral
                </p>

                <p className="mx-auto mt-2 max-w-xs text-[10px] leading-5 text-slate-400">
                  Frontal o lateral, buena luz y cuerpo completo para comparar tu evolución.
                </p>
              </div>
            )}

            <input
              id="checkin-photo"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>

          {!hasPreview ? (
            <label
              htmlFor="checkin-photo"
              className="block rounded-2xl bg-[#10b981] px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#06110c] shadow-[0_20px_60px_#22c55e22] transition hover:bg-white"
            >
              Subir foto
            </label>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <label
                htmlFor="checkin-photo"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-200 transition hover:border-[#10b981]/35 hover:text-white"
              >
                Cambiar foto
              </label>

              <button
                type="button"
                onClick={saveCheckIn}
                disabled={loading}
                className="group relative overflow-hidden rounded-2xl bg-[#10b981] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#06110c] shadow-[0_20px_60px_#22c55e22] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ScanFace size={16} />
                  {loading ? "Analizando..." : "Analizar cuerpo con IA"}
                  <ChevronRight size={15} />
                </span>
              </button>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Field
              label="Peso actual"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="72.5"
              type="number"
              step="0.1"
              required
            />

            <div className="hidden sm:block" />
          </div>

          <details className="group rounded-[28px] border border-white/10 bg-black/20 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Medidas opcionales
              <ChevronDown size={14} className="transition group-open:rotate-180" />
            </summary>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Field
                label="Cintura"
                value={form.waist}
                onChange={(e) => handleChange("waist", e.target.value)}
                placeholder="80"
                type="number"
                step="0.1"
              />

              <Field
                label="Pecho"
                value={form.chest}
                onChange={(e) => handleChange("chest", e.target.value)}
                placeholder="95"
                type="number"
                step="0.1"
              />

              <Field
                label="Cadera"
                value={form.hips}
                onChange={(e) => handleChange("hips", e.target.value)}
                placeholder="90"
                type="number"
                step="0.1"
              />

              <label className="sm:col-span-2">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Nota
                </p>

                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="h-[68px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white outline-none placeholder:text-white/20 focus:border-[#10b981]/50"
                  placeholder="Ej: entrené 4 días, mejor energía..."
                />
              </label>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>

      <input
        {...props}
        className="h-10 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-[11px] font-bold text-white outline-none placeholder:text-white/20 focus:border-[#10b981]/50"
      />
    </label>
  );
}
