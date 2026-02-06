import { db } from "@/lib/db";
import { newsArticles, newsEtfLinks } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function getNewsArticles(options: {
  etfTicker?: string;
  sentiment?: string;
  apiSource?: string;
  page?: number;
  limit?: number;
}) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  if (options.etfTicker) {
    const conditions: ReturnType<typeof eq>[] = [
      eq(newsEtfLinks.etfTicker, options.etfTicker),
    ];

    if (options.sentiment) {
      conditions.push(eq(newsArticles.sentimentLabel, options.sentiment));
    }
    if (options.apiSource) {
      conditions.push(eq(newsArticles.apiSource, options.apiSource));
    }

    const results = await db
      .select({
        id: newsArticles.id,
        externalId: newsArticles.externalId,
        title: newsArticles.title,
        description: newsArticles.description,
        snippet: newsArticles.snippet,
        url: newsArticles.url,
        imageUrl: newsArticles.imageUrl,
        source: newsArticles.source,
        publishedAt: newsArticles.publishedAt,
        sentiment: newsArticles.sentiment,
        sentimentLabel: newsArticles.sentimentLabel,
        relevanceScore: newsArticles.relevanceScore,
        apiSource: newsArticles.apiSource,
      })
      .from(newsArticles)
      .innerJoin(newsEtfLinks, eq(newsArticles.id, newsEtfLinks.articleId))
      .where(and(...conditions))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit)
      .offset(offset);

    return { data: results, page, limit };
  }

  const conditions: ReturnType<typeof eq>[] = [];
  if (options.sentiment) {
    conditions.push(eq(newsArticles.sentimentLabel, options.sentiment));
  }
  if (options.apiSource) {
    conditions.push(eq(newsArticles.apiSource, options.apiSource));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(newsArticles)
    .where(where)
    .orderBy(desc(newsArticles.publishedAt))
    .limit(limit)
    .offset(offset);

  return { data: results, page, limit };
}

export async function getRelatedTickers(articleId: number): Promise<string[]> {
  const links = await db
    .select({ etfTicker: newsEtfLinks.etfTicker })
    .from(newsEtfLinks)
    .where(eq(newsEtfLinks.articleId, articleId));

  return links.map((l) => l.etfTicker);
}

/**
 * Batch-fetch related tickers for multiple articles.
 */
export async function getRelatedTickersBatch(
  articleIds: number[]
): Promise<Record<number, string[]>> {
  if (articleIds.length === 0) return {};

  const links = await db
    .select({
      articleId: newsEtfLinks.articleId,
      etfTicker: newsEtfLinks.etfTicker,
    })
    .from(newsEtfLinks)
    .where(inArray(newsEtfLinks.articleId, articleIds));

  const result: Record<number, string[]> = {};
  for (const link of links) {
    if (!result[link.articleId]) result[link.articleId] = [];
    result[link.articleId].push(link.etfTicker);
  }
  return result;
}
