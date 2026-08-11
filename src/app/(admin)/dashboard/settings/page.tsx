"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  parseSiteSettings,
  type SiteSettingsSubmitPayload,
} from "@/schemas/settings";

export default function SettingsPage() {
  const { shouldRender, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/settings");
      return parseSiteSettings(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: SiteSettingsSubmitPayload) => {
      const { data } = await api.put("/admin/settings", values);
      return parseSiteSettings(data);
    },
    onSuccess: async (settings) => {
      queryClient.setQueryData(["admin-settings"], settings);
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Configurações salvas com sucesso");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível salvar as configurações.",
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

  if (settingsQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando configurações...
      </main>
    );
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          settingsQuery.error,
          "Não foi possível carregar as configurações.",
        )}
      </main>
    );
  }

  const settings = settingsQuery.data;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os dados globais do portal institucional.
        </p>
      </div>

      <SiteSettingsForm
        key={settings.id ?? "settings"}
        defaultValues={settings}
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}
