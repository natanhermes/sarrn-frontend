import { z } from "zod";

import {
  datetimeLocalToIsoWithOffset,
  toDateTimeLocalValue,
} from "@/lib/format";
import {
  contentBlockFormSchema,
  contentBlockSchema,
  emptyContentBlock,
  toBlocksSubmitPayload,
  toContentBlockFormValues,
  type ContentBlock,
} from "@/schemas/content-blocks";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const eventSummarySchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z.string(),
    startDate: z.string().nullish(),
    start_date: z.string().nullish(),
    endDate: z.string().nullish(),
    end_date: z.string().nullish(),
    location: z.string().nullish(),
    summary: optionalTextSchema.optional(),
    coverImageUrl: z.string().nullish(),
    cover_image_url: z.string().nullish(),
    storageId: z.string().nullable().optional(),
    storage_id: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((event) => ({
    id: event.id,
    storageId: event.storageId || event.storage_id || undefined,
    title: event.title,
    slug: event.slug,
    startDate: event.startDate || event.start_date || "",
    endDate: event.endDate || event.end_date || "",
    location: event.location?.trim() || "",
    summary: event.summary || "",
    coverImageUrl: event.coverImageUrl || event.cover_image_url || "",
  }));

export const eventSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z.string(),
    startDate: z.string().nullish(),
    start_date: z.string().nullish(),
    endDate: z.string().nullish(),
    end_date: z.string().nullish(),
    location: z.string().nullish(),
    summary: optionalTextSchema.optional(),
    coverImageUrl: z.string().nullish(),
    cover_image_url: z.string().nullish(),
    isPublished: z.boolean().nullish(),
    is_published: z.boolean().nullish(),
    storageId: z.string().nullable().optional(),
    storage_id: z.string().nullable().optional(),
    blocks: z.array(contentBlockSchema).nullish(),
  })
  .passthrough()
  .transform((event) => ({
    id: event.id,
    storageId: event.storageId || event.storage_id || undefined,
    title: event.title,
    slug: event.slug,
    startDate: event.startDate || event.start_date || "",
    endDate: event.endDate || event.end_date || "",
    location: event.location?.trim() || "",
    summary: event.summary || "",
    coverImageUrl: event.coverImageUrl || event.cover_image_url || "",
    isPublished: event.isPublished ?? event.is_published ?? false,
    blocks: [...(event.blocks ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    ),
  }));

export const eventsPageSchema = z.object({
  content: z.array(eventSchema),
  first: z.boolean().optional().default(true),
  last: z.boolean().optional().default(true),
  totalPages: z.number().optional().default(1),
  totalElements: z.number().optional().default(0),
  number: z.number().optional().default(0),
  size: z.number().optional().default(10),
});

export const eventSummariesPageSchema = z.object({
  content: z.array(eventSummarySchema),
  first: z.boolean().optional().default(true),
  last: z.boolean().optional().default(true),
  totalPages: z.number().optional().default(1),
  totalElements: z.number().optional().default(0),
  number: z.number().optional().default(0),
  size: z.number().optional().default(10),
});

export const eventFormSchema = z
  .object({
    storageId: z.string().optional(),
    title: z
      .string()
      .min(1, "Informe o título")
      .max(200, "O título deve ter no máximo 200 caracteres"),
    slug: z
      .string()
      .max(220, "O slug deve ter no máximo 220 caracteres")
      .optional(),
    startDate: z.string().min(1, "Informe a data de início"),
    endDate: z.string().optional(),
    location: z
      .string()
      .min(1, "Informe o local")
      .max(255, "O local deve ter no máximo 255 caracteres"),
    coverImageUrl: z.string().optional(),
    summary: z
      .string()
      .max(2000, "O resumo deve ter no máximo 2000 caracteres")
      .optional(),
    isPublished: z.boolean(),
    blocks: z.array(contentBlockFormSchema),
  })
  .superRefine((values, ctx) => {
    if (!values.endDate?.trim()) {
      return;
    }

    const start = new Date(values.startDate);
    const end = new Date(values.endDate);

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end < start
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "A data de término deve ser igual ou posterior ao início",
      });
    }
  });

export type EventSummary = z.infer<typeof eventSummarySchema>;
export type Event = z.infer<typeof eventSchema>;
export type EventsPage = z.infer<typeof eventsPageSchema>;
export type EventSummariesPage = z.infer<typeof eventSummariesPageSchema>;
export type EventFormValues = z.infer<typeof eventFormSchema>;
export type EventBlocks = ContentBlock[];

export function parseEvent(payload: unknown): Event {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return eventSchema.parse((payload as { data: unknown }).data);
  }

  return eventSchema.parse(payload);
}

function parseEventsArray(items: unknown[]): Event[] {
  return items.flatMap((item) => {
    const parsed = eventSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseEventsList(payload: unknown): Event[] {
  if (Array.isArray(payload)) {
    return parseEventsArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parseEventsArray((payload as { content: unknown[] }).content);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseEventsArray((payload as { data: unknown[] }).data);
  }

  return [];
}

export function parseEventsPage(payload: unknown): EventsPage {
  const parsed = eventsPageSchema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }

  const list = parseEventsList(payload);
  return {
    content: list,
    first: true,
    last: true,
    totalPages: 1,
    totalElements: list.length,
    number: 0,
    size: list.length,
  };
}

export function parseEventSummariesPage(payload: unknown): EventSummariesPage {
  const parsed = eventSummariesPageSchema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }

  if (Array.isArray(payload)) {
    const content = payload.flatMap((item) => {
      const result = eventSummarySchema.safeParse(item);
      return result.success ? [result.data] : [];
    });

    return {
      content,
      first: true,
      last: true,
      totalPages: 1,
      totalElements: content.length,
      number: 0,
      size: content.length,
    };
  }

  return {
    content: [],
    first: true,
    last: true,
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 0,
  };
}

export function emptyEventFormValues(): EventFormValues {
  return {
    title: "",
    slug: "",
    startDate: "",
    endDate: "",
    location: "",
    coverImageUrl: "",
    summary: "",
    isPublished: false,
    blocks: [emptyContentBlock("TEXT")],
  };
}

export function toEventFormValues(event: Event): EventFormValues {
  return {
    storageId: event.storageId,
    title: event.title,
    slug: event.slug,
    startDate: toDateTimeLocalValue(event.startDate),
    endDate: toDateTimeLocalValue(event.endDate),
    location: event.location,
    coverImageUrl: event.coverImageUrl,
    summary: event.summary,
    isPublished: event.isPublished,
    blocks: toContentBlockFormValues(event.blocks),
  };
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toEventSubmitPayload(values: EventFormValues) {
  return {
    storageId: values.storageId || undefined,
    title: values.title.trim(),
    slug: optionalOrNull(values.slug),
    startDate: datetimeLocalToIsoWithOffset(values.startDate),
    endDate: datetimeLocalToIsoWithOffset(values.endDate),
    location: values.location.trim(),
    summary: optionalOrNull(values.summary),
    coverImageUrl: optionalOrNull(values.coverImageUrl),
    isPublished: values.isPublished,
    blocks: toBlocksSubmitPayload(values.blocks),
  };
}

export type EventSubmitPayload = ReturnType<typeof toEventSubmitPayload>;
