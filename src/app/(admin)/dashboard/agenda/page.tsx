"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDateTimeBR } from "@/lib/format";
import { parseEventsList, type Event } from "@/schemas/events";

export default function AgendaAdminPage() {
  const { shouldRender, isChecking } = useRequireEditor();
  const queryClient = useQueryClient();
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const eventsQuery = useQuery({
    queryKey: ["admin-events"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/events", {
        params: { size: 100, sort: "startDate,desc" },
      });
      return parseEventsList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/admin/events/${eventId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Evento excluído com sucesso");
      setEventToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir o evento."),
      );
    },
  });

  if (isChecking) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando...
      </main>
    );
  }

  if (!shouldRender) {
    return null;
  }

  const events = eventsQuery.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os eventos exibidos na agenda pública.
          </p>
        </div>

        <Link href="/dashboard/agenda/create">
          <Button type="button">
            <PlusIcon />
            Novo evento
          </Button>
        </Link>
      </div>

      {eventsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando eventos...
        </div>
      ) : eventsQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            eventsQuery.error,
            "Não foi possível carregar os eventos.",
          )}
        </p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum evento cadastrado. Crie o primeiro evento da agenda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="w-30">Status</TableHead>
                <TableHead className="w-30 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-2">{event.title}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTimeBR(event.startDate)}
                  </TableCell>
                  <TableCell className="max-w-[12rem]">
                    <span className="line-clamp-2 text-muted-foreground">
                      {event.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.isPublished ? "default" : "secondary"}
                    >
                      {event.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/agenda/${event.id}/edit`}>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar evento"
                        >
                          <PencilIcon />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir evento"
                        onClick={() => setEventToDelete(event)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(eventToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setEventToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente
              {eventToDelete?.title ? ` “${eventToDelete.title}”` : ""} da
              agenda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (eventToDelete) {
                  deleteMutation.mutate(eventToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
