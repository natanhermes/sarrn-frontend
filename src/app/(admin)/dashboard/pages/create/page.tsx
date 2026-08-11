"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { InstitutionalPageForm } from "@/components/admin/institutional-page-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { InstitutionalPageSubmitPayload } from "@/schemas/institutional-pages";

export default function CreateInstitutionalPagePage() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: InstitutionalPageSubmitPayload) => {
      await api.post("/admin/pages", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Página criada com sucesso");
      router.push("/dashboard/pages");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar a página."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova página</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monte o conteúdo com blocos de texto, galeria e arquivos PDF.
        </p>
      </div>

      <InstitutionalPageForm
        submitLabel="Criar página"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
