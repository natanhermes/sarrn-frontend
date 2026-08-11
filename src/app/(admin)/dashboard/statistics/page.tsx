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
  parseStatisticsList,
  type Statistic,
} from "@/schemas/statistics";

export default function StatisticsPage() {
  const { shouldRender, isChecking } = useRequireEditor();
  const queryClient = useQueryClient();
  const [statisticToDelete, setStatisticToDelete] = useState<Statistic | null>(
    null,
  );

  const statisticsQuery = useQuery({
    queryKey: ["admin-statistics"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/statistics");
      return parseStatisticsList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (statisticId: string) => {
      await api.delete(`/admin/statistics/${statisticId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      toast.success("Estatística excluída com sucesso");
      setStatisticToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir a estatística."),
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

  const statistics = statisticsQuery.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Estatísticas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os números de impacto exibidos na Home.
          </p>
        </div>

        <Link href="/dashboard/statistics/create">
          <Button type="button">
            <PlusIcon />
            Nova estatística
          </Button>
        </Link>
      </div>

      {statisticsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando estatísticas...
        </div>
      ) : statisticsQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            statisticsQuery.error,
            "Não foi possível carregar as estatísticas.",
          )}
        </p>
      ) : statistics.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma estatística cadastrada. Adicione o primeiro indicador da
          Home.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valor</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-25">Ordem</TableHead>
                <TableHead className="w-30">Status</TableHead>
                <TableHead className="w-30 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((statistic) => (
                <TableRow key={statistic.id}>
                  <TableCell className="font-semibold tracking-tight">
                    {statistic.value}
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-2">{statistic.title}</span>
                  </TableCell>
                  <TableCell>{statistic.displayOrder}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statistic.isActive ? "default" : "secondary"}
                    >
                      {statistic.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/dashboard/statistics/${statistic.id}/edit`}
                      >
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar estatística"
                        >
                          <PencilIcon />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir estatística"
                        onClick={() => setStatisticToDelete(statistic)}
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
        open={Boolean(statisticToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setStatisticToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir estatística?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente
              {statisticToDelete?.title
                ? ` “${statisticToDelete.title}”`
                : ""}{" "}
              da listagem.
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
                if (statisticToDelete) {
                  deleteMutation.mutate(statisticToDelete.id);
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
