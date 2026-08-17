import { z } from "zod";

import {
  contentBlockFormSchema,
  contentBlockSchema,
  emptyContentBlock,
  toBlocksSubmitPayload,
  toContentBlockFormValues,
  type ContentBlock,
} from "@/schemas/content-blocks";

export const menuGroupSchema = z.enum(["SAR", "TRANSPARENCIA"]);

export type MenuGroup = z.infer<typeof menuGroupSchema>;

export const menuGroupPathSchema = z.enum(["sar", "transparencia"]);

export type MenuGroupPath = z.infer<typeof menuGroupPathSchema>;

export const MENU_GROUP_LABELS: Record<MenuGroup, string> = {
  SAR: "SAR",
  TRANSPARENCIA: "Transparência",
};

export function menuGroupToPath(menuGroup: MenuGroup): MenuGroupPath {
  return menuGroup === "SAR" ? "sar" : "transparencia";
}

export function pathToMenuGroup(path: string): MenuGroup | null {
  const parsed = menuGroupPathSchema.safeParse(path.toLowerCase());

  if (!parsed.success) {
    return null;
  }

  return parsed.data === "sar" ? "SAR" : "TRANSPARENCIA";
}

export function getInstitutionalPagePath(
  menuGroup: MenuGroup,
  slug: string,
) {
  return `/${menuGroupToPath(menuGroup)}/${slug}`;
}

export const institutionalPageSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z.string(),
    menuGroup: menuGroupSchema.optional(),
    menu_group: menuGroupSchema.optional(),
    storageId: z.string().nullable().optional(),
    storage_id: z.string().nullable().optional(),
    blocks: z.array(contentBlockSchema).nullish(),
  })
  .passthrough()
  .transform((page) => {
    const menuGroup = page.menuGroup ?? page.menu_group;

    if (!menuGroup) {
      throw new Error("Página institucional sem menuGroup");
    }

    return {
      id: page.id,
      storageId: page.storageId || page.storage_id || undefined,
      title: page.title,
      slug: page.slug,
      menuGroup,
      blocks: [...(page.blocks ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    };
  });

export const institutionalPageMenuItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z.string(),
    menuGroup: menuGroupSchema.optional(),
    menu_group: menuGroupSchema.optional(),
  })
  .passthrough()
  .transform((item) => {
    const menuGroup = item.menuGroup ?? item.menu_group;

    if (!menuGroup) {
      throw new Error("Item de menu sem menuGroup");
    }

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      menuGroup,
    };
  });

export const institutionalPageFormSchema = z.object({
  storageId: z.string().optional(),
  title: z
    .string()
    .min(1, "Informe o título")
    .max(200, "O título deve ter no máximo 200 caracteres"),
  slug: z
    .string()
    .max(220, "O slug deve ter no máximo 220 caracteres")
    .optional(),
  menuGroup: menuGroupSchema,
  blocks: z.array(contentBlockFormSchema),
});

export type InstitutionalPage = z.infer<typeof institutionalPageSchema>;
export type InstitutionalPageMenuItem = z.infer<
  typeof institutionalPageMenuItemSchema
>;
export type InstitutionalPageFormValues = z.infer<
  typeof institutionalPageFormSchema
>;
export type InstitutionalPageBlocks = ContentBlock[];

export function parseInstitutionalPage(payload: unknown): InstitutionalPage {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return institutionalPageSchema.parse((payload as { data: unknown }).data);
  }

  return institutionalPageSchema.parse(payload);
}

function parseInstitutionalPagesArray(items: unknown[]): InstitutionalPage[] {
  return items.flatMap((item) => {
    const parsed = institutionalPageSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseInstitutionalPagesList(
  payload: unknown,
): InstitutionalPage[] {
  if (Array.isArray(payload)) {
    return parseInstitutionalPagesArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseInstitutionalPagesArray((payload as { data: unknown[] }).data);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parseInstitutionalPagesArray(
      (payload as { content: unknown[] }).content,
    );
  }

  return [];
}

function parseMenuItemsArray(items: unknown[]): InstitutionalPageMenuItem[] {
  return items.flatMap((item) => {
    const parsed = institutionalPageMenuItemSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseInstitutionalPagesMenu(
  payload: unknown,
): InstitutionalPageMenuItem[] {
  if (Array.isArray(payload)) {
    return parseMenuItemsArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseMenuItemsArray((payload as { data: unknown[] }).data);
  }

  return [];
}

export function toInstitutionalPageFormValues(
  page: InstitutionalPage,
): InstitutionalPageFormValues {
  return {
    storageId: page.storageId,
    title: page.title,
    slug: page.slug,
    menuGroup: page.menuGroup,
    blocks: toContentBlockFormValues(page.blocks),
  };
}

export function emptyInstitutionalPageFormValues(): InstitutionalPageFormValues {
  return {
    title: "",
    slug: "",
    menuGroup: "SAR",
    blocks: [emptyContentBlock("TEXT")],
  };
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toInstitutionalPageSubmitPayload(
  values: InstitutionalPageFormValues,
) {
  return {
    storageId: values.storageId || undefined,
    title: values.title.trim(),
    slug: optionalOrNull(values.slug),
    menuGroup: values.menuGroup,
    blocks: toBlocksSubmitPayload(values.blocks ?? []),
  };
}

export type InstitutionalPageSubmitPayload = ReturnType<
  typeof toInstitutionalPageSubmitPayload
>;
