"use client";

import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload";

type CoverImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  emptyLabel?: string;
};

export function CoverImageUpload({
  value,
  onChange,
  disabled = false,
  emptyLabel = "Nenhuma imagem de capa",
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(file?: File) {
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Imagem enviada com sucesso");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Não foi possível enviar a imagem."),
      );
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
        accept={IMAGE_ACCEPT}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      {value ? (
        <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
          <img
            src={value}
            alt="Capa da publicação"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ImagePlusIcon />
          )}
          {value ? "Trocar imagem" : "Enviar capa"}
        </Button>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isUploading}
            onClick={() => onChange("")}
          >
            <Trash2Icon />
            Remover
          </Button>
        ) : null}
      </div>
    </div>
  );
}
