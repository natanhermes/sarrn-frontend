"use client";

import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { canDeleteMedia } from "@/lib/post-permissions";
import {
  GALLERY_MEDIA_ACCEPT,
  isVideoUrl,
  uploadImage,
} from "@/lib/upload";
import { useAuth } from "@/store/useAuth";

const MAX_GALLERY_ITEMS = 15;

type GalleryImagesUploadProps = {
  value?: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  storagePath?: string;
};

export function GalleryImagesUpload({
  value = [],
  onChange,
  disabled = false,
  storagePath,
}: GalleryImagesUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuth((state) => state.user);
  const allowDelete = canDeleteMedia(user);
  const items = value.filter(Boolean);
  const remainingSlots = MAX_GALLERY_ITEMS - items.length;
  const isAtLimit = remainingSlots <= 0;

  async function handleFiles(files?: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selected = Array.from(files);

    const hasSvg = selected.some(
      (file) =>
        file.type === "image/svg+xml" ||
        file.name.toLowerCase().endsWith(".svg"),
    );

    if (hasSvg) {
      toast.error(
        "SVGs não são permitidos em blocos de galeria. Selecione imagens (JPG, PNG, WEBP, AVIF) ou vídeos (MP4, WEBM).",
      );
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    if (selected.length > remainingSlots) {
      toast.error(
        `Você atingiu o limite de ${MAX_GALLERY_ITEMS} arquivos. Selecione apenas as melhores mídias do seu projeto.`,
      );
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of selected) {
        uploaded.push(await uploadImage(file, storagePath));
      }

      onChange([...items, ...uploaded]);
      toast.success(
        uploaded.length === 1
          ? "Mídia adicionada à galeria"
          : `${uploaded.length} mídias adicionadas à galeria`,
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Não foi possível enviar a mídia."),
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeAt(index: number) {
    onChange(items.filter((_, current) => current !== index));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={GALLERY_MEDIA_ACCEPT}
        multiple
        className="hidden"
        disabled={disabled || isUploading || isAtLimit}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {items.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Nenhuma mídia na galeria
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((url, index) => {
            const isVideo = isVideoUrl(url);

            return (
              <div
                key={`${url}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted/20"
              >
                {isVideo ? (
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    playsInline
                    controlsList="nodownload"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Mídia ${index + 1} da galeria`}
                    className="aspect-square w-full object-cover"
                  />
                )}
                {allowDelete ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    disabled={disabled || isUploading}
                    onClick={() => removeAt(index)}
                    aria-label="Remover mídia"
                  >
                    <Trash2Icon />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Selecione imagens ou vídeos (.mp4, .webm até 100MB). Máximo de{" "}
        {MAX_GALLERY_ITEMS} mídias por publicação
        {items.length > 0 ? ` (${items.length}/${MAX_GALLERY_ITEMS}).` : "."}
      </p>

      <Button
        type="button"
        variant="outline"
        disabled={disabled || isUploading || isAtLimit}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <ImagePlusIcon />
        )}
        {isAtLimit ? "Limite de mídias atingido" : "Adicionar mídias"}
      </Button>
    </div>
  );
}
