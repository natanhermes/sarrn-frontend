"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createUserSchema,
  roleSelectItems,
  type CreateUserFormValues,
} from "@/schemas/users";

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EDITOR",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateUserFormValues) => {
      await api.post("/admin/users", values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário criado com sucesso");
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o usuário."));
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
      });
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Convide um membro da equipe e defina o nível de acesso.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-user-form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-user-name">Nome</FieldLabel>
                  <Input
                    {...field}
                    id="create-user-name"
                    placeholder="Nome completo"
                    aria-invalid={fieldState.invalid}
                    disabled={mutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-user-email">E-mail</FieldLabel>
                  <Input
                    {...field}
                    id="create-user-email"
                    type="email"
                    autoComplete="off"
                    placeholder="email@instituicao.org"
                    aria-invalid={fieldState.invalid}
                    disabled={mutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-user-password">Senha</FieldLabel>
                  <Input
                    {...field}
                    id="create-user-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mín. 8 caracteres"
                    aria-invalid={fieldState.invalid}
                    disabled={mutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-user-role">
                    Nível de acesso
                  </FieldLabel>
                  <Select
                    items={roleSelectItems}
                    value={field.value}
                    onValueChange={(value) => {
                      if (value != null) {
                        field.onChange(value);
                      }
                    }}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger
                      id="create-user-role"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleSelectItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2Icon className="animate-spin" />
                Salvando...
              </>
            ) : (
              "Criar usuário"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
