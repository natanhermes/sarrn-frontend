import { z } from "zod";

import { sanitizeRichText } from "@/lib/sanitize-html";

export const blockTypeSchema = z.enum(["TEXT", "GALLERY", "FILE"]);

export type BlockType = z.infer<typeof blockTypeSchema>;

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

const stringArraySchema = z
  .union([z.array(z.string()), z.null(), z.undefined()])
  .transform((value) =>
    (value ?? []).map((item) => item.trim()).filter(Boolean),
  );

export const contentBlockSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullish().transform((value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return String(value);
    }),
    type: blockTypeSchema,
    content: optionalTextSchema.optional(),
    galleryUrls: stringArraySchema.optional(),
    gallery_urls: stringArraySchema.optional(),
    fileUrl: optionalTextSchema.optional(),
    file_url: optionalTextSchema.optional(),
    fileTitle: optionalTextSchema.optional(),
    file_title: optionalTextSchema.optional(),
    displayOrder: z.coerce.number().nullish(),
    display_order: z.coerce.number().nullish(),
  })
  .passthrough()
  .transform((block) => ({
    id: block.id,
    type: block.type,
    content: block.content || "",
    galleryUrls: block.galleryUrls?.length
      ? block.galleryUrls
      : (block.gallery_urls ?? []),
    fileUrl: block.fileUrl || block.file_url || "",
    fileTitle: block.fileTitle || block.file_title || "",
    displayOrder: block.displayOrder ?? block.display_order ?? 0,
  }));

export const contentBlockFormSchema = z
  .object({
    type: blockTypeSchema,
    content: z.string().optional(),
    galleryUrls: z.array(z.string()).optional(),
    fileUrl: z.string().optional(),
    fileTitle: z.string().optional(),
  })
  .superRefine((block, ctx) => {
    if (block.type === "TEXT" && !block.content?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Informe o conteúdo do bloco de texto",
      });
    }

    if (
      block.type === "GALLERY" &&
      (!block.galleryUrls || block.galleryUrls.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["galleryUrls"],
        message: "Adicione ao menos uma imagem à galeria",
      });
    }

    if (block.type === "FILE" && !block.fileUrl?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["fileUrl"],
        message: "Envie o arquivo PDF",
      });
    }
  });

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentBlockFormValues = z.infer<typeof contentBlockFormSchema>;

export function toBlocksSubmitPayload(blocks: ContentBlockFormValues[]) {
  return blocks.map((block, index) => {
    if (block.type === "TEXT") {
      return {
        type: "TEXT" as const,
        content: sanitizeRichText(block.content ?? ""),
        galleryUrls: null,
        fileUrl: null,
        fileTitle: null,
        displayOrder: index,
      };
    }

    if (block.type === "GALLERY") {
      return {
        type: "GALLERY" as const,
        content: null,
        galleryUrls: (block.galleryUrls ?? [])
          .map((url) => url.trim())
          .filter(Boolean),
        fileUrl: null,
        fileTitle: null,
        displayOrder: index,
      };
    }

    return {
      type: "FILE" as const,
      content: null,
      galleryUrls: null,
      fileUrl: block.fileUrl?.trim() || null,
      fileTitle: block.fileTitle?.trim() || null,
      displayOrder: index,
    };
  });
}

export function emptyContentBlock(
  type: BlockType = "TEXT",
): ContentBlockFormValues {
  if (type === "GALLERY") {
    return { type, content: "", galleryUrls: [], fileUrl: "", fileTitle: "" };
  }

  if (type === "FILE") {
    return { type, content: "", galleryUrls: [], fileUrl: "", fileTitle: "" };
  }

  return { type: "TEXT", content: "", galleryUrls: [], fileUrl: "", fileTitle: "" };
}

export function toContentBlockFormValues(
  blocks: ContentBlock[],
): ContentBlockFormValues[] {
  if (blocks.length === 0) {
    return [emptyContentBlock("TEXT")];
  }

  return blocks.map((block) => ({
    type: block.type,
    content: block.content,
    galleryUrls: block.galleryUrls,
    fileUrl: block.fileUrl,
    fileTitle: block.fileTitle,
  }));
}
