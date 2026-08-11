"use client";

import { useLayoutEffect } from "react";

import { getAccessToken, getAuthUser } from "@/lib/auth-cookies";
import { useAuth } from "@/store/useAuth";

export function AuthHydrator({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const login = useAuth((state) => state.login);
  const logout = useAuth((state) => state.logout);

  useLayoutEffect(() => {
    const accessToken = getAccessToken();
    const user = getAuthUser();

    if (accessToken && user) {
      login(user);
      return;
    }

    if (!accessToken) {
      logout();
    }
  }, [login, logout]);

  return children;
}
