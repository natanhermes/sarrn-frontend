"use client";

import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useState } from "react";

import { LightboxModal } from "@/components/public/lightbox-modal";
import { Button } from "@/components/ui/button";
import { resolvePublicMediaUrl } from "@/lib/public-api";
import { isVideoUrl } from "@/lib/upload";
import { cn } from "@/lib/utils";

type BlockGalleryProps = {
  images: string[];
  title: string;
};

export function BlockGallery({ images, title }: BlockGalleryProps) {
  const items = images
    .map((url) => resolvePublicMediaUrl(url) || url)
    .filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (items.length === 0) {
    return null;
  }

  // Prepara os slides apenas para imagens (ignora vídeos no lightbox se houver)
  const imageItems = items.filter((url) => !isVideoUrl(url));
  const slides = imageItems.map((url) => ({ src: url, alt: title }));

  const openLightboxForCurrent = (index: number) => {
    const currentUrl = items[index];
    if (isVideoUrl(currentUrl)) {
      return;
    }
    const imgIndex = imageItems.indexOf(currentUrl);
    setLightboxIndex(imgIndex >= 0 ? imgIndex : 0);
    setLightboxOpen(true);
  };

  if (items.length === 1) {
    const singleUrl = items[0];
    const isVid = isVideoUrl(singleUrl);

    return (
      <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-border bg-muted/20">
        {isVid ? (
          <video
            src={singleUrl}
            controls
            preload="metadata"
            playsInline
            controlsList="nodownload"
            className="aspect-[16/10] h-auto w-full max-w-full object-cover"
          />
        ) : (
          <div className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden">
            <img
              src={singleUrl}
              alt={`${title} — mídia 1`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onClick={() => openLightboxForCurrent(0)}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-3 right-3 z-20 gap-1.5 rounded-full bg-brand-black/70 text-xs font-semibold text-white backdrop-blur-md hover:bg-brand-black/90"
              onClick={() => openLightboxForCurrent(0)}
            >
              <Maximize2 className="size-3.5" />
              Ampliar
            </Button>
          </div>
        )}

        <LightboxModal
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={slides}
          index={lightboxIndex}
        />
      </div>
    );
  }

  const goTo = (direction: -1 | 1) => {
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return items.length - 1;
      if (next >= items.length) return 0;
      return next;
    });
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-border bg-muted/20">
      <div className="group relative aspect-[16/10] w-full overflow-hidden">
        {items.map((url, index) => {
          const isVid = isVideoUrl(url);

          if (isVid) {
            return (
              <video
                key={`${url}-${index}`}
                src={url}
                controls
                preload="metadata"
                playsInline
                controlsList="nodownload"
                className={cn(
                  "absolute inset-0 h-full w-full max-w-full object-cover transition-opacity duration-500",
                  index === activeIndex
                    ? "pointer-events-auto z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0",
                )}
              />
            );
          }

          return (
            <img
              key={`${url}-${index}`}
              src={url}
              alt={`${title} — mídia ${index + 1}`}
              className={cn(
                "absolute inset-0 h-full w-full cursor-pointer max-w-full object-cover transition-opacity duration-500",
                index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0",
              )}
              loading={index === 0 ? "eager" : "lazy"}
              onClick={() => openLightboxForCurrent(index)}
            />
          );
        })}

        {!isVideoUrl(items[activeIndex]) ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute bottom-16 right-4 z-30 gap-1.5 rounded-full bg-brand-black/70 text-xs font-semibold text-white backdrop-blur-md hover:bg-brand-black/90"
            onClick={() => openLightboxForCurrent(activeIndex)}
          >
            <Maximize2 className="size-3.5" />
            Ampliar
          </Button>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-t from-brand-black/80 via-brand-black/40 to-transparent p-4">
        <p className="text-sm font-medium text-white">
          {activeIndex + 1} / {items.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-label="Mídia anterior"
            onClick={() => goTo(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-label="Próxima mídia"
            onClick={() => goTo(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <LightboxModal
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />
    </div>
  );
}
