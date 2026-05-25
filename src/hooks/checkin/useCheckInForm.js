import { useState } from "react";

const INITIAL_FORM = {
  weight: "",
  waist: "",
  chest: "",
  hips: "",
  notes: "",
};

export function useCheckInForm() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [showMeasures, setShowMeasures] = useState(false);

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM });
    setShowMeasures(false);
  }

  return {
    form,
    handleChange,
    resetForm,
    setForm,
    setShowMeasures,
    showMeasures,
  };
}
