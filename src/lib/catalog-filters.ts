import { postTypeSchema, type PostType } from "@/schemas/posts";

export function resolveCatalogType(
  typeParam: string | undefined,
  allowedTypes: PostType[],
): PostType | PostType[] {
  if (!typeParam) {
    return allowedTypes.length === 1 ? allowedTypes[0] : allowedTypes;
  }

  const parsed = postTypeSchema.safeParse(typeParam);

  if (!parsed.success || !allowedTypes.includes(parsed.data)) {
    return allowedTypes.length === 1 ? allowedTypes[0] : allowedTypes;
  }

  return parsed.data;
}

export function resolveCatalogYear(yearParam: string | undefined) {
  if (!yearParam?.trim()) {
    return undefined;
  }

  const year = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 3;

  if (!Number.isInteger(year) || year < minYear || year > currentYear) {
    return undefined;
  }

  return year;
}

export function resolveCatalogSearch(searchParam: string | undefined) {
  if (!searchParam?.trim()) {
    return undefined;
  }
  return searchParam.trim();
}

export function resolveCatalogDate(dateParam: string | undefined) {
  if (!dateParam?.trim()) {
    return undefined;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam.trim())) {
    return dateParam.trim();
  }
  return undefined;
}

export function resolveCatalogPage(pageParam: string | undefined) {
  const page = Number(pageParam ?? "1");

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

export function buildCatalogHref(
  basePath: string,
  pageOneBased: number,
  filters: { type?: string; year?: number; search?: string; date?: string },
) {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.year) {
    params.set("year", String(filters.year));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.date) {
    params.set("date", filters.date);
  }

  if (pageOneBased > 1) {
    params.set("page", String(pageOneBased));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
