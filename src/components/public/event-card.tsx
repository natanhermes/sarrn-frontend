import { MapPin } from "lucide-react";
import Image from "next/image";

import { getCalendarBadgeParts } from "@/lib/format";
import { resolvePublicMediaUrl } from "@/lib/public-api";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/schemas/events";

type EventCardProps = {
  event: EventSummary;
  onSelect: (event: EventSummary) => void;
};

export function EventCard({ event, onSelect }: EventCardProps) {
  const badge = getCalendarBadgeParts(event.startDate);
  const coverSrc = resolvePublicMediaUrl(event.coverImageUrl);

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={cn(
        "group flex w-full items-stretch gap-4 rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-brand-green/35 hover:shadow-md",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "sm:gap-5 sm:p-5",
      )}
    >
      <div className="flex size-[4.5rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-green text-white shadow-sm sm:size-20">
        <span className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase opacity-90">
          {badge?.month ?? "—"}
        </span>
        <span className="text-3xl leading-none font-extrabold tracking-tight sm:text-4xl">
          {badge?.day ?? "--"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <h3 className="text-lg font-bold tracking-tight text-balance transition-colors group-hover:text-brand-green sm:text-xl">
          {event.title}
        </h3>

        {event.location ? (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        ) : null}

        {event.summary ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            {event.summary}
          </p>
        ) : null}
      </div>

      {coverSrc ? (
        <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-muted md:block">
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="128px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : null}
    </button>
  );
}
