import type {
  FMPHolding,
  FMPPriceHistory,
  FMPSectorWeight,
  FMPCountryWeight,
} from "@/types/api";

const FMP_STABLE = "https://financialmodelingprep.com/stable";
const apiKey = () => process.env.FMP_API_KEY || "";

async function fmpFetch<T>(
  url: string,
  params: Record<string, string> = {},
  revalidate = 3600
): Promise<T> {
  const u = new URL(url);
  u.searchParams.set("apikey", apiKey());
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));

  const res = await fetch(u.toString(), { next: { revalidate } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `FMP API error: ${res.status} for ${url} - ${text.slice(0, 200)}`
    );
  }
  return res.json();
}

export async function fetchEtfProfile(symbol: string) {
  try {
    const data = await fmpFetch<any[]>(`${FMP_STABLE}/profile`, { symbol });
    return data?.[0] || null;
  } catch {
    return null;
  }
}

export async function fetchEtfHoldings(
  symbol: string
): Promise<FMPHolding[]> {
  try {
    return await fmpFetch<FMPHolding[]>(`${FMP_STABLE}/etf-holder`, {
      symbol,
    });
  } catch {
    return [];
  }
}

export async function fetchHistoricalPrices(
  symbol: string,
  from?: string,
  to?: string
): Promise<FMPPriceHistory[]> {
  try {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    const data = await fmpFetch<any>(
      `${FMP_STABLE}/historical-price-eod/full`,
      params
    );
    return Array.isArray(data) ? data : data?.historical || [];
  } catch {
    return [];
  }
}

export async function fetchSectorWeightings(
  symbol: string
): Promise<FMPSectorWeight[]> {
  try {
    return await fmpFetch<FMPSectorWeight[]>(
      `${FMP_STABLE}/etf-sector-weightings`,
      { symbol }
    );
  } catch {
    return [];
  }
}

export async function fetchCountryWeightings(
  symbol: string
): Promise<FMPCountryWeight[]> {
  try {
    return await fmpFetch<FMPCountryWeight[]>(
      `${FMP_STABLE}/etf-country-weightings`,
      { symbol }
    );
  } catch {
    return [];
  }
}

export async function fetchEtfList(): Promise<any[]> {
  try {
    return await fmpFetch<any[]>(`${FMP_STABLE}/etf-list`, {});
  } catch {
    return [];
  }
}

export async function searchSymbol(query: string) {
  try {
    return await fmpFetch<{ symbol: string; name: string }[]>(
      `${FMP_STABLE}/search-symbol`,
      { query, limit: "10" }
    );
  } catch {
    return [];
  }
}

export interface FMPNewsArticle {
  title: string;
  date: string;
  content: string;
  tickers: string;
  image: string;
  link: string;
  author: string;
  site: string;
}

/**
 * Fetch stock news for specific tickers via FMP.
 * Free tier: 250 req/day.
 */
export async function fetchStockNews(options: {
  tickers?: string[];
  limit?: number;
  page?: number;
}): Promise<FMPNewsArticle[]> {
  try {
    const params: Record<string, string> = {
      limit: String(options.limit || 20),
      page: String(options.page || 0),
    };
    if (options.tickers?.length) {
      params.tickers = options.tickers.join(",");
    }
    return await fmpFetch<FMPNewsArticle[]>(
      `${FMP_STABLE}/stock-news`,
      params
    );
  } catch {
    return [];
  }
}
