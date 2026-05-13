export function getCache(key, fallback = null) {
  return safeParse(localStorage.getItem(key), fallback);
}

export function setCache(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeCache(key) {
  localStorage.removeItem(key);
}

export function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
