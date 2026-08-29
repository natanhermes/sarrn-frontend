import { z } from "zod";

import { datetimeLocalToIsoWithOffset } from "@/lib/format";
import {
  contentBlockFormSchema,
  contentBlockSchema,
  toBlocksSubmitPayload,
} from "@/schemas/content-blocks";

export const postTypeSchema = z.enum([
  "PROJECT",
  "NEWS",
  "DOCUMENT",
  "BOOKLET",
  "EBOOK",
  "ARTICLE",
  "REPORT",
  "LIBRARY",
]);
export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]);
export const executionStatusSchema = z.enum([
  "PLANNED",
  "ONGOING",
  "COMPLETED",
]);

export const projectDetailsSchema = z
  .object({
    generalObjective: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    durationText: z.string().optional().nullable(),
    budgetValue: z.coerce.number().optional().nullable(),
    executionStatus: executionStatusSchema.optional().nullable(),
    funderName: z.string().optional().nullable(),
    funder: z
      .object({
        id: z.union([z.string(), z.number()]).transform(String),
        name: z.string(),
      })
      .nullable()
      .optional(),
    funders: z
      .array(
        z.object({
          id: z.union([z.string(), z.number()]).transform(String),
          name: z.string(),
        }),
      )
      .optional()
      .nullable(),
    funderIds: z
      .array(z.union([z.string(), z.number()]).transform(String))
      .optional()
      .nullable(),
  })
  .passthrough();

export const postAuthorSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string(),
    email: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((value) => value ?? ""),
  })
  .passthrough();

