"use client";

import { PasswordChangeForm } from "@/components/admin/password-change-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PasswordChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PasswordChangeDialog({
  open,
  onOpenChange,
}: PasswordChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>
            Informe a sua senha atual e escolha uma nova senha forte.
          </DialogDescription>
        </DialogHeader>
        <PasswordChangeForm
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
