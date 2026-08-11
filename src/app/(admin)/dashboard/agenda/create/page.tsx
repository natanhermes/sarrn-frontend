"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EventForm } from "@/components/admin/event-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { EventSubmitPayload } from "@/schemas/events";

export default function CreateEventPage() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: EventSubmitPayload) => {
      await api.post("/admin/events", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Evento criado com sucesso");
      router.push("/dashboard/agenda");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar o evento."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo evento</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre um evento e monte o conteúdo com blocos.
        </p>
      </div>

      <EventForm
        submitLabel="Criar evento"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
