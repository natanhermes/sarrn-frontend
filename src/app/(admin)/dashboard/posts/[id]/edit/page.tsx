"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { PostForm } from "@/components/admin/post-form";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { canEditPost } from "@/lib/post-permissions";
import { toContentBlockFormValues } from "@/schemas/content-blocks";
import {
  parsePost,
  type PostSubmitPayload,
} from "@/schemas/posts";
import { useAuth } from "@/store/useAuth";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuth((state) => state.user);
  const postId = params.id;

  const postQuery = useQuery({
    queryKey: ["admin-post", postId],
    enabled: Boolean(postId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/posts/${postId}`);
      return parsePost(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: PostSubmitPayload) => {
      await api.put(`/admin/posts/${postId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-post", postId] });
      toast.success("Publicação atualizada com sucesso");
      router.push("/dashboard/posts");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar a publicação."),
      );
    },
  });

  if (postQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando publicação...
      </main>
    );
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-destructive">
        {getApiErrorMessage(
          postQuery.error,
          "Não foi possível carregar a publicação.",
        )}
      </main>
    );
  }

  if (user && !canEditPost(user, postQuery.data)) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <ShieldAlertIcon className="size-8 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Você só pode editar publicações das quais é autor ou co-autor.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar publicação
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize o conteúdo e o status da publicação.
        </p>
      </div>

      <PostForm
        isEditing
        defaultValues={{
          storageId: postQuery.data.storageId,
          type: postQuery.data.type,
          title: postQuery.data.title,
          summary: postQuery.data.summary,
          coverImageUrl: postQuery.data.coverImageUrl,
          blocks: toContentBlockFormValues(postQuery.data.blocks),
          status: postQuery.data.status,
          publishedAt: postQuery.data.publishedAt ?? "",
          coAuthorIds: postQuery.data.coAuthors.map((author) => author.id),
          projectDetails: postQuery.data.projectDetails
            ? {
                generalObjective:
                  postQuery.data.projectDetails.generalObjective,
                startDate: postQuery.data.projectDetails.startDate ?? "",
                endDate: postQuery.data.projectDetails.endDate ?? "",
                budgetValue: postQuery.data.projectDetails.budgetValue,
                executionStatus:
                  postQuery.data.projectDetails.executionStatus,
              }
            : undefined,
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
