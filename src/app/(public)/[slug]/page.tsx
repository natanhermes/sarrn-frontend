import type { Metadata } from "next";

import { PostCoverHero } from "@/components/public/post-cover-hero";
import { ProjectDetailsPanel } from "@/components/public/project-details-panel";
import { BlockRenderer } from "@/components/shared/block-renderer";
import { formatLongDateBR } from "@/lib/format";
import {
  getPublicPostBySlug,
  resolvePublicMediaUrl,
} from "@/lib/public-api";
import { postTypeLabels } from "@/schemas/posts";

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
      <PostCoverHero
        title={post.title}
        coverImage={coverImage}
        typeLabel={postTypeLabels[post.type]}
        publishedLabel={publishedLabel}
        authorNames={authorNames}
        publishedAt={post.publishedAt}
      />

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
