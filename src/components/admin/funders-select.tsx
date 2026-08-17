"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { parseFundersList, type Funder } from "@/schemas/funders";

type FundersSelectProps = {
  value?: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function FundersSelect({
  value = [],
  onChange,
  disabled = false,
}: FundersSelectProps) {
  const selectedIds = value.filter(Boolean);

  const fundersQuery = useQuery({
    queryKey: ["admin-funders"],
    queryFn: async () => {
      const { data } = await api.get("/admin/funders");
      return parseFundersList(data);
    },
  });

  const options = fundersQuery.data ?? [];

  const selectedFunders = selectedIds
    .map((id) => options.find((funder) => funder.id === id))
    .filter((funder): funder is Funder => Boolean(funder));

  function toggleFunder(funderId: string) {
    if (selectedIds.includes(funderId)) {
      onChange(selectedIds.filter((id) => id !== funderId));
      return;
    }

    onChange([...selectedIds, funderId]);
  }

  return (
    <div className="space-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled || fundersQuery.isLoading}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="truncate text-left">
            {fundersQuery.isLoading
              ? "Carregando financiadores..."
              : selectedFunders.length > 0
                ? `${selectedFunders.length} financiador(es) selecionado(s)`
                : "Selecionar financiadores"}
          </span>
          <ChevronsUpDownIcon className="size-4 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--anchor-width) max-w-md">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Financiadores cadastrados</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {fundersQuery.isError ? (
            <p className="px-2 py-3 text-sm text-destructive">
              Não foi possível carregar os financiadores.
            </p>
          ) : options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Nenhum financiador disponível.
            </p>
          ) : (
            <DropdownMenuGroup>
              {options.map((funder) => {
                const checked = selectedIds.includes(funder.id);

                return (
                  <DropdownMenuCheckboxItem
                    key={funder.id}
                    checked={checked}
                    onCheckedChange={() => toggleFunder(funder.id)}
                    className={cn(checked && "font-medium")}
                  >
                    <span className="truncate">{funder.name}</span>
                    {checked ? <CheckIcon className="ml-auto" /> : null}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedFunders.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedFunders.map((funder) => (
            <Badge key={funder.id} variant="secondary" className="gap-1 pr-1">
              {funder.name}
              <button
                type="button"
                disabled={disabled}
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remover ${funder.name}`}
                onClick={() => toggleFunder(funder.id)}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
