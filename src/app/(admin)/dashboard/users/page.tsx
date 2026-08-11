"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { parseUsersList, roleLabels } from "@/schemas/users";

export default function UsersPage() {
  const { shouldRender } = useRequireAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return parseUsersList(data);
    },
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os membros da equipe e seus níveis de acesso.
          </p>
        </div>

        <Button type="button" onClick={() => setDialogOpen(true)}>
          <PlusIcon />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Carregando usuários...
          </div>
        ) : usersQuery.isError ? (
          <div className="px-4 py-16 text-center text-sm text-destructive">
            {getApiErrorMessage(
              usersQuery.error,
              "Não foi possível carregar os usuários.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível de Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usersQuery.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                usersQuery.data?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleLabels[item.role]}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  );
}
