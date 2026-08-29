"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { parseAuthorsList, type AuthorSummary } from "@/schemas/users";

type AuthorSelectProps = {
  value?: string | null;
  onChange: (authorId: string) => void;
  disabled?: boolean;
};

export function AuthorSelect({
  value = "",
  onChange,
  disabled = false,
}: AuthorSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const authorsQuery = useQuery({
    queryKey: ["admin-authors"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users/authors");
      return parseAuthorsList(data);
    },
  });

  const authors = authorsQuery.data ?? [];

  const selectedAuthor = useMemo(() => {
    if (!value) return null;
    return authors.find((author) => author.id === value) ?? null;
  }, [authors, value]);

  const filteredAuthors = useMemo(() => {
    if (!search.trim()) return authors;
    const q = search.trim().toLowerCase();
    return authors.filter((author) =>
      author.name.toLowerCase().includes(q),
    );
  }, [authors, search]);

  function handleSelect(authorId: string) {
    onChange(authorId);
    setOpen(false);
    setSearch("");
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled || authorsQuery.isLoading}
            className="w-full justify-between font-normal text-left"
          />
        }
      >
        <span className="flex items-center gap-2 truncate">
          <UserIcon className="size-4 shrink-0 text-muted-foreground" />
          {authorsQuery.isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2Icon className="size-3 animate-spin" />
              Carregando autores...
            </span>
          ) : selectedAuthor ? (
            <span className="font-medium text-foreground truncate">
              {selectedAuthor.name}
            </span>
          ) : value ? (
            <span className="text-muted-foreground truncate">
              Autor selecionado ({value})
            </span>
          ) : (
            <span className="text-muted-foreground">
              Atribuir a mim (padrão)
            </span>
          )}
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-(--anchor-width) min-w-[240px] max-w-md p-1">
        <div className="p-1">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
              autoFocus
            />
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSelect("")}
            className={cn(
              "flex items-center justify-between cursor-pointer text-sm",
              !value && "font-medium bg-muted/60",
            )}
          >
            <span>Atribuir a mim (padrão)</span>
            {!value ? (
              <CheckIcon className="size-4 text-primary ml-auto" />
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {authorsQuery.isError ? (
          <p className="px-2 py-3 text-xs text-destructive">
            Não foi possível carregar os autores.
          </p>
        ) : authors.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Nenhum outro autor cadastrado.
          </p>
        ) : filteredAuthors.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Nenhum autor encontrado para &ldquo;{search}&rdquo;.
          </p>
        ) : (
          <DropdownMenuGroup className="max-h-56 overflow-y-auto">
            {filteredAuthors.map((author) => {
              const isSelected = value === author.id;
              return (
                <DropdownMenuItem
                  key={author.id}
                  onClick={() => handleSelect(author.id)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer text-sm",
                    isSelected && "font-medium bg-muted/60",
                  )}
                >
                  <span className="truncate">{author.name}</span>
                  {isSelected ? (
                    <CheckIcon className="size-4 text-primary ml-auto shrink-0" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
