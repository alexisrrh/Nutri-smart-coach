import { ImagePlus, ScanLine } from "lucide-react";

export default function FoodUploadCard({
  preview,
  handleImage,
  analyzeFood,
  loading,
}) {
  return (
    <section className="mt-2">
      <label className="group block cursor-pointer overflow-hidden rounded-[24px] bg-black/25 p-1.5 transition active:scale-[0.99]">
        <div className="relative h-[190px] overflow-hidden rounded-[20px] bg-[#04110b]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#04110b] via-[#04110b]/20 to-transparent" />

              <div className="absolute left-2 top-2 rounded-full border border-[#10b981]/25 bg-black/45 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-[#10b981] backdrop-blur-xl">
                Foto lista
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-base font-black uppercase italic text-white">
                  Imagen preparada
                </p>

                <p className="mt-0.5 text-[10px] text-white/60">
                  Toca la imagen para cambiarla.
                </p>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[#10b981]/25 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_30px_#10b98122]">
                  <ImagePlus size={28} />
                </div>

                <p className="text-lg font-black uppercase italic text-white">
                  Sube tu comida
                </p>

                <p className="mx-auto mt-1.5 max-w-[220px] text-[10px] leading-4 text-slate-400">
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

      <button
        type="button"
        onClick={analyzeFood}
        disabled={!preview || loading}
        className="group relative mt-2 w-full overflow-hidden rounded-[18px] bg-[#10b981] px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#04110b] shadow-[0_14px_45px_rgba(16,185,129,0.22)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <ScanLine size={15} />
          {loading ? "Analizando..." : "Analizar comida"}
        </span>

        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition duration-700 group-hover:translate-x-full" />
      </button>
    </section>
  );
}