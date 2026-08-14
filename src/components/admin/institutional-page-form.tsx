"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { ContentBlocksField } from "@/components/admin/content-blocks-field";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  emptyInstitutionalPageFormValues,
  institutionalPageFormSchema,
  MENU_GROUP_LABELS,
  toInstitutionalPageSubmitPayload,
  type InstitutionalPageFormValues,
  type InstitutionalPageSubmitPayload,
  type MenuGroup,
} from "@/schemas/institutional-pages";

type InstitutionalPageFormProps = {
  defaultValues?: Partial<InstitutionalPageFormValues>;
  submitLabel: string;
  onSubmit: (values: InstitutionalPageSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

const menuGroupItems: { value: MenuGroup; label: string }[] = [
  { value: "SAR", label: MENU_GROUP_LABELS.SAR },
  { value: "TRANSPARENCIA", label: MENU_GROUP_LABELS.TRANSPARENCIA },
];

export function InstitutionalPageForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: InstitutionalPageFormProps) {
  const router = useRouter();
  const fallback = emptyInstitutionalPageFormValues();

  const initialStorageId = useMemo(
    () => defaultValues?.storageId || crypto.randomUUID(),
    [defaultValues?.storageId],
  );

  const form = useForm<InstitutionalPageFormValues>({
    resolver: zodResolver(institutionalPageFormSchema),
    defaultValues: {
      storageId: initialStorageId,
      title: defaultValues?.title ?? fallback.title,
      slug: defaultValues?.slug ?? fallback.slug,
      menuGroup: defaultValues?.menuGroup ?? fallback.menuGroup,
      blocks: defaultValues?.blocks?.length
        ? defaultValues.blocks
        : fallback.blocks,
    },
  });

  const watchStorageId = useWatch({
    control: form.control,
    name: "storageId",
  });
  const currentStorageId = watchStorageId || initialStorageId;

  async function handleSubmit(values: InstitutionalPageFormValues) {
    await onSubmit(toInstitutionalPageSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="page-title">Título</FieldLabel>
              <Input
                id="page-title"
                placeholder="Ex.: Estatuto Social"
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
              <FieldLabel htmlFor="page-slug">Slug (opcional)</FieldLabel>
              <Input
                id="page-slug"
                placeholder="estatuto-social"
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
          name="menuGroup"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Grupo do menu</FieldLabel>
              <Select
                items={menuGroupItems}
                value={field.value}
                onValueChange={(value) => {
                  if (value != null) {
                    field.onChange(value);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {menuGroupItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Define em qual dropdown do header a página aparece.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <ContentBlocksField
        control={form.control}
        disabled={isSubmitting}
        baseStoragePath={`paginas/${currentStorageId}/blocks`}
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
          onClick={() => router.push("/dashboard/pages")}
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
