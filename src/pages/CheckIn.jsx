import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save, ImagePlus } from "lucide-react";
import BottomNav from "../components/BottomNav";

const CHECKIN_KEY = "nutricoach_checkins";

export function CheckIn() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState([]);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCheckins(JSON.parse(localStorage.getItem(CHECKIN_KEY)) || []);
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFrontPhoto(reader.result);
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const saveCheckIn = () => {
    if (!frontPhoto || !weight) return;

    const newCheckin = {
      id: crypto.randomUUID(),
      frontPhoto,
      weight: Number(weight),
      note,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCheckin, ...checkins];
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated));
    setCheckins(updated);
    setSaved(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 900);
  };

  const lastCheckin = checkins[0];

  return (
    <section className="min-h-screen bg-[#06130d] px-4 py-8 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-emerald-300 hover:bg-white/15"
        >
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>

        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
            Check-in semanal
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Registra tu progreso
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            Sube una foto frontal y tu peso actual una vez por semana para ver tu evolución.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                <Camera />
              </div>
              <div>
                <h2 className="text-xl font-black">Foto frontal</h2>
                <p className="text-sm text-white/50">
                  Usa misma luz, distancia y postura cada semana.
                </p>
              </div>
            </div>

            <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-400/30 bg-white/5 p-6 text-center hover:bg-white/10">
              {preview ? (
                <img
                  src={preview}
                  alt="Check-in frontal"
                  className="h-[360px] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="mb-4 text-emerald-300" size={48} />
                  <p className="text-lg font-black">Subir foto</p>
                  <p className="mt-2 text-sm text-white/50">Foto de cuerpo completo</p>
                </>
              )}

              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>

            <div className="mt-5 grid gap-4">
              <label>
                <p className="mb-2 font-bold text-white/80">Peso actual (kg)</p>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#06130d] px-4 py-4 font-semibold text-white outline-none focus:border-emerald-400"
                  placeholder="Ej: 72"
                />
              </label>

              <label>
                <p className="mb-2 font-bold text-white/80">Nota opcional</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#06130d] px-4 py-4 font-semibold text-white outline-none focus:border-emerald-400"
                  placeholder="Ej: Me siento con más energía esta semana..."
                />
              </label>

              <button
                onClick={saveCheckIn}
                disabled={!frontPhoto || !weight}
                className="flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-40"
              >
                <Save size={22} />
                Guardar check-in
              </button>

              {saved && (
                <p className="rounded-2xl bg-green-400/10 p-3 text-center font-bold text-green-300">
                  ✅ Check-in guardado
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-black">Último progreso</h2>

            {!lastCheckin ? (
              <div className="mt-5 rounded-3xl bg-white/5 p-6 text-white/60">
                Aún no tienes check-ins guardados.
              </div>
            ) : (
              <div className="mt-5">
                <img
                  src={lastCheckin.frontPhoto}
                  alt="Último check-in"
                  className="h-[360px] w-full rounded-[2rem] object-cover"
                />

                <div className="mt-5 grid gap-3">
                  <Info label="Peso" value={`${lastCheckin.weight} kg`} />
                  <Info
                    label="Fecha"
                    value={new Date(lastCheckin.createdAt).toLocaleDateString("es-ES")}
                  />
                  <Info label="Nota" value={lastCheckin.note || "Sin nota"} />
                </div>
              </div>
            )}

            <p className="mt-6 text-xs text-white/40">
              * La comparación visual es aproximada. La luz, ropa, postura y ángulo pueden alterar la percepción del progreso.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
        {label}
      </p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}