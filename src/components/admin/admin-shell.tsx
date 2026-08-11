"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 bg-muted/30">
      <div className="hidden md:block">
        <AdminSidebar className="sticky top-0 h-svh" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
