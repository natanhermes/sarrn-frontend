import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicPagesMenu } from "@/lib/public-api";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = await getPublicPagesMenu();

  return (
    <div className="relative flex min-h-full min-w-0 flex-col overflow-x-hidden bg-background">
      <SiteHeader menuItems={menuItems} />
      <div className="min-w-0 flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
