import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsArticles, newsEtfLinks, etfs } from "@/lib/db/schema";
import { fetchNews } from "@/lib/api/marketaux";
import { fetchCompanyNews, fetchMarketNews } from "@/lib/api/finnhub";
import { fetchStockNews } from "@/lib/api/fmp";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get top ETF tickers by AUM to search news for
    const topEtfs = await db
      .select({ ticker: etfs.ticker })
      .from(etfs)
      .orderBy(sql`${etfs.aum} DESC NULLS LAST`)
      .limit(20);

    const symbols = topEtfs.map((e) => e.ticker);
    const symbolSet = new Set(symbols);

    let marketauxCount = 0;
    let finnhubCount = 0;
    let fmpCount = 0;

    // ── 1. Marketaux (primary: sentiment + entity tagging) ──
    try {
      const newsResponse = await fetchNews({
        symbols,
        filter_entities: true,
        limit: 50,
      });

      for (const article of newsResponse.data) {
        try {
          // Compute average sentiment across related entities
          const entitySentiments = (article.entities || [])
            .filter((e) => e.type === "equity" && symbolSet.has(e.symbol))
            .map((e) => e.sentiment_score);

          const avgSentiment =
            entitySentiments.length > 0
              ? entitySentiments.reduce((a, b) => a + b, 0) /
                entitySentiments.length
              : null;

          const sentimentLabel = avgSentiment
            ? avgSentiment > 0.15
              ? "positive"
              : avgSentiment < -0.15
                ? "negative"
                : "neutral"
            : null;

          const result = await db
            .insert(newsArticles)
            .values({
              externalId: `marketaux-${article.uuid}`,
              title: article.title,
              description: article.description,
              snippet: article.snippet,
              url: article.url,
              imageUrl: article.image_url,
              source: article.source,
              publishedAt: new Date(article.published_at),
              sentiment: avgSentiment?.toFixed(4) ?? null,
              sentimentLabel,
              relevanceScore: article.relevance_score?.toString() ?? null,
              apiSource: "marketaux",
            })
            .onConflictDoNothing()
            .returning({ id: newsArticles.id });

          if (result.length > 0) {
            const articleId = result[0].id;

            for (const entity of article.entities || []) {
              if (entity.type === "equity" && symbolSet.has(entity.symbol)) {
                await db
                  .insert(newsEtfLinks)
                  .values({
                    articleId,
                    etfTicker: entity.symbol,
                    relevance: entity.sentiment_score?.toString(),
                  })
                  .onConflictDoNothing();
              }
            }
            marketauxCount++;
          }
        } catch {
          continue;
        }
      }
    } catch (err) {
      console.error("Marketaux sync error:", err);
    }

    // ── 2. Finnhub (company news for top tickers) ──
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const toStr = today.toISOString().split("T")[0];
    const fromStr = weekAgo.toISOString().split("T")[0];

    // Fetch news for top 10 tickers (rate limit friendly: 60/min)
    const finnhubTickers = symbols.slice(0, 10);
    for (const ticker of finnhubTickers) {
      try {
        const articles = await fetchCompanyNews(ticker, fromStr, toStr);

        // Take top 5 per ticker to stay reasonable
        for (const article of articles.slice(0, 5)) {
          try {
            const result = await db
              .insert(newsArticles)
              .values({
                externalId: `finnhub-${article.id}`,
                title: article.headline,
                description: article.summary || null,
                snippet: article.summary?.slice(0, 200) || null,
                url: article.url,
                imageUrl: article.image || null,
                source: article.source,
                publishedAt: new Date(article.datetime * 1000),
                apiSource: "finnhub",
              })
              .onConflictDoNothing()
              .returning({ id: newsArticles.id });

            if (result.length > 0) {
              const articleId = result[0].id;

              // Link to the ticker we searched for
              await db
                .insert(newsEtfLinks)
                .values({ articleId, etfTicker: ticker })
                .onConflictDoNothing();

              // Also link any other tracked tickers mentioned in 'related'
              if (article.related) {
                const relatedTickers = article.related
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t !== ticker && symbolSet.has(t));

                for (const rt of relatedTickers) {
                  await db
                    .insert(newsEtfLinks)
                    .values({ articleId, etfTicker: rt })
                    .onConflictDoNothing();
                }
              }
              finnhubCount++;
            }
          } catch {
            continue;
          }
        }

        // Small delay between tickers to be polite
        await new Promise((r) => setTimeout(r, 200));
      } catch {
        continue;
      }
    }

    // Also grab general market news from Finnhub
    try {
      const generalNews = await fetchMarketNews("general");
      for (const article of generalNews.slice(0, 10)) {
        try {
          const result = await db
            .insert(newsArticles)
            .values({
              externalId: `finnhub-general-${article.id}`,
              title: article.headline,
              description: article.summary || null,
              snippet: article.summary?.slice(0, 200) || null,
              url: article.url,
              imageUrl: article.image || null,
              source: article.source,
              publishedAt: new Date(article.datetime * 1000),
              apiSource: "finnhub",
            })
            .onConflictDoNothing()
            .returning({ id: newsArticles.id });

          if (result.length > 0) {
            finnhubCount++;
          }
        } catch {
          continue;
        }
      }
    } catch (err) {
      console.error("Finnhub general news error:", err);
    }

    // ── 3. FMP (stock news for ETF tickers) ──
    try {
      const fmpArticles = await fetchStockNews({
        tickers: symbols.slice(0, 10),
        limit: 30,
      });

      for (const article of fmpArticles) {
        try {
          // Generate a stable external ID from URL
          const extId = `fmp-${Buffer.from(article.link).toString("base64").slice(0, 40)}`;

          const result = await db
            .insert(newsArticles)
            .values({
              externalId: extId,
              title: article.title,
              description: article.content?.slice(0, 500) || null,
              snippet: article.content?.slice(0, 200) || null,
              url: article.link,
              imageUrl: article.image || null,
              source: article.site,
              publishedAt: new Date(article.date),
              apiSource: "fmp",
            })
            .onConflictDoNothing()
            .returning({ id: newsArticles.id });

          if (result.length > 0) {
            const articleId = result[0].id;

            // Link to any tracked tickers mentioned in the article
            if (article.tickers) {
              const tickers = article.tickers
                .split(",")
                .map((t) => t.trim())
                .filter((t) => symbolSet.has(t));

              for (const t of tickers) {
                await db
                  .insert(newsEtfLinks)
                  .values({ articleId, etfTicker: t })
                  .onConflictDoNothing();
              }
            }
            fmpCount++;
          }
        } catch {
          continue;
        }
      }
    } catch (err) {
      console.error("FMP news sync error:", err);
    }

    return NextResponse.json({
      marketaux: marketauxCount,
      finnhub: finnhubCount,
      fmp: fmpCount,
      total: marketauxCount + finnhubCount + fmpCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "News sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
