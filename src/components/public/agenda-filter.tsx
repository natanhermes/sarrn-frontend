"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { DatePickerInput } from "@/components/public/date-picker-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type AgendaView = "upcoming" | "past";

const MONTH_ITEMS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

function currentMonthParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

type AgendaFilterProps = {
  view: AgendaView;
  year?: number;
  month?: number;
};

export function AgendaFilter({ view, month }: AgendaFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedSearch = searchParams.get("search") ?? "";
  const selectedDate = searchParams.get("date") ?? "";

  const [searchTerm, setSearchTerm] = useState(selectedSearch);

  // Sync state if URL searchParam changes externally
  useEffect(() => {
    setSearchTerm(selectedSearch);
  }, [selectedSearch]);

  // Debounced search update (500ms)
  useEffect(() => {
    if (searchTerm === selectedSearch) {
      return;
    }

    const timer = setTimeout(() => {
      updateSearchAndDate(searchTerm, undefined);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSearch]);

  function pushParams(next: URLSearchParams) {
    next.delete("page");
    next.delete("scope");
    next.delete("year");
    const query = next.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(href);
    });
  }

  function updateSearchAndDate(
    searchVal?: string | null,
    dateVal?: string | null,
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (searchVal !== undefined) {
      if (searchVal?.trim()) {
        params.set("search", searchVal.trim());
      } else {
        params.delete("search");
      }
    }

    if (dateVal !== undefined) {
      if (dateVal?.trim()) {
        params.set("date", dateVal.trim());
      } else {
        params.delete("date");
      }
    }

    pushParams(params);
  }

  function setView(nextView: AgendaView) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "upcoming") {
      params.delete("view");
      params.delete("month");
      pushParams(params);
      return;
    }

    const fallback = currentMonthParts();
    params.set("view", "past");
    params.set("month", String(month ?? fallback.month));
    pushParams(params);
  }

  function setMonth(nextMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "past");
    params.set("month", nextMonth);
    pushParams(params);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Title Search + Typable DatePicker Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Title Search Input (Debounced 500ms) */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar evento por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateSearchAndDate(null, undefined);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              <span className="sr-only">Limpar busca</span>
            </button>
          ) : null}
        </div>

        {/* Seletor de Data Digitável e com Popover */}
        <DatePickerInput
          value={selectedDate}
          onChange={(nextDate) => updateSearchAndDate(undefined, nextDate)}
          className="w-full sm:w-60"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex w-fit rounded-lg border border-border bg-secondary/50 p-1"
          role="tablist"
          aria-label="Filtrar agenda"
        >
          {(
            [
              ["upcoming", "Próximos"],
              ["past", "Anteriores"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              role="tab"
              aria-selected={view === value}
              className={cn(
                "rounded-md px-4",
                view === value
                  ? "bg-brand-green text-white hover:bg-brand-green/90 hover:text-white"
                  : "text-muted-foreground hover:bg-transparent hover:text-foreground",
              )}
              onClick={() => setView(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        {view === "past" ? (
          <div className="flex items-center gap-3">
            <Select
              items={MONTH_ITEMS}
              value={month ? String(month) : undefined}
              onValueChange={(value) => {
                if (value != null) {
                  setMonth(value);
                }
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
