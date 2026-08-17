import { z } from "zod";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const funderSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string(),
    cnpj: optionalTextSchema.optional(),
    cnpj_format: optionalTextSchema.optional(),
    logoUrl: z.string().nullish(),
    logo_url: z.string().nullish(),
    siteUrl: optionalTextSchema.optional(),
    site_url: optionalTextSchema.optional(),
    isActive: z.boolean().nullish(),
    is_active: z.boolean().nullish(),
    displayOrder: z.coerce.number().nullish(),
    display_order: z.coerce.number().nullish(),
    storageId: z.string().nullable().optional(),
    storage_id: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((funder) => ({
    id: funder.id,
    storageId: funder.storageId || funder.storage_id || undefined,
    name: funder.name,
    cnpj: funder.cnpj || funder.cnpj_format || "",
    logoUrl: funder.logoUrl || funder.logo_url || "",
    siteUrl: funder.siteUrl || funder.site_url || "",
    isActive: funder.isActive ?? funder.is_active ?? true,
    displayOrder: funder.displayOrder ?? funder.display_order ?? 0,
  }));

export const funderFormSchema = z.object({
  storageId: z.string().optional(),
  logoUrl: z.string().min(1, "Envie a logo do apoiador"),
  name: z.string().min(1, "Informe o nome"),
  cnpj: z.string().optional(),
  siteUrl: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z
    .number({ error: "Informe a ordem de exibição" })
    .int("A ordem deve ser um número inteiro"),
});

export type Funder = z.infer<typeof funderSchema>;
export type FunderFormValues = z.infer<typeof funderFormSchema>;

export function parseFunder(payload: unknown): Funder {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return funderSchema.parse((payload as { data: unknown }).data);
  }

  return funderSchema.parse(payload);
}

function parseFundersArray(items: unknown[]): Funder[] {
  return items.flatMap((item) => {
    const parsed = funderSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseFundersList(payload: unknown): Funder[] {
  if (Array.isArray(payload)) {
    return parseFundersArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseFundersArray((payload as { data: unknown[] }).data);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parseFundersArray((payload as { content: unknown[] }).content);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "funders" in payload &&
    Array.isArray((payload as { funders: unknown }).funders)
  ) {
    return parseFundersArray((payload as { funders: unknown[] }).funders);
  }

  return [];
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toFunderSubmitPayload(values: FunderFormValues) {
  return {
    storageId: values.storageId || undefined,
    logoUrl: values.logoUrl.trim(),
    name: values.name.trim(),
    cnpj: optionalOrNull(values.cnpj),
    siteUrl: optionalOrNull(values.siteUrl),
    isActive: values.isActive,
    displayOrder: Number(values.displayOrder),
  };
}

export type FunderSubmitPayload = ReturnType<typeof toFunderSubmitPayload>;

export const fundersGroupedSchema = z
  .object({
    supporters: z.array(funderSchema).nullish(),
    partners: z.array(funderSchema).nullish(),
  })
  .passthrough()
  .transform((grouped) => ({
    supporters: grouped.supporters ?? [],
    partners: grouped.partners ?? [],
  }));

export type FundersGrouped = z.infer<typeof fundersGroupedSchema>;

export function parseFundersGrouped(payload: unknown): FundersGrouped {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return fundersGroupedSchema.parse((payload as { data: unknown }).data);
  }

  return fundersGroupedSchema.parse(payload);
}
