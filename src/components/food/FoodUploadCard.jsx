import { ImagePlus, ScanLine, UploadCloud } from "lucide-react";

export default function FoodUploadCard({
  preview,
  handleImage,
  analyzeFood,
  loading,
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07170f] p-3">
      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative z-10">
        <label className="group relative grid min-h-[260px] cursor-pointer place-items-center overflow-hidden rounded-[28px] border border-dashed border-[#10b981]/35 bg-black/20 text-center transition hover:border-[#10b981]/70 hover:bg-[#10b981]/5">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#06110c]/95 via-[#06110c]/20 to-transparent" />

              <div className="absolute inset-x-0 top-1/2 h-px bg-[#10b981]/70 shadow-[0_0_18px_#10b981] opacity-70" />

              <div className="relative z-10 self-end p-4">
                <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-[#10b981] text-[#06110c]">
                  <ScanLine size={22} />
                </div>

                <p className="text-xl font-black uppercase italic">
                  Foto lista
                </p>

                <p className="mt-1 text-xs normal-case text-white/60">
                  Toca para cambiar la imagen.
                </p>
              </div>
            </>
          ) : (
            <div className="p-5">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_35px_#10b98122]">
                <ImagePlus size={34} />
              </div>

              <p className="text-2xl font-black uppercase italic">
                Subir comida
              </p>

              <p className="mx-auto mt-2 max-w-xs text-xs normal-case leading-5 text-slate-400">
                Sube una foto clara. La IA estimará calorías, macros y calidad nutricional.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#10b981]">
                <UploadCloud size={13} />
                JPG · PNG · WEBP
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={analyzeFood}
          disabled={!preview || loading}
          className="group relative mt-3 w-full overflow-hidden rounded-2xl bg-[#10b981] px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#06110c] shadow-[0_20px_70px_rgba(16,185,129,0.2)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <ScanLine size={17} />
            {loading ? "Analizando..." : "Analizar comida"}
          </span>

          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
        </button>
      </div>
    </section>
  );
}