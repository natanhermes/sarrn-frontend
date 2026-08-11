"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CarouselSlideForm } from "@/components/admin/carousel-slide-form";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CarouselSlideSubmitPayload } from "@/schemas/carousel";

export default function CreateCarouselSlidePage() {
  const { shouldRender } = useRequireEditor();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: CarouselSlideSubmitPayload) => {
      await api.post("/admin/carousel", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide criado com sucesso");
      router.push("/dashboard/carousel");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar o slide."),
      );
    },
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo slide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre um banner para o carrossel da Home.
        </p>
      </div>

      <CarouselSlideForm
        submitLabel="Criar slide"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
