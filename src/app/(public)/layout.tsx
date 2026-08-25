import { FloatingDonateButton } from "@/components/public/floating-donate-button";
import { FloatingSocialSidebar } from "@/components/public/floating-social-sidebar";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader, type HeaderMenuItem } from "@/components/public/site-header";
import {
  getPublicAboutUs,
  getPublicPagesMenu,
  getPublicSiteSettings,
  type PublicSiteSettings,
} from "@/lib/public-api";
import { hasValidBlocks } from "@/lib/utils";
import { getInstitutionalPagePath } from "@/schemas/institutional-pages";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let sarMenuItems: HeaderMenuItem[] = [];
  let transparenciaMenuItems: HeaderMenuItem[] = [];
  let settings: PublicSiteSettings | null = null;

  try {
    const [aboutUs, pagesMenu, fetchedSettings] = await Promise.all([
      getPublicAboutUs(),
      getPublicPagesMenu(),
      getPublicSiteSettings(),
    ]);

    settings = fetchedSettings;

    // 1. Inserir "Quem somos" se houver blocos válidos em detailedBlocks
    if (hasValidBlocks(aboutUs?.detailedBlocks)) {
      sarMenuItems.push({
        id: "quem-somos",
        title: "Quem somos",
        href: "/quem-somos",
        menuGroup: "SAR",
      });
    }

    // 2. Mapear páginas dinâmicas vindas da API
    for (const item of pagesMenu) {
      const formattedItem: HeaderMenuItem = {
        id: String(item.id),
        title: item.title,
        href: getInstitutionalPagePath(item.menuGroup, item.slug),
        menuGroup: item.menuGroup,
      };

      if (item.menuGroup === "SAR") {
        sarMenuItems.push(formattedItem);
      } else if (item.menuGroup === "TRANSPARENCIA") {
        transparenciaMenuItems.push(formattedItem);
      }
    }
  } catch {
    // Tratar falha graciosamente em caso de erro na API
    sarMenuItems = [];
    transparenciaMenuItems = [];
    settings = null;
  }

  return (
    <div className="relative flex min-h-full min-w-0 flex-col overflow-x-hidden bg-background">
      <SiteHeader
        sarMenuItems={sarMenuItems}
        transparenciaMenuItems={transparenciaMenuItems}
      />
      <div className="min-w-0 flex-1">{children}</div>
      <FloatingSocialSidebar settings={settings} />
      <FloatingDonateButton />
      <SiteFooter />
    </div>
  );
}
