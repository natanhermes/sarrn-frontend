"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FunderForm } from "@/components/admin/funder-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { FunderSubmitPayload } from "@/schemas/funders";

export default function CreateFunderPage() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: FunderSubmitPayload) => {
      await api.post("/admin/funders", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-funders"] });
      toast.success("Apoiador criado com sucesso");
      router.push("/dashboard/funders");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar o apoiador."),
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
          Novo apoiador
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre um parceiro para a seção de apoiadores da Home.
        </p>
      </div>

      <FunderForm
        submitLabel="Criar apoiador"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
