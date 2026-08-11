import { Badge } from "@/components/ui/badge";
import {
  formatCurrencyBRL,
  formatDateBR,
} from "@/lib/format";
import {
  executionStatusLabels,
  type ProjectDetails,
} from "@/schemas/posts";

type ProjectDetailsPanelProps = {
  details: ProjectDetails;
};

export function ProjectDetailsPanel({ details }: ProjectDetailsPanelProps) {
  const funderName =
    details.funder?.name?.trim() || details.funderName?.trim() || "—";

  return (
    <section className="mt-10 rounded-3xl border border-border bg-secondary/40 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-tight">
          Detalhes do projeto
        </h2>
        <Badge variant="secondary">
          {executionStatusLabels[details.executionStatus]}
        </Badge>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Objetivo geral
          </p>
          <p className="mt-2 text-sm leading-relaxed text-pretty">
            {details.generalObjective}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Financiador
          </p>
          <p className="mt-2 text-sm font-medium">{funderName}</p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Orçamento
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatCurrencyBRL(details.budgetValue)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Data de início
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatDateBR(details.startDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Data de fim
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatDateBR(details.endDate)}
          </p>
        </div>
      </div>
    </section>
  );
}
