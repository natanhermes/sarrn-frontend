"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ActionLineForm } from "@/components/admin/action-line-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseActionLine,
  type ActionLineSubmitPayload,
} from "@/schemas/action-lines";
import { toContentBlockFormValues } from "@/schemas/content-blocks";

export default function EditActionLinePage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const actionLineId = params.id;

  const actionLineQuery = useQuery({
    queryKey: ["admin-action-lines", actionLineId],
    enabled: shouldRender && Boolean(actionLineId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/action-lines/${actionLineId}`);
      return parseActionLine(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: ActionLineSubmitPayload) => {
      await api.put(`/admin/action-lines/${actionLineId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-action-lines"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-action-lines", actionLineId],
      });
      toast.success("Linha de atuação atualizada com sucesso");
      router.push("/dashboard/action-lines");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível atualizar a linha de atuação.",
        ),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (actionLineQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando linha de atuação...
      </main>
    );
  }

  if (actionLineQuery.isError || !actionLineQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          actionLineQuery.error,
          "Não foi possível carregar a linha de atuação.",
        )}
      </main>
    );
  }

  const line = actionLineQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar linha de atuação
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize os dados e a ordem dos blocos de conteúdo.
        </p>
      </div>

      <ActionLineForm
        defaultValues={{
          iconUrl: line.iconUrl,
          coverImageUrl: line.coverImageUrl,
          title: line.title,
          slug: line.slug,
          summary: line.summary,
          isActive: line.isActive,
          displayOrder: line.displayOrder,
          blocks: toContentBlockFormValues(line.blocks),
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
