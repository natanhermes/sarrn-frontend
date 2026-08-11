"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";

import { getAuthUser } from "@/lib/auth-cookies";
import { useAuth } from "@/store/useAuth";

export function useRequireAdmin() {
  const router = useRouter();
  const storeUser = useAuth((state) => state.user);
  const [hasMounted, setHasMounted] = useState(false);

  useLayoutEffect(() => {
    setHasMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!hasMounted) {
      return;
    }

    const currentUser = useAuth.getState().user ?? getAuthUser();

    if (currentUser && currentUser.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [hasMounted, storeUser, router]);

  const sessionUser = hasMounted ? (storeUser ?? getAuthUser()) : null;
  const isAdmin = sessionUser?.role === "ADMIN";

  return {
    sessionUser,
    isAdmin,
    isChecking: !hasMounted,
    shouldRender: hasMounted && Boolean(sessionUser && isAdmin),
  };
}
