import { formatTimeAgo } from "@/lib/utils/format";
import { Clock } from "lucide-react";

export function DataFreshness({ lastSyncedAt }: { lastSyncedAt: Date | null }) {
  if (!lastSyncedAt) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>Updated {formatTimeAgo(lastSyncedAt)}</span>
    </div>
  );
}
