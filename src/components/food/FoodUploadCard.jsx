import { ImagePlus, ScanLine } from "lucide-react";

export default function FoodUploadCard({
  preview,
  handleImage,
  analyzeFood,
  loading,
}) {
  return (
    <section className="mt-3">
      <label className="group block cursor-pointer overflow-hidden rounded-[32px] bg-black/25 p-2 transition active:scale-[0.99]">
        <div className="relative h-[250px] overflow-hidden rounded-[26px] bg-[#04110b]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#04110b] via-[#04110b]/20 to-transparent" />

              <div className="absolute left-3 top-3 rounded-full border border-[#10b981]/25 bg-black/45 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#10b981] backdrop-blur-xl">
                Foto lista
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xl font-black uppercase italic text-white">
                  Imagen preparada
                </p>

                <p className="mt-1 text-[11px] normal-case text-white/60">
                  Toca la imagen si quieres cambiarla.
                </p>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_35px_#10b98122]">
                  <ImagePlus size={34} />
                </div>

                <p className="text-xl font-black uppercase italic text-white">
                  Sube tu comida
                </p>

                <p className="mx-auto mt-2 max-w-[240px] text-[11px] normal-case leading-5 text-slate-400">
                  Usa buena luz y que el plato se vea completo.
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </div>
      </label>

      <button
        type="button"
        onClick={analyzeFood}
        disabled={!preview || loading}
        className="group relative mt-3 w-full overflow-hidden rounded-2xl bg-[#10b981] px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#04110b] shadow-[0_18px_60px_rgba(16,185,129,0.25)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <ScanLine size={16} />
          {loading ? "Analizando..." : "Analizar comida"}
        </span>

        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
      </button>
    </section>
  );
}