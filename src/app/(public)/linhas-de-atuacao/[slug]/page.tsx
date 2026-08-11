import type { Metadata } from "next";
import Image from "next/image";

import { BlockRenderer } from "@/components/shared/block-renderer";
import {
  getPublicActionLineBySlug,
  resolvePublicMediaUrl,
} from "@/lib/public-api";

type ActionLinePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ActionLinePageProps): Promise<Metadata> {
  const { slug } = await params;
  const line = await getPublicActionLineBySlug(slug);
  const coverImage =
    resolvePublicMediaUrl(line.coverImageUrl) ||
    resolvePublicMediaUrl(line.iconUrl);

  return {
    title: `${line.title} | SARRN`,
    description: `Linha de atuação da SARRN: ${line.title}.`,
    openGraph: {
      title: line.title,
      description: `Linha de atuação da SARRN: ${line.title}.`,
      ...(coverImage
        ? {
            images: [
              {
                url: coverImage,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function ActionLinePage({ params }: ActionLinePageProps) {
  const { slug } = await params;
  const line = await getPublicActionLineBySlug(slug);
  const iconUrl = resolvePublicMediaUrl(line.iconUrl);
  const coverImageUrl = resolvePublicMediaUrl(line.coverImageUrl);

  return (
    <main className="min-w-0 overflow-x-hidden pb-20">
      <section className="relative isolate min-h-[min(50vh,28rem)] overflow-hidden bg-brand-black text-white">
        {coverImageUrl ? (
          <>
            <Image
              src={coverImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/35 via-brand-black to-brand-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-brand-black/40" />
          </>
        )}

        <div className="relative mx-auto flex min-h-[min(50vh,28rem)] w-full max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:px-8 md:pb-20">
          {iconUrl ? (
            <div className="relative mb-6 size-16 overflow-hidden rounded-2xl bg-white/10 backdrop-blur">
              <Image
                src={iconUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : null}
          <p className="text-sm font-semibold tracking-widest text-brand-orange uppercase">
            Linha de atuação
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {line.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8">
        <BlockRenderer blocks={line.blocks} title={line.title} />
      </div>
    </main>
  );
}
