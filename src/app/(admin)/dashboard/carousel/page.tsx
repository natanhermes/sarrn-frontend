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
import {
  parseCarouselSlidesList,
  type CarouselSlide,
} from "@/schemas/carousel";

export default function CarouselPage() {
  const { shouldRender } = useRequireEditor();
  const queryClient = useQueryClient();
  const [slideToDelete, setSlideToDelete] = useState<CarouselSlide | null>(
    null,
  );

  const slidesQuery = useQuery({
    queryKey: ["admin-carousel"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/carousel");
      return parseCarouselSlidesList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slideId: string) => {
      await api.delete(`/admin/carousel/${slideId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide excluído com sucesso");
      setSlideToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir o slide."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  const slides = slidesQuery.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Carrossel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os banners da Home do portal.
          </p>
        </div>

        <Link href="/dashboard/carousel/create">
          <Button type="button">
            <PlusIcon />
            Novo slide
          </Button>
        </Link>
      </div>

      {slidesQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando slides...
        </div>
      ) : slidesQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            slidesQuery.error,
            "Não foi possível carregar os slides.",
          )}
        </p>
      ) : slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum slide cadastrado. Crie o primeiro banner da Home.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[88px]">Imagem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[100px]">Ordem</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((slide) => {
                return (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <img
                        src={slide.imageUrl || "/placeholder.svg"}
                        alt=""
                        className="size-14 rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="max-w-xs font-medium">
                      <span className="line-clamp-2">{slide.title}</span>
                    </TableCell>
                    <TableCell>{slide.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={slide.isActive ? "default" : "secondary"}>
                        {slide.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/carousel/${slide.id}/edit`}>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Editar slide"
                          >
                            <PencilIcon />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Excluir slide"
                          onClick={() => setSlideToDelete(slide)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(slideToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setSlideToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir slide?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente o banner
              {slideToDelete?.title ? ` “${slideToDelete.title}”` : ""}.
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
                if (slideToDelete) {
                  deleteMutation.mutate(slideToDelete.id);
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
