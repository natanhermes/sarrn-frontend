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
import { parseUsersList, type AdminUser } from "@/schemas/users";

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

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return parseUsersList(data);
    },
  });

  const options = (usersQuery.data ?? []).filter(
    (user) => user.id !== excludeUserId,
  );

  const selectedUsers = selectedIds
    .map((id) => options.find((user) => user.id === id))
    .filter((user): user is AdminUser => Boolean(user));

  function toggleUser(userId: string) {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
      return;
    }

    onChange([...selectedIds, userId]);
  }

  return (
    <div className="space-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled || usersQuery.isLoading}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="truncate text-left">
            {usersQuery.isLoading
              ? "Carregando usuários..."
              : selectedUsers.length > 0
                ? `${selectedUsers.length} co-autor(es) selecionado(s)`
                : "Selecionar co-autores"}
          </span>
          <ChevronsUpDownIcon className="size-4 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--anchor-width) max-w-md">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Usuários do sistema</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {usersQuery.isError ? (
            <p className="px-2 py-3 text-sm text-destructive">
              Não foi possível carregar os usuários.
            </p>
          ) : options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Nenhum usuário disponível.
            </p>
          ) : (
            <DropdownMenuGroup>
              {options.map((user) => {
                const checked = selectedIds.includes(user.id);

                return (
                  <DropdownMenuCheckboxItem
                    key={user.id}
                    checked={checked}
                    onCheckedChange={() => toggleUser(user.id)}
                    className={cn(checked && "font-medium")}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                    {checked ? <CheckIcon className="ml-auto" /> : null}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedUsers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
              {user.name}
              <button
                type="button"
                disabled={disabled}
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remover ${user.name}`}
                onClick={() => toggleUser(user.id)}
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
