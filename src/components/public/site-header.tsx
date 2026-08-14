"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SarrnLogo } from "@/components/public/sarrn-logo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  getInstitutionalPagePath,
  MENU_GROUP_LABELS,
  type InstitutionalPageMenuItem,
} from "@/schemas/institutional-pages";

const staticLinks = [
  { label: "Início", href: "/#inicio" },
  { label: "Projetos", href: "/#projetos" },
  { label: "Notícias", href: "/#noticias" },
  { label: "Agenda", href: "/agenda" },
  { label: "Publicações", href: "/publicacoes" },
];

export type HeaderMenuItem = {
  id: string;
  title: string;
  href: string;
  menuGroup: "SAR" | "TRANSPARENCIA";
};

type SiteHeaderProps = {
  menuItems?: InstitutionalPageMenuItem[];
  sarMenuItems?: HeaderMenuItem[];
  transparenciaMenuItems?: HeaderMenuItem[];
};

const navTriggerClassName =
  "h-auto rounded-md bg-transparent px-3 py-2 text-sm font-medium text-white/90 hover:bg-transparent hover:text-white/90 focus:bg-transparent focus:text-white/90 data-popup-open:bg-transparent data-popup-open:text-white/90 data-popup-open:hover:bg-transparent data-open:bg-transparent data-open:text-white/90 data-open:hover:bg-transparent data-open:focus:bg-transparent";

export function SiteHeader({
  menuItems,
  sarMenuItems,
  transparenciaMenuItems,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Resolution logic: use explicit sar/transparencia arrays if provided, else fallback to menuItems
  const sarList: HeaderMenuItem[] =
    sarMenuItems ??
    (menuItems
      ? menuItems
          .filter((item) => item.menuGroup === "SAR")
          .map((item) => ({
            id: item.id,
            title: item.title,
            href: getInstitutionalPagePath(item.menuGroup, item.slug),
            menuGroup: item.menuGroup,
          }))
      : []);

  const transparenciaList: HeaderMenuItem[] =
    transparenciaMenuItems ??
    (menuItems
      ? menuItems
          .filter((item) => item.menuGroup === "TRANSPARENCIA")
          .map((item) => ({
            id: item.id,
            title: item.title,
            href: getInstitutionalPagePath(item.menuGroup, item.slug),
            menuGroup: item.menuGroup,
          }))
      : []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const solid = !isHome || isScrolled;

  return (
    <>
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute top-10 left-0 z-0 h-1 w-full bg-transparent"
        aria-hidden="true"
      />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
          solid ? "bg-[#356e7c] py-4 shadow-md" : "bg-transparent py-6",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Página inicial da SARRN">
            <SarrnLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {staticLinks.slice(0, 1).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}

            {sarList.length > 0 || transparenciaList.length > 0 ? (
              <NavigationMenu className="max-w-none">
                <NavigationMenuList className="gap-0">
                  {(
                    [
                      ["SAR", sarList],
                      ["TRANSPARENCIA", transparenciaList],
                    ] as const
                  ).map(([group, items]) =>
                    items.length > 0 ? (
                      <NavigationMenuItem key={group}>
                        <NavigationMenuTrigger className={navTriggerClassName}>
                          {MENU_GROUP_LABELS[group]}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="min-w-56 p-2">
                          <ul className="flex flex-col gap-1">
                            {items.map((item) => (
                              <li key={item.id}>
                                <NavigationMenuLink
                                  closeOnClick
                                  render={<Link href={item.href} />}
                                  className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  {item.title}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ) : null,
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}

            {staticLinks.slice(1).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="lg"
              nativeButton={false}
              className="hidden bg-brand-green text-white hover:bg-brand-green/90 sm:inline-flex"
              render={<Link href="/#doacoes" />}
            >
              Doar agora
            </Button>
            <Button
              size="icon-lg"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Abrir menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-white/15 bg-[#356e7c] px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {staticLinks.slice(0, 1).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}

              {(
                [
                  ["SAR", sarList],
                  ["TRANSPARENCIA", transparenciaList],
                ] as const
              ).map(([group, items]) =>
                items.length > 0 ? (
                  <div key={group} className="pt-2">
                    <p className="px-3 text-xs font-semibold tracking-wide text-white/60 uppercase">
                      {MENU_GROUP_LABELS[group]}
                    </p>
                    <div className="mt-1 flex flex-col">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}

              {staticLinks.slice(1).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="mt-2 bg-brand-green text-white hover:bg-brand-green/90"
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/#doacoes" onClick={() => setOpen(false)} />
                }
              >
                Doar agora
              </Button>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
