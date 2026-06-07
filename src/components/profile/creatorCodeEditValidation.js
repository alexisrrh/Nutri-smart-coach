export function validateCreatorCodeEditInput(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "El código no puede estar vacío.";
  }

  const normalized = raw.toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return "El código solo puede contener letras y números.";
  }

  if (normalized.length < 5) {
    return "El código debe tener al menos 5 caracteres.";
  }

  if (normalized.length > 20) {
    return "El código no puede superar 20 caracteres.";
  }

  return null;
}
