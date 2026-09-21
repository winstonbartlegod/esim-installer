export type PhoneOs = "ios" | "android" | "other";

export function detectPhoneOs(ua = typeof navigator === "undefined" ? "" : navigator.userAgent): PhoneOs {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function isInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
