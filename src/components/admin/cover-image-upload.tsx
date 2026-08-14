"use client";

import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { canDeleteMedia } from "@/lib/post-permissions";
import { resolvePublicMediaUrl } from "@/lib/public-api";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload";
import { useAuth } from "@/store/useAuth";

type CoverImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  emptyLabel?: string;
  aspectRatio?: "4/5" | "16/9" | "square" | string;
  storagePath?: string;
};

export function CoverImageUpload({
  value,
  onChange,
  disabled = false,
  emptyLabel = "Nenhuma imagem de capa",
  aspectRatio,
  storagePath,
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuth((state) => state.user);
  const allowDelete = canDeleteMedia(user);

  const isPortrait45 =
    aspectRatio === "4/5" ||
    aspectRatio === "0.8" ||
    aspectRatio === "aspect-4/5";

  const emptyContainerClass = isPortrait45
    ? "aspect-4/5 w-64 max-w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground p-4 text-center"
    : "flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground";

  async function handleFileChange(file?: File) {
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadImage(file, storagePath);
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

  const previewUrl = value ? resolvePublicMediaUrl(value) || value : null;

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

      {previewUrl ? (
        <div className="relative flex items-center justify-center rounded-lg border border-border bg-muted/20 p-3">
          <Image
            src={previewUrl}
            alt="Capa da publicação"
            unoptimized
            width={400}
            height={400}
            className="max-h-56 max-w-full w-auto h-auto object-contain rounded-md"
          />
        </div>
      ) : (
        <div className={emptyContainerClass}>
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

        {value && allowDelete ? (
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
