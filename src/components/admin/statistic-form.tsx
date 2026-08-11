"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

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
  statisticFormSchema,
  toStatisticSubmitPayload,
  type StatisticFormValues,
  type StatisticSubmitPayload,
} from "@/schemas/statistics";

type StatisticFormProps = {
  defaultValues?: Partial<StatisticFormValues>;
  submitLabel: string;
  onSubmit: (values: StatisticSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function StatisticForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: StatisticFormProps) {
  const router = useRouter();

  const form = useForm<StatisticFormValues>({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      value: defaultValues?.value ?? "",
      description: defaultValues?.description ?? "",
      isActive: defaultValues?.isActive ?? true,
      displayOrder: defaultValues?.displayOrder ?? 0,
    },
  });

  async function handleSubmit(values: StatisticFormValues) {
    await onSubmit(toStatisticSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="value"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="statistic-value">Valor</FieldLabel>
              <Input
                id="statistic-value"
                placeholder="Ex.: 320+"
                disabled={isSubmitting}
                {...field}
              />
              <FieldDescription>
                Número ou texto curto exibido em destaque na Home.
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
              <FieldLabel htmlFor="statistic-title">Título</FieldLabel>
              <Input
                id="statistic-title"
                placeholder="Ex.: Famílias atendidas"
                disabled={isSubmitting}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="statistic-description">
                Descrição (opcional)
              </FieldLabel>
              <Textarea
                id="statistic-description"
                placeholder="Texto complementar sobre o indicador"
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
            name="displayOrder"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="statistic-order">Ordem</FieldLabel>
                <Input
                  id="statistic-order"
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
                <FieldLabel htmlFor="statistic-active">Status</FieldLabel>
                <label
                  htmlFor="statistic-active"
                  className="flex h-9 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 text-sm"
                >
                  <input
                    id="statistic-active"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={isSubmitting}
                  />
                  Estatística ativa na Home
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
          onClick={() => router.push("/dashboard/statistics")}
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
