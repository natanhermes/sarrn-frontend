"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { StatisticForm } from "@/components/admin/statistic-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseStatistic,
  type StatisticSubmitPayload,
} from "@/schemas/statistics";

export default function EditStatisticPage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const statisticId = params.id;

  const statisticQuery = useQuery({
    queryKey: ["admin-statistics", statisticId],
    enabled: shouldRender && Boolean(statisticId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/statistics/${statisticId}`);
      return parseStatistic(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: StatisticSubmitPayload) => {
      await api.put(`/admin/statistics/${statisticId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-statistics", statisticId],
      });
      toast.success("Estatística atualizada com sucesso");
      router.push("/dashboard/statistics");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível atualizar a estatística.",
        ),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (statisticQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando estatística...
      </main>
    );
  }

  if (statisticQuery.isError || !statisticQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          statisticQuery.error,
          "Não foi possível carregar a estatística.",
        )}
      </main>
    );
  }

  const statistic = statisticQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar estatística
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize o valor, o título e a ordem de exibição.
        </p>
      </div>

      <StatisticForm
        defaultValues={{
          title: statistic.title,
          value: statistic.value,
          description: statistic.description,
          isActive: statistic.isActive,
          displayOrder: statistic.displayOrder,
        }}
        submitLabel="Salvar alterações"
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
