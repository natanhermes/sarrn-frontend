import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "EDITOR", "CONTRIBUTOR"]);

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
});

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
