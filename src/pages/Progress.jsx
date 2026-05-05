import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function Progress() {
  const { user } = useAuth();
  const [peso, setPeso] = useState("");
  const [nota, setNota] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getLogs() {
    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setLogs(data || []);
  }

  useEffect(() => {
    if (user) getLogs();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("progress_logs").insert({
      user_id: user.id,
      peso: Number(peso),
      nota,
    });

    setLoading(false);

    if (!error) {
      setPeso("");
      setNota("");
      getLogs();
    }
  }

  return (
    <main className="min-h-screen bg-[#07130d] text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <h1 className="text-4xl font-bold md:text-6xl">Progreso</h1>
        <p className="mt-4 text-white/60">
          Registra tu peso y controla tu evolución.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-2xl font-bold">Nuevo registro</h2>

            <div className="mt-6 space-y-4">
              <input
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="input"
                placeholder="Peso actual en kg"
                type="number"
                step="0.1"
                required
              />

              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="input min-h-28 resize-none"
                placeholder="Nota opcional"
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-emerald-400 py-3 font-bold text-black disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar progreso"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Historial</h2>

            <div className="mt-6 space-y-4">
              {logs.length === 0 ? (
                <p className="text-white/60">Aún no hay registros.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-2xl font-bold text-emerald-300">
                        {log.peso} kg
                      </h3>

                      <span className="text-sm text-white/50">
                        {new Date(log.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>

                    {log.nota && (
                      <p className="mt-3 text-white/60">{log.nota}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}