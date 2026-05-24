export function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
