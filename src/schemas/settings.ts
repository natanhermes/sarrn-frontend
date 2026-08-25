import { z } from "zod";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const siteSettingsSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullish(),
    siteTitle: optionalTextSchema.optional(),
    site_title: optionalTextSchema.optional(),
    metaDescription: optionalTextSchema.optional(),
    meta_description: optionalTextSchema.optional(),
    pixKey: optionalTextSchema.optional(),
    pix_key: optionalTextSchema.optional(),
    pixKeyType: optionalTextSchema.optional(),
    pix_key_type: optionalTextSchema.optional(),
    pixReceiverName: optionalTextSchema.optional(),
    pix_receiver_name: optionalTextSchema.optional(),
    pixKeySecondary: optionalTextSchema.optional(),
    pix_key_secondary: optionalTextSchema.optional(),
    pixKeySecondaryType: optionalTextSchema.optional(),
    pix_key_secondary_type: optionalTextSchema.optional(),
    bankName: optionalTextSchema.optional(),
    bank_name: optionalTextSchema.optional(),
    bankAgency: optionalTextSchema.optional(),
    bank_agency: optionalTextSchema.optional(),
    bankAccount: optionalTextSchema.optional(),
    bank_account: optionalTextSchema.optional(),
    documentCnpj: optionalTextSchema.optional(),
    document_cnpj: optionalTextSchema.optional(),
    instagramUrl: optionalTextSchema.optional(),
    instagram_url: optionalTextSchema.optional(),
    facebookUrl: optionalTextSchema.optional(),
    facebook_url: optionalTextSchema.optional(),
    youtubeUrl: optionalTextSchema.optional(),
    youtube_url: optionalTextSchema.optional(),
    phoneNumber: optionalTextSchema.optional(),
    phone_number: optionalTextSchema.optional(),
    whatsappNumber: optionalTextSchema.optional(),
    whatsapp_number: optionalTextSchema.optional(),
    locationText: optionalTextSchema.optional(),
    location_text: optionalTextSchema.optional(),
    googleMapsUrl: optionalTextSchema.optional(),
    google_maps_url: optionalTextSchema.optional(),
    donationPixPayload: optionalTextSchema.optional(),
    donation_pix_payload: optionalTextSchema.optional(),
    youtubeApiKey: optionalTextSchema.optional(),
    youtube_api_key: optionalTextSchema.optional(),
    youtubeChannelId: optionalTextSchema.optional(),
    youtube_channel_id: optionalTextSchema.optional(),
    instagramAccessToken: optionalTextSchema.optional(),
    instagram_access_token: optionalTextSchema.optional(),
    instagramAccountId: optionalTextSchema.optional(),
    instagram_account_id: optionalTextSchema.optional(),
    facebookAccessToken: optionalTextSchema.optional(),
    facebook_access_token: optionalTextSchema.optional(),
    facebookPageId: optionalTextSchema.optional(),
    facebook_page_id: optionalTextSchema.optional(),
    metaAppId: optionalTextSchema.optional(),
    meta_app_id: optionalTextSchema.optional(),
    metaAppSecret: optionalTextSchema.optional(),
    meta_app_secret: optionalTextSchema.optional(),
  })
  .passthrough()
  .transform((settings) => ({
    id: settings.id != null ? String(settings.id) : undefined,
    siteTitle: settings.siteTitle || settings.site_title || "",
    metaDescription:
      settings.metaDescription || settings.meta_description || "",
    pixKey: settings.pixKey || settings.pix_key || "",
    pixKeyType: settings.pixKeyType || settings.pix_key_type || "",
    pixReceiverName:
      settings.pixReceiverName || settings.pix_receiver_name || "",
    pixKeySecondary:
      settings.pixKeySecondary || settings.pix_key_secondary || "",
    pixKeySecondaryType:
      settings.pixKeySecondaryType || settings.pix_key_secondary_type || "",
    bankName: settings.bankName || settings.bank_name || "",
    bankAgency: settings.bankAgency || settings.bank_agency || "",
    bankAccount: settings.bankAccount || settings.bank_account || "",
    documentCnpj: settings.documentCnpj || settings.document_cnpj || "",
    instagramUrl: settings.instagramUrl || settings.instagram_url || "",
    facebookUrl: settings.facebookUrl || settings.facebook_url || "",
    youtubeUrl: settings.youtubeUrl || settings.youtube_url || "",
    phoneNumber: settings.phoneNumber || settings.phone_number || "",
    whatsappNumber: settings.whatsappNumber || settings.whatsapp_number || "",
    locationText: settings.locationText || settings.location_text || "",
    googleMapsUrl: settings.googleMapsUrl || settings.google_maps_url || "",
    donationPixPayload:
      settings.donationPixPayload || settings.donation_pix_payload || "",
    youtubeApiKey: settings.youtubeApiKey || settings.youtube_api_key || "",
    youtubeChannelId:
      settings.youtubeChannelId || settings.youtube_channel_id || "",
    instagramAccessToken:
      settings.instagramAccessToken || settings.instagram_access_token || "",
    instagramAccountId:
      settings.instagramAccountId || settings.instagram_account_id || "",
    facebookAccessToken:
      settings.facebookAccessToken || settings.facebook_access_token || "",
    facebookPageId: settings.facebookPageId || settings.facebook_page_id || "",
    metaAppId: settings.metaAppId || settings.meta_app_id || "",
    metaAppSecret: settings.metaAppSecret || settings.meta_app_secret || "",
  }));

