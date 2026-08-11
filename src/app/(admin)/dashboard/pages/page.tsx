"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import {
  MENU_GROUP_LABELS,
  parseInstitutionalPagesList,
  type InstitutionalPage,
} from "@/schemas/institutional-pages";

export default function InstitutionalPagesPage() {
  const { shouldRender, isChecking } = useRequireEditor();
  const queryClient = useQueryClient();
  const [pageToDelete, setPageToDelete] = useState<InstitutionalPage | null>(
    null,
  );

  const pagesQuery = useQuery({
    queryKey: ["admin-pages"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/pages");
      return parseInstitutionalPagesList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      await api.delete(`/admin/pages/${pageId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Página excluída com sucesso");
      setPageToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir a página."),
      );
    },
  });

  if (isChecking) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando...
      </main>
    );
  }

  if (!shouldRender) {
    return null;
  }

  const pages = pagesQuery.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Páginas Institucionais
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as páginas dos menus SAR e Transparência.
          </p>
        </div>

        <Link href="/dashboard/pages/create">
          <Button type="button">
            <PlusIcon />
            Nova página
          </Button>
        </Link>
      </div>

      {pagesQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando páginas...
        </div>
      ) : pagesQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            pagesQuery.error,
            "Não foi possível carregar as páginas.",
          )}
        </p>
      ) : pages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma página cadastrada. Crie a primeira página institucional.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {page.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {MENU_GROUP_LABELS[page.menuGroup]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/pages/${page.id}/edit`}>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar página"
                        >
                          <PencilIcon />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir página"
                        onClick={() => setPageToDelete(page)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(pageToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPageToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir página?</AlertDialogTitle>
            <AlertDialogDescription>
              A página &quot;{pageToDelete?.title}&quot; será removida
              permanentemente do menu público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || !pageToDelete}
              onClick={() => {
                if (pageToDelete) {
                  deleteMutation.mutate(pageToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
