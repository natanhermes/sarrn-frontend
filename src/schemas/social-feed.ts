import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "YOUTUBE",
  "INSTAGRAM",
  "FACEBOOK",
]);

export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

export const socialFeedItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    platform: z.string().transform((val) => val.toUpperCase() as SocialPlatform),
    externalId: z.string().nullish(),
    external_id: z.string().nullish(),
    title: z.string().nullish(),
    thumbnailUrl: z.string().nullish(),
    thumbnail_url: z.string().nullish(),
    postUrl: z.string().nullish(),
    post_url: z.string().nullish(),
    publishedAt: z.string().nullish(),
    published_at: z.string().nullish(),
    isActive: z.boolean().nullish(),
    is_active: z.boolean().nullish(),
    active: z.boolean().nullish(),
    visible: z.boolean().nullish(),
  })
  .passthrough()
  .transform((item) => ({
    id: item.id,
    platform: (["YOUTUBE", "INSTAGRAM", "FACEBOOK"].includes(item.platform)
      ? item.platform
      : "YOUTUBE") as SocialPlatform,
    externalId: item.externalId || item.external_id || "",
    title: item.title || "",
    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || "",
    postUrl: item.postUrl || item.post_url || "",
    publishedAt: item.publishedAt || item.published_at || "",
    isActive: item.isActive ?? item.is_active ?? item.active ?? item.visible ?? true,
  }));

export type SocialFeedItem = z.infer<typeof socialFeedItemSchema>;

export function parseSocialFeedItem(payload: unknown): SocialFeedItem {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return socialFeedItemSchema.parse((payload as { data: unknown }).data);
  }

  return socialFeedItemSchema.parse(payload);
}

function parseSocialFeedItemsArray(items: unknown[]): SocialFeedItem[] {
  return items.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const obj = item as Record<string, unknown>;
    if (
      !obj.id &&
      !obj.externalId &&
      !obj.external_id &&
      !obj.title &&
      !obj.postUrl &&
      !obj.post_url
    ) {
      return [];
    }

    const parsed = socialFeedItemSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseSocialFeedList(payload: unknown): SocialFeedItem[] {
  if (Array.isArray(payload)) {
    return parseSocialFeedItemsArray(payload);
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return parseSocialFeedItemsArray(obj.data);
    }

    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as Record<string, unknown>).content)
    ) {
      return parseSocialFeedItemsArray(
        (obj.data as Record<string, unknown>).content as unknown[],
      );
    }

    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as Record<string, unknown>).items)
    ) {
      return parseSocialFeedItemsArray(
        (obj.data as Record<string, unknown>).items as unknown[],
      );
    }

    if (Array.isArray(obj.content)) {
      return parseSocialFeedItemsArray(obj.content);
    }

    if (Array.isArray(obj.items)) {
      return parseSocialFeedItemsArray(obj.items);
    }
  }

  return [];
}

export type SocialFeedPage = {
  content: SocialFeedItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

export function parseSocialFeedPage(payload: unknown): SocialFeedPage {
  const content = parseSocialFeedList(payload);

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    return {
      content,
      totalPages: typeof obj.totalPages === "number" ? obj.totalPages : 1,
      totalElements: typeof obj.totalElements === "number" ? obj.totalElements : content.length,
      number: typeof obj.number === "number" ? obj.number : 0,
      size: typeof obj.size === "number" ? obj.size : content.length || 10,
      first: typeof obj.first === "boolean" ? obj.first : true,
      last: typeof obj.last === "boolean" ? obj.last : true,
    };
  }

  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    number: 0,
    size: content.length || 10,
    first: true,
    last: true,
  };
}

export const socialSyncResultItemSchema = z.object({
  platform: z.string().transform((val) => val.toUpperCase() as SocialPlatform),
  configured: z.boolean().nullish().transform((val) => val ?? false),
  success: z.boolean().nullish().transform((val) => val ?? false),
  itemsCount: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((val) => Number(val) || 0),
  message: z.string().nullish().transform((val) => val ?? ""),
});

export type SocialSyncResultItem = z.infer<typeof socialSyncResultItemSchema>;

export const socialFeedSyncResponseSchema = z.object({
  summary: z.string().nullish().transform((val) => val ?? "Sincronização executada."),
  results: z.array(socialSyncResultItemSchema).nullish().transform((val) => val ?? []),
});

export type SocialFeedSyncResponse = z.infer<typeof socialFeedSyncResponseSchema>;

export function parseSocialFeedSyncResponse(payload: unknown): SocialFeedSyncResponse {
  const parsed = socialFeedSyncResponseSchema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }
  return {
    summary: "Sincronização executada.",
    results: [],
  };
}
