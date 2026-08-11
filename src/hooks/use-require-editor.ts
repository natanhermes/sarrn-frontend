"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";

import { getAuthUser } from "@/lib/auth-cookies";
import { useAuth } from "@/store/useAuth";

function canManageEditorContent(role?: string | null) {
  return role === "ADMIN" || role === "EDITOR";
}

export function useRequireEditor() {
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

    if (currentUser && !canManageEditorContent(currentUser.role)) {
      router.replace("/dashboard");
    }
  }, [hasMounted, storeUser, router]);

  const sessionUser = hasMounted ? (storeUser ?? getAuthUser()) : null;
  const allowed = canManageEditorContent(sessionUser?.role);

  return {
    sessionUser,
    allowed,
    isChecking: !hasMounted,
    shouldRender: hasMounted && Boolean(sessionUser && allowed),
  };
}
