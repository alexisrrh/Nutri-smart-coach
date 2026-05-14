import {
  Camera,
  ChevronRight,
  ImagePlus,
  Save,
} from "lucide-react";

export function CheckInForm({
  preview,
  handlePhoto,
  form,
  handleChange,
  saveCheckIn,
  loading,
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#091710] shadow-2xl shadow-black/20">
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#10b981]/12 blur-3xl" />

      <div className="relative z-10 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
              <Camera size={20} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#10b981]">
                Check-in físico
              </p>

              <h2 className="text-xl font-black uppercase italic">
                Foto y medidas
              </h2>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-[#0d2218] px-3 py-1 text-[9px] font-black text-slate-400">
            Máx 4MB
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <label className="group relative grid min-h-[220px] cursor-pointer place-items-center overflow-hidden rounded-[30px] border border-dashed border-[#10b981]/35 bg-white/[0.035] text-center transition hover:border-[#10b981]/70 hover:bg-[#10b981]/5">
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Vista previa check-in"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/92 via-[#06110c]/20 to-transparent" />

                <div className="relative z-10 self-end p-4">
                  <p className="text-lg font-black uppercase italic">
                    Foto lista
                  </p>

                  <p className="mt-1 text-xs text-white/60">
                    Toca para cambiar.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">
                  <ImagePlus size={30} />
                </div>

                <p className="text-xl font-black uppercase italic">
                  Sube tu foto
                </p>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-400">
                  Frontal, buena luz y misma distancia para comparar tu físico.
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Peso"
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="72.5"
                type="number"
                step="0.1"
              />

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
            </div>

            <label>
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                Nota
              </p>

              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="h-[74px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white outline-none placeholder:text-white/20 focus:border-[#10b981]/50"
                placeholder="Ej: entrené 4 días, mejor energía..."
              />
            </label>

            <PrimaryButton onClick={saveCheckIn} disabled={loading}>
              <Save size={17} />
              {loading ? "Guardando..." : "Guardar check-in"}
              <ChevronRight size={15} />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>

      <input
        {...props}
        className="h-10 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white outline-none placeholder:text-white/20 focus:border-[#10b981]/50"
      />
    </label>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full overflow-hidden rounded-2xl bg-[#10b981] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#06110c] shadow-[0_20px_60px_#22c55e22] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
    </button>
  );
}
