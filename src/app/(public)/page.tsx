import type { Metadata } from "next";

import { ActionLinesSection } from "@/components/public/action-lines-section";
import { ApoiadoresSection } from "@/components/public/apoiadores-section";
import { DonateSection } from "@/components/public/donate-section";
import { HeroCarousel } from "@/components/public/hero-carousel";
import { NoticiasSection } from "@/components/public/noticias-section";
import { ProjetosSection } from "@/components/public/projetos-section";
import { QuemSomos } from "@/components/public/quem-somos";
import { WhereWeAreSection } from "@/components/public/where-we-are-section";
import {
  getPublicAboutUs,
  getPublicActionLines,
  getPublicCarouselSlides,
  getPublicFundersGrouped,
  getPublicPosts,
  getPublicSiteSettings,
  getPublicStatistics,
  resolvePublicMediaUrl,
} from "@/lib/public-api";

export const metadata: Metadata = {
  title: "SAR — Semeando Autonomia e Renda no Rio Grande do Norte",
  description:
    "O SAR é uma organização social que promove agricultura sustentável, educação e desenvolvimento comunitário. Conheça nossos projetos, notícias e relatórios de transparência.",
};

export default async function HomePage() {
  const [
    projects,
    news,
    carouselSlides,
    fundersGrouped,
    actionLines,
    settings,
    statistics,
    aboutUs,
  ] = await Promise.all([
    getPublicPosts("PROJECT", 3),
    getPublicPosts(["NEWS", "ARTICLE"], 4),
    getPublicCarouselSlides(),
    getPublicFundersGrouped(),
    getPublicActionLines(),
    getPublicSiteSettings(),
    getPublicStatistics(),
    getPublicAboutUs(),
  ]);

  const heroSlides = carouselSlides.map((slide) => ({
    id: slide.id,
    imageUrl: resolvePublicMediaUrl(slide.imageUrl) || slide.imageUrl,
    badgeText: slide.badgeText,
    title: slide.title,
    subtitle: slide.subtitle,
    primaryButtonText: slide.primaryButtonText,
    primaryButtonUrl: slide.primaryButtonUrl,
    secondaryButtonText: slide.secondaryButtonText,
    secondaryButtonUrl: slide.secondaryButtonUrl,
  }));

  return (
    <main>
      <HeroCarousel slides={heroSlides} />
      <QuemSomos aboutUs={aboutUs} statistics={statistics} />
      <NoticiasSection news={news} />
      <ProjetosSection projects={projects} />
      <ActionLinesSection actionLines={actionLines} />
      <ApoiadoresSection fundersGrouped={fundersGrouped} />
      <WhereWeAreSection settings={settings} />
      <DonateSection settings={settings} />
    </main>
  );
}
