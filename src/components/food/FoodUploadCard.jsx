import { ImagePlus } from "lucide-react";

export default function FoodUploadCard({
  preview,
  handleImage,
  analyzeFood,
  loading,
}) {
  return (
    <section className="min-h-0">
      <label className="group block cursor-pointer overflow-hidden rounded-[24px] bg-black/25 p-1.5 transition active:scale-[0.99]">
        <div className="relative h-[168px] max-h-[180px] overflow-hidden rounded-[20px] bg-[#04110b]">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Vista previa comida"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#04110b] via-[#04110b]/20 to-transparent" />

              <div className="absolute left-2 top-2 rounded-full border border-[#10b981]/25 bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#10b981] backdrop-blur-xl">
                Foto lista
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-base font-black uppercase italic text-white">
                  Imagen preparada
                </p>

                <p className="mt-0.5 text-xs text-white/60">
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

                <p className="mx-auto mt-1.5 max-w-[220px] text-xs leading-4 text-slate-400">
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
        className="group relative mt-2 w-full overflow-hidden rounded-[1.15rem] border border-emerald-300/25 bg-gradient-to-br from-[#063d2d] via-[#07523b] to-[#0a6b4c] px-3 py-3 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)] transition duration-300 hover:border-emerald-200/40 hover:shadow-[0_18px_42px_rgba(16,185,129,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
       <span className="relative z-10 flex min-h-[48px] items-center justify-center gap-9">
              <span className="relative grid h-18 w-19 shrink-0 place-items-center overflow-hidden rounded-[0.95rem] bg-[#06110e]/35">
                <span className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60%,#6ee7b7_72%,transparent_90%,transparent_100%)] opacity-70 animate-[spin_2.5s_linear_infinite]" />
                <span className="absolute inset-[2px] rounded-[0.9rem] bg-[#07583f]" />
            <img
              src="/icons/scan-comida-icon.png"
              alt=""
              aria-hidden="true"
              className="relative z-10 h-18 w-25 object-contain"
            />
          </span>

          <span className="min-w-0 text-left">
            <span className="block text-[12px] font-black uppercase leading-tight tracking-[0.12em] text-white">
              {loading ? "ANALIZANDO..." : "ANALIZAR COMIDA"}
            </span>
            <span className="mt-0.5 block text-[10px] font-bold leading-tight text-emerald-100/82">
              IA nutricional + macros
            </span>
            <span className="mt-1 block text-[9px] font-medium leading-tight text-emerald-50/62">
              Detecta calorías, proteína y calidad nutricional
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}
