import { z } from "zod";

const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() ?? "");

export const statisticSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    value: z.string(),
    description: optionalTextSchema.optional(),
    isActive: z.boolean().nullish(),
    is_active: z.boolean().nullish(),
    displayOrder: z.coerce.number().nullish(),
    display_order: z.coerce.number().nullish(),
  })
  .passthrough()
  .transform((statistic) => ({
    id: statistic.id,
    title: statistic.title,
    value: statistic.value,
    description: statistic.description || "",
    isActive: statistic.isActive ?? statistic.is_active ?? true,
    displayOrder: statistic.displayOrder ?? statistic.display_order ?? 0,
  }));

export const statisticFormSchema = z.object({
  title: z
    .string()
    .min(1, "Informe o título")
    .max(120, "O título deve ter no máximo 120 caracteres"),
  value: z
    .string()
    .min(1, "Informe o valor")
    .max(60, "O valor deve ter no máximo 60 caracteres"),
  description: z
    .string()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres")
    .optional(),
  isActive: z.boolean(),
  displayOrder: z
    .number({ error: "Informe a ordem de exibição" })
    .int("A ordem deve ser um número inteiro"),
});

export type Statistic = z.infer<typeof statisticSchema>;
export type StatisticFormValues = z.infer<typeof statisticFormSchema>;

export function parseStatistic(payload: unknown): Statistic {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data
  ) {
    return statisticSchema.parse((payload as { data: unknown }).data);
  }

  return statisticSchema.parse(payload);
}

function parseStatisticsArray(items: unknown[]): Statistic[] {
  return items.flatMap((item) => {
    const parsed = statisticSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseStatisticsList(payload: unknown): Statistic[] {
  if (Array.isArray(payload)) {
    return parseStatisticsArray(payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return parseStatisticsArray((payload as { data: unknown[] }).data);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "content" in payload &&
    Array.isArray((payload as { content: unknown }).content)
  ) {
    return parseStatisticsArray((payload as { content: unknown[] }).content);
  }

  return [];
}

function optionalOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toStatisticSubmitPayload(values: StatisticFormValues) {
  return {
    title: values.title.trim(),
    value: values.value.trim(),
    description: optionalOrNull(values.description),
    isActive: values.isActive,
    displayOrder: Number(values.displayOrder),
  };
}

export type StatisticSubmitPayload = ReturnType<
  typeof toStatisticSubmitPayload
>;
