import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import {
  getPublicPostCoverUrl,
  getPublicPostPath,
  type PublicPost,
} from "@/lib/public-api";
import { formatDateBR } from "@/lib/format";
import { postTypeLabels } from "@/schemas/posts";

type PostCardProps = {
  post: PublicPost;
};

export function PostCard({ post }: PostCardProps) {
  const href = getPublicPostPath(post);
  const imageSrc = getPublicPostCoverUrl(post);
  const summary = post.summary?.trim() || "Leia o conteúdo completo.";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-black/5">
      <Link href={href} className="flex h-full flex-col">
        <div className="aspect-16/10 overflow-hidden">
          <img
            src={imageSrc}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex w-full items-center justify-between gap-3 text-xs font-medium">
            <span className="rounded-full bg-brand-green/10 px-2.5 py-1 font-semibold text-brand-green">
              {postTypeLabels[post.type]}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {formatDateBR(post.publishedAt || post.createdAt)}
            </span>
          </div>
          <h2 className="mt-4 text-xl leading-snug font-bold tracking-tight text-balance">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-pretty text-muted-foreground">
            {summary}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-black">
            Ler mais
            <ArrowRight className="size-4 text-brand-green transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
