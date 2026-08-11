"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { resolvePublicMediaUrl } from "@/lib/public-api";
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

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return (
      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-muted/20">
        <img
          src={items[0]}
          alt={`${title} — imagem 1`}
          className="aspect-[16/10] h-auto w-full max-w-full object-cover"
          loading="lazy"
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
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {items.map((url, index) => (
          <img
            key={`${url}-${index}`}
            src={url}
            alt={`${title} — imagem ${index + 1}`}
            className={cn(
              "absolute inset-0 h-full w-full max-w-full object-cover transition-opacity duration-500",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-brand-black/70 to-transparent p-4">
        <p className="text-sm font-medium text-white">
          {activeIndex + 1} / {items.length}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-label="Imagem anterior"
            onClick={() => goTo(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-label="Próxima imagem"
            onClick={() => goTo(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
