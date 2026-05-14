import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { supabase } from "../lib/supabase";

import { CheckInHero } from "../components/checkin/CheckInHero";
import { CheckInForm } from "../components/checkin/CheckInForm";
import { CheckInLoader } from "../components/checkin/CheckInLoader";
import { CheckInHistory } from "../components/checkin/CheckInHistory";
import { CheckInAlert } from "../components/checkin/CheckInAlert";
import { CheckInCompare } from "../components/checkin/CheckInCompare";
import { CheckInAnalysis } from "../components/checkin/CheckInAnalysis";
import { CheckInStatus } from "../components/checkin/CheckInStatus";
import { CheckInDetailSheet } from "../components/checkin/CheckInDetailSheet";
import { getWeightDiff } from "../components/checkin/checkinUtils";
import { createCheckin, listCheckins } from "../services/checkinService";
import {
  clearCachedProfile,
  getCachedProfile,
} from "../services/profileService";
import { AppShell, SecondaryButton } from "../components/ui";

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
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [sheetMode, setSheetMode] = useState("detail");

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

  function openAnalysisSheet() {
    if (!lastCheckin) return;
    setSheetMode("analysis");
    setSelectedCheckin(lastCheckin);
  }

  function openCheckinSheet(checkin) {
    if (!checkin) return;
    setSheetMode("detail");
    setSelectedCheckin(checkin);
  }

  function closeSheet() {
    setSelectedCheckin(null);
  }

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
    <AppShell contentClassName="px-2 pb-[96px] pt-2">
      <div className="flex min-h-[calc(100dvh-106px)] flex-col gap-2.5">
        <div className="flex items-center justify-end">
          <SecondaryButton
            type="button"
            onClick={handleLogout}
            icon={<LogOut size={14} />}
            className="w-auto border-red-400/15 bg-red-400/10 px-3 py-2 text-[10px] text-red-300 hover:border-red-300/30 hover:bg-red-400/15 hover:text-red-200"
          >
            Salir
          </SecondaryButton>
        </div>

        <CheckInHero
          profile={profile}
        />

        <CheckInAlert type="error" text={error} />
        <CheckInAlert type="success" text={message} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
          <div className="space-y-2">
            <CheckInForm
              preview={preview}
              handlePhoto={handlePhoto}
              form={form}
              handleChange={handleChange}
              saveCheckIn={saveCheckIn}
              loading={loading}
            />

            <CheckInLoader loading={loading} />

            <CheckInStatus lastCheckin={lastCheckin} weightDiff={weightDiff} />

            <CheckInCompare history={history} onSelect={openCheckinSheet} />

            <CheckInAnalysis
              lastCheckin={lastCheckin}
              profile={profile}
              weightDiff={weightDiff}
              onOpenFull={openAnalysisSheet}
            />

            <CheckInHistory
              history={history}
              loading={loadingHistory}
              onSelect={openCheckinSheet}
            />
          </div>
        </div>

        {selectedCheckin && (
          <CheckInDetailSheet
            checkin={selectedCheckin}
            mode={sheetMode}
            onClose={closeSheet}
          />
        )}
      </div>
    </AppShell>
  );
}
