"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { DatePickerInput } from "@/components/public/date-picker-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PostType } from "@/schemas/posts";

export type PostsFilterTypeOption = {
  value: PostType;
  label: string;
};

type PostsFilterProps = {
  types?: PostsFilterTypeOption[];
};

export function PostsFilter({ types = [] }: PostsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedType = searchParams.get("type");
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
      updateParams({ search: searchTerm });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSearch]);

  function updateParams(updates: {
    type?: string | null;
    search?: string | null;
    date?: string | null;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if ("type" in updates) {
      if (updates.type) {
        params.set("type", updates.type);
      } else {
        params.delete("type");
      }
    }

    if ("search" in updates) {
      if (updates.search?.trim()) {
        params.set("search", updates.search.trim());
      } else {
        params.delete("search");
      }
    }

    if ("date" in updates) {
      if (updates.date?.trim()) {
        params.set("date", updates.date.trim());
      } else {
        params.delete("date");
      }
    }

    // Removido ano do filtro conforme solicitado
    params.delete("year");
    params.delete("page");

    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="space-y-4">
      {/* Top Filter Bar: Title search + Typable DatePickerInput */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Title Search Input (Debounced 500ms) */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateParams({ search: null });
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
          onChange={(nextDate) => updateParams({ date: nextDate })}
          className="w-full sm:w-60"
        />
      </div>

      {/* Category Type Pills */}
      {types.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrar por tipo"
        >
          <Button
            type="button"
            size="sm"
            variant={!selectedType ? "default" : "outline"}
            className={cn(
              "rounded-full",
              !selectedType &&
                "bg-brand-green text-white hover:bg-brand-green/90",
            )}
            onClick={() => updateParams({ type: null })}
          >
            Todos
          </Button>
          {types.map((type) => {
            const active = selectedType === type.value;

            return (
              <Button
                key={type.value}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className={cn(
                  "rounded-full",
                  active &&
                    "bg-brand-green text-white hover:bg-brand-green/90",
                )}
                onClick={() => updateParams({ type: type.value })}
              >
                {type.label}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
