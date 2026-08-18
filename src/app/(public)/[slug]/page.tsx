import type { Metadata } from "next";
import Image from "next/image";

import { ProjectDetailsPanel } from "@/components/public/project-details-panel";
import { BlockRenderer } from "@/components/shared/block-renderer";
import { Badge } from "@/components/ui/badge";
import { formatLongDateBR } from "@/lib/format";
import {
  getPublicPostBySlug,
  resolvePublicMediaUrl,
} from "@/lib/public-api";
import { postTypeLabels } from "@/schemas/posts";
import { isVideoUrl } from "@/lib/upload";

type PublicPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  const coverImage = resolvePublicMediaUrl(post.coverImageUrl);

  return {
    title: `${post.title} | SARRN`,
    description:
      post.summary?.trim() ||
      "Publicação institucional do SAR.",
    openGraph: {
      title: post.title,
      description:
        post.summary?.trim() ||
        "Publicação institucional do SAR.",
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

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  const coverImage = resolvePublicMediaUrl(post.coverImageUrl);
  const authorNames = [
    post.author?.name || post.authorName,
    ...post.coAuthors.map((author) => author.name),
  ]
    .filter(Boolean)
    .join(", ");

  const publishedLabel = formatLongDateBR(
    post.publishedAt ||
    post.projectDetails?.startDate ||
    post.createdAt,
  );

  return (
    <main className="pb-20">
      <section className="relative isolate min-h-[min(70vh,40rem)] overflow-hidden bg-brand-black text-white">
        {coverImage ? (
          isVideoUrl(coverImage) ? (
            <video
              src={coverImage}
              controls
              preload="metadata"
              playsInline
              controlsList="nodownload"
              className="absolute inset-0 h-full w-full object-cover opacity-60 z-0"
            />
          ) : (
            <Image
              src={coverImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-brand-green/40 via-brand-black to-brand-black" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-brand-black via-brand-black/70 to-brand-black/35" />

        <div className="relative mx-auto flex min-h-[min(70vh,40rem)] w-full max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:px-8 md:pb-20">
          <Badge className="w-fit bg-brand-green text-white hover:bg-brand-green">
            {postTypeLabels[post.type]}
          </Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 md:text-base">
            <time dateTime={post.publishedAt || undefined}>
              {publishedLabel}
            </time>
            {authorNames ? (
              <>
                <span aria-hidden>•</span>
                <span>{authorNames}</span>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8 md:py-16">
        {post.summary?.trim() ? (
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
            {post.summary}
          </p>
        ) : null}

        {post.type === "PROJECT" && post.projectDetails ? (
          <ProjectDetailsPanel
            details={post.projectDetails}
            funders={post.funders}
          />
        ) : null}

        <div className="mt-12">
          <BlockRenderer blocks={post.blocks} title={post.title} />
        </div>
      </div>
    </main>
  );
}
