"use client";

import { Loader2Icon, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { BlockRenderer } from "@/components/shared/block-renderer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTimeBR } from "@/lib/format";
import {
  getPublicEventBySlug,
  resolvePublicMediaUrl,
  type PublicEvent,
} from "@/lib/public-api";
import type { EventSummary } from "@/schemas/events";
import { isVideoUrl } from "@/lib/upload";

type EventDetailSheetProps = {
  event: EventSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
}: EventDetailSheetProps) {
  const [detail, setDetail] = useState<PublicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !event?.slug) {
      return;
    }

    let cancelled = false;
    const slug = event.slug;

    setIsLoading(true);
    setError(null);
    setDetail(null);

    getPublicEventBySlug(slug)
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Não foi possível carregar os detalhes do evento.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, event?.slug]);

  const coverSrc = resolvePublicMediaUrl(
    detail?.coverImageUrl || event?.coverImageUrl,
  );
  const title = detail?.title || event?.title || "Evento";
  const location = detail?.location || event?.location || "";
  const startDate = detail?.startDate || event?.startDate || "";
  const endDate = detail?.endDate || event?.endDate || "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle className="text-xl font-bold tracking-tight text-balance">
            {title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes do evento {title}
          </SheetDescription>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              {formatDateTimeBR(startDate)}
              {endDate ? ` — ${formatDateTimeBR(endDate)}` : ""}
            </p>
            {location ? (
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                <span>{location}</span>
              </p>
            ) : null}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-6">
          {coverSrc ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
              {isVideoUrl(coverSrc) ? (
                <video
                  src={coverSrc}
                  controls
                  preload="metadata"
                  playsInline
                  controlsList="nodownload"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={coverSrc}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 36rem"
                  className="object-cover"
                />
              )}
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin" />
              Carregando detalhes...
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!isLoading && !error && detail ? (
            <>
              {detail.summary ? (
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                  {detail.summary}
                </p>
              ) : null}

              {detail.blocks.length > 0 ? (
                <BlockRenderer blocks={detail.blocks} title={detail.title} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este evento ainda não possui conteúdo adicional.
                </p>
              )}
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
