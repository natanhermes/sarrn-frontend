"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

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
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export type AgendaView = "upcoming" | "past";

const MONTH_ITEMS = [
  { value: "all", label: "Todos os anteriores" },
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

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_ITEMS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

type AgendaFilterProps = {
  view: AgendaView;
  year?: number;
  month?: number;
};

export function AgendaFilter({ view, year, month }: AgendaFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedSearch = searchParams.get("search") ?? "";
  const selectedDate = searchParams.get("date") ?? "";

  const [prevSelectedSearch, setPrevSelectedSearch] = useState(selectedSearch);
  const [searchTerm, setSearchTerm] = useState(selectedSearch);

  if (prevSelectedSearch !== selectedSearch) {
    setPrevSelectedSearch(selectedSearch);
    setSearchTerm(selectedSearch);
  }

  const debouncedSearch = useDebounce(searchTerm, 500);

  const pushParams = useCallback(
    (next: URLSearchParams) => {
      next.delete("page");
      next.delete("scope");
      const query = next.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router],
  );

  const updateSearchAndDate = useCallback(
    (searchVal?: string | null, dateVal?: string | null) => {
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
    },
    [pushParams, searchParams],
  );

  // Debounced search update (500ms)
  useEffect(() => {
    if (!searchTerm.trim()) {
      if (selectedSearch.trim()) {
        updateSearchAndDate(null, undefined);
      }
      return;
    }

    if (debouncedSearch.trim() !== selectedSearch.trim()) {
      updateSearchAndDate(debouncedSearch, undefined);
    }
  }, [debouncedSearch, searchTerm, selectedSearch, updateSearchAndDate]);

  const handleClear = () => {
    setSearchTerm("");
    updateSearchAndDate(null, undefined);
  };

  function setView(nextView: AgendaView) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "upcoming") {
      params.delete("view");
      params.delete("month");
      params.delete("year");
      pushParams(params);
      return;
    }

    params.set("view", "past");
    pushParams(params);
  }

  function setMonth(nextMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "past");

    if (nextMonth === "all") {
      params.delete("month");
      params.delete("year");
    } else {
      params.set("month", nextMonth);
      if (!params.get("year")) {
        params.set("year", String(year ?? CURRENT_YEAR));
      }
    }

    pushParams(params);
  }

  function setYear(nextYear: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "past");
    params.set("year", nextYear);

    if (!params.get("month") || params.get("month") === "all") {
      const currentMonth = new Date().getMonth() + 1;
      params.set("month", String(currentMonth));
    }

    pushParams(params);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Title Search + Typable DatePicker Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Title Search Input (Debounced 500ms) */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar evento por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          <div className="flex flex-wrap items-center gap-2">
            <Select
              items={MONTH_ITEMS}
              value={month ? String(month) : "all"}
              onValueChange={(value) => {
                if (value != null) {
                  setMonth(value);
                }
              }}
            >
              <SelectTrigger className="w-44">
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

            {month ? (
              <Select
                items={YEAR_ITEMS}
                value={String(year ?? CURRENT_YEAR)}
                onValueChange={(value) => {
                  if (value != null) {
                    setYear(value);
                  }
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
