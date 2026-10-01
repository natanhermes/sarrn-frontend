import { z } from "zod";

import { userRoleSchema, type UserRole } from "@/schemas/auth";

export { userRoleSchema, type UserRole } from "@/schemas/auth";

export interface UserUpdateRequest {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const adminUserSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
});

export const userResponseSchema = adminUserSchema;

export const authorSummarySchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string().optional(),
    nome: z.string().optional(),
  })
  .transform((author) => ({
    id: author.id,
    name: author.name ?? author.nome ?? "",
  }));

export const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(150, "Máximo de 150 caracteres"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número")
    .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial"),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(150, "Máximo de 150 caracteres"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  role: userRoleSchema,
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim().length === 0) return true;
        return (
          val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[^A-Za-z0-9]/.test(val)
        );
      },
      {
        message:
          "A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial",
      },
    ),
});

export const usersListResponseSchema = z.union([
  z.array(adminUserSchema),
  z.object({ content: z.array(adminUserSchema) }),
  z.object({ data: z.array(adminUserSchema) }),
  z.object({ users: z.array(adminUserSchema) }),
]);

export const authorsListResponseSchema = z.union([
  z.array(authorSummarySchema),
  z.object({ content: z.array(authorSummarySchema) }),
  z.object({ data: z.array(authorSummarySchema) }),
  z.object({ authors: z.array(authorSummarySchema) }),
  z.object({ users: z.array(authorSummarySchema) }),
]);

export type AdminUser = z.infer<typeof adminUserSchema>;
export type AuthorSummary = z.infer<typeof authorSummarySchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export function toUpdateUserPayload(
  values: UpdateUserFormValues,
): UserUpdateRequest {
  const payload: UserUpdateRequest = {
    name: values.name.trim(),
    email: values.email.trim(),
    role: values.role,
  };

  if (values.password && values.password.trim().length > 0) {
    payload.password = values.password;
  }

  return payload;
}

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número")
      .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial"),
    confirmNewPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function toChangePasswordSubmitPayload(
  values: ChangePasswordFormValues,
) {
  return {
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  };
}

export function parseUsersList(payload: unknown): AdminUser[] {
  const parsed = usersListResponseSchema.parse(payload);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if ("content" in parsed) {
    return parsed.content;
  }

  if ("data" in parsed) {
    return parsed.data;
  }

  return parsed.users;
}

export function parseAuthorsList(payload: unknown): AuthorSummary[] {
  const parsed = authorsListResponseSchema.parse(payload);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if ("content" in parsed) {
    return parsed.content;
  }

  if ("data" in parsed) {
    return parsed.data;
  }

  if ("authors" in parsed) {
    return parsed.authors;
  }

  return parsed.users;
}

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  CONTRIBUTOR: "Colaborador",
};

export const roleSelectItems: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: roleLabels.ADMIN },
  { value: "EDITOR", label: roleLabels.EDITOR },
  { value: "CONTRIBUTOR", label: roleLabels.CONTRIBUTOR },
];

export const roleBadgeConfig: Record<
  UserRole,
  { label: string; className: string }
> = {
  ADMIN: {
    label: roleLabels.ADMIN,
    className:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  EDITOR: {
    label: roleLabels.EDITOR,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  CONTRIBUTOR: {
    label: roleLabels.CONTRIBUTOR,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

