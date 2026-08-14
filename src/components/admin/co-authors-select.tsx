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
import { parseAuthorsList, type AuthorSummary } from "@/schemas/users";

type CoAuthorsSelectProps = {
  value?: string[];
  onChange: (ids: string[]) => void;
  excludeUserId?: string | null;
  disabled?: boolean;
};

export function CoAuthorsSelect({
  value = [],
  onChange,
  excludeUserId,
  disabled = false,
}: CoAuthorsSelectProps) {
  const selectedIds = value.filter(Boolean);

  const authorsQuery = useQuery({
    queryKey: ["admin-authors"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users/authors");
      return parseAuthorsList(data);
    },
  });

  const options = (authorsQuery.data ?? []).filter(
    (author) => author.id !== excludeUserId,
  );

  const selectedAuthors = selectedIds
    .map((id) => options.find((author) => author.id === id))
    .filter((author): author is AuthorSummary => Boolean(author));

  function toggleAuthor(authorId: string) {
    if (selectedIds.includes(authorId)) {
      onChange(selectedIds.filter((id) => id !== authorId));
      return;
    }

    onChange([...selectedIds, authorId]);
  }

  return (
    <div className="space-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled || authorsQuery.isLoading}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="truncate text-left">
            {authorsQuery.isLoading
              ? "Carregando autores..."
              : selectedAuthors.length > 0
                ? `${selectedAuthors.length} co-autor(es) selecionado(s)`
                : "Selecionar co-autores"}
          </span>
          <ChevronsUpDownIcon className="size-4 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--anchor-width) max-w-md">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Autores do sistema</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {authorsQuery.isError ? (
            <p className="px-2 py-3 text-sm text-destructive">
              Não foi possível carregar os autores.
            </p>
          ) : options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Nenhum autor disponível.
            </p>
          ) : (
            <DropdownMenuGroup>
              {options.map((author) => {
                const checked = selectedIds.includes(author.id);

                return (
                  <DropdownMenuCheckboxItem
                    key={author.id}
                    checked={checked}
                    onCheckedChange={() => toggleAuthor(author.id)}
                    className={cn(checked && "font-medium")}
                  >
                    <span className="truncate">{author.name}</span>
                    {checked ? <CheckIcon className="ml-auto" /> : null}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAuthors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedAuthors.map((author) => (
            <Badge key={author.id} variant="secondary" className="gap-1 pr-1">
              {author.name}
              <button
                type="button"
                disabled={disabled}
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remover ${author.name}`}
                onClick={() => toggleAuthor(author.id)}
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
