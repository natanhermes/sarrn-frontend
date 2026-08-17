"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LockIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  changePasswordSchema,
  toChangePasswordSubmitPayload,
  type ChangePasswordFormValues,
} from "@/schemas/users";

type PasswordChangeFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function PasswordChangeForm({
  onSuccess,
  onCancel,
}: PasswordChangeFormProps) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: ChangePasswordFormValues) {
    try {
      const payload = toChangePasswordSubmitPayload(values);
      await api.put("/admin/users/me/password", payload);
      toast.success("Senha alterada com sucesso!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível alterar a senha. Verifique sua senha atual.",
        ),
      );
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="current-password">Senha atual</FieldLabel>
              <Input
                {...field}
                id="current-password"
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
              <Input
                {...field}
                id="new-password"
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Mínimo de 8 caracteres, com letra maiúscula, número e símbolo.
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmNewPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirm-new-password">
                Confirmar nova senha
              </FieldLabel>
              <Input
                {...field}
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Alterando...
            </>
          ) : (
            <>
              <LockIcon className="size-4" />
              Alterar Senha
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
