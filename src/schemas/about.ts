import { z } from "zod";

import {
  contentBlockFormSchema,
  contentBlockSchema,
  toBlocksSubmitPayload,
} from "@/schemas/content-blocks";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const aboutUsTagSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullish(),
    title: optionalTextSchema.optional(),
    name: optionalTextSchema.optional(),
    label: optionalTextSchema.optional(),
    iconUrl: optionalTextSchema.optional(),
    icon_url: optionalTextSchema.optional(),
    icon: optionalTextSchema.optional(),
    iconColor: optionalTextSchema.optional(),
    icon_color: optionalTextSchema.optional(),
  })
  .passthrough()
  .transform((tag) => ({
    id: tag.id != null ? String(tag.id) : undefined,
    title: tag.title || tag.name || tag.label || "",
    iconUrl: tag.iconUrl || tag.icon_url || tag.icon || "",
    iconColor: tag.iconColor || tag.icon_color || "#356e7c",
  }));

export type AboutUsTag = z.infer<typeof aboutUsTagSchema>;

export const aboutUsSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullish(),
    homeTitle: optionalTextSchema.optional(),
    home_title: optionalTextSchema.optional(),
    title: optionalTextSchema.optional(),
    homeSummary: optionalTextSchema.optional(),
    home_summary: optionalTextSchema.optional(),
    summary: optionalTextSchema.optional(),
    resumo: optionalTextSchema.optional(),
    homeImageUrl: optionalTextSchema.optional(),
    home_image_url: optionalTextSchema.optional(),
    imageUrl: optionalTextSchema.optional(),
    image_url: optionalTextSchema.optional(),
    coverImageUrl: optionalTextSchema.optional(),
    cover_image_url: optionalTextSchema.optional(),
    foundationYear: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
    foundation_year: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
    foundationText: optionalTextSchema.optional(),
    foundation_text: optionalTextSchema.optional(),
    badgeText: optionalTextSchema.optional(),
    badge_text: optionalTextSchema.optional(),
    tags: z.array(z.unknown()).optional(),
    detailedBlocks: z.array(contentBlockSchema).nullish(),
    detailed_blocks: z.array(contentBlockSchema).nullish(),
  })
  .passthrough()
  .transform((data) => {
    const rawFoundation = data.foundationYear ?? data.foundation_year;
    const foundationYearNum =
      typeof rawFoundation === "number"
        ? rawFoundation
        : rawFoundation
          ? parseInt(String(rawFoundation), 10)
          : new Date().getFullYear();

    const detailedBlocks = [
      ...(data.detailedBlocks ?? data.detailed_blocks ?? []),
    ].sort((a, b) => a.displayOrder - b.displayOrder);

    const rawTags = Array.isArray(data.tags) ? data.tags : [];
    const parsedTags = rawTags.map((tag) => aboutUsTagSchema.parse(tag));

    const title = data.homeTitle || data.home_title || data.title || "";
    const summary = data.homeSummary || data.home_summary || data.summary || data.resumo || "";
    const imageUrl = data.homeImageUrl || data.home_image_url || data.imageUrl || data.image_url || data.coverImageUrl || data.cover_image_url || "";
    const badgeText = data.foundationText || data.foundation_text || data.badgeText || data.badge_text || "";

    return {
      id: data.id != null ? String(data.id) : undefined,
      title,
      homeTitle: title,
      summary,
      homeSummary: summary,
      imageUrl,
      homeImageUrl: imageUrl,
      foundationYear: isNaN(foundationYearNum) ? new Date().getFullYear() : foundationYearNum,
      badgeText,
      foundationText: badgeText,
      tags: parsedTags,
      detailedBlocks,
    };
  });

export type AboutUs = z.infer<typeof aboutUsSchema>;

export const aboutUsFormSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(255, "O título deve ter no máximo 255 caracteres"),
  summary: z
    .string()
    .min(1, "O resumo é obrigatório")
    .max(2000, "O resumo deve ter no máximo 2000 caracteres"),
  imageUrl: z.string().optional(),
  foundationYear: z
    .number({ message: "Informe um ano válido" })
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear(), "O ano de fundação não pode ser no futuro"),
  badgeText: z
    .string()
    .max(255, "O texto da badge deve ter no máximo 255 caracteres")
    .optional(),
  tags: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      label: z.string().optional(),
      iconUrl: z.string().optional(),
      iconColor: z.string().optional(),
    }),
  ),
  detailedBlocks: z.array(contentBlockFormSchema).optional(),
});

export type AboutUsFormValues = z.infer<typeof aboutUsFormSchema>;

export function parseAboutUs(payload: unknown): AboutUs {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return aboutUsSchema.parse((payload as { data: unknown }).data);
  }

  return aboutUsSchema.parse(payload ?? {});
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toAboutUsSubmitPayload(values: AboutUsFormValues) {
  return {
    homeTitle: values.title.trim(),
    homeSummary: values.summary.trim(),
    homeImageUrl: optionalOrNull(values.imageUrl),
    foundationYear: values.foundationYear,
    foundationText: optionalOrNull(values.badgeText),
    tags: values.tags.map((tag) => ({
      ...(tag.id ? { id: tag.id } : {}),
      label: (tag.label || tag.title || "").trim(),
      iconUrl: optionalOrNull(tag.iconUrl),
      iconColor: tag.iconColor || "#356e7c",
    })),
    detailedBlocks: toBlocksSubmitPayload(values.detailedBlocks ?? []),
  };
}

export type AboutUsSubmitPayload = ReturnType<typeof toAboutUsSubmitPayload>;
