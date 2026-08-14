"use client";

import { FileTextIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { canDeleteMedia } from "@/lib/post-permissions";
import { uploadPdf } from "@/lib/upload";
import { useAuth } from "@/store/useAuth";

type PdfAttachmentsUploadProps = {
  value?: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  storagePath?: string;
};

function getFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? "arquivo.pdf");
  } catch {
    const segments = url.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? "arquivo.pdf");
  }
}

export function PdfAttachmentsUpload({
  value = [],
  onChange,
  disabled = false,
  storagePath,
}: PdfAttachmentsUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuth((state) => state.user);
  const allowDelete = canDeleteMedia(user);
  const attachments = value.filter(Boolean);

  async function handleFiles(files?: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        uploaded.push(await uploadPdf(file, storagePath));
      }

      onChange([...attachments, ...uploaded]);
      toast.success(
        uploaded.length === 1
          ? "PDF anexado com sucesso"
          : `${uploaded.length} PDFs anexados com sucesso`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível enviar o PDF."));
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeAt(index: number) {
    onChange(attachments.filter((_, current) => current !== index));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {attachments.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Nenhum PDF anexado
        </div>
      ) : (
        <ul className="space-y-2">
          {attachments.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3"
            >
              <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {getFileNameFromUrl(url)}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  Abrir anexo
                </a>
              </div>
              {allowDelete ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={disabled || isUploading}
                  onClick={() => removeAt(index)}
                  aria-label="Remover anexo"
                >
                  <Trash2Icon />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <FileTextIcon />
        )}
        Adicionar PDF
      </Button>
    </div>
  );
}
