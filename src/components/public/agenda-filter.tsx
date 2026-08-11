"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
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

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, index) => currentYear - index);
}

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

export function AgendaFilter({ view, year, month }: AgendaFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const yearOptions = buildYearOptions();
  const yearItems = yearOptions.map((value) => ({
    value: String(value),
    label: String(value),
  }));

  function pushParams(next: URLSearchParams) {
    next.delete("page");
    next.delete("scope");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function setView(nextView: AgendaView) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "upcoming") {
      params.delete("view");
      params.delete("year");
      params.delete("month");
      pushParams(params);
      return;
    }

    const fallback = currentMonthParts();
    params.set("view", "past");
    params.set("year", String(year ?? fallback.year));
    params.set("month", String(month ?? fallback.month));
    pushParams(params);
  }

  function setPeriod(nextYear: string, nextMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "past");
    params.set("year", nextYear);
    params.set("month", nextMonth);
    pushParams(params);
  }

  return (
    <div className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            items={yearItems}
            value={year ? String(year) : undefined}
            onValueChange={(value) => {
              if (value != null) {
                setPeriod(value, String(month ?? currentMonthParts().month));
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {yearItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={MONTH_ITEMS}
            value={month ? String(month) : undefined}
            onValueChange={(value) => {
              if (value != null) {
                setPeriod(String(year ?? currentMonthParts().year), value);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
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
  );
}
