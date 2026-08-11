"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { EventForm } from "@/components/admin/event-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseEvent,
  toEventFormValues,
  type EventSubmitPayload,
} from "@/schemas/events";

export default function EditEventPage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.id;

  const eventQuery = useQuery({
    queryKey: ["admin-events", eventId],
    enabled: shouldRender && Boolean(eventId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/events/${eventId}`);
      return parseEvent(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: EventSubmitPayload) => {
      await api.put(`/admin/events/${eventId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-events", eventId],
      });
      toast.success("Evento atualizado com sucesso");
      router.push("/dashboard/agenda");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar o evento."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (eventQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando evento...
      </main>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          eventQuery.error,
          "Não foi possível carregar o evento.",
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar evento
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize os dados e o conteúdo em blocos.
        </p>
      </div>

      <EventForm
        defaultValues={toEventFormValues(eventQuery.data)}
        submitLabel="Salvar alterações"
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
