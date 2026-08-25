import type { PostType } from "@/schemas/posts";

export const CACHE_TAGS = {
  posts: "posts",
  projetos: "projetos",
  noticias: "noticias",
  artigos: "artigos",
  relatorios: "relatorios",
  cartilhas: "cartilhas",
  ebooks: "ebooks",
  documentos: "documentos",
  biblioteca: "biblioteca",
  agenda: "agenda",
  carousel: "carousel",
  actionLines: "action-lines",
  statistics: "statistics",
  funders: "funders",
  pages: "pages",
  settings: "settings",
  about: "about",
  socialFeed: "social-feed",
} as const;

const POST_TYPE_TAGS: Record<PostType, string> = {
  PROJECT: CACHE_TAGS.projetos,
  NEWS: CACHE_TAGS.noticias,
  ARTICLE: CACHE_TAGS.artigos,
  REPORT: CACHE_TAGS.relatorios,
  BOOKLET: CACHE_TAGS.cartilhas,
  EBOOK: CACHE_TAGS.ebooks,
  DOCUMENT: CACHE_TAGS.documentos,
  LIBRARY: CACHE_TAGS.biblioteca,
};

const ALL_POST_TAGS = Object.values(POST_TYPE_TAGS);

export function tagsForPostTypes(type?: PostType | PostType[]) {
  if (!type) {
    return [CACHE_TAGS.posts, ...ALL_POST_TAGS];
  }

  const types = Array.isArray(type) ? type : [type];
  const specificTags = types.map((value) => POST_TYPE_TAGS[value]);
  return [...new Set([CACHE_TAGS.posts, ...specificTags])];
}
