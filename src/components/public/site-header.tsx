"use client";

import { HeartHandshake, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

const homeLink = { label: "Início", href: "/#inicio" };
const sectionLinks = [
  { label: "Projetos", href: "/#projetos" },
  { label: "Notícias", href: "/#noticias" },
];
const agendaLink = { label: "Agenda", href: "/agenda" };

const publicacoesMenuItems = [
  { id: "cartilhas", title: "Cartilhas", href: "/publicacoes?type=BOOKLET" },
  { id: "ebooks", title: "E-books", href: "/publicacoes?type=EBOOK" },
  { id: "artigos", title: "Artigos", href: "/publicacoes?type=ARTICLE" },
  { id: "biblioteca", title: "Biblioteca", href: "/publicacoes?type=LIBRARY" },
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
  "h-auto rounded-md bg-transparent px-2 xl:px-3 py-2 text-[13px] xl:text-sm font-medium text-white/90 hover:bg-transparent hover:text-white/90 focus:bg-transparent focus:text-white/90 data-popup-open:bg-transparent data-popup-open:text-white/90 data-popup-open:hover:bg-transparent data-open:bg-transparent data-open:text-white/90 data-open:hover:bg-transparent data-open:focus:bg-transparent";

const navLinkClassName =
  "rounded-md px-2 xl:px-3 py-2 text-[13px] xl:text-sm font-medium text-white/90 transition-colors hover:text-white whitespace-nowrap";

export function SiteHeader({
  menuItems,
  sarMenuItems,
  transparenciaMenuItems,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const solid = !isHome || isScrolled;

  return (
    <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
          solid ? "bg-[#356e7c] py-4 shadow-md" : "bg-transparent py-6",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Página inicial do SAR" className="shrink-0">
            <SarrnLogo />
          </Link>

          <nav className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
            <a
              key={homeLink.href}
              href={homeLink.href}
              className={navLinkClassName}
            >
              {homeLink.label}
            </a>

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

            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={navLinkClassName}
              >
                {link.label}
              </a>
            ))}

            <NavigationMenu className="max-w-none">
              <NavigationMenuList className="gap-0">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={navTriggerClassName}>
                    Publicações
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-56 p-2">
                    <ul className="flex flex-col gap-1">
                      {publicacoesMenuItems.map((item) => (
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
              </NavigationMenuList>
            </NavigationMenu>

            <a
              key={agendaLink.href}
              href={agendaLink.href}
              className={navLinkClassName}
            >
              {agendaLink.label}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/doar"
              className="hidden sm:flex shrink-0 whitespace-nowrap items-center gap-2 rounded-full bg-orange-500 px-4 py-2 xl:px-5 xl:py-2 text-xs font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-orange-600 hover:shadow-2xl active:scale-95 xl:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              aria-label="Doe Agora para o SAR"
            >
              <HeartHandshake className="size-4.5 xl:size-5 shrink-0 text-white" />
              <span>Doe Agora</span>
            </Link>
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
              <a
                key={homeLink.href}
                href={homeLink.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                {homeLink.label}
              </a>

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

              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2">
                <p className="px-3 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Publicações
                </p>
                <div className="mt-1 flex flex-col">
                  {publicacoesMenuItems.map((item) => (
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

              <a
                key={agendaLink.href}
                href={agendaLink.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                {agendaLink.label}
              </a>
              <Button
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 font-bold text-white hover:bg-orange-600"
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/doar" onClick={() => setOpen(false)} />
                }
              >
                <HeartHandshake className="size-5 shrink-0 text-white" />
                Doe Agora
              </Button>
            </nav>
          </div>
        ) : null}
      </header>
  );
}
