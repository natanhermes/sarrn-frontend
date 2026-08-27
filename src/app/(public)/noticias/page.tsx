import type { Metadata } from "next";

import { PostsCatalog } from "@/components/public/posts-catalog";
import {
  resolveCatalogDate,
  resolveCatalogPage,
  resolveCatalogSearch,
  resolveCatalogType,
} from "@/lib/catalog-filters";
import { getPublicPostsPage } from "@/lib/public-api";
import type { PostType } from "@/schemas/posts";

export const metadata: Metadata = {
  title: "Notícias — SAR",
  description:
    "Acompanhe as últimas notícias do SAR sobre agroecologia, educação e desenvolvimento comunitário no semiárido potiguar.",
};

const PAGE_SIZE = 9;
const ALLOWED_TYPES: PostType[] = ["NEWS"];

type NoticiasPageProps = {
  searchParams: Promise<{
    page?: string;
    type?: string;
    search?: string;
    date?: string;
  }>;
};

export default async function NoticiasPage({
  searchParams,
}: NoticiasPageProps) {
  const params = await searchParams;
  const pageOneBased = resolveCatalogPage(params.page);
  const search = resolveCatalogSearch(params.search);
  const date = resolveCatalogDate(params.date);
  const type = resolveCatalogType(params.type, ALLOWED_TYPES);

  const pageData = await getPublicPostsPage({
    type,
    search,
    date,
    page: pageOneBased - 1,
    size: PAGE_SIZE,
  });

  return (
    <PostsCatalog
      eyebrow="Notícias"
      title="Últimas Notícias"
      description="Acompanhe matérias sobre os projetos, ações e impactos do SAR nas comunidades do Rio Grande do Norte."
      emptyMessage="Nenhuma notícia encontrada com os filtros selecionados."
      basePath="/noticias"
      pageData={pageData}
    />
  );
}
