import { Download, FileText } from "lucide-react";

import { BlockGallery } from "@/components/public/block-gallery";
import { Button } from "@/components/ui/button";
import { resolvePublicMediaUrl } from "@/lib/public-api";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { ContentBlock } from "@/schemas/content-blocks";

type BlockRendererProps = {
  blocks: ContentBlock[];
  title?: string;
};

export function BlockRenderer({
  blocks,
  title = "Conteúdo",
}: BlockRendererProps) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10">
      {blocks.map((block) => {
        if (block.type === "TEXT") {
          const safeHtml = sanitizeRichText(block.content);

          if (!safeHtml.trim()) {
            return null;
          }

          return (
            <article
              key={block.id ?? `text-${block.displayOrder}`}
              className="prose prose-brand my-2 w-full min-w-0 max-w-none overflow-hidden wrap-break-word dark:prose-invert [&_img]:mx-auto [&_img]:h-auto [&_img]:max-w-full [&_.ql-align-center]:text-center [&_.ql-align-justify]:text-justify [&_.ql-align-right]:text-right"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          );
        }

        if (block.type === "GALLERY") {
          return (
            <div
              key={block.id ?? `gallery-${block.displayOrder}`}
              className="my-4 w-full min-w-0 overflow-hidden"
            >
              <BlockGallery images={block.galleryUrls} title={title} />
            </div>
          );
        }

        if (block.type === "FILE") {
          const fileUrl =
            resolvePublicMediaUrl(block.fileUrl) || block.fileUrl;
          const fileTitle = block.fileTitle?.trim() || "Documento PDF";

          if (!fileUrl) {
            return null;
          }

          return (
            <article
              key={block.id ?? `file-${block.displayOrder}`}
              className="my-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileText className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Arquivo
                    </p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight">
                      {fileTitle}
                    </h3>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-brand-green text-white hover:bg-brand-green/90 [a]:hover:bg-brand-green/90"
                  nativeButton={false}
                  render={
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    />
                  }
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>

              <iframe
                src={fileUrl}
                title={fileTitle}
                className="mt-4 hidden h-[600px] w-full rounded-lg border border-border md:block"
              />
            </article>
          );
        }

        return null;
      })}
    </div>
  );
}
