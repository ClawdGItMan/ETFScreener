import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils/format";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface NewsCardProps {
  title: string;
  description: string | null;
  source: string | null;
  url: string;
  imageUrl?: string | null;
  publishedAt: Date | string;
  sentimentLabel: string | null;
  apiSource?: string | null;
  relatedTickers?: string[];
}

const API_SOURCE_COLORS: Record<string, string> = {
  marketaux: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  finnhub: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  fmp: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function NewsCard({
  title,
  description,
  source,
  url,
  imageUrl,
  publishedAt,
  sentimentLabel,
  apiSource,
  relatedTickers,
}: NewsCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {imageUrl && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block shrink-0"
            >
              <img
                src={imageUrl}
                alt=""
                className="w-20 h-14 object-cover rounded-md bg-muted"
                loading="lazy"
              />
            </a>
          )}

          <div className="flex-1 min-w-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
            >
              {title}
              <ExternalLink className="inline-block h-3 w-3 ml-1 opacity-50" />
            </a>

            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {source && (
                <span className="text-xs text-muted-foreground">{source}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(publishedAt)}
              </span>

              {sentimentLabel && (
                <SentimentBadge sentiment={sentimentLabel} />
              )}

              {apiSource && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${API_SOURCE_COLORS[apiSource] || "bg-muted text-muted-foreground"}`}
                >
                  {apiSource}
                </span>
              )}

              {relatedTickers?.map((t) => (
                <Link key={t} href={`/etf/${t}`}>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 cursor-pointer hover:bg-accent"
                  >
                    {t}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const variant =
    sentiment === "positive"
      ? "default"
      : sentiment === "negative"
        ? "destructive"
        : "secondary";

  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0">
      {sentiment}
    </Badge>
  );
}
