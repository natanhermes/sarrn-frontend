import type { Metadata } from "next";

import { PostsCatalog } from "@/components/public/posts-catalog";
import {
  resolveCatalogPage,
  resolveCatalogType,
  resolveCatalogYear,
} from "@/lib/catalog-filters";
import { getPublicPostsPage } from "@/lib/public-api";
import type { PostType } from "@/schemas/posts";

export const metadata: Metadata = {
  title: "Publicações — SAR",
  description:
    "Acesse e-books, cartilhas e artigos publicados pelo SAR.",
};

const PAGE_SIZE = 9;
const ALLOWED_TYPES: PostType[] = ["BOOKLET", "EBOOK", "ARTICLE", "LIBRARY"];

type PublicacoesPageProps = {
  searchParams: Promise<{ page?: string; type?: string; year?: string }>;
};

export default async function PublicacoesPage({
  searchParams,
}: PublicacoesPageProps) {
  const params = await searchParams;
  const pageOneBased = resolveCatalogPage(params.page);
  const year = resolveCatalogYear(params.year);
  const type = resolveCatalogType(params.type, ALLOWED_TYPES);
  const activeType =
    typeof type === "string" ? type : undefined;

  const pageData = await getPublicPostsPage({
    type,
    year,
    page: pageOneBased - 1,
    size: PAGE_SIZE,
  });

  return (
    <PostsCatalog
      eyebrow="Acervo"
      title="Publicações e Materiais"
      description="E-books, cartilhas e artigos para apoiar a educação, a transparência e o desenvolvimento comunitário."
      emptyMessage="Nenhuma publicação encontrada com os filtros selecionados."
      basePath="/publicacoes"
      pageData={pageData}
      activeType={activeType}
      activeYear={year}
      filterTypes={[
        { value: "BOOKLET", label: "Cartilhas" },
        { value: "EBOOK", label: "E-books" },
        { value: "ARTICLE", label: "Artigos" },
        { value: "LIBRARY", label: "Biblioteca" },
      ]}
    />
  );
}
