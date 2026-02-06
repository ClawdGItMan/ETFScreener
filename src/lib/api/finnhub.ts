const FINNHUB_BASE = "https://finnhub.io/api/v1";
const apiKey = () => process.env.FINNHUB_API_KEY || "";

export interface FinnhubNewsArticle {
  id: number;
  category: string;
  datetime: number; // UNIX timestamp
  headline: string;
  image: string;
  related: string; // ticker
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubSentiment {
  buzz: {
    articlesInLastWeek: number;
    weeklyAverage: number;
    buzz: number;
  };
  companyNewsScore: number;
  sectorAverageBullishPercent: number;
  sectorAverageNewsScore: number;
  sentiment: {
    bearishPercent: number;
    bullishPercent: number;
  };
  symbol: string;
}

/**
 * Fetch company news for a specific ticker within a date range.
 * Free tier: 60 calls/min. Only North American companies.
 */
export async function fetchCompanyNews(
  symbol: string,
  from: string, // YYYY-MM-DD
  to: string // YYYY-MM-DD
): Promise<FinnhubNewsArticle[]> {
  if (!apiKey()) return [];

  const url = new URL(`${FINNHUB_BASE}/company-news`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  url.searchParams.set("token", apiKey());

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`Finnhub company-news error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Finnhub company-news fetch error:", err);
    return [];
  }
}

/**
 * Fetch general market news.
 */
export async function fetchMarketNews(
  category: "general" | "forex" | "crypto" | "merger" = "general"
): Promise<FinnhubNewsArticle[]> {
  if (!apiKey()) return [];

  const url = new URL(`${FINNHUB_BASE}/news`);
  url.searchParams.set("category", category);
  url.searchParams.set("token", apiKey());

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`Finnhub market-news error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Finnhub market-news fetch error:", err);
    return [];
  }
}

/**
 * Fetch aggregate news sentiment for a ticker.
 */
export async function fetchNewsSentiment(
  symbol: string
): Promise<FinnhubSentiment | null> {
  if (!apiKey()) return null;

  const url = new URL(`${FINNHUB_BASE}/news-sentiment`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", apiKey());

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`Finnhub news-sentiment error: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("Finnhub news-sentiment fetch error:", err);
    return null;
  }
}
