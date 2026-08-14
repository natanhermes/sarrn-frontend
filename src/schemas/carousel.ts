import { z } from "zod";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const carouselSlideSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    imageUrl: z.string(),
    badgeText: optionalTextSchema,
    title: z.string(),
    subtitle: optionalTextSchema,
    primaryButtonText: optionalTextSchema,
    primaryButtonUrl: optionalTextSchema,
    secondaryButtonText: optionalTextSchema,
    secondaryButtonUrl: optionalTextSchema,
    isActive: z.boolean(),
    displayOrder: z.coerce.number(),
    storageId: z.string().nullable().optional(),
    storage_id: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((slide) => ({
    ...slide,
    storageId: slide.storageId || slide.storage_id || undefined,
  }));

export const carouselSlideFormSchema = z.object({
  storageId: z.string().optional(),
  imageUrl: z.string().min(1, "Envie a imagem do slide"),
  badgeText: z.string().optional(),
  title: z.string().min(1, "Informe o título"),
  subtitle: z.string().optional(),
  primaryButtonText: z.string().optional(),
  primaryButtonUrl: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z
    .number({ error: "Informe a ordem de exibição" })
    .int("A ordem deve ser um número inteiro"),
});

export type CarouselSlide = z.infer<typeof carouselSlideSchema>;
export type CarouselSlideFormValues = z.infer<typeof carouselSlideFormSchema>;

export function parseCarouselSlide(payload: unknown): CarouselSlide {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return carouselSlideSchema.parse((payload as { data: unknown }).data);
  }

  return carouselSlideSchema.parse(payload);
}

export function parseCarouselSlidesList(payload: unknown): CarouselSlide[] {
  if (Array.isArray(payload)) {
    return z.array(carouselSlideSchema).parse(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return z
      .array(carouselSlideSchema)
      .parse((payload as { data: unknown }).data);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return z
      .array(carouselSlideSchema)
      .parse((payload as { content: unknown }).content);
  }

  return z.array(carouselSlideSchema).parse(payload);
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toCarouselSlideSubmitPayload(values: CarouselSlideFormValues) {
  return {
    storageId: values.storageId || undefined,
    imageUrl: values.imageUrl.trim(),
    badgeText: optionalOrNull(values.badgeText),
    title: values.title.trim(),
    subtitle: optionalOrNull(values.subtitle),
    primaryButtonText: optionalOrNull(values.primaryButtonText),
    primaryButtonUrl: optionalOrNull(values.primaryButtonUrl),
    secondaryButtonText: optionalOrNull(values.secondaryButtonText),
    secondaryButtonUrl: optionalOrNull(values.secondaryButtonUrl),
    isActive: values.isActive,
    displayOrder: Number(values.displayOrder),
  };
}

export type CarouselSlideSubmitPayload = ReturnType<
  typeof toCarouselSlideSubmitPayload
>;
