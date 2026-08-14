import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlockRenderer } from "@/components/shared/block-renderer";
import { getPublicAboutUs } from "@/lib/public-api";
import { hasValidBlocks } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getPublicAboutUs();

  return {
    title: about?.title ? `${about.title} | SARRN` : "Quem Somos | SARRN",
    description:
      about?.summary ||
      "Conheça a história, missão e atuação da SARRN no semiárido potiguar.",
  };
}

export default async function QuemSomosPublicPage() {
  const about = await getPublicAboutUs();

  if (!about || !hasValidBlocks(about.detailedBlocks)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-24 md:px-8 md:py-32">
      <div className="mb-10 text-center">
        <span className="text-sm font-semibold tracking-widest text-brand-green uppercase">
          Quem somos
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance md:text-5xl">
          {about.title || "Quem somos"}
        </h1>
      </div>

      <div className="mx-auto max-w-none">
        <BlockRenderer
          blocks={about.detailedBlocks}
          title={about.title || "Quem somos"}
        />
      </div>
    </main>
  );
}
