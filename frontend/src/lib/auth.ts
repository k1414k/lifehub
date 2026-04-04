export const AUTH_SESSION_COOKIE_NAME = "lifehub_auth";
export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";
export const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"] as const;

export function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function sanitizeRedirectPath(pathname: string | null | undefined) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return null;
  }

  const [pathnameOnly] = pathname.split("?");

  if (isPublicAuthPath(pathnameOnly)) {
    return null;
  }

  return pathname;
}

export function buildLoginRedirectPath(pathname: string, search = "") {
  const nextPath = sanitizeRedirectPath(`${pathname}${search}`);

  if (!nextPath) {
    return "/auth/login";
  }

  const params = new URLSearchParams({ next: nextPath });
  return `/auth/login?${params.toString()}`;
}

export function getPostAuthRedirectPath(nextPath: string | null | undefined) {
  return sanitizeRedirectPath(nextPath) ?? DEFAULT_AUTHENTICATED_PATH;
}

export function extractBearerToken(headerValue?: string | null) {
  if (!headerValue) {
    return null;
  }

  const token = headerValue.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 ? token : null;
}
