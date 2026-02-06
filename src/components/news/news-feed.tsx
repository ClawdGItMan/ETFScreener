import { NewsCard } from "./news-card";

interface Article {
  id: number;
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

export function NewsFeed({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No news articles</p>
        <p className="text-sm mt-1">News will appear here once data is synced.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <NewsCard
          key={article.id}
          title={article.title}
          description={article.description}
          source={article.source}
          url={article.url}
          imageUrl={article.imageUrl}
          publishedAt={article.publishedAt}
          sentimentLabel={article.sentimentLabel}
          apiSource={article.apiSource}
          relatedTickers={article.relatedTickers}
        />
      ))}
    </div>
  );
}
