"use client";

import {
  FileTextIcon,
  ImageIcon,
  TextIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Controller,
  useFieldArray,
  type ArrayPath,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { GalleryImagesUpload } from "@/components/admin/gallery-images-upload";
import { PdfFileUpload } from "@/components/admin/pdf-file-upload";
import { QuillEditor } from "@/components/admin/quill-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  emptyContentBlock,
  type ContentBlockFormValues,
} from "@/schemas/content-blocks";

type FormWithBlocks = FieldValues;

type ContentBlocksFieldProps<T extends FormWithBlocks> = {
  control: Control<T>;
  name?: Path<T>;
  disabled?: boolean;
  errorsMessage?: string;
  baseStoragePath?: string;
};

const blockMeta = {
  TEXT: {
    label: "Bloco de texto",
    icon: TextIcon,
  },
  GALLERY: {
    label: "Bloco de galeria",
    icon: ImageIcon,
  },
  FILE: {
    label: "Bloco de arquivo",
    icon: FileTextIcon,
  },
} as const;

export function ContentBlocksField<T extends FormWithBlocks>({
  control,
  name = "blocks" as Path<T>,
  disabled = false,
  errorsMessage,
  baseStoragePath,
}: ContentBlocksFieldProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Blocos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Intercale textos, galerias e arquivos PDF na ordem de exibição
          desejada.
        </p>
      </div>

      {errorsMessage ? (
        <p className="text-sm text-destructive">{errorsMessage}</p>
      ) : null}

      <div className="flex flex-col gap-4">
        {fields.map((item, index) => (
          <Controller
            key={item.id}
            control={control}
            name={`${name}.${index}.type` as Path<T>}
            render={({ field: typeField }) => {
              const blockType = typeField.value as ContentBlockFormValues["type"];
              const meta = blockMeta[blockType];
              const Icon = meta.icon;

              return (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Ordem {index + 1}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Remover bloco"
                      disabled={disabled || fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>

                  {blockType === "TEXT" ? (
                    <Controller
                      control={control}
                      name={`${name}.${index}.content` as Path<T>}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Conteúdo</FieldLabel>
                          <QuillEditor
                            value={(field.value as string) ?? ""}
                            onChange={field.onChange}
                            disabled={disabled}
                            invalid={fieldState.invalid}
                            storagePath={
                              baseStoragePath
                                ? `${baseStoragePath}/editor`
                                : undefined
                            }
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  ) : null}

                  {blockType === "GALLERY" ? (
                    <Controller
                      control={control}
                      name={`${name}.${index}.galleryUrls` as Path<T>}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Imagens da galeria</FieldLabel>
                          <GalleryImagesUpload
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            disabled={disabled}
                            storagePath={
                              baseStoragePath
                                ? `${baseStoragePath}/gallery`
                                : undefined
                            }
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  ) : null}

                  {blockType === "FILE" ? (
                    <div className="flex flex-col gap-4">
                      <Controller
                        control={control}
                        name={`${name}.${index}.fileTitle` as Path<T>}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`block-file-title-${index}`}>
                              Título do arquivo
                            </FieldLabel>
                            <Input
                              id={`block-file-title-${index}`}
                              placeholder="Ex.: Relatório anual 2024"
                              disabled={disabled}
                              value={(field.value as string) ?? ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`${name}.${index}.fileUrl` as Path<T>}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Arquivo PDF</FieldLabel>
                            <PdfFileUpload
                              value={(field.value as string) ?? ""}
                              onChange={field.onChange}
                              disabled={disabled}
                              storagePath={
                                baseStoragePath
                                  ? `${baseStoragePath}/files`
                                  : undefined
                              }
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  ) : null}
                </div>
              );
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => append(emptyContentBlock("TEXT") as never)}
        >
          <TextIcon className="size-4" />
          Adicionar Texto
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => append(emptyContentBlock("GALLERY") as never)}
        >
          <ImageIcon className="size-4" />
          Adicionar Galeria
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => append(emptyContentBlock("FILE") as never)}
        >
          <FileTextIcon className="size-4" />
          Adicionar Arquivo
        </Button>
      </div>
    </div>
  );
}
