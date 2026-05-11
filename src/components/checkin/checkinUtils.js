export function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getWeightDiff(lastCheckin, previousCheckin) {
  if (!lastCheckin || !previousCheckin) return null;

  const current = Number(lastCheckin.weight || 0);
  const previous = Number(previousCheckin.weight || 0);

  if (!current || !previous) return null;

  return Number((current - previous).toFixed(1));
}

export function shortText(text = "", max = 180) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function formatDate(date) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("es-ES");
  } catch {
    return "-";
  }
}