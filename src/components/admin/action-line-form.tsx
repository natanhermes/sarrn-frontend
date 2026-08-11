"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { ContentBlocksField } from "@/components/admin/content-blocks-field";
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
import { Textarea } from "@/components/ui/textarea";
import { emptyContentBlock } from "@/schemas/content-blocks";
import {
  actionLineFormSchema,
  toActionLineSubmitPayload,
  type ActionLineFormValues,
  type ActionLineSubmitPayload,
} from "@/schemas/action-lines";

type ActionLineFormProps = {
  defaultValues?: Partial<ActionLineFormValues>;
  submitLabel: string;
  onSubmit: (values: ActionLineSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function ActionLineForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: ActionLineFormProps) {
  const router = useRouter();

  const form = useForm<ActionLineFormValues>({
    resolver: zodResolver(actionLineFormSchema),
    defaultValues: {
      iconUrl: defaultValues?.iconUrl ?? "",
      coverImageUrl: defaultValues?.coverImageUrl ?? "",
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      summary: defaultValues?.summary ?? "",
      isActive: defaultValues?.isActive ?? true,
      displayOrder: defaultValues?.displayOrder ?? 0,
      blocks: defaultValues?.blocks?.length
        ? defaultValues.blocks
        : [emptyContentBlock("TEXT")],
    },
  });

  async function handleSubmit(values: ActionLineFormValues) {
    await onSubmit(toActionLineSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="iconUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Ícone</FieldLabel>
              <CoverImageUpload
                value={field.value}
                emptyLabel="Nenhum ícone selecionado"
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Imagem quadrada recomendada (PNG ou SVG). Exibida na Home.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="coverImageUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Imagem de Capa / Wallpaper (Opcional) - Usada no cabeçalho da
                página de detalhes
              </FieldLabel>
              <CoverImageUpload
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Preferencialmente imagem horizontal em alta resolução.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="action-line-title">Título</FieldLabel>
              <Input
                id="action-line-title"
                placeholder="Ex.: Agroecologia"
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="slug"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="action-line-slug">Slug (opcional)</FieldLabel>
              <Input
                id="action-line-slug"
                placeholder="agroecologia"
                disabled={isSubmitting}
                {...field}
              />
              <FieldDescription>
                Se vazio, o backend gera a partir do título.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="summary"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="action-line-summary">Resumo</FieldLabel>
              <Textarea
                id="action-line-summary"
                placeholder="Breve descrição exibida nos cards da Home"
                disabled={isSubmitting}
                {...field}
              />
              <FieldDescription>
                Texto curto (até ~3 linhas) para o card da linha de atuação.
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
                <FieldLabel htmlFor="action-line-order">Ordem</FieldLabel>
                <Input
                  id="action-line-order"
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
                <FieldLabel htmlFor="action-line-active">Status</FieldLabel>
                <label
                  htmlFor="action-line-active"
                  className="flex h-9 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 text-sm"
                >
                  <input
                    id="action-line-active"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={isSubmitting}
                  />
                  Linha ativa na vitrine
                </label>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <ContentBlocksField
        control={form.control}
        disabled={isSubmitting}
        errorsMessage={
          form.formState.errors.blocks?.root?.message ||
          form.formState.errors.blocks?.message
        }
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/dashboard/action-lines")}
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
