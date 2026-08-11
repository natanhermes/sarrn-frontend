"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { setAuthTokens, setAuthUser } from "@/lib/auth-cookies";
import {
  loginResponseSchema,
  loginSchema,
  type LoginFormValues,
} from "@/schemas/auth";
import { useAuth } from "@/store/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const { data } = await api.post("/admin/auth/login", values);
      const parsed = loginResponseSchema.parse(data);

      setAuthTokens(parsed.accessToken, parsed.refreshToken);
      setAuthUser(parsed.user);
      login(parsed.user);

      toast.success("Login realizado com sucesso");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível autenticar. Verifique suas credenciais.",
        ),
      );
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Acesso ao Painel</CardTitle>
          <CardDescription>
            Entre com seu e-mail e senha para gerenciar o portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu.email@instituicao.org"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
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
                    <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
