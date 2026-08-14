"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { AboutForm } from "@/components/admin/about-form";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseAboutUs,
  type AboutUsSubmitPayload,
} from "@/schemas/about";

export default function AdminAboutPage() {
  const { shouldRender, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();

  const aboutQuery = useQuery({
    queryKey: ["admin-about"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/about");
      return parseAboutUs(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: AboutUsSubmitPayload) => {
      const { data } = await api.put("/admin/about", values);
      return parseAboutUs(data);
    },
    onSuccess: async (about) => {
      queryClient.setQueryData(["admin-about"], about);
      await queryClient.invalidateQueries({ queryKey: ["admin-about"] });
      toast.success("Dados de Quem Somos salvos com sucesso");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível salvar as informações de Quem Somos.",
        ),
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

  if (aboutQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando informações de Quem Somos...
      </main>
    );
  }

  if (aboutQuery.isError || !aboutQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          aboutQuery.error,
          "Não foi possível carregar as informações de Quem Somos.",
        )}
      </main>
    );
  }

  const about = aboutQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Quem Somos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o conteúdo institucional da vitrine e da página detalhada Quem Somos.
        </p>
      </div>

      <AboutForm
        key={about.id ?? "about"}
        defaultValues={about}
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
