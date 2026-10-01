"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { setAuthUser } from "@/lib/auth-cookies";
import {
  adminUserSchema,
  roleSelectItems,
  toUpdateUserPayload,
  updateUserSchema,
  type AdminUser,
  type UpdateUserFormValues,
} from "@/schemas/users";
import { useAuth } from "@/store/useAuth";

export interface UserFormProps {
  user: AdminUser;
  onSuccess?: (updatedUser: AdminUser) => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: async (values: UpdateUserFormValues) => {
      const payload = toUpdateUserPayload(values);
      const { data } = await api.put(`/admin/users/${user.id}`, payload);
      return adminUserSchema.parse(data);
    },
    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      // Synchronize current session if the edited user is the logged-in user
      const currentUser = useAuth.getState().user;
      if (currentUser && currentUser.id === updatedUser.id) {
        const syncedUser = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        };
        setAuthUser(syncedUser);
        useAuth.getState().setUser(syncedUser);
      }

      toast.success("Usuário atualizado com sucesso!");
      onSuccess?.(updatedUser);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível atualizar o usuário."),
      );
    },
  });

  return (
    <form
      id={`edit-user-form-${user.id}`}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="space-y-4"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`edit-user-name-${user.id}`}>Nome</FieldLabel>
              <Input
                {...field}
                id={`edit-user-name-${user.id}`}
                placeholder="Nome completo"
                maxLength={150}
                aria-invalid={fieldState.invalid}
                disabled={mutation.isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`edit-user-email-${user.id}`}>E-mail</FieldLabel>
              <Input
                {...field}
                id={`edit-user-email-${user.id}`}
                type="email"
                autoComplete="off"
                placeholder="email@instituicao.org"
                aria-invalid={fieldState.invalid}
                disabled={mutation.isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`edit-user-role-${user.id}`}>
                Nível de acesso (Função)
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
                  id={`edit-user-role-${user.id}`}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={`edit-user-password-${user.id}`}>
                  Nova Senha
                </FieldLabel>
                <span className="text-xs text-muted-foreground">Opcional</span>
              </div>
              <Input
                {...field}
                id={`edit-user-password-${user.id}`}
                type="password"
                autoComplete="new-password"
                placeholder="Deixe em branco para manter a atual"
                aria-invalid={fieldState.invalid}
                disabled={mutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Preencha apenas se desejar redefinir a senha do usuário (mín. 8 caracteres, com maiúscula, número e símbolo).
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
