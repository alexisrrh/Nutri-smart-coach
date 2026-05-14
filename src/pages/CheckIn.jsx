import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, LogOut } from "lucide-react";

import { supabase } from "../lib/supabase";

import { CheckInHero } from "../components/checkin/CheckInHero";
import { CheckInForm } from "../components/checkin/CheckInForm";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { CheckInHistory } from "../components/checkin/CheckInHistory";
import { CheckInNotice } from "../components/checkin/CheckInNotice";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInCompare } from "../components/checkin/CheckInCompare";
import { getWeightDiff } from "../components/checkin/checkinUtils";
import { createCheckin, listCheckins } from "../services/checkinService";
import {
  clearCachedProfile,
  getCachedProfile,
} from "../services/profileService";
import {
  AppShell,
  PageHeaderCard,
  SecondaryButton,
} from "../components/ui";

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

  const loadData = useCallback(async () => {
    setLoadingHistory(true);
    setError("");

    setProfile(getCachedProfile());

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Necesitas iniciar sesión para guardar tu check-in físico.");
      setLoadingHistory(false);
      return;
    }

    setUser(user);

    const checkins = await listCheckins(user.id);

    setHistory(checkins);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

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

      const checkin = await createCheckin({
        userId: user.id,
        image: file,
        weight: form.weight,
        waist: form.waist,
        chest: form.chest,
        hips: form.hips,
        notes: form.notes,
      });

      setHistory((prev) => [checkin, ...prev]);

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
    clearCachedProfile();
    navigate("/");
  }

  return (
    <AppShell>
        <div className="mb-4 flex items-center justify-between gap-3">
          <SecondaryButton
            type="button"
            onClick={() => navigate("/dashboard")}
            icon={<ArrowLeft size={15} />}
            className="w-auto px-3 py-2 text-[10px]"
          >
            Dashboard
          </SecondaryButton>

          <SecondaryButton
            type="button"
            onClick={handleLogout}
            icon={<LogOut size={14} />}
            className="w-auto border-red-400/15 bg-red-400/10 px-3 py-2 text-[10px] text-red-300 hover:border-red-300/30 hover:bg-red-400/15 hover:text-red-200"
          >
            Salir
          </SecondaryButton>
        </div>

        <PageHeaderCard
          badge="Check-in físico"
          badgeIcon={<Camera size={14} />}
          icon={<Camera size={18} />}
          title="Foto y medidas"
          description="Registra tu físico con foto, peso y medidas para comparar tu evolución."
        />

        <section className="mt-4 space-y-3">
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
        <CheckInCompare history={history} />
        <CheckInHistory history={history} loading={loadingHistory} />
    </AppShell>
  );
}
