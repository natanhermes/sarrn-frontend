import { NextResponse, type NextRequest } from "next/server";

import { getRoleFromJwt } from "@/lib/jwt";
import { authUserSchema, type UserRole } from "@/schemas/auth";

const CONTRIBUTOR_BLOCKED_PREFIXES = [
  "/dashboard/users",
  "/dashboard/settings",
  "/dashboard/agenda",
  "/dashboard/carousel",
  "/dashboard/pages",
  "/dashboard/funders",
  "/dashboard/action-lines",
  "/dashboard/statistics",
] as const;

const ADMIN_ONLY_PREFIXES = [
  "/dashboard/users",
  "/dashboard/settings",
] as const;

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getRoleFromAuthUserCookie(raw?: string): UserRole | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = authUserSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.role : null;
  } catch {
    return null;
  }
}

function resolveRole(
  request: NextRequest,
  accessToken: string,
): UserRole | null {
  return (
    getRoleFromJwt(accessToken) ??
    getRoleFromAuthUserCookie(request.cookies.get("authUser")?.value)
  );
}

function isBlockedForRole(pathname: string, role: UserRole | null) {
  if (!role) {
    return false;
  }

  if (
    role === "CONTRIBUTOR" &&
    matchesPrefix(pathname, CONTRIBUTOR_BLOCKED_PREFIXES)
  ) {
    return true;
  }

  if (role === "EDITOR" && matchesPrefix(pathname, ADMIN_ONLY_PREFIXES)) {
    return true;
  }

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = Boolean(accessToken);
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname === "/login";

  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute && accessToken) {
    const role = resolveRole(request, accessToken);

    if (isBlockedForRole(pathname, role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
