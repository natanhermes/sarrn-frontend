"use client";

import { usePathname } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { AuthHydrator } from "@/components/admin/auth-hydrator";
import { QueryProvider } from "@/components/providers/query-provider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <QueryProvider>
      <AuthHydrator>
        {isLoginPage ? children : <AdminShell>{children}</AdminShell>}
      </AuthHydrator>
    </QueryProvider>
  );
}
