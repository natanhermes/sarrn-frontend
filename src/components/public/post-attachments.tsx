import { DownloadIcon, FileTextIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { resolvePublicMediaUrl } from "@/lib/public-api";
import { cn } from "@/lib/utils";

type PostAttachmentsProps = {
  urls: string[];
};

function getFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? "documento.pdf");
  } catch {
    const segments = url.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? "documento.pdf");
  }
}

export function PostAttachments({ urls }: PostAttachmentsProps) {
  const attachments = urls
    .map((url) => resolvePublicMediaUrl(url) || url)
    .filter(Boolean);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 space-y-8 border-t border-border pt-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Documentos anexos
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Visualize ou baixe os arquivos relacionados a esta publicação.
        </p>
      </div>

      <div className="space-y-8">
        {attachments.map((url, index) => (
          <article
            key={`${url}-${index}`}
            className="overflow-hidden rounded-3xl border border-border bg-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex min-w-0 items-center gap-2">
                <FileTextIcon className="size-4 shrink-0 text-brand-green" />
                <p className="truncate text-sm font-semibold">
                  {getFileNameFromUrl(url)}
                </p>
              </div>
              <a
                href={url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                <DownloadIcon />
                Fazer download
              </a>
            </div>
            <iframe
              src={`${url}#view=FitH`}
              title={`Visualização de ${getFileNameFromUrl(url)}`}
              className="h-[32rem] w-full bg-muted/20"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