export const postSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    slug: z
      .string()
      .nullable()
      .optional()
      .transform((value) => value ?? ""),
    type: postTypeSchema,
    status: postStatusSchema,
    summary: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    blocks: z.array(contentBlockSchema).nullish(),
    projectDetails: projectDetailsSchema.nullable().optional(),
    project_details: projectDetailsSchema.nullable().optional(),
    funderIds: z
      .array(z.union([z.string(), z.number()]).transform(String))
      .optional()
      .nullable(),
    funders: z
      .array(
        z.object({
          id: z.union([z.string(), z.number()]).transform(String),
          name: z.string(),
        }),
      )
      .optional()
      .nullable(),
    storageId: z.string().nullable().optional(),
    storage_id: z.string().nullable().optional(),
    authorId: z
      .union([z.string(), z.number()])
      .transform(String)
      .optional(),
    author_id: z
      .union([z.string(), z.number()])
      .transform(String)
      .optional(),
    authorName: z.string().nullable().optional(),
    author: postAuthorSchema.nullable().optional(),
    coAuthors: z.array(postAuthorSchema).nullable().optional(),
    co_authors: z.array(postAuthorSchema).nullable().optional(),
    createdAt: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    published_at: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .transform((post) => {
    const authorId =
      post.authorId || post.author_id || post.author?.id || "";
    const storageId = post.storageId || post.storage_id || undefined;

    const rawFunderIds =
      (post as Record<string, unknown>).funderIds ??
      (post as Record<string, unknown>).funder_ids ??
      post.projectDetails?.funderIds ??
      (post.projectDetails as Record<string, unknown> | null)?.funder_ids ??
      (post.project_details as Record<string, unknown> | null)?.funderIds ??
      (post.project_details as Record<string, unknown> | null)?.funder_ids;

    const rawFundersList =
      (post as Record<string, unknown>).funders ??
      post.projectDetails?.funders ??
      (post.project_details as Record<string, unknown> | null)?.funders;

    let funderIds: string[] = [];
    if (Array.isArray(rawFunderIds)) {
      funderIds = (rawFunderIds as (string | number)[]).map(String);
    } else if (Array.isArray(rawFundersList)) {
      funderIds = (rawFundersList as { id: string | number }[]).map((f) => String(f.id));
    } else if (post.projectDetails?.funder?.id) {
      funderIds = [String(post.projectDetails.funder.id)];
    }

    let funders: { id: string; name: string }[] = [];
    if (Array.isArray(rawFundersList)) {
      funders = (rawFundersList as { id: string | number; name: string }[]).map((f) => ({
        id: String(f.id),
        name: f.name,
      }));
    } else if (post.projectDetails?.funder?.name) {
      funders = [
        {
          id: String(post.projectDetails.funder.id ?? ""),
          name: post.projectDetails.funder.name,
        },
      ];
    }

    const rawAuthorName = (
      post.authorName ||
      post.author?.name ||
      ""
    ).trim();

    const isDevAuthor =
      rawAuthorName.toLowerCase() === "desenvolvedor";

    const authorName = isDevAuthor ? "" : rawAuthorName;

    const author = post.author
      ? {
          id: post.author.id,
          name:
            post.author.name?.trim().toLowerCase() === "desenvolvedor"
              ? ""
              : post.author.name.trim(),
          email: post.author.email,
        }
      : authorId
        ? {
            id: authorId,
            name: authorName,
            email: "",
          }
        : null;

    const coAuthors = (post.coAuthors ?? post.co_authors ?? [])
      .filter(
        (coAuthor) =>
          coAuthor.name?.trim().toLowerCase() !== "desenvolvedor",
      )
      .map((coAuthor) => ({
        id: coAuthor.id,
        name: coAuthor.name.trim(),
        email: coAuthor.email,
      }));

    return {
      id: post.id,
      storageId,
      title: post.title,
      slug: post.slug,
      type: post.type,
      status: post.status,
      summary: post.summary ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      blocks: [...(post.blocks ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
      projectDetails: post.projectDetails ?? post.project_details ?? null,
      funderIds,
      funders,
      author,
      coAuthors,
      authorId,
      authorName,
      createdAt: post.createdAt || post.created_at || null,
      publishedAt: post.publishedAt || post.published_at || null,
      updatedAt: post.updatedAt || post.updated_at || null,
    };
  });

export const postsPageSchema = z.object({
  content: z.array(postSchema),
  first: z.boolean().optional().default(true),
  last: z.boolean().optional().default(true),
  totalPages: z.number().optional().default(1),
  totalElements: z.number().optional().default(0),
  number: z.number().optional().default(0),
  size: z.number().optional().default(10),
  empty: z.boolean().optional(),
});

export const postsListResponseSchema = z.union([
  z.array(postSchema),
  postsPageSchema,
  z.object({ data: z.array(postSchema) }),
  z.object({ posts: z.array(postSchema) }),
]);

export const postFormSchema = z
  .object({
    storageId: z.string().optional(),
    authorId: z.string().optional().nullable(),
    type: postTypeSchema,
    title: z.string().min(1, "Informe o título"),
    summary: z.string().optional(),
    coverImageUrl: z.string().optional(),
    blocks: z.array(contentBlockFormSchema),
    status: postStatusSchema,
    manualPublishedAt: z.boolean(),
    publishedAt: z.string().optional(),
    coAuthorIds: z.array(z.string()),
    funderIds: z.array(z.string()),
    projectDetails: z
      .object({
        generalObjective: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budgetValue: z.union([z.number(), z.nan()]).optional(),
        executionStatus: executionStatusSchema.optional(),
      })
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== "PROJECT") {
      const requiresPublishedAt =
        values.status === "SCHEDULED" || values.manualPublishedAt;

      if (requiresPublishedAt && !values.publishedAt?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["publishedAt"],
          message: "Informe a data de publicação",
        });
      }
    }

    if (values.type === "PROJECT") {
      const details = values.projectDetails;

      if (
        details?.budgetValue !== undefined &&
        !Number.isNaN(details.budgetValue) &&
        details.budgetValue < 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["projectDetails", "budgetValue"],
          message: "Informe um orçamento válido",
        });
      }

      if (details?.startDate && details?.endDate) {
        const start = new Date(`${details.startDate}T00:00:00`);
        const end = new Date(`${details.endDate}T00:00:00`);

        if (
          !Number.isNaN(start.getTime()) &&
          !Number.isNaN(end.getTime()) &&
          end.getTime() < start.getTime()
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["projectDetails", "endDate"],
            message: "A data de fim deve ser posterior ou igual à de início",
          });
        }
      }
    }
  });

export type PostType = z.infer<typeof postTypeSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type ExecutionStatus = z.infer<typeof executionStatusSchema>;
export type ProjectDetails = z.infer<typeof projectDetailsSchema>;
export type PostAuthor = z.infer<typeof postAuthorSchema>;
export type PostFormValues = z.infer<typeof postFormSchema>;
export type AdminPost = z.infer<typeof postSchema>;
export type PostsPage = z.infer<typeof postsPageSchema>;

export function parsePostsList(payload: unknown): AdminPost[] {
  return parsePostsPage(payload).content;
}

