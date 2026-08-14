"use client";

import { FileTextIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { canDeleteMedia } from "@/lib/post-permissions";
import { uploadPdf } from "@/lib/upload";
import { useAuth } from "@/store/useAuth";

type PdfFileUploadProps = {
  value?: string;
  onChange: (url: string) => void;
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

export function PdfFileUpload({
  value = "",
  onChange,
  disabled = false,
  storagePath,
}: PdfFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuth((state) => state.user);
  const allowDelete = canDeleteMedia(user);
  const fileUrl = value.trim();

  async function handleFile(files?: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadPdf(file, storagePath);
      onChange(url);
      toast.success("PDF enviado com sucesso");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível enviar o PDF."));
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => handleFile(event.target.files)}
      />

      {fileUrl ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium hover:underline"
            >
              {getFileNameFromUrl(fileUrl)}
            </a>
          </div>
          {allowDelete ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Remover PDF"
              disabled={disabled || isUploading}
              onClick={() => onChange("")}
            >
              <Trash2Icon />
            </Button>
          ) : null}
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <FileTextIcon className="size-4" />
            {fileUrl ? "Trocar PDF" : "Enviar PDF"}
          </>
        )}
      </Button>
    </div>
  );
}
