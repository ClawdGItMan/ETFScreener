/**
 * Yahoo Finance Chart API client.
 * Free, no API key required. Returns OHLCV data.
 *
 * Rate limiting: be polite — add delays between requests.
 * Uses the public v8 chart endpoint.
 */

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)";

export interface YahooPricePoint {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

type YahooRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max";
type YahooInterval = "1d" | "1wk" | "1mo";

/**
 * Fetch historical price data from Yahoo Finance.
 */
export async function fetchYahooHistory(
  symbol: string,
  range: YahooRange = "1y",
  interval: YahooInterval = "1d"
): Promise<YahooPricePoint[]> {
  const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Yahoo Finance error for ${symbol}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

    const opens: number[] = quote.open || [];
    const highs: number[] = quote.high || [];
    const lows: number[] = quote.low || [];
    const closes: number[] = quote.close || [];
    const volumes: number[] = quote.volume || [];

    const points: YahooPricePoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      // Skip if close is null/undefined (market holiday placeholders)
      if (closes[i] == null) continue;

      const d = new Date(timestamps[i] * 1000);
      const dateStr = d.toISOString().split("T")[0];

      points.push({
        date: dateStr,
        open: opens[i] ?? closes[i],
        high: highs[i] ?? closes[i],
        low: lows[i] ?? closes[i],
        close: closes[i],
        adjClose: adjClose[i] ?? closes[i],
        volume: volumes[i] ?? 0,
      });
    }

    return points;
  } catch (err) {
    console.error(`Yahoo Finance fetch error for ${symbol}:`, err);
    return [];
  }
}
