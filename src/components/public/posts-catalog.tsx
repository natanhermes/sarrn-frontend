import Link from "next/link";
import { Suspense } from "react";

import { PostCard } from "@/components/public/post-card";
import {
  PostsFilter,
  type PostsFilterTypeOption,
} from "@/components/public/posts-filter";
import { Button } from "@/components/ui/button";
import { buildCatalogHref } from "@/lib/catalog-filters";
import type { PublicPostsPage } from "@/lib/public-api";

type PostsCatalogProps = {
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
  basePath: string;
  pageData: PublicPostsPage;
  filterTypes?: PostsFilterTypeOption[];
  activeType?: string;
  activeYear?: number;
};

export function PostsCatalog({
  eyebrow,
  title,
  description,
  emptyMessage,
  basePath,
  pageData,
  filterTypes = [],
  activeType,
  activeYear,
}: PostsCatalogProps) {
  const posts = pageData.content;
  const currentPage = (pageData.number ?? 0) + 1;
  const totalPages = Math.max(pageData.totalPages ?? 1, 1);
  const isFirst = pageData.first ?? currentPage <= 1;
  const isLast = pageData.last ?? currentPage >= totalPages;
  const filters = {
    type: activeType,
    year: activeYear,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-28 pb-24 md:px-8 md:pt-36 md:pb-32">
      <header className="max-w-2xl">
        <span className="text-sm font-semibold tracking-widest text-brand-pink uppercase">
          {eyebrow}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          {description}
        </p>
      </header>

      <div className="mt-10">
        <Suspense
          fallback={
            <div className="h-20 animate-pulse rounded-lg bg-muted/60" />
          }
        >
          <PostsFilter types={filterTypes} />
        </Suspense>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {posts.length > 0 && totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="mt-14 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {isFirst ? (
              <Button type="button" variant="outline" size="lg" disabled>
                Anterior
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={
                  <Link
                    href={buildCatalogHref(basePath, currentPage - 1, filters)}
                  />
                }
              >
                Anterior
              </Button>
            )}
            {isLast ? (
              <Button type="button" variant="outline" size="lg" disabled>
                Próximo
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={
                  <Link
                    href={buildCatalogHref(basePath, currentPage + 1, filters)}
                  />
                }
              >
                Próximo
              </Button>
            )}
          </div>
        </nav>
      ) : null}
    </main>
  );
}
