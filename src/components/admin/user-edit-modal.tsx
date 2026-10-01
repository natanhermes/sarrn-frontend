"use client";

import { UserForm } from "@/components/admin/user-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUser } from "@/schemas/users";

export type UserEditModalProps = {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserEditModal({
  user,
  open,
  onOpenChange,
}: UserEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados cadastrais, nível de acesso ou redefina a senha do usuário.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <UserForm
            user={user}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export const EditUserDialog = UserEditModal;
export { UserForm };
