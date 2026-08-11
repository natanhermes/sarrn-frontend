"use client";

import Link from "next/link";
import { Suspense, useState } from "react";

import { AgendaFilter, type AgendaView } from "@/components/public/agenda-filter";
import { EventCard } from "@/components/public/event-card";
import { EventDetailSheet } from "@/components/public/event-detail-sheet";
import { Button } from "@/components/ui/button";
import type { EventSummariesPage, EventSummary } from "@/schemas/events";

type AgendaCatalogProps = {
  pageData: EventSummariesPage;
  view: AgendaView;
  year?: number;
  month?: number;
  basePath?: string;
};

function buildAgendaHref(
  basePath: string,
  pageOneBased: number,
  filters: { view: AgendaView; year?: number; month?: number },
) {
  const params = new URLSearchParams();

  if (filters.view === "past") {
    params.set("view", "past");
    if (filters.year) {
      params.set("year", String(filters.year));
    }
    if (filters.month) {
      params.set("month", String(filters.month));
    }
  }

  if (pageOneBased > 1) {
    params.set("page", String(pageOneBased));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AgendaCatalog({
  pageData,
  view,
  year,
  month,
  basePath = "/agenda",
}: AgendaCatalogProps) {
  const [selected, setSelected] = useState<EventSummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const currentPage = pageData.number + 1;
  const events = pageData.content;

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={null}>
        <AgendaFilter view={view} year={year} month={month} />
      </Suspense>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
          Nenhum evento encontrado com os filtros selecionados.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={(item) => {
                setSelected(item);
                setSheetOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {pageData.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          {currentPage > 1 ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={buildAgendaHref(basePath, currentPage - 1, {
                    view,
                    year,
                    month,
                  })}
                />
              }
            >
              Anterior
            </Button>
          ) : (
            <span />
          )}

          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {pageData.totalPages}
          </p>

          {!pageData.last ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={buildAgendaHref(basePath, currentPage + 1, {
                    view,
                    year,
                    month,
                  })}
                />
              }
            >
              Próxima
            </Button>
          ) : (
            <span />
          )}
        </div>
      ) : null}

      <EventDetailSheet
        event={selected}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSelected(null);
          }
        }}
      />
    </div>
  );
}
