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
  title: "Notícias e Artigos — SAR",
  description:
    "Acompanhe as últimas notícias e artigos do SAR sobre agroecologia, educação e desenvolvimento comunitário no semiárido potiguar.",
};

const PAGE_SIZE = 9;
const ALLOWED_TYPES: PostType[] = ["NEWS", "ARTICLE"];

type NoticiasPageProps = {
  searchParams: Promise<{ page?: string; type?: string; year?: string }>;
};

export default async function NoticiasPage({
  searchParams,
}: NoticiasPageProps) {
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
      eyebrow="Notícias"
      title="Últimas Notícias"
      description="Acompanhe matérias e artigos sobre os projetos, ações e impactos do SAR nas comunidades do Rio Grande do Norte."
      emptyMessage="Nenhuma notícia ou artigo encontrado com os filtros selecionados."
      basePath="/noticias"
      pageData={pageData}
      activeType={activeType}
      activeYear={year}
      filterTypes={[
        { value: "NEWS", label: "Notícias" },
        { value: "ARTICLE", label: "Artigos" },
      ]}
    />
  );
}
