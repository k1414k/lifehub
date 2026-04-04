import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME, buildLoginRedirectPath, isPublicAuthPath } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // パブリックパスはそのまま通す
  if (isPublicAuthPath(pathname)) {
    return NextResponse.next();
  }

  const hasAuthSession = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value === "1";

  if (!hasAuthSession) {
    return NextResponse.redirect(
      new URL(buildLoginRedirectPath(pathname, request.nextUrl.search), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
