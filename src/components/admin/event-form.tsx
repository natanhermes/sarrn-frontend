"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

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
import {
  emptyEventFormValues,
  eventFormSchema,
  toEventSubmitPayload,
  type EventFormValues,
  type EventSubmitPayload,
} from "@/schemas/events";

type EventFormProps = {
  defaultValues?: Partial<EventFormValues>;
  submitLabel: string;
  onSubmit: (values: EventSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function EventForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: EventFormProps) {
  const router = useRouter();
  const fallback = emptyEventFormValues();

  const initialStorageId = useMemo(
    () => defaultValues?.storageId || crypto.randomUUID(),
    [defaultValues?.storageId],
  );

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      storageId: initialStorageId,
      title: defaultValues?.title ?? fallback.title,
      slug: defaultValues?.slug ?? fallback.slug,
      startDate: defaultValues?.startDate ?? fallback.startDate,
      endDate: defaultValues?.endDate ?? fallback.endDate,
      location: defaultValues?.location ?? fallback.location,
      coverImageUrl: defaultValues?.coverImageUrl ?? fallback.coverImageUrl,
      summary: defaultValues?.summary ?? fallback.summary,
      isPublished: defaultValues?.isPublished ?? fallback.isPublished,
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

  async function handleSubmit(values: EventFormValues) {
    await onSubmit(toEventSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="coverImageUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Imagem de capa (opcional)</FieldLabel>
              <CoverImageUpload
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                storagePath={`agenda/${currentStorageId}/cover`}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-title">Título</FieldLabel>
              <Input
                id="event-title"
                placeholder="Ex.: Feira da Agricultura Familiar"
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
              <FieldLabel htmlFor="event-slug">Slug (opcional)</FieldLabel>
              <Input
                id="event-slug"
                placeholder="feira-agricultura-familiar"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="startDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="event-start">Data de início</FieldLabel>
                <Input
                  id="event-start"
                  type="datetime-local"
                  disabled={isSubmitting}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="endDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="event-end">
                  Data de término (opcional)
                </FieldLabel>
                <Input
                  id="event-end"
                  type="datetime-local"
                  disabled={isSubmitting}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="location"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-location">Local</FieldLabel>
              <Input
                id="event-location"
                placeholder="Ex.: Centro Comunitário de Assú"
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="summary"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-summary">Resumo</FieldLabel>
              <Textarea
                id="event-summary"
                placeholder="Breve descrição do evento para a listagem"
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="isPublished"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-published">Publicação</FieldLabel>
              <label
                htmlFor="event-published"
                className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 py-2 text-sm"
              >
                <input
                  id="event-published"
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
                  {field.value ? "Publicado" : "Rascunho"}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {field.value
                      ? "Visível na agenda pública"
                      : "Não aparece na vitrine"}
                  </span>
                </span>
              </label>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <ContentBlocksField
        control={form.control}
        disabled={isSubmitting}
        baseStoragePath={`agenda/${currentStorageId}/blocks`}
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
          onClick={() => router.push("/dashboard/agenda")}
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
