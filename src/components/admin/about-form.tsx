"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, type FieldErrors, useFieldArray, useForm } from "react-hook-form";

import { TagIconUpload } from "@/components/admin/about-tag-icon-upload";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  aboutUsFormSchema,
  toAboutUsSubmitPayload,
  type AboutUs,
  type AboutUsFormValues,
  type AboutUsSubmitPayload,
} from "@/schemas/about";
import { toContentBlockFormValues } from "@/schemas/content-blocks";

type AboutFormProps = {
  defaultValues?: Partial<AboutUs>;
  onSubmit: (values: AboutUsSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function AboutForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: AboutFormProps) {
  const [activeTab, setActiveTab] = useState<"home" | "detailed">("home");

  const form = useForm<AboutUsFormValues>({
    resolver: zodResolver(aboutUsFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      summary: defaultValues?.summary ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      foundationYear: defaultValues?.foundationYear ?? new Date().getFullYear(),
      badgeText: defaultValues?.badgeText ?? "",
      tags: defaultValues?.tags?.map((tag) => ({
        id: tag.id,
        title: tag.title,
        iconUrl: tag.iconUrl,
        iconColor: tag.iconColor || "#356e7c",
      })) ?? [],
      detailedBlocks: defaultValues?.detailedBlocks?.length
        ? toContentBlockFormValues(defaultValues.detailedBlocks)
        : [],
    },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const handleValid = (values: AboutUsFormValues) => {
    const payload = toAboutUsSubmitPayload(values);
    return onSubmit(payload);
  };

  const handleInvalid = (errors: FieldErrors<AboutUsFormValues>) => {
    if (errors.detailedBlocks) {
      setActiveTab("detailed");
    } else if (
      errors.title ||
      errors.summary ||
      errors.imageUrl ||
      errors.foundationYear ||
      errors.badgeText ||
      errors.tags
    ) {
      setActiveTab("home");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleValid, handleInvalid)}
      className="space-y-6"
    >
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "home" | "detailed")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="home">Página Inicial (Home)</TabsTrigger>
          <TabsTrigger value="detailed">Página Detalhada</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6 space-y-6">
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="about-title">Título Principal</FieldLabel>
                  <Input
                    {...field}
                    id="about-title"
                    placeholder="Ex: Uma rede que semeia autonomia e renda no Rio Grande do Norte"
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    O título exibido na seção &quot;Quem Somos&quot; da Home.
                  </FieldDescription>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="summary"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="about-summary">Resumo Institucional</FieldLabel>
                  <Textarea
                    {...field}
                    id="about-summary"
                    rows={4}
                    placeholder="Resumo das atividades e propósito da SARRN..."
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Texto de apresentação exibido na Home.
                  </FieldDescription>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Imagem Institucional</FieldLabel>
                  <CoverImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    emptyLabel="Nenhuma imagem selecionada"
                    aspectRatio="4/5"
                    storagePath="institucional/quem-somos/cover"
                  />
                  <FieldDescription>
                    Para um melhor encaixe visual, envie uma imagem vertical (Retrato). Imagens horizontais terão as laterais cortadas automaticamente.
                  </FieldDescription>
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="foundationYear"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="about-foundation-year">Ano de Fundação</FieldLabel>
                    <Input
                      {...field}
                      id="about-foundation-year"
                      type="number"
                      placeholder="Ex: 1950"
                      disabled={isSubmitting}
                      onChange={(e) =>
                        field.onChange(
                          isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                    <FieldDescription>
                      Usado para calcular a idade dinâmica (&quot;+X anos&quot;).
                    </FieldDescription>
                    {fieldState.error ? (
                      <FieldError>{fieldState.error.message}</FieldError>
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="badgeText"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="about-badge-text">Texto da Badge</FieldLabel>
                    <Input
                      {...field}
                      id="about-badge-text"
                      placeholder="Ex: transformando o semiárido"
                      disabled={isSubmitting}
                    />
                    <FieldDescription>
                      Subtítulo exibido abaixo da idade dinâmica.
                    </FieldDescription>
                    {fieldState.error ? (
                      <FieldError>{fieldState.error.message}</FieldError>
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <div className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Gerenciador de Tags (Pilares)</h3>
                  <p className="text-xs text-muted-foreground">
                    Adicione tags com ícone em formato SVG e cor personalizada.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() =>
                    appendTag({
                      title: "",
                      iconUrl: "",
                      iconColor: "#356e7c",
                    })
                  }
                >
                  <PlusIcon className="size-4" />
                  Adicionar Tag
                </Button>
              </div>

              {tagFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2 text-center">
                  Nenhuma tag cadastrada.
                </p>
              ) : null}

              <div className="space-y-3">
                {tagFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-md border border-border bg-muted/30 p-3"
                  >
                    <div className="flex-1 w-full">
                      <Controller
                        control={form.control}
                        name={`tags.${index}.title`}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              placeholder="Título da tag (ex: Agroecologia)"
                              disabled={isSubmitting}
                            />
                            {fieldState.error ? (
                              <FieldError>{fieldState.error.message}</FieldError>
                            ) : null}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name={`tags.${index}.iconUrl`}
                        render={({ field }) => (
                          <TagIconUpload
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                            storagePath="institucional/quem-somos/tags"
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name={`tags.${index}.iconColor`}
                        render={({ field }) => (
                          <div className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1 bg-background">
                            <span className="text-xs text-muted-foreground">Cor:</span>
                            <input
                              type="color"
                              value={field.value || "#356e7c"}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={isSubmitting}
                              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                          </div>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isSubmitting}
                        onClick={() => removeTag(index)}
                        title="Remover Tag"
                      >
                        <Trash2Icon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="detailed" className="mt-6 space-y-6">
          <ContentBlocksField
            control={form.control}
            name="detailedBlocks"
            disabled={isSubmitting}
            baseStoragePath="institucional/quem-somos/blocks"
            errorsMessage={
              form.formState.errors.detailedBlocks?.root?.message ||
              form.formState.errors.detailedBlocks?.message
            }
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : null}
          Salvar Quem Somos
        </Button>
      </div>
    </form>
  );
}
