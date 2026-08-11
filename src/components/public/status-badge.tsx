import { cn } from "@/lib/utils";
import {
  executionStatusLabels,
  type ExecutionStatus,
} from "@/schemas/posts";

const styles: Record<ExecutionStatus, string> = {
  ONGOING: "bg-brand-green/12 text-brand-green ring-brand-green/20",
  COMPLETED: "bg-brand-black/8 text-brand-black ring-brand-black/15",
  PLANNED: "bg-brand-orange/12 text-brand-orange ring-brand-orange/25",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ExecutionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {executionStatusLabels[status]}
    </span>
  );
}
