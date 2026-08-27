import type { Metadata } from "next";

import { PostsCatalog } from "@/components/public/posts-catalog";
import {
  resolveCatalogDate,
  resolveCatalogPage,
  resolveCatalogSearch,
} from "@/lib/catalog-filters";
import { getPublicPostsPage } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Projetos — SAR",
  description:
    "Conheça os projetos do SAR em agroecologia, educação e desenvolvimento comunitário no semiárido potiguar.",
};

const PAGE_SIZE = 9;

type ProjetosPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    date?: string;
  }>;
};

export default async function ProjetosPage({
  searchParams,
}: ProjetosPageProps) {
  const params = await searchParams;
  const pageOneBased = resolveCatalogPage(params.page);
  const search = resolveCatalogSearch(params.search);
  const date = resolveCatalogDate(params.date);

  const pageData = await getPublicPostsPage({
    type: "PROJECT",
    search,
    date,
    page: pageOneBased - 1,
    size: PAGE_SIZE,
  });

  return (
    <PostsCatalog
      eyebrow="Projetos"
      title="Nossos Projetos"
      description="Iniciativas que fortalecem a autonomia, a renda e o desenvolvimento das comunidades no Rio Grande do Norte."
      emptyMessage="Nenhum projeto encontrado com os filtros selecionados."
      basePath="/projetos"
      pageData={pageData}
    />
  );
}
