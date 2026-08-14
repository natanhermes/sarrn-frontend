"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { CarouselSlideForm } from "@/components/admin/carousel-slide-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseCarouselSlide,
  type CarouselSlideSubmitPayload,
} from "@/schemas/carousel";

export default function EditCarouselSlidePage() {
  const { shouldRender } = useRequireEditor();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slideId = params.id;

  const slideQuery = useQuery({
    queryKey: ["admin-carousel", slideId],
    enabled: shouldRender && Boolean(slideId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/carousel/${slideId}`);
      return parseCarouselSlide(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CarouselSlideSubmitPayload) => {
      await api.put(`/admin/carousel/${slideId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-carousel", slideId],
      });
      toast.success("Slide atualizado com sucesso");
      router.push("/dashboard/carousel");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar o slide."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  if (slideQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando slide...
      </main>
    );
  }

  if (slideQuery.isError || !slideQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          slideQuery.error,
          "Não foi possível carregar o slide.",
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar slide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize o conteúdo e a ordem do banner.
        </p>
      </div>

      <CarouselSlideForm
        defaultValues={{
          storageId: slideQuery.data.storageId,
          imageUrl: slideQuery.data.imageUrl,
          badgeText: slideQuery.data.badgeText,
          title: slideQuery.data.title,
          subtitle: slideQuery.data.subtitle,
          primaryButtonText: slideQuery.data.primaryButtonText,
          primaryButtonUrl: slideQuery.data.primaryButtonUrl,
          secondaryButtonText: slideQuery.data.secondaryButtonText,
          secondaryButtonUrl: slideQuery.data.secondaryButtonUrl,
          isActive: slideQuery.data.isActive,
          displayOrder: slideQuery.data.displayOrder,
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
