"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { StatisticForm } from "@/components/admin/statistic-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { StatisticSubmitPayload } from "@/schemas/statistics";

export default function CreateStatisticPage() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: StatisticSubmitPayload) => {
      await api.post("/admin/statistics", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      toast.success("Estatística criada com sucesso");
      router.push("/dashboard/statistics");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar a estatística."),
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
          Nova estatística
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre um indicador de impacto para a seção Quem Somos.
        </p>
      </div>

      <StatisticForm
        submitLabel="Criar estatística"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
