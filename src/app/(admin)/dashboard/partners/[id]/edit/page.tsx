"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { PartnerForm } from "@/components/admin/partner-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parsePartner,
  type PartnerSubmitPayload,
} from "@/schemas/partners";

export default function EditPartnerPage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const partnerId = params.id;

  const partnerQuery = useQuery({
    queryKey: ["admin-partners", partnerId],
    enabled: shouldRender && Boolean(partnerId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/partners/${partnerId}`);
      return parsePartner(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: PartnerSubmitPayload) => {
      await api.put(`/admin/partners/${partnerId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-partners", partnerId],
      });
      toast.success("Parceiro atualizado com sucesso");
      router.push("/dashboard/partners");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar o parceiro."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (partnerQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando parceiro...
      </main>
    );
  }

  if (partnerQuery.isError || !partnerQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          partnerQuery.error,
          "Não foi possível carregar o parceiro.",
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar parceiro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize os dados e a ordem de exibição.
        </p>
      </div>

      <PartnerForm
        defaultValues={{
          storageId: partnerQuery.data.storageId,
          logoUrl: partnerQuery.data.logoUrl,
          name: partnerQuery.data.name,
          cnpj: partnerQuery.data.cnpj,
          siteUrl: partnerQuery.data.siteUrl,
          isActive: partnerQuery.data.isActive,
          displayOrder: partnerQuery.data.displayOrder,
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
