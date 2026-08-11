import { notFound } from "next/navigation";

import {
  parseActionLine,
  parseActionLineSummariesList,
  type ActionLine,
  type ActionLineSummary,
} from "@/schemas/action-lines";
import {
  parseCarouselSlidesList,
  type CarouselSlide,
} from "@/schemas/carousel";
import {
  parseEvent,
  parseEventSummariesPage,
  type Event,
  type EventSummariesPage,
  type EventSummary,
} from "@/schemas/events";
import {
  parseFundersGrouped,
  parseFundersList,
  type Funder,
  type FundersGrouped,
} from "@/schemas/funders";
import {
  parseStatisticsList,
  type Statistic,
} from "@/schemas/statistics";
import {
  parsePost,
  parsePostsPage,
  type AdminPost,
  type PostsPage,
  type PostType,
} from "@/schemas/posts";
import {
  parseInstitutionalPage,
  parseInstitutionalPagesMenu,
  pathToMenuGroup,
  type InstitutionalPage,
  type InstitutionalPageMenuItem,
} from "@/schemas/institutional-pages";
import {
  parseSiteSettings,
  type SiteSettings,
} from "@/schemas/settings";

const REVALIDATE_SECONDS = 60;

export type PublicPost = AdminPost;
export type PublicCarouselSlide = CarouselSlide;
export type PublicFunder = Funder;
export type PublicFundersGrouped = FundersGrouped;
export type PublicPostsPage = PostsPage;
export type PublicActionLine = ActionLine;
export type PublicActionLineSummary = ActionLineSummary;
export type PublicSiteSettings = SiteSettings;
export type PublicInstitutionalPage = InstitutionalPage;
export type PublicInstitutionalPageMenuItem = InstitutionalPageMenuItem;
export type PublicStatistic = Statistic;
export type PublicEvent = Event;
export type PublicEventSummary = EventSummary;
export type PublicEventSummariesPage = EventSummariesPage;

export type GetPublicEventsParams = {
  upcoming?: boolean;
  year?: number;
  month?: number;
  page?: number;
  size?: number;
};

export type GetPublicPostsParams = {
  type?: PostType | PostType[];
  page?: number;
  size?: number;
  year?: number;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || null;
}

function appendTypeParams(url: URL, type?: PostType | PostType[]) {
  if (!type) {
    return;
  }

  const types = Array.isArray(type) ? type : [type];

  for (const value of types) {
    url.searchParams.append("type", value);
  }
}

function buildPublicPostsUrl(params: GetPublicPostsParams = {}) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const url = new URL(`${baseUrl}/public/posts`);
  appendTypeParams(url, params.type);

  if (typeof params.page === "number") {
    url.searchParams.set("page", String(params.page));
  }

  if (typeof params.size === "number") {
    url.searchParams.set("size", String(params.size));
  }

  if (typeof params.year === "number") {
    url.searchParams.set("year", String(params.year));
  }

  return url.toString();
}

function buildPublicPostBySlugUrl(slug: string) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/posts/${encodeURIComponent(slug)}`;
}

export async function getPublicPostsPage(
  params: GetPublicPostsParams = {},
): Promise<PublicPostsPage> {
  const endpoint = buildPublicPostsUrl(params);

  if (!endpoint) {
    return {
      content: [],
      first: true,
      last: true,
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: params.size ?? 0,
    };
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["posts"],
      },
    });

    if (!response.ok) {
      return {
        content: [],
        first: true,
        last: true,
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: params.size ?? 0,
      };
    }

    const payload: unknown = await response.json();
    return parsePostsPage(payload);
  } catch {
    return {
      content: [],
      first: true,
      last: true,
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: params.size ?? 0,
    };
  }
}

export async function getPublicPosts(
  type: PostType,
  size: number,
): Promise<PublicPost[]> {
  const page = await getPublicPostsPage({ type, size, page: 0 });
  return page.content;
}

export async function getPublicPostBySlug(slug: string): Promise<PublicPost> {
  const endpoint = buildPublicPostBySlugUrl(slug);

  if (!endpoint) {
    notFound();
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["posts", `post-${slug}`],
      },
    });
  } catch {
    notFound();
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    notFound();
  }

  const payload: unknown = await response.json();
  return parsePost(payload);
}

function buildPublicCarouselUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/carousel`;
}

export async function getPublicCarouselSlides(): Promise<PublicCarouselSlide[]> {
  const endpoint = buildPublicCarouselUrl();

  if (!endpoint) {
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["carousel"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    return parseCarouselSlidesList(payload);
  } catch {
    return [];
  }
}

function buildPublicFundersUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/funders`;
}

function buildPublicFundersGroupedUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/funders/grouped`;
}

export async function getPublicFunders(): Promise<PublicFunder[]> {
  const endpoint = buildPublicFundersUrl();

  if (!endpoint) {
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["funders"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    return parseFundersList(payload);
  } catch {
    return [];
  }
}

export async function getPublicFundersGrouped(): Promise<PublicFundersGrouped> {
  const endpoint = buildPublicFundersGroupedUrl();

  if (!endpoint) {
    return { supporters: [], partners: [] };
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["funders"],
      },
    });

    if (!response.ok) {
      return { supporters: [], partners: [] };
    }

    const payload: unknown = await response.json();
    return parseFundersGrouped(payload);
  } catch {
    return { supporters: [], partners: [] };
  }
}

function buildPublicStatisticsUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/statistics`;
}

export async function getPublicStatistics(): Promise<PublicStatistic[]> {
  const endpoint = buildPublicStatisticsUrl();

  if (!endpoint) {
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["statistics"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    return parseStatisticsList(payload);
  } catch {
    return [];
  }
}

function buildPublicActionLinesUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/action-lines`;
}

function buildPublicActionLineBySlugUrl(slug: string) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/action-lines/${encodeURIComponent(slug)}`;
}

export async function getPublicActionLines(): Promise<
  PublicActionLineSummary[]
> {
  const endpoint = buildPublicActionLinesUrl();

  if (!endpoint) {
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["action-lines"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    return parseActionLineSummariesList(payload);
  } catch {
    return [];
  }
}

export async function getPublicActionLineBySlug(
  slug: string,
): Promise<PublicActionLine> {
  const endpoint = buildPublicActionLineBySlugUrl(slug);

  if (!endpoint) {
    notFound();
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["action-lines", `action-line-${slug}`],
      },
    });
  } catch {
    notFound();
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    notFound();
  }

  const payload: unknown = await response.json();
  return parseActionLine(payload);
}

export function getPublicActionLinePath(
  line: Pick<PublicActionLineSummary, "slug">,
) {
  return `/linhas-de-atuacao/${line.slug}`;
}

function buildPublicSettingsUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/settings`;
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings | null> {
  const endpoint = buildPublicSettingsUrl();

  if (!endpoint) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["settings"],
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseSiteSettings(payload);
  } catch {
    return null;
  }
}

function buildPublicPagesMenuUrl() {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/pages/menu`;
}

function buildPublicPageBySlugUrl(slug: string) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/pages/${encodeURIComponent(slug)}`;
}

export async function getPublicPagesMenu(): Promise<
  PublicInstitutionalPageMenuItem[]
> {
  const endpoint = buildPublicPagesMenuUrl();

  if (!endpoint) {
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["pages", "pages-menu"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload: unknown = await response.json();
    return parseInstitutionalPagesMenu(payload);
  } catch {
    return [];
  }
}

export async function getPublicInstitutionalPageBySlug(
  slug: string,
  menuGroupPath?: string,
): Promise<PublicInstitutionalPage> {
  const endpoint = buildPublicPageBySlugUrl(slug);

  if (!endpoint) {
    notFound();
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["pages", `page-${slug}`],
      },
    });
  } catch {
    notFound();
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    notFound();
  }

  const payload: unknown = await response.json();
  const page = parseInstitutionalPage(payload);

  if (menuGroupPath) {
    const expectedGroup = pathToMenuGroup(menuGroupPath);

    if (!expectedGroup || page.menuGroup !== expectedGroup) {
      notFound();
    }
  }

  return page;
}

function buildPublicEventsUrl(params: GetPublicEventsParams = {}) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const url = new URL(`${baseUrl}/public/events`);

  if (params.upcoming === true) {
    url.searchParams.set("upcoming", "true");
  }

  if (typeof params.year === "number" && typeof params.month === "number") {
    url.searchParams.set("year", String(params.year));
    url.searchParams.set("month", String(params.month));
  }

  if (typeof params.page === "number") {
    url.searchParams.set("page", String(params.page));
  }

  if (typeof params.size === "number") {
    url.searchParams.set("size", String(params.size));
  }

  return url.toString();
}

function buildPublicEventBySlugUrl(slug: string) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/public/events/${encodeURIComponent(slug)}`;
}

export async function getPublicEventsPage(
  params: GetPublicEventsParams = {},
): Promise<PublicEventSummariesPage> {
  const endpoint = buildPublicEventsUrl(params);

  if (!endpoint) {
    return {
      content: [],
      first: true,
      last: true,
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: params.size ?? 0,
    };
  }

  try {
    const response = await fetch(endpoint, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["events"],
      },
    });

    if (!response.ok) {
      return {
        content: [],
        first: true,
        last: true,
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: params.size ?? 0,
      };
    }

    const payload: unknown = await response.json();
    return parseEventSummariesPage(payload);
  } catch {
    return {
      content: [],
      first: true,
      last: true,
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: params.size ?? 0,
    };
  }
}

export async function getPublicEventBySlug(slug: string): Promise<PublicEvent> {
  const endpoint = buildPublicEventBySlugUrl(slug);

  if (!endpoint) {
    throw new Error("API pública não configurada.");
  }

  const response = await fetch(endpoint, {
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags: ["events", `event-${slug}`],
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar o evento.");
  }

  const payload: unknown = await response.json();
  return parseEvent(payload);
}

export function resolvePublicMediaUrl(url?: string | null) {
  if (!url?.trim()) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return url;
  }

  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

export function getPublicPostPath(post: Pick<PublicPost, "id" | "slug">) {
  return `/${post.slug || post.id}`;
}

export function getPublicPostCoverUrl(post: PublicPost) {
  return (
    resolvePublicMediaUrl(post.coverImageUrl) ||
    resolvePublicMediaUrl(post.galleryImages?.[0]) ||
    "/placeholder.svg"
  );
}
