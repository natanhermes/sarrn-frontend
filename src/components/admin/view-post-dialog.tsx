"use client";

import { BlockRenderer } from "@/components/shared/block-renderer";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatDateTimeBR,
} from "@/lib/format";
import {
  executionStatusLabels,
  postStatusLabels,
  type AdminPost,
} from "@/schemas/posts";

type ViewPostDialogProps = {
  post: AdminPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
};

export function ViewPostDialog({
  post,
  open,
  onOpenChange,
  isLoading = false,
}: ViewPostDialogProps) {
  const details = post?.projectDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{post?.title ?? "Visualizar publicação"}</DialogTitle>
          <DialogDescription>
            Pré-visualização segura do conteúdo para revisão editorial.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !post ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Carregando publicação...
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4">
              <Badge
                variant={
                  post.status === "PUBLISHED" ? "default" : "outline"
                }
              >
                {postStatusLabels[post.status]}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Autor:{" "}
                <span className="text-foreground">{post.authorName}</span>
              </p>
              {post.coAuthors.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Co-autores:{" "}
                  <span className="text-foreground">
                    {post.coAuthors.map((author) => author.name).join(", ")}
                  </span>
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Data:{" "}
                <span className="text-foreground">
                  {formatDateTimeBR(post.publishedAt || post.createdAt)}
                </span>
              </p>
            </div>

            {post.coverImageUrl?.trim() ? (
              <div className="flex max-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20">
                <img
                  src={post.coverImageUrl}
                  alt={`Capa de ${post.title}`}
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
            ) : null}

            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Resumo
              </p>
              <p className="mt-1 text-sm text-foreground">
                {post.summary?.trim()
                  ? post.summary
                  : "Nenhum resumo informado."}
              </p>
            </div>

            {post.type === "PROJECT" && details ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Detalhes do projeto</p>
                  <Badge variant="secondary">
                    {executionStatusLabels[details.executionStatus]}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Objetivo geral
                    </p>
                    <p className="mt-1 text-sm">{details.generalObjective}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Data de início
                    </p>
                    <p className="mt-1 text-sm">
                      {formatDateBR(details.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Data de fim
                    </p>
                    <p className="mt-1 text-sm">
                      {formatDateBR(details.endDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Duração
                    </p>
                    <p className="mt-1 text-sm">
                      {details.durationText?.trim() || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Orçamento
                    </p>
                    <p className="mt-1 text-sm">
                      {formatCurrencyBRL(details.budgetValue)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Conteúdo
              </p>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <BlockRenderer blocks={post.blocks} title={post.title} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
