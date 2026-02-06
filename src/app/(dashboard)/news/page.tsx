import {
  getNewsArticles,
  getRelatedTickersBatch,
} from "@/lib/db/queries/news";
import { NewsFeed } from "@/components/news/news-feed";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper } from "lucide-react";
import Link from "next/link";

interface NewsPageProps {
  searchParams: Promise<{
    etf?: string;
    sentiment?: string;
    source?: string;
    page?: string;
  }>;
}

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "marketaux", label: "Marketaux" },
  { value: "finnhub", label: "Finnhub" },
  { value: "fmp", label: "FMP" },
];

const SENTIMENT_OPTIONS = [
  { value: "", label: "All" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const etfTicker = params.etf;
  const sentiment = params.sentiment;
  const apiSource = params.source;

  let articles: {
    id: number;
    title: string;
    description: string | null;
    source: string | null;
    url: string;
    imageUrl: string | null;
    publishedAt: Date;
    sentimentLabel: string | null;
    apiSource: string | null;
    relatedTickers?: string[];
  }[] = [];

  try {
    const result = await getNewsArticles({
      etfTicker,
      sentiment,
      apiSource,
      page,
      limit: 30,
    });

    // Batch-fetch related tickers
    const articleIds = result.data.map((a) => a.id);
    const tickerMap = await getRelatedTickersBatch(articleIds);

    articles = result.data.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      source: a.source,
      url: a.url,
      imageUrl: "imageUrl" in a ? (a as Record<string, unknown>).imageUrl as string | null : null,
      publishedAt: a.publishedAt,
      sentimentLabel: a.sentimentLabel,
      apiSource: "apiSource" in a ? (a as Record<string, unknown>).apiSource as string | null : null,
      relatedTickers: tickerMap[a.id] || [],
    }));
  } catch {
    // DB not connected
  }

  // Build filter URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      etf: etfTicker,
      sentiment,
      source: apiSource,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    const qs = p.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">News Feed</h1>
        <p className="text-muted-foreground mt-1">
          Latest news relevant to tracked ETFs
          {etfTicker && (
            <>
              {" "}
              — filtered to{" "}
              <span className="font-mono font-bold text-foreground">
                {etfTicker}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Source filter */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Source</p>
          <div className="flex gap-1.5">
            {SOURCE_OPTIONS.map((opt) => (
              <Link key={opt.value} href={filterUrl({ source: opt.value || undefined })}>
                <Badge
                  variant={
                    (apiSource || "") === opt.value ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-accent"
                >
                  {opt.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Sentiment filter */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Sentiment</p>
          <div className="flex gap-1.5">
            {SENTIMENT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={filterUrl({ sentiment: opt.value || undefined })}
              >
                <Badge
                  variant={
                    (sentiment || "") === opt.value ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-accent"
                >
                  {opt.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Clear ETF filter if active */}
        {etfTicker && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">ETF</p>
            <Link href={filterUrl({ etf: undefined })}>
              <Badge variant="secondary" className="cursor-pointer">
                {etfTicker} ✕
              </Badge>
            </Link>
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No News Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              News articles will appear here once data is synced. Trigger a sync
              by visiting{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                /api/cron/sync-news
              </code>{" "}
              with the proper auth header.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <NewsFeed articles={articles} />

          {/* Pagination */}
          <div className="flex justify-center gap-3 pt-4">
            {page > 1 && (
              <Link
                href={filterUrl({ page: String(page - 1) })}
                className="text-sm text-primary hover:underline"
              >
                ← Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page}
            </span>
            {articles.length === 30 && (
              <Link
                href={filterUrl({ page: String(page + 1) })}
                className="text-sm text-primary hover:underline"
              >
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
