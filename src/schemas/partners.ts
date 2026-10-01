import { z } from "zod";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const partnerSchema = z
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
    createdAt: z.string().nullish(),
    created_at: z.string().nullish(),
    updatedAt: z.string().nullish(),
    updated_at: z.string().nullish(),
  })
  .passthrough()
  .transform((partner) => ({
    id: partner.id,
    storageId: partner.storageId || partner.storage_id || undefined,
    name: partner.name,
    cnpj: partner.cnpj || partner.cnpj_format || "",
    logoUrl: partner.logoUrl || partner.logo_url || "",
    siteUrl: partner.siteUrl || partner.site_url || "",
    isActive: partner.isActive ?? partner.is_active ?? true,
    displayOrder: partner.displayOrder ?? partner.display_order ?? 0,
    createdAt: partner.createdAt || partner.created_at || "",
    updatedAt: partner.updatedAt || partner.updated_at || "",
  }));

export const partnerFormSchema = z.object({
  storageId: z.string().optional(),
  logoUrl: z.string().optional(),
  name: z.string().min(1, "Informe o nome"),
  cnpj: z.string().optional(),
  siteUrl: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z
    .number({ error: "Informe a ordem de exibição" })
    .int("A ordem deve ser um número inteiro"),
});

export type Partner = z.infer<typeof partnerSchema>;
export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export function parsePartner(payload: unknown): Partner {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return partnerSchema.parse((payload as { data: unknown }).data);
  }

  return partnerSchema.parse(payload);
}

function parsePartnersArray(items: unknown[]): Partner[] {
  return items.flatMap((item) => {
    const parsed = partnerSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parsePartnersList(payload: unknown): Partner[] {
  if (Array.isArray(payload)) {
    return parsePartnersArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parsePartnersArray((payload as { data: unknown[] }).data);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parsePartnersArray((payload as { content: unknown[] }).content);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "partners" in payload &&
    Array.isArray((payload as { partners: unknown }).partners)
  ) {
    return parsePartnersArray((payload as { partners: unknown[] }).partners);
  }

  return [];
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toPartnerSubmitPayload(values: PartnerFormValues) {
  return {
    storageId: values.storageId || undefined,
    logoUrl: optionalOrNull(values.logoUrl),
    name: values.name.trim(),
    cnpj: optionalOrNull(values.cnpj),
    siteUrl: optionalOrNull(values.siteUrl),
    isActive: values.isActive,
    displayOrder: Number(values.displayOrder),
  };
}

export type PartnerSubmitPayload = ReturnType<typeof toPartnerSubmitPayload>;
