"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { FunderForm } from "@/components/admin/funder-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseFunder,
  type FunderSubmitPayload,
} from "@/schemas/funders";

export default function EditFunderPage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const funderId = params.id;

  const funderQuery = useQuery({
    queryKey: ["admin-funders", funderId],
    enabled: shouldRender && Boolean(funderId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/funders/${funderId}`);
      return parseFunder(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FunderSubmitPayload) => {
      await api.put(`/admin/funders/${funderId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-funders"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-funders", funderId],
      });
      toast.success("Apoiador atualizado com sucesso");
      router.push("/dashboard/funders");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar o apoiador."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (funderQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando apoiador...
      </main>
    );
  }

  if (funderQuery.isError || !funderQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          funderQuery.error,
          "Não foi possível carregar o apoiador.",
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar apoiador
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize os dados e a ordem de exibição.
        </p>
      </div>

      <FunderForm
        defaultValues={{
          logoUrl: funderQuery.data.logoUrl,
          name: funderQuery.data.name,
          siteUrl: funderQuery.data.siteUrl,
          isActive: funderQuery.data.isActive,
          displayOrder: funderQuery.data.displayOrder,
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
