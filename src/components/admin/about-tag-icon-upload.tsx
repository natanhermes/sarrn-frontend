"use client";

import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { uploadImage } from "@/lib/upload";

type TagIconUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  storagePath?: string;
};

export function TagIconUpload({
  value,
  onChange,
  disabled = false,
  storagePath,
}: TagIconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(file?: File) {
    if (!file) {
      return;
    }

    const isSvgMime = file.type === "image/svg+xml";
    const isSvgExt = file.name.toLowerCase().endsWith(".svg");

    if (!isSvgMime && !isSvgExt) {
      toast.error("Apenas arquivos .svg são permitidos para ícones de tag.");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadImage(file, storagePath);
      onChange(url);
      toast.success("Ícone SVG enviado com sucesso.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Não foi possível enviar o ícone SVG."),
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".svg, image/svg+xml"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      {value ? (
        <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-border bg-muted p-1.5">
          <img src={value} alt="Ícone SVG" className="size-full object-contain" />
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2Icon className="size-3.5 animate-spin" />
        ) : (
          <ImagePlusIcon className="size-3.5" />
        )}
        {value ? "Trocar SVG" : "Upload SVG"}
      </Button>

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || isUploading}
          onClick={() => onChange("")}
          title="Remover Ícone"
        >
          <Trash2Icon className="size-3.5 text-destructive" />
        </Button>
      ) : null}
    </div>
  );
}
