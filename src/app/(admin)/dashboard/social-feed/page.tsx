"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  RefreshCwIcon,
  SettingsIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

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
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDateBR } from "@/lib/format";
import {
  parseSocialFeedPage,
  parseSocialFeedSyncResponse,
  socialPlatformSchema,
  type SocialFeedItem,
  type SocialFeedSyncResponse,
  type SocialPlatform,
} from "@/schemas/social-feed";

const DEFAULT_PAGE_SIZE = 12;

const platformFilters: { value: SocialPlatform | null; label: string }[] = [
  { value: null, label: "Todas as redes" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
];

function getPlatformBadge(platform: SocialPlatform) {
  switch (platform) {
    case "YOUTUBE":
      return <Badge className="bg-red-600 hover:bg-red-700 text-white">YouTube</Badge>;
    case "INSTAGRAM":
      return (
        <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border-0">
          Instagram
        </Badge>
      );
    case "FACEBOOK":
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Facebook</Badge>;
    default:
      return <Badge variant="secondary">{platform}</Badge>;
  }
}

function SocialFeedPageContent() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [itemToDelete, setItemToDelete] = useState<SocialFeedItem | null>(null);
  const [syncResult, setSyncResult] = useState<SocialFeedSyncResponse | null>(null);

  const platformParam = searchParams.get("platform");
  const parsedPlatform = socialPlatformSchema.safeParse(platformParam);
  const selectedPlatform = parsedPlatform.success ? parsedPlatform.data : undefined;

  const pageParam = Number(searchParams.get("page") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;

  const feedQuery = useQuery({
    queryKey: ["admin-social-feed", selectedPlatform ?? "ALL", page],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/social-feed", {
        params: {
          page,
          size: DEFAULT_PAGE_SIZE,
          sort: "publishedAt,desc",
          ...(selectedPlatform ? { platform: selectedPlatform } : {}),
        },
      });
      return parseSocialFeedPage(data);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/admin/social-feed/sync");
      return parseSocialFeedSyncResponse(data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-social-feed"] });
      setSyncResult(data);
      if (data.results.some((r) => !r.configured)) {
        toast.warning("Sincronização executada com avisos. Veja os detalhes.");
      } else {
        toast.success("Sincronização executada com sucesso!");
      }
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível sincronizar as coletas das redes sociais.",
        ),
      );
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ item }: { item: SocialFeedItem }) => {
      const nextStatus = !item.isActive;
      await api.patch(`/admin/social-feed/${item.id}`, {
        active: nextStatus,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-social-feed"] });
      toast.success("Status do item atualizado!");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível alterar o status do item."),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/social-feed/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-social-feed"] });
      toast.success("Item removido do feed!");
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível remover o item."),
      );
    },
  });

  function updateParams(updates: { platform?: SocialPlatform | null; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());

    if ("platform" in updates) {
      if (updates.platform) {
        params.set("platform", updates.platform);
      } else {
        params.delete("platform");
      }
      params.set("page", "0");
    }

    if (typeof updates.page === "number") {
      params.set("page", String(updates.page));
    }

    if (params.get("page") === "0") {
      params.delete("page");
    }

    const query = params.toString();
    router.push(query ? `/dashboard/social-feed?${query}` : "/dashboard/social-feed");
  }

  if (!shouldRender) {
    return null;
  }

  const feedPage = feedQuery.data;
  const items = feedPage?.content ?? [];
  const isFirst = feedPage?.first ?? true;
  const isLast = feedPage?.last ?? true;
  const totalPages = feedPage?.totalPages ?? 1;
  const currentPage = feedPage?.number ?? page;

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Redes Sociais & Coletas
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as publicações coletadas do YouTube, Instagram e Facebook exibidas no portal.
          </p>
        </div>

        <Button
          type="button"
          disabled={syncMutation.isPending}
          onClick={() => syncMutation.mutate()}
        >
          {syncMutation.isPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCwIcon className="size-4" />
              Sincronizar redes agora
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {platformFilters.map((filter) => {
          const isActive =
            filter.value === null
              ? !selectedPlatform
              : selectedPlatform === filter.value;

          return (
            <Button
              key={filter.label}
              type="button"
              size="sm"
              variant={isActive ? "secondary" : "outline"}
              onClick={() => updateParams({ platform: filter.value })}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {feedQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Carregando coletas das redes sociais...
          </div>
        ) : feedQuery.isError ? (
          <div className="px-4 py-16 text-center text-sm text-destructive">
            {getApiErrorMessage(
              feedQuery.error,
              "Não foi possível carregar as coletas das redes sociais.",
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center text-muted-foreground">
            <Share2Icon className="size-10 text-muted-foreground/50" />
            <p className="text-sm">
              Nenhuma coleta encontrada. Clique em &quot;Sincronizar redes agora&quot; para puxar as postagens mais recentes.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Mídia</TableHead>
                  <TableHead>Rede Social</TableHead>
                  <TableHead>Título / Conteúdo</TableHead>
                  <TableHead>Data de Publicação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="relative aspect-square size-12 overflow-hidden rounded-md bg-muted">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPlatformBadge(item.platform)}</TableCell>
                    <TableCell className="max-w-md font-medium">
                      <span className="line-clamp-2">{item.title || "Sem título"}</span>
                      {item.externalId ? (
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {item.externalId}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {item.publishedAt ? formatDateBR(item.publishedAt) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {item.postUrl ? (
                          <a
                            href={item.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              title="Ver post original"
                            >
                              <ExternalLinkIcon className="size-4" />
                            </Button>
                          </a>
                        ) : null}

                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          title={item.isActive ? "Ocultar da vitrine" : "Exibir na vitrine"}
                          disabled={toggleStatusMutation.isPending}
                          onClick={() => toggleStatusMutation.mutate({ item })}
                        >
                          {item.isActive ? (
                            <EyeOffIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <EyeIcon className="size-4 text-primary" />
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          title="Excluir coleta"
                          onClick={() => setItemToDelete(item)}
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

      <AlertDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setItemToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir coleta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a coleta
              {itemToDelete?.title ? ` “${itemToDelete.title}”` : ""} do feed do portal.
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
                if (itemToDelete) {
                  deleteMutation.mutate(itemToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(syncResult)}
        onOpenChange={(open) => {
          if (!open) {
            setSyncResult(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCwIcon className="size-5 text-primary" />
              Resultado da Sincronização
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {syncResult?.summary}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-2 flex flex-col gap-3">
            {syncResult?.results.map((res) => (
              <div
                key={res.platform}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-3 text-xs"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    {res.platform === "YOUTUBE" && (
                      <span className="inline-block size-2 rounded-full bg-red-500" />
                    )}
                    {res.platform === "FACEBOOK" && (
                      <span className="inline-block size-2 rounded-full bg-blue-500" />
                    )}
                    {res.platform === "INSTAGRAM" && (
                      <span className="inline-block size-2 rounded-full bg-pink-500" />
                    )}
                    {res.platform}
                  </span>

                  {res.configured && res.success ? (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2Icon className="mr-1 size-3" />
                      {res.itemsCount} salvos/atualizados
                    </Badge>
                  ) : !res.configured ? (
                    <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                      <AlertTriangleIcon className="mr-1 size-3" />
                      Não Configurado
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Falha na Coleta
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground">{res.message}</p>
              </div>
            ))}
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {syncResult?.results.some((r) => !r.configured) && (
              <Link href="/dashboard/settings" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <SettingsIcon className="size-4" />
                  Ir para Configurações
                </Button>
              </Link>
            )}
            <AlertDialogAction onClick={() => setSyncResult(null)} size="sm">
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export default function SocialFeedPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-muted-foreground">
          <Loader2Icon className="mr-2 size-4 animate-spin" />
          Carregando...
        </main>
      }
    >
      <SocialFeedPageContent />
    </Suspense>
  );
}
