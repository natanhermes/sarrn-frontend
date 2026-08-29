"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { ViewPostDialog } from "@/components/admin/view-post-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDateTimeBR } from "@/lib/format";
import { canDeletePost, canEditPost } from "@/lib/post-permissions";
import {
  parsePost,
  parsePostsPage,
  postStatusLabels,
  postTypeLabels,
  postTypeSchema,
  type AdminPost,
  type PostType,
} from "@/schemas/posts";
import { useAuth } from "@/store/useAuth";

const DEFAULT_PAGE_SIZE = 10;

const pageTitleByType: Record<PostType, string> = {
  PROJECT: "Projetos",
  NEWS: "Notícias",
  BOOKLET: "Cartilhas",
  EBOOK: "E-books",
  ARTICLE: "Artigos",
  DOCUMENT: "Documentos",
  REPORT: "Relatórios",
  LIBRARY: "Biblioteca",
};

const typeFilters: { value: PostType | null; label: string }[] = [
  { value: null, label: "Todas" },
  { value: "PROJECT", label: "Projetos" },
  { value: "NEWS", label: "Notícias" },
  { value: "BOOKLET", label: "Cartilhas" },
  { value: "ARTICLE", label: "Artigos" },
  { value: "EBOOK", label: "E-books" },
  { value: "LIBRARY", label: "Biblioteca" },
];

function PostsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const user = useAuth((state) => state.user);
  const [postToDelete, setPostToDelete] = useState<AdminPost | null>(null);
  const [viewPostId, setViewPostId] = useState<string | null>(null);

  const typeParam = searchParams.get("type");
  const parsedType = postTypeSchema.safeParse(typeParam);
  const selectedType = parsedType.success ? parsedType.data : undefined;

  const pageParam = Number(searchParams.get("page") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;
  const sizeParam = Number(searchParams.get("size") ?? String(DEFAULT_PAGE_SIZE));
  const size =
    Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : DEFAULT_PAGE_SIZE;

  const postsQuery = useQuery({
    queryKey: ["admin-posts", selectedType ?? "ALL", page, size],
    queryFn: async () => {
      const { data } = await api.get("/admin/posts", {
        params: {
          page,
          size,
          sort: "createdAt,desc",
          ...(selectedType ? { type: selectedType } : {}),
        },
      });
      return parsePostsPage(data);
    },
  });

  const viewPostQuery = useQuery({
    queryKey: ["admin-post", viewPostId],
    enabled: Boolean(viewPostId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/posts/${viewPostId}`);
      return parsePost(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/admin/posts/${postId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Publicação excluída com sucesso");
      setPostToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir a publicação."),
      );
    },
  });

  function updateParams(updates: {
    type?: PostType | null;
    page?: number;
    size?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if ("type" in updates) {
      if (updates.type) {
        params.set("type", updates.type);
      } else {
        params.delete("type");
      }
      params.set("page", "0");
    }

    if (typeof updates.page === "number") {
      params.set("page", String(updates.page));
    }

    if (typeof updates.size === "number") {
      params.set("size", String(updates.size));
    }

    if (params.get("page") === "0") {
      params.delete("page");
    }

    if (params.get("size") === String(DEFAULT_PAGE_SIZE)) {
      params.delete("size");
    }

    const query = params.toString();
    router.push(query ? `/dashboard/posts?${query}` : "/dashboard/posts");
  }

  const pageTitle = selectedType
    ? pageTitleByType[selectedType]
    : "Todas as Publicações";

  const postsPage = postsQuery.data;
  const rawPosts = postsPage?.content ?? [];
  const posts = [...rawPosts].sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  const isFirst = postsPage?.first ?? true;
  const isLast = postsPage?.last ?? true;
  const totalPages = postsPage?.totalPages ?? 1;
  const currentPage = postsPage?.number ?? page;

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie todo o conteúdo do portal em um único lugar.
          </p>
        </div>

        <Link href="/dashboard/posts/create">
          <Button type="button">
            <PlusIcon />
            Nova publicação
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeFilters.map((filter) => {
          const isActive =
            filter.value === null
              ? !selectedType
              : selectedType === filter.value;

          return (
            <Button
              key={filter.label}
              type="button"
              size="sm"
              variant={isActive ? "secondary" : "outline"}
              onClick={() => updateParams({ type: filter.value })}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {postsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Carregando publicações...
          </div>
        ) : postsQuery.isError ? (
          <div className="px-4 py-16 text-center text-sm text-destructive">
            {getApiErrorMessage(
              postsQuery.error,
              "Não foi possível carregar as publicações.",
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-40">Autor</TableHead>
                  <TableHead className="w-40">Data</TableHead>
                  <TableHead className="w-28 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Nenhuma publicação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => {
                    const canEdit = canEditPost(user, post);
                    const canDelete = canDeletePost(user, post);

                    return (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-xs font-medium lg:max-w-md">
                          <span className="line-clamp-2" title={post.title}>
                            {post.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {postTypeLabels[post.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.status === "PUBLISHED"
                                ? "default"
                                : "outline"
                            }
                          >
                            {postStatusLabels[post.status]}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-[140px] truncate text-muted-foreground"
                          title={post.authorName}
                        >
                          {post.authorName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateTimeBR(post.publishedAt || post.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              aria-label="Visualizar"
                              onClick={() => setViewPostId(post.id)}
                            >
                              <EyeIcon />
                            </Button>
                            {canEdit ? (
                              <Link href={`/dashboard/posts/${post.id}/edit`}>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label="Editar"
                                >
                                  <PencilIcon />
                                </Button>
                              </Link>
                            ) : null}
                            {canDelete ? (
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Excluir"
                                onClick={() => setPostToDelete(post)}
                              >
                                <Trash2Icon />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {totalPages > 1 ? (
              <div className="flex flex-col items-center gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage + 1} de {totalPages}
                </p>
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        text="Anterior"
                        href="#"
                        aria-disabled={isFirst}
                        className={
                          isFirst ? "pointer-events-none opacity-50" : undefined
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          if (!isFirst) {
                            updateParams({ page: currentPage - 1 });
                          }
                        }}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        text="Próximo"
                        href="#"
                        aria-disabled={isLast}
                        className={
                          isLast ? "pointer-events-none opacity-50" : undefined
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          if (!isLast) {
                            updateParams({ page: currentPage + 1 });
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
          </>
        )}
      </div>

      <ViewPostDialog
        post={viewPostQuery.data ?? null}
        open={Boolean(viewPostId)}
        isLoading={viewPostQuery.isLoading || viewPostQuery.isFetching}
        onOpenChange={(open) => {
          if (!open) {
            setViewPostId(null);
          }
        }}
      />

      <AlertDialog
        open={Boolean(postToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPostToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
            <AlertDialogDescription>
              A publicação &quot;{postToDelete?.title}&quot; será removida
              logicamente. Esta ação pode ser irreversível na interface.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (postToDelete) {
                  deleteMutation.mutate(postToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-muted-foreground">
          <Loader2Icon className="mr-2 size-4 animate-spin" />
          Carregando...
        </main>
      }
    >
      <PostsPageContent />
    </Suspense>
  );
}
