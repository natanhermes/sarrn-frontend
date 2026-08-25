import type { Metadata } from "next";

import { DonatePageContent } from "@/components/public/donate-page-content";
import { getPublicSiteSettings } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Doe Agora — SAR",
  description:
    "Faça sua doação para o SAR e ajude a fortalecer a agricultura familiar, a agroecologia e o desenvolvimento sustentável no Rio Grande do Norte.",
};

export default async function DonatePage() {
  const settings = await getPublicSiteSettings();

  return (
    <main>
      <DonatePageContent settings={settings} />
    </main>
  );
}
