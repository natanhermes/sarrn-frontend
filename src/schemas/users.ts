import { z } from "zod";

import { userRoleSchema } from "@/schemas/auth";

export const adminUserSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número")
    .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial"),
  role: userRoleSchema,
});

export const usersListResponseSchema = z.union([
  z.array(adminUserSchema),
  z.object({ content: z.array(adminUserSchema) }),
  z.object({ data: z.array(adminUserSchema) }),
  z.object({ users: z.array(adminUserSchema) }),
]);

export type AdminUser = z.infer<typeof adminUserSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

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

export const roleLabels: Record<z.infer<typeof userRoleSchema>, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  CONTRIBUTOR: "Contribuidor",
};

export const roleSelectItems = [
  { value: "ADMIN" as const, label: roleLabels.ADMIN },
  { value: "EDITOR" as const, label: roleLabels.EDITOR },
  { value: "CONTRIBUTOR" as const, label: roleLabels.CONTRIBUTOR },
];
