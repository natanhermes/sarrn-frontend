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
import { parseFundersList, type Funder } from "@/schemas/funders";

export default function FundersPage() {
  const { shouldRender, isChecking } = useRequireEditor();
  const queryClient = useQueryClient();
  const [funderToDelete, setFunderToDelete] = useState<Funder | null>(null);

  const fundersQuery = useQuery({
    queryKey: ["admin-funders"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/funders");
      return parseFundersList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (funderId: string) => {
      await api.delete(`/admin/funders/${funderId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-funders"] });
      toast.success("Apoiador excluído com sucesso");
      setFunderToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir o apoiador."),
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

  const funders = fundersQuery.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apoiadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as logos exibidas na seção de apoiadores da Home.
          </p>
        </div>

        <Link href="/dashboard/funders/create">
          <Button type="button">
            <PlusIcon />
            Novo apoiador
          </Button>
        </Link>
      </div>

      {fundersQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando apoiadores...
        </div>
      ) : fundersQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            fundersQuery.error,
            "Não foi possível carregar os apoiadores.",
          )}
        </p>
      ) : funders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum apoiador cadastrado. Adicione o primeiro parceiro da Home.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-22">Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-25">Ordem</TableHead>
                <TableHead className="w-30">Status</TableHead>
                <TableHead className="w-30 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funders.map((funder) => (
                <TableRow key={funder.id}>
                  <TableCell>
                    <img
                      src={funder.logoUrl || "/placeholder.svg"}
                      alt=""
                      className="size-14 rounded-md object-contain bg-muted/40 p-1"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-2">{funder.name}</span>
                  </TableCell>
                  <TableCell>{funder.displayOrder}</TableCell>
                  <TableCell>
                    <Badge variant={funder.isActive ? "default" : "secondary"}>
                      {funder.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/funders/${funder.id}/edit`}>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar apoiador"
                        >
                          <PencilIcon />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir apoiador"
                        onClick={() => setFunderToDelete(funder)}
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
        open={Boolean(funderToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setFunderToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir apoiador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente
              {funderToDelete?.name ? ` “${funderToDelete.name}”` : ""} da
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
                if (funderToDelete) {
                  deleteMutation.mutate(funderToDelete.id);
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
