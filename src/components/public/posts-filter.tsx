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
import type { PostType } from "@/schemas/posts";

export type PostsFilterTypeOption = {
  value: PostType;
  label: string;
};

type PostsFilterProps = {
  types?: PostsFilterTypeOption[];
};

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 4 }, (_, index) => currentYear - index);
}

export function PostsFilter({ types = [] }: PostsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type");
  const selectedYear = searchParams.get("year") ?? "all";
  const yearOptions = buildYearOptions();
  const yearItems = [
    { value: "all", label: "Todos os anos" },
    ...yearOptions.map((year) => ({
      value: String(year),
      label: String(year),
    })),
  ];

  function updateParams(updates: {
    type?: string | null;
    year?: string | null;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if ("type" in updates) {
      if (updates.type) {
        params.set("type", updates.type);
      } else {
        params.delete("type");
      }
    }

    if ("year" in updates) {
      if (updates.year) {
        params.set("year", updates.year);
      } else {
        params.delete("year");
      }
    }

    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
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
              !selectedType && "bg-brand-green text-white hover:bg-brand-green/90",
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

      <Select
        items={yearItems}
        value={selectedYear}
        onValueChange={(value) => {
          if (value == null || value === "all") {
            updateParams({ year: null });
            return;
          }

          updateParams({ year: String(value) });
        }}
      >
        <SelectTrigger
          className="w-44 shrink-0 md:ml-auto"
          aria-label="Filtrar por ano"
        >
          <SelectValue placeholder="Todos os anos" />
        </SelectTrigger>
        <SelectContent align="start">
          {yearItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
