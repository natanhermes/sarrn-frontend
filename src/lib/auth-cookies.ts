import Cookies from "js-cookie";

import { authUserSchema, type AuthUser } from "@/schemas/auth";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_USER_KEY = "authUser";

const cookieOptions: Cookies.CookieAttributes = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = Cookies.get(AUTH_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return authUserSchema.parse(JSON.parse(raw));
  } catch {
    Cookies.remove(AUTH_USER_KEY, { path: "/" });
    return null;
  }
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...cookieOptions,
    expires: 1,
  });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...cookieOptions,
    expires: 7,
  });
}

export function setAuthUser(user: AuthUser) {
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), {
    ...cookieOptions,
    expires: 7,
  });
}

export function clearAuthTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  Cookies.remove(AUTH_USER_KEY, { path: "/" });
}
