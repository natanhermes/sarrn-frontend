"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

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
  carouselSlideFormSchema,
  toCarouselSlideSubmitPayload,
  type CarouselSlideFormValues,
  type CarouselSlideSubmitPayload,
} from "@/schemas/carousel";

type CarouselSlideFormProps = {
  defaultValues?: Partial<CarouselSlideFormValues>;
  submitLabel: string;
  onSubmit: (values: CarouselSlideSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function CarouselSlideForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: CarouselSlideFormProps) {
  const router = useRouter();

  const initialStorageId = useMemo(
    () => defaultValues?.storageId || crypto.randomUUID(),
    [defaultValues?.storageId],
  );

  const form = useForm<CarouselSlideFormValues>({
    resolver: zodResolver(carouselSlideFormSchema),
    defaultValues: {
      storageId: initialStorageId,
      imageUrl: defaultValues?.imageUrl ?? "",
      badgeText: defaultValues?.badgeText ?? "",
      title: defaultValues?.title ?? "",
      subtitle: defaultValues?.subtitle ?? "",
      primaryButtonText: defaultValues?.primaryButtonText ?? "",
      primaryButtonUrl: defaultValues?.primaryButtonUrl ?? "",
      secondaryButtonText: defaultValues?.secondaryButtonText ?? "",
      secondaryButtonUrl: defaultValues?.secondaryButtonUrl ?? "",
      isActive: defaultValues?.isActive ?? true,
      displayOrder: defaultValues?.displayOrder ?? 0,
    },
  });

  const watchStorageId = useWatch({
    control: form.control,
    name: "storageId",
  });
  const currentStorageId = watchStorageId || initialStorageId;

  async function handleSubmit(values: CarouselSlideFormValues) {
    await onSubmit(toCarouselSlideSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="imageUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Imagem do slide</FieldLabel>
              <CoverImageUpload
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                storagePath={`carrossel/${currentStorageId}/cover`}
              />
              <FieldDescription>
                Imagem de fundo do banner (recomendado paisagem em alta
                resolução).
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="badgeText"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="carousel-badge">Badge</FieldLabel>
              <Input
                id="carousel-badge"
                placeholder="Ex: Agricultura Sustentável"
                disabled={isSubmitting}
                {...field}
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
              <FieldLabel htmlFor="carousel-title">Título</FieldLabel>
              <Input
                id="carousel-title"
                placeholder="Título principal do slide"
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="subtitle"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="carousel-subtitle">Subtítulo</FieldLabel>
              <Textarea
                id="carousel-subtitle"
                placeholder="Texto de apoio do slide"
                rows={3}
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="primaryButtonText"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="carousel-primary-text">
                  Botão primário — texto
                </FieldLabel>
                <Input
                  id="carousel-primary-text"
                  placeholder="Ex: Conheça nossos projetos"
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
            name="primaryButtonUrl"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="carousel-primary-url">
                  Botão primário — link
                </FieldLabel>
                <Input
                  id="carousel-primary-url"
                  placeholder="#projetos ou https://..."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="secondaryButtonText"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="carousel-secondary-text">
                  Botão secundário — texto
                </FieldLabel>
                <Input
                  id="carousel-secondary-text"
                  placeholder="Ex: Sobre a instituição"
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
            name="secondaryButtonUrl"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="carousel-secondary-url">
                  Botão secundário — link
                </FieldLabel>
                <Input
                  id="carousel-secondary-url"
                  placeholder="#instituicao ou https://..."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="displayOrder"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="carousel-order">Ordem</FieldLabel>
                <Input
                  id="carousel-order"
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
                  Menor número aparece primeiro no carrossel.
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
                <FieldLabel htmlFor="carousel-active">Status</FieldLabel>
                <label
                  htmlFor="carousel-active"
                  className="flex h-9 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 text-sm"
                >
                  <input
                    id="carousel-active"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={isSubmitting}
                  />
                  Slide ativo na Home
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
          onClick={() => router.push("/dashboard/carousel")}
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
