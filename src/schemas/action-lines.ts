import { z } from "zod";

import {
  contentBlockFormSchema,
  contentBlockSchema,
  toBlocksSubmitPayload,
  type ContentBlock,
  type ContentBlockFormValues,
} from "@/schemas/content-blocks";

export const actionLineBlockSchema = contentBlockSchema;
export const actionLineBlockFormSchema = contentBlockFormSchema;

export type ActionLineBlock = ContentBlock;
export type ActionLineBlockFormValues = ContentBlockFormValues;

export const actionLineSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z.string(),
    iconUrl: z.string().nullish(),
    icon_url: z.string().nullish(),
    coverImageUrl: z.string().nullish(),
    cover_image_url: z.string().nullish(),
    summary: z.string().nullish(),
    isActive: z.boolean().nullish(),
    is_active: z.boolean().nullish(),
    displayOrder: z.coerce.number().nullish(),
    display_order: z.coerce.number().nullish(),
    blocks: z.array(actionLineBlockSchema).nullish(),
  })
  .passthrough()
  .transform((line) => ({
    id: line.id,
    title: line.title,
    slug: line.slug,
    iconUrl: line.iconUrl || line.icon_url || "",
    coverImageUrl: line.coverImageUrl || line.cover_image_url || "",
    summary: line.summary?.trim() || "",
    isActive: line.isActive ?? line.is_active ?? true,
    displayOrder: line.displayOrder ?? line.display_order ?? 0,
    blocks: [...(line.blocks ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    ),
  }));

export const actionLineSummarySchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z.string(),
    iconUrl: z.string().nullish(),
    icon_url: z.string().nullish(),
    summary: z.string().nullish(),
  })
  .passthrough()
  .transform((line) => ({
    id: line.id,
    title: line.title,
    slug: line.slug,
    iconUrl: line.iconUrl || line.icon_url || "",
    summary: line.summary?.trim() || "",
  }));

export const actionLineFormSchema = z.object({
  iconUrl: z.string().min(1, "Envie o ícone da linha de atuação"),
  coverImageUrl: z.string().optional(),
  title: z
    .string()
    .min(1, "Informe o título")
    .max(150, "O título deve ter no máximo 150 caracteres"),
  slug: z
    .string()
    .max(160, "O slug deve ter no máximo 160 caracteres")
    .optional(),
  summary: z
    .string()
    .max(1000, "O resumo deve ter no máximo 1000 caracteres")
    .optional(),
  isActive: z.boolean(),
  displayOrder: z
    .number({ error: "Informe a ordem de exibição" })
    .int("A ordem deve ser um número inteiro"),
  blocks: z
    .array(actionLineBlockFormSchema)
    .min(1, "Adicione ao menos um bloco"),
});

export type ActionLine = z.infer<typeof actionLineSchema>;
export type ActionLineSummary = z.infer<typeof actionLineSummarySchema>;
export type ActionLineFormValues = z.infer<typeof actionLineFormSchema>;

export function parseActionLine(payload: unknown): ActionLine {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return actionLineSchema.parse((payload as { data: unknown }).data);
  }

  return actionLineSchema.parse(payload);
}

function parseActionLinesArray(items: unknown[]): ActionLine[] {
  return items.flatMap((item) => {
    const parsed = actionLineSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseActionLinesList(payload: unknown): ActionLine[] {
  if (Array.isArray(payload)) {
    return parseActionLinesArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseActionLinesArray((payload as { data: unknown[] }).data);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parseActionLinesArray((payload as { content: unknown[] }).content);
  }

  return [];
}

function parseActionLineSummariesArray(items: unknown[]): ActionLineSummary[] {
  return items.flatMap((item) => {
    const parsed = actionLineSummarySchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseActionLineSummariesList(
  payload: unknown,
): ActionLineSummary[] {
  if (Array.isArray(payload)) {
    return parseActionLineSummariesArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseActionLineSummariesArray(
      (payload as { data: unknown[] }).data,
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parseActionLineSummariesArray(
      (payload as { content: unknown[] }).content,
    );
  }

  return [];
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toActionLineSubmitPayload(values: ActionLineFormValues) {
  return {
    iconUrl: values.iconUrl.trim(),
    coverImageUrl: optionalOrNull(values.coverImageUrl),
    title: values.title.trim(),
    slug: optionalOrNull(values.slug),
    summary: optionalOrNull(values.summary),
    isActive: values.isActive,
    displayOrder: Number(values.displayOrder),
    blocks: toBlocksSubmitPayload(values.blocks),
  };
}

export type ActionLineSubmitPayload = ReturnType<
  typeof toActionLineSubmitPayload
>;