export const siteSettingsFormSchema = z.object({
  siteTitle: z
    .string()
    .max(255, "O título deve ter no máximo 255 caracteres")
    .optional(),
  metaDescription: z
    .string()
    .max(500, "A meta-descrição deve ter no máximo 500 caracteres")
    .optional(),
  locationText: z
    .string()
    .max(2000, "O texto de localização deve ter no máximo 2000 caracteres")
    .optional(),
  phoneNumber: z
    .string()
    .max(50, "O telefone deve ter no máximo 50 caracteres")
    .optional(),
  whatsappNumber: z
    .string()
    .max(50, "O WhatsApp deve ter no máximo 50 caracteres")
    .optional(),
  googleMapsUrl: z
    .string()
    .max(500, "A URL do Google Maps deve ter no máximo 500 caracteres")
    .optional(),
  instagramUrl: z
    .string()
    .max(500, "A URL do Instagram deve ter no máximo 500 caracteres")
    .optional(),
  facebookUrl: z
    .string()
    .max(500, "A URL do Facebook deve ter no máximo 500 caracteres")
    .optional(),
  youtubeUrl: z
    .string()
    .max(500, "A URL do YouTube deve ter no máximo 500 caracteres")
    .optional(),
  pixKey: z
    .string()
    .max(255, "A chave PIX deve ter no máximo 255 caracteres")
    .optional(),
  pixKeyType: z
    .string()
    .max(50, "O tipo da chave PIX deve ter no máximo 50 caracteres")
    .optional(),
  pixReceiverName: z
    .string()
    .max(150, "O nome do recebedor deve ter no máximo 150 caracteres")
    .optional(),
  pixKeySecondary: z
    .string()
    .max(255, "A chave PIX secundária deve ter no máximo 255 caracteres")
    .optional(),
  pixKeySecondaryType: z
    .string()
    .max(50, "O tipo da chave PIX secundária deve ter no máximo 50 caracteres")
    .optional(),
  bankName: z
    .string()
    .max(150, "O nome do banco deve ter no máximo 150 caracteres")
    .optional(),
  bankAgency: z
    .string()
    .max(50, "A agência deve ter no máximo 50 caracteres")
    .optional(),
  bankAccount: z
    .string()
    .max(50, "A conta deve ter no máximo 50 caracteres")
    .optional(),
  documentCnpj: z
    .string()
    .max(18, "O CNPJ deve ter no máximo 18 caracteres")
    .optional(),
  donationPixPayload: z
    .string()
    .max(2000, "O código Pix deve ter no máximo 2000 caracteres")
    .optional(),
  youtubeApiKey: z
    .string()
    .max(500, "A chave de API do YouTube deve ter no máximo 500 caracteres")
    .optional(),
  youtubeChannelId: z
    .string()
    .max(255, "O ID do canal do YouTube deve ter no máximo 255 caracteres")
    .optional(),
  instagramAccessToken: z
    .string()
    .max(2000, "O token do Instagram deve ter no máximo 2000 caracteres")
    .optional(),
  instagramAccountId: z
    .string()
    .max(255, "O ID da conta do Instagram deve ter no máximo 255 caracteres")
    .optional(),
  facebookAccessToken: z
    .string()
    .max(2000, "O token do Facebook deve ter no máximo 2000 caracteres")
    .optional(),
  facebookPageId: z
    .string()
    .max(255, "O ID da página do Facebook deve ter no máximo 255 caracteres")
    .optional(),
  metaAppId: z
    .string()
    .max(255, "O App ID da Meta deve ter no máximo 255 caracteres")
    .optional(),
  metaAppSecret: z
    .string()
    .max(500, "O App Secret da Meta deve ter no máximo 500 caracteres")
    .optional(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

export function parseSiteSettings(payload: unknown): SiteSettings {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return siteSettingsSchema.parse((payload as { data: unknown }).data);
  }

  return siteSettingsSchema.parse(payload ?? {});
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toSiteSettingsSubmitPayload(values: SiteSettingsFormValues) {
  return {
    siteTitle: optionalOrNull(values.siteTitle),
    metaDescription: optionalOrNull(values.metaDescription),
    locationText: optionalOrNull(values.locationText),
    phoneNumber: optionalOrNull(values.phoneNumber),
    whatsappNumber: optionalOrNull(values.whatsappNumber),
    googleMapsUrl: optionalOrNull(values.googleMapsUrl),
    instagramUrl: optionalOrNull(values.instagramUrl),
    facebookUrl: optionalOrNull(values.facebookUrl),
    youtubeUrl: optionalOrNull(values.youtubeUrl),
    pixKey: optionalOrNull(values.pixKey),
    pixKeyType: optionalOrNull(values.pixKeyType),
    pixReceiverName: optionalOrNull(values.pixReceiverName),
    pixKeySecondary: optionalOrNull(values.pixKeySecondary),
    pixKeySecondaryType: optionalOrNull(values.pixKeySecondaryType),
    bankName: optionalOrNull(values.bankName),
    bankAgency: optionalOrNull(values.bankAgency),
    bankAccount: optionalOrNull(values.bankAccount),
    documentCnpj: optionalOrNull(values.documentCnpj),
    donationPixPayload: optionalOrNull(values.donationPixPayload),
    youtubeApiKey: optionalOrNull(values.youtubeApiKey),
    youtubeChannelId: optionalOrNull(values.youtubeChannelId),
    instagramAccessToken: optionalOrNull(values.instagramAccessToken),
    instagramAccountId: optionalOrNull(values.instagramAccountId),
    facebookAccessToken: optionalOrNull(values.facebookAccessToken),
    facebookPageId: optionalOrNull(values.facebookPageId),
    metaAppId: optionalOrNull(values.metaAppId),
    metaAppSecret: optionalOrNull(values.metaAppSecret),
  };
}

export type SiteSettingsSubmitPayload = ReturnType<
  typeof toSiteSettingsSubmitPayload
>;
