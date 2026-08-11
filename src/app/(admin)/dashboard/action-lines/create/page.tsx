"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ActionLineForm } from "@/components/admin/action-line-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ActionLineSubmitPayload } from "@/schemas/action-lines";

export default function CreateActionLinePage() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: ActionLineSubmitPayload) => {
      await api.post("/admin/action-lines", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-action-lines"] });
      toast.success("Linha de atuação criada com sucesso");
      router.push("/dashboard/action-lines");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível criar a linha de atuação.",
        ),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nova linha de atuação
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monte o conteúdo com blocos de texto, galeria e arquivos PDF.
        </p>
      </div>

      <ActionLineForm
        submitLabel="Criar linha"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
