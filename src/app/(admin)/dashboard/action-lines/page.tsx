"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
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
  parseActionLinesList,
  type ActionLine,
} from "@/schemas/action-lines";

export default function ActionLinesPage() {
  const { shouldRender, isChecking } = useRequireEditor();
  const queryClient = useQueryClient();
  const [lineToDelete, setLineToDelete] = useState<ActionLine | null>(null);

  const actionLinesQuery = useQuery({
    queryKey: ["admin-action-lines"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/action-lines");
      return parseActionLinesList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (actionLineId: string) => {
      await api.delete(`/admin/action-lines/${actionLineId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-action-lines"] });
      toast.success("Linha de atuação excluída com sucesso");
      setLineToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível excluir a linha de atuação.",
        ),
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

  const actionLines = actionLinesQuery.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Linhas de Atuação
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as frentes de trabalho exibidas na vitrine.
          </p>
        </div>

        <Link href="/dashboard/action-lines/create">
          <Button type="button">
            <PlusIcon />
            Nova linha
          </Button>
        </Link>
      </div>

      {actionLinesQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando linhas de atuação...
        </div>
      ) : actionLinesQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            actionLinesQuery.error,
            "Não foi possível carregar as linhas de atuação.",
          )}
        </p>
      ) : actionLines.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Nenhuma linha cadastrada. Crie a primeira frente de atuação.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-22">Ícone</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-40">Slug</TableHead>
                <TableHead className="w-25">Blocos</TableHead>
                <TableHead className="w-25">Ordem</TableHead>
                <TableHead className="w-30">Status</TableHead>
                <TableHead className="w-30 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Image
                      src={line.iconUrl || "/placeholder.svg"}
                      alt=""
                      width={56}
                      height={56}
                      className="size-14 rounded-full bg-muted/40 object-cover"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-2">{line.title}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {line.slug}
                  </TableCell>
                  <TableCell>{line.blocks.length}</TableCell>
                  <TableCell>{line.displayOrder}</TableCell>
                  <TableCell>
                    <Badge variant={line.isActive ? "default" : "secondary"}>
                      {line.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/action-lines/${line.id}/edit`}>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar linha de atuação"
                        >
                          <PencilIcon />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir linha de atuação"
                        onClick={() => setLineToDelete(line)}
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
        open={Boolean(lineToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setLineToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir linha de atuação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove
              {lineToDelete?.title ? ` “${lineToDelete.title}”` : ""} da
              listagem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (lineToDelete) {
                  deleteMutation.mutate(lineToDelete.id);
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
