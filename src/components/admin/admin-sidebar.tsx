"use client";

import {
  CalendarDaysIcon,
  ChartColumnIcon,
  FileTextIcon,
  HandshakeIcon,
  ImagesIcon,
  InfoIcon,
  LayoutDashboardIcon,
  LayersIcon,
  NewspaperIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/schemas/auth";
import { useAuth } from "@/store/useAuth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  roles?: UserRole[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Usuários",
    href: "/dashboard/users",
    icon: UsersIcon,
    adminOnly: true,
  },
  {
    label: "Quem Somos",
    href: "/dashboard/about",
    icon: InfoIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Publicações",
    href: "/dashboard/posts",
    icon: FileTextIcon,
  },
  {
    label: "Carrossel",
    href: "/dashboard/carousel",
    icon: ImagesIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Apoiadores",
    href: "/dashboard/funders",
    icon: HandshakeIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Linhas de Atuação",
    href: "/dashboard/action-lines",
    icon: LayersIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Estatísticas",
    href: "/dashboard/statistics",
    icon: ChartColumnIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Páginas",
    href: "/dashboard/pages",
    icon: NewspaperIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Agenda",
    href: "/dashboard/agenda",
    icon: CalendarDaysIcon,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Configurações",
    href: "/dashboard/settings",
    icon: SettingsIcon,
    adminOnly: true,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const role = useAuth((state) => state.user?.role);

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && role !== "ADMIN") {
      return false;
    }

    if (item.roles && (!role || !item.roles.includes(role))) {
      return false;
    }

    return true;
  });

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-5 py-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Painel
        </p>
        <p className="mt-1 text-sm font-semibold">Portal Institucional</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
