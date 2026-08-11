import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlockRenderer } from "@/components/shared/block-renderer";
import { getPublicInstitutionalPageBySlug } from "@/lib/public-api";
import {
  MENU_GROUP_LABELS,
  pathToMenuGroup,
} from "@/schemas/institutional-pages";

type InstitutionalPageRouteProps = {
  params: Promise<{ slug: string; pageSlug: string }>;
};

export async function generateMetadata({
  params,
}: InstitutionalPageRouteProps): Promise<Metadata> {
  const { slug: menuGroup, pageSlug } = await params;

  if (!pathToMenuGroup(menuGroup)) {
    return { title: "Página não encontrada | SARRN" };
  }

  const page = await getPublicInstitutionalPageBySlug(pageSlug, menuGroup);

  return {
    title: `${page.title} | SARRN`,
    description: `${MENU_GROUP_LABELS[page.menuGroup]}: ${page.title}.`,
    openGraph: {
      title: page.title,
      description: `${MENU_GROUP_LABELS[page.menuGroup]}: ${page.title}.`,
    },
  };
}

export default async function InstitutionalPageRoute({
  params,
}: InstitutionalPageRouteProps) {
  const { slug: menuGroup, pageSlug } = await params;

  if (!pathToMenuGroup(menuGroup)) {
    notFound();
  }

  const page = await getPublicInstitutionalPageBySlug(pageSlug, menuGroup);

  return (
    <main className="min-w-0 overflow-x-hidden pb-20">
      <section className="bg-[#356e7c] pt-28 pb-12 text-white md:pt-32 md:pb-16">
        <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
          <p className="text-sm font-semibold tracking-widest text-white/70 uppercase">
            {MENU_GROUP_LABELS[page.menuGroup]}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            {page.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8">
        <BlockRenderer blocks={page.blocks} title={page.title} />
      </div>
    </main>
  );
}
