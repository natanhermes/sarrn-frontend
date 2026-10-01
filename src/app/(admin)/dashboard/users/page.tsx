"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  parseUsersList,
  roleBadgeConfig,
  roleLabels,
  type AdminUser,
} from "@/schemas/users";
import { useAuth } from "@/store/useAuth";

export default function UsersPage() {
  const { shouldRender } = useRequireAdmin();
  const queryClient = useQueryClient();
  const currentUser = useAuth((state) => state.user);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return parseUsersList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário excluído com sucesso!");
      setDeleteUser(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir o usuário."),
      );
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usersQuery.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                usersQuery.data?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {currentUser?.id === item.id && (
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            você
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={roleBadgeConfig[item.role]?.className}
                      >
                        {roleBadgeConfig[item.role]?.label ?? roleLabels[item.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Editar usuário ${item.name}`}
                          onClick={() => setEditUser(item)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Excluir usuário ${item.name}`}
                          onClick={() => setDeleteUser(item)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <UserEditModal
        user={editUser}
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) {
            setEditUser(null);
          }
        }}
      />

      <AlertDialog
        open={Boolean(deleteUser)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário
              {deleteUser?.name ? ` “${deleteUser.name}”` : ""} perderá o acesso
              ao painel administrativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleteUser) {
                  deleteMutation.mutate(deleteUser.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