export function parsePostsPage(payload: unknown): PostsPage {
  if (Array.isArray(payload)) {
    const content = z.array(postSchema).parse(payload);
    return {
      content,
      first: true,
      last: true,
      totalPages: 1,
      totalElements: content.length,
      number: 0,
      size: content.length || 10,
    };
  }

  const pageResult = postsPageSchema.safeParse(payload);
  if (pageResult.success) {
    return pageResult.data;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    const content = z.array(postSchema).parse((payload as { data: unknown }).data);
    return {
      content,
      first: true,
      last: true,
      totalPages: 1,
      totalElements: content.length,
      number: 0,
      size: content.length || 10,
    };
  }

  if (
    payload &&
    typeof payload === "object" &&
    "posts" in payload &&
    Array.isArray((payload as { posts: unknown }).posts)
  ) {
    const content = z
      .array(postSchema)
      .parse((payload as { posts: unknown }).posts);
    return {
      content,
      first: true,
      last: true,
      totalPages: 1,
      totalElements: content.length,
      number: 0,
      size: content.length || 10,
    };
  }

  return postsPageSchema.parse(payload);
}

export function parsePost(payload: unknown): AdminPost {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return postSchema.parse((payload as { data: unknown }).data);
  }

  return postSchema.parse(payload);
}

export function toPostSubmitPayload(values: PostFormValues) {
  const coAuthorIds = (values.coAuthorIds ?? []).filter(Boolean);
  const funderIds = (values.funderIds ?? []).filter(Boolean);
  const authorId = values.authorId?.trim() ? values.authorId.trim() : null;

  const base = {
    storageId: values.storageId || undefined,
    authorId,
    type: values.type,
    title: values.title,
    summary: values.summary?.trim() || undefined,
    coverImageUrl: values.coverImageUrl?.trim() || undefined,
    blocks: toBlocksSubmitPayload(values.blocks ?? []),
    status: values.status,
    coAuthorIds,
    funderIds,
  };

  if (values.type === "PROJECT") {
    const rawBudget = values.projectDetails?.budgetValue;
    const budgetValue =
      rawBudget !== undefined && !Number.isNaN(rawBudget)
        ? Number(rawBudget)
        : undefined;
    const startDate = values.projectDetails?.startDate?.trim();
    const endDate = values.projectDetails?.endDate?.trim();

    return {
      ...base,
      projectDetails: {
        generalObjective: values.projectDetails?.generalObjective?.trim() || undefined,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(budgetValue !== undefined ? { budgetValue } : {}),
        executionStatus:
          values.status === "SCHEDULED"
            ? "PLANNED"
            : (values.projectDetails?.executionStatus ?? "ONGOING"),
        funderIds,
      },
    };
  }

  const shouldSendPublishedAt =
    values.status === "SCHEDULED" || values.manualPublishedAt;

  return {
    ...base,
    publishedAt: shouldSendPublishedAt
      ? datetimeLocalToIsoWithOffset(values.publishedAt)
      : null,
    projectDetails: undefined,
  };
}

export type PostSubmitPayload = ReturnType<typeof toPostSubmitPayload>;

export const postTypeLabels: Record<PostType, string> = {
  PROJECT: "Projeto",
  NEWS: "Notícia",
  DOCUMENT: "Documento",
  BOOKLET: "Cartilha",
  EBOOK: "E-book",
  ARTICLE: "Artigo",
  REPORT: "Relatório",
  LIBRARY: "Biblioteca",
};

export const postStatusLabels: Record<PostStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  SCHEDULED: "Agendado",
};

export const executionStatusLabels: Record<ExecutionStatus, string> = {
  PLANNED: "Planejado",
  ONGOING: "Em andamento",
  COMPLETED: "Concluído",
};

export const postTypeSelectItems = [
  { value: "PROJECT" as const, label: postTypeLabels.PROJECT },
  { value: "NEWS" as const, label: postTypeLabels.NEWS },
  { value: "BOOKLET" as const, label: postTypeLabels.BOOKLET },
  { value: "ARTICLE" as const, label: postTypeLabels.ARTICLE },
  { value: "EBOOK" as const, label: postTypeLabels.EBOOK },
  { value: "LIBRARY" as const, label: postTypeLabels.LIBRARY },
];

export const postStatusSelectItems = [
  { value: "DRAFT" as const, label: postStatusLabels.DRAFT },
  { value: "PUBLISHED" as const, label: postStatusLabels.PUBLISHED },
  { value: "SCHEDULED" as const, label: postStatusLabels.SCHEDULED },
];

export const executionStatusSelectItems = [
  { value: "PLANNED" as const, label: executionStatusLabels.PLANNED },
  { value: "ONGOING" as const, label: executionStatusLabels.ONGOING },
  { value: "COMPLETED" as const, label: executionStatusLabels.COMPLETED },
];
