"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { CoverImageUpload } from "@/components/admin/cover-image-upload";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  funderFormSchema,
  toFunderSubmitPayload,
  type FunderFormValues,
  type FunderSubmitPayload,
} from "@/schemas/funders";

type FunderFormProps = {
  defaultValues?: Partial<FunderFormValues>;
  submitLabel: string;
  onSubmit: (values: FunderSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function FunderForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: FunderFormProps) {
  const router = useRouter();

  const form = useForm<FunderFormValues>({
    resolver: zodResolver(funderFormSchema),
    defaultValues: {
      logoUrl: defaultValues?.logoUrl ?? "",
      name: defaultValues?.name ?? "",
      siteUrl: defaultValues?.siteUrl ?? "",
      isActive: defaultValues?.isActive ?? true,
      displayOrder: defaultValues?.displayOrder ?? 0,
    },
  });

  async function handleSubmit(values: FunderFormValues) {
    await onSubmit(toFunderSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="logoUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Logo</FieldLabel>
              <CoverImageUpload
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Preferencialmente PNG ou SVG com fundo transparente.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="funder-name">Nome</FieldLabel>
              <Input
                id="funder-name"
                placeholder="Nome do apoiador"
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="siteUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="funder-site">Site (opcional)</FieldLabel>
              <Input
                id="funder-site"
                placeholder="https://exemplo.org"
                disabled={isSubmitting}
                {...field}
              />
              <FieldDescription>
                Se informado, a logo na Home abrirá este link em nova aba.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="displayOrder"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="funder-order">Ordem</FieldLabel>
                <Input
                  id="funder-order"
                  type="number"
                  disabled={isSubmitting}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                <FieldDescription>
                  Menor número aparece primeiro na Home.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="isActive"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="funder-active">Status</FieldLabel>
                <label
                  htmlFor="funder-active"
                  className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 py-2 text-sm"
                >
                  <input
                    id="funder-active"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={isSubmitting}
                  />
                  <span>
                    {field.value ? "Ativo" : "Inativo"}
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {field.value
                        ? "Aparece em Quem Apoia Essa Transformação"
                        : "Aparece na seção Parcerias"}
                    </span>
                  </span>
                </label>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/dashboard/funders")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
