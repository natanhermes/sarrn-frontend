"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import { CoAuthorsSelect } from "@/components/admin/co-authors-select";
import { ContentBlocksField } from "@/components/admin/content-blocks-field";
import { CoverImageUpload } from "@/components/admin/cover-image-upload";
import { FundersSelect } from "@/components/admin/funders-select";
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
import { Textarea } from "@/components/ui/textarea";
import { getAuthUser } from "@/lib/auth-cookies";
import { toDateInputValue, toDateTimeLocalValue } from "@/lib/format";
import {
  canSetPostStatus,
  resolvePostStatusForSubmit,
} from "@/lib/post-permissions";
import {
  executionStatusSelectItems,
  postFormSchema,
  postStatusSelectItems,
  postTypeLabels,
  postTypeSelectItems,
  toPostSubmitPayload,
  type PostFormValues,
  type PostSubmitPayload,
  type PostType,
} from "@/schemas/posts";
import { useAuth } from "@/store/useAuth";

type PostFormProps = {
  defaultValues?: Partial<PostFormValues>;
  defaultType?: PostType;
  submitLabel: string;
  onSubmit: (values: PostSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
  isEditing?: boolean;
};

export function PostForm({
  defaultValues,
  defaultType = "NEWS",
  submitLabel,
  onSubmit,
  isSubmitting = false,
  isEditing = false,
}: PostFormProps) {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const sessionUser = user ?? getAuthUser();
  const statusLocked = !canSetPostStatus(sessionUser);

  const initialPublishedAt = toDateTimeLocalValue(defaultValues?.publishedAt);
  const initialStatus = statusLocked
    ? "DRAFT"
    : (defaultValues?.status ?? "DRAFT");
  const initialType = defaultValues?.type ?? defaultType;

  const initialStorageId = useMemo(
    () => defaultValues?.storageId || crypto.randomUUID(),
    [defaultValues?.storageId],
  );

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      storageId: initialStorageId,
      type: initialType,
      title: defaultValues?.title ?? "",
      summary: defaultValues?.summary ?? "",
      coverImageUrl: defaultValues?.coverImageUrl ?? "",
      blocks: defaultValues?.blocks ?? [],
      status: initialStatus,
      manualPublishedAt:
        initialType !== "PROJECT" &&
        (initialStatus === "SCHEDULED" || Boolean(initialPublishedAt)),
      publishedAt: initialPublishedAt,
      coAuthorIds: defaultValues?.coAuthorIds ?? [],
      funderIds: defaultValues?.funderIds ?? [],
      projectDetails: {
        generalObjective:
          defaultValues?.projectDetails?.generalObjective ?? "",
        startDate: toDateInputValue(defaultValues?.projectDetails?.startDate),
        endDate: toDateInputValue(defaultValues?.projectDetails?.endDate),
        budgetValue: defaultValues?.projectDetails?.budgetValue ?? undefined,
        executionStatus:
          defaultValues?.projectDetails?.executionStatus ?? "ONGOING",
      },
    },
  });

  const [selectedType, publicationStatus, manualPublishedAt, watchStorageId] =
    useWatch({
      control: form.control,
      name: ["type", "status", "manualPublishedAt", "storageId"],
    });

  const currentStorageId = watchStorageId || initialStorageId;
  const postTypeFolder = (selectedType || initialType).toLowerCase();
  const showProjectDetails = selectedType === "PROJECT";
  const showPublishedAtControls = selectedType !== "PROJECT";
  const isScheduled = publicationStatus === "SCHEDULED";
  const isManualPublishedAtEnabled = isScheduled || Boolean(manualPublishedAt);
  const executionStatusLocked = isScheduled;

  useEffect(() => {
    if (!showProjectDetails || !executionStatusLocked) {
      return;
    }

    form.setValue("projectDetails.executionStatus", "PLANNED", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [showProjectDetails, executionStatusLocked, form]);

  useEffect(() => {
    if (!showPublishedAtControls || !isScheduled) {
      return;
    }

    form.setValue("manualPublishedAt", true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [showPublishedAtControls, isScheduled, form]);

  useEffect(() => {
    if (!showPublishedAtControls || isManualPublishedAtEnabled) {
      return;
    }

    if (form.getValues("publishedAt")) {
      form.setValue("publishedAt", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [showPublishedAtControls, isManualPublishedAtEnabled, form]);

  async function handleSubmit(values: PostFormValues) {
    const currentUser = useAuth.getState().user ?? getAuthUser();
    const sanitized: PostFormValues = {
      ...values,
      status: resolvePostStatusForSubmit(currentUser, values.status),
      coAuthorIds: (values.coAuthorIds ?? []).filter(
        (id) => id !== currentUser?.id,
      ),
    };

    await onSubmit(toPostSubmitPayload(sanitized));
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <FieldGroup>
        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => {
              const activeItems = postTypeSelectItems.some(
                (item) => item.value === field.value,
              )
                ? postTypeSelectItems
                : field.value && field.value in postTypeLabels
                  ? [
                      ...postTypeSelectItems,
                      {
                        value: field.value as PostType,
                        label: postTypeLabels[field.value as PostType],
                      },
                    ]
                  : postTypeSelectItems;

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tipo</FieldLabel>
                  <Select
                    items={activeItems}
                    value={field.value}
                    onValueChange={(value) => {
                      if (value != null) {
                        field.onChange(value);
                      }
                    }}
                    disabled={isSubmitting || isEditing}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing ? (
                    <FieldDescription>
                      O tipo não pode ser alterado após a criação.
                    </FieldDescription>
                  ) : null}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Status</FieldLabel>
                <Select
                  items={postStatusSelectItems}
                  value={statusLocked ? "DRAFT" : field.value}
                  onValueChange={(value) => {
                    if (!statusLocked && value != null) {
                      field.onChange(value);
                    }
                  }}
                  disabled={isSubmitting || statusLocked}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {postStatusSelectItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusLocked ? (
                  <FieldDescription>
                    Contribuidor só pode salvar publicações como rascunho.
                  </FieldDescription>
                ) : null}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {showPublishedAtControls ? (
          <div className="space-y-3">
            <Controller
              name="manualPublishedAt"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <input
                    id="post-manual-published-at"
                    type="checkbox"
                    role="checkbox"
                    checked={isScheduled ? true : field.value}
                    disabled={isSubmitting || isScheduled}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      field.onChange(checked);
                      if (!checked) {
                        form.setValue("publishedAt", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    className="size-4 shrink-0 rounded border border-input accent-primary"
                  />
                  <FieldLabel htmlFor="post-manual-published-at">
                    Informar data de publicação manualmente
                  </FieldLabel>
                </Field>
              )}
            />

            {isScheduled ? (
              <FieldDescription>
                Publicações agendadas exigem uma data de publicação.
              </FieldDescription>
            ) : null}

            <Controller
              name="publishedAt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="post-published-at">
                    Data de publicação
                  </FieldLabel>
                  <Input
                    {...field}
                    id="post-published-at"
                    type="datetime-local"
                    value={isManualPublishedAtEnabled ? (field.value ?? "") : ""}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting || !isManualPublishedAtEnabled}
                    required={isScheduled}
                  />
                  <FieldDescription>
                    {isManualPublishedAtEnabled
                      ? "Horário no fuso local do dispositivo (ex.: Brasília)."
                      : "Campo desativado: nenhuma data customizada será enviada."}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        ) : null}

        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="post-title">Título</FieldLabel>
              <Input
                {...field}
                id="post-title"
                placeholder="Título da publicação"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {showProjectDetails ? (
          <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4">
            <div>
              <h2 className="text-sm font-semibold">Detalhes do projeto</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A duração será calculada automaticamente pelo backend.
              </p>
            </div>

            <Controller
              name="funderIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Financiadores</FieldLabel>
                  <FieldDescription>
                    Opcional. Selecione um ou mais apoiadores/financiadores do projeto.
                  </FieldDescription>
                  <FundersSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="projectDetails.generalObjective"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-objective">
                    Objetivo geral
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="project-objective"
                    rows={3}
                    placeholder="Descreva o objetivo geral do projeto"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Controller
                name="projectDetails.startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="project-start">
                      Data de início
                    </FieldLabel>
                    <Input
                      {...field}
                      id="project-start"
                      type="date"
                      value={field.value ?? ""}
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
                name="projectDetails.endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="project-end">Data de fim</FieldLabel>
                    <Input
                      {...field}
                      id="project-end"
                      type="date"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Controller
                name="projectDetails.budgetValue"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="project-budget">Orçamento</FieldLabel>
                    <NumericFormat
                      id="project-budget"
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue,
                        );
                      }}
                      onBlur={field.onBlur}
                      getInputRef={field.ref}
                      placeholder="R$ 0,00"
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
                name="projectDetails.executionStatus"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status de execução</FieldLabel>
                    <Select
                      items={executionStatusSelectItems}
                      value={
                        executionStatusLocked ? "PLANNED" : field.value
                      }
                      onValueChange={(value) => {
                        if (!executionStatusLocked && value != null) {
                          field.onChange(value);
                        }
                      }}
                      disabled={isSubmitting || executionStatusLocked}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {executionStatusSelectItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {executionStatusLocked ? (
                      <FieldDescription>
                        Publicações agendadas ficam com execução Planejado.
                      </FieldDescription>
                    ) : null}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        ) : null}

        <Controller
          name="summary"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="post-summary">Resumo</FieldLabel>
              <Textarea
                {...field}
                id="post-summary"
                placeholder="Resumo opcional para listagens e SEO"
                rows={3}
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="coAuthorIds"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Co-autores</FieldLabel>
              <FieldDescription>
                Opcional. O usuário logado permanece como autor principal.
              </FieldDescription>
              <CoAuthorsSelect
                value={field.value}
                onChange={field.onChange}
                excludeUserId={sessionUser?.id}
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="coverImageUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Imagem de capa</FieldLabel>
              <CoverImageUpload
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                storagePath={`posts/${postTypeFolder}/${currentStorageId}/cover`}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <ContentBlocksField
          control={form.control}
          name="blocks"
          disabled={isSubmitting}
          baseStoragePath={`posts/${postTypeFolder}/${currentStorageId}/blocks`}
          errorsMessage={
            form.formState.errors.blocks?.root?.message ||
            form.formState.errors.blocks?.message
          }
        />
      </FieldGroup>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/dashboard/posts")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
