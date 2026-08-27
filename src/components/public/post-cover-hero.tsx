"use client";

import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { LightboxModal } from "@/components/public/lightbox-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isVideoUrl } from "@/lib/upload";

type PostCoverHeroProps = {
  title: string;
  coverImage?: string | null;
  typeLabel: string;
  publishedLabel: string;
  authorNames?: string;
  publishedAt?: string | null;
};

export function PostCoverHero({
  title,
  coverImage,
  typeLabel,
  publishedLabel,
  authorNames,
  publishedAt,
}: PostCoverHeroProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isVid = coverImage ? isVideoUrl(coverImage) : false;

  return (
    <section className="relative isolate min-h-[min(70vh,40rem)] overflow-hidden bg-brand-black text-white">
      {coverImage ? (
        isVid ? (
          <video
            src={coverImage}
            controls
            preload="metadata"
            playsInline
            controlsList="nodownload"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-85"
          />
        ) : (
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green/40 via-brand-black to-brand-black" />
      )}

      {/* Gradiente suave reduzido para alta visibilidade da capa */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/85 via-brand-black/40 to-brand-black/15" />

      {/* Botão Ampliar Capa */}
      {coverImage && !isVid ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute bottom-6 right-6 z-20 gap-1.5 rounded-full bg-brand-black/70 text-xs font-semibold text-white backdrop-blur-md hover:bg-brand-black/90"
          onClick={() => setLightboxOpen(true)}
        >
          <Maximize2 className="size-3.5" />
          Ampliar capa
        </Button>
      ) : null}

      <div className="relative mx-auto flex min-h-[min(70vh,40rem)] w-full max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:px-8 md:pb-20">
        <Badge className="w-fit bg-brand-green text-white hover:bg-brand-green">
          {typeLabel}
        </Badge>
        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 md:text-base">
          <time dateTime={publishedAt || undefined}>{publishedLabel}</time>
          {authorNames ? (
            <>
              <span aria-hidden>•</span>
              <span>{authorNames}</span>
            </>
          ) : null}
        </div>
      </div>

      {coverImage && !isVid ? (
        <LightboxModal
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: coverImage, alt: title }]}
        />
      ) : null}
    </section>
  );
}
