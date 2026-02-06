import { cn } from "@/lib/utils";

export function PriceChange({
  value,
  className,
}: {
  value: number | null | undefined;
  className?: string;
}) {
  if (value == null) return <span className={cn("text-muted-foreground", className)}>--</span>;

  const isPositive = value >= 0;
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
        className
      )}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function LargeNumber({
  value,
  className,
}: {
  value: number | null | undefined;
  className?: string;
}) {
  if (value == null) return <span className={cn("text-muted-foreground", className)}>N/A</span>;

  let formatted: string;
  if (value >= 1e12) formatted = `$${(value / 1e12).toFixed(2)}T`;
  else if (value >= 1e9) formatted = `$${(value / 1e9).toFixed(2)}B`;
  else if (value >= 1e6) formatted = `$${(value / 1e6).toFixed(1)}M`;
  else if (value >= 1e3) formatted = `$${(value / 1e3).toFixed(1)}K`;
  else formatted = `$${value.toFixed(2)}`;

  return <span className={cn("tabular-nums", className)}>{formatted}</span>;
}
