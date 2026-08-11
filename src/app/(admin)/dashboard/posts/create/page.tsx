"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";

import { PostForm } from "@/components/admin/post-form";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  postTypeSchema,
  type PostSubmitPayload,
  type PostType,
} from "@/schemas/posts";

function CreatePostPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const parsedType = postTypeSchema.safeParse(typeParam);
  const defaultType: PostType = parsedType.success ? parsedType.data : "NEWS";

  const createMutation = useMutation({
    mutationFn: async (values: PostSubmitPayload) => {
      await api.post("/admin/posts", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Publicação criada com sucesso");
      router.push("/dashboard/posts");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar a publicação."),
      );
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nova publicação
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre um projeto, notícia ou publicação com conteúdo rico.
        </p>
      </div>

      <PostForm
        defaultType={defaultType}
        submitLabel="Criar publicação"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </main>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-muted-foreground">
          Carregando formulário...
        </main>
      }
    >
      <CreatePostPageContent />
    </Suspense>
  );
}
