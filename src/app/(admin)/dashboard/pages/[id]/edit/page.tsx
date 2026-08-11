"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { InstitutionalPageForm } from "@/components/admin/institutional-page-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseInstitutionalPage,
  toInstitutionalPageFormValues,
  type InstitutionalPageSubmitPayload,
} from "@/schemas/institutional-pages";

export default function EditInstitutionalPagePage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pageId = params.id;

  const pageQuery = useQuery({
    queryKey: ["admin-pages", pageId],
    enabled: shouldRender && Boolean(pageId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/pages/${pageId}`);
      return parseInstitutionalPage(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: InstitutionalPageSubmitPayload) => {
      await api.put(`/admin/pages/${pageId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-pages", pageId],
      });
      toast.success("Página atualizada com sucesso");
      router.push("/dashboard/pages");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar a página."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (pageQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando página...
      </main>
    );
  }

  if (pageQuery.isError || !pageQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          pageQuery.error,
          "Não foi possível carregar a página.",
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar página
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize os dados e a ordem dos blocos de conteúdo.
        </p>
      </div>

      <InstitutionalPageForm
        defaultValues={toInstitutionalPageFormValues(pageQuery.data)}
        submitLabel="Salvar alterações"
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
