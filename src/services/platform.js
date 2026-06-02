export function getRuntimePlatform() {
  if (typeof window === "undefined") return "web";

  const capacitorPlatform = window.Capacitor?.getPlatform?.();
  if (capacitorPlatform === "ios" || capacitorPlatform === "android") {
    return capacitorPlatform;
  }

  const userAgent = String(window.navigator?.userAgent || "").toLowerCase();

  if (userAgent.includes("android")) return "android";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";

  return "web";
}
