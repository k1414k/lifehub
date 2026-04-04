import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth";

function cookieAttributes() {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `Path=/; SameSite=Lax${secure}`;
}

export function setAuthSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_SESSION_COOKIE_NAME}=1; ${cookieAttributes()}`;
}

export function clearAuthSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_SESSION_COOKIE_NAME}=; Max-Age=0; ${cookieAttributes()}`;
}
