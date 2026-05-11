import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";

import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

import { CheckInHero } from "../components/checkin/CheckInHero";
import { CheckInForm } from "../components/checkin/CheckInForm";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { CheckInHistory } from "../components/checkin/CheckInHistory";
import { CheckInNotice } from "../components/checkin/CheckInNotice";
import { CheckInAlert } from "../components/checkin/CheckInAlert";

import {
  getWeightDiff,
  safeParse,
} from "../components/checkin/checkinUtils";

const PROFILE_KEY = "nutricoach_profile";

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://nutricoach-backend-frlc.onrender.com";

export function CheckIn() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    weight: "",
    waist: "",
    chest: "",
    hips: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingHistory(true);
    setError("");

    const savedProfile = safeParse(localStorage.getItem(PROFILE_KEY), null);
    setProfile(savedProfile);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Necesitas iniciar sesión para guardar tu progreso.");
      setLoadingHistory(false);
      return;
    }

    setUser(user);

    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando checkins:", error);
      setError("No se pudo cargar tu historial de progreso.");
      setLoadingHistory(false);
      return;
    }

    setHistory(data || []);
    setLoadingHistory(false);
  }

  const lastCheckin = history[0];
  const previousCheckin = history[1];

  const weightDiff = useMemo(
    () => getWeightDiff(lastCheckin, previousCheckin),
    [lastCheckin, previousCheckin]
  );

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhoto(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      setError("La imagen es demasiado pesada. Máximo 4MB.");
      return;
    }

    setError("");
    setMessage("");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function saveCheckIn() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Necesitas iniciar sesión.");
      return;
    }

    if (!file) {
      setError("Sube una foto frontal de cuerpo completo.");
      return;
    }

    if (!form.weight) {
      setError("Introduce tu peso actual.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("user_id", user.id);
      formData.append("image", file);
      formData.append("weight", form.weight);
      formData.append("waist", form.waist);
      formData.append("chest", form.chest);
      formData.append("hips", form.hips);
      formData.append("notes", form.notes);

      const response = await fetch(`${API_URL}/checkins`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("RESPUESTA CHECKIN:", data);

      if (!response.ok) {
        throw new Error(data.detail || data.error || "No se pudo guardar.");
      }

      setHistory((prev) => [data.checkin, ...prev]);

      setFile(null);
      setPreview(null);

      setForm({
        weight: "",
        waist: "",
        chest: "",
        hips: "",
        notes: "",
      });

      setMessage("Check-in guardado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar el check-in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem(PROFILE_KEY);
    navigate("/");
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#06110c] px-3 pb-28 pt-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b98120,transparent_38%),radial-gradient(circle_at_bottom_left,#22c55e12,transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-3">
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-300 transition hover:bg-[#10b981] hover:text-[#06110c]"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-red-400/70"
          >
            <LogOut size={14} />
            Salir
          </button>
        </header>

        <section className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <CheckInHero
            lastCheckin={lastCheckin}
            weightDiff={weightDiff}
            profile={profile}
          />

          <CheckInForm
            preview={preview}
            handlePhoto={handlePhoto}
            form={form}
            handleChange={handleChange}
            saveCheckIn={saveCheckIn}
            loading={loading}
          />
        </section>

        <CheckInLoader loading={loading} />

        <CheckInAlert type="error" text={error} />
        <CheckInAlert type="success" text={message} />

        <CheckInNotice />

        <CheckInHistory history={history} loading={loadingHistory} />
      </div>

      <BottomNav />
    </section>
  );
}