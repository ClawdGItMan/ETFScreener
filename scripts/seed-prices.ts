/**
 * Seed historical prices from Yahoo Finance.
 * Fetches 1 year of daily data for all ETFs in the database.
 * Uses batch SQL inserts for speed (~5x faster than individual inserts).
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-prices.ts
 */

import { neon } from "@neondatabase/serverless";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

async function fetchYahooHistory(symbol: string): Promise<PricePoint[]> {
  const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=1y&interval=1d`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      if (res.status === 429) {
        // Rate limited, wait and retry once
        await sleep(3000);
        const retry = await fetch(url, {
          headers: { "User-Agent": USER_AGENT },
        });
        if (!retry.ok) return [];
        const json = await retry.json();
        return parseYahooResponse(json);
      }
      return [];
    }

    const json = await res.json();
    return parseYahooResponse(json);
  } catch (err) {
    console.error(`  Fetch error for ${symbol}:`, err);
    return [];
  }
}

function parseYahooResponse(json: any): PricePoint[] {
  const result = json?.chart?.result?.[0];
  if (!result) return [];

  const timestamps: number[] = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const adjCloseArr = result.indicators?.adjclose?.[0]?.adjclose || [];

  const points: PricePoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (quote.close?.[i] == null) continue;
    const d = new Date(timestamps[i] * 1000);
    points.push({
      date: d.toISOString().split("T")[0],
      open: quote.open?.[i] ?? quote.close[i],
      high: quote.high?.[i] ?? quote.close[i],
      low: quote.low?.[i] ?? quote.close[i],
      close: quote.close[i],
      adjClose: adjCloseArr[i] ?? quote.close[i],
      volume: quote.volume?.[i] ?? 0,
    });
  }
  return points;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = neon(process.env.DATABASE_URL);

  // Get all ETF tickers
  const etfs = await sql`SELECT ticker FROM etfs ORDER BY aum DESC NULLS LAST`;
  const tickers = etfs.map((r) => r.ticker as string);

  console.log(`Seeding 1 year of daily prices for ${tickers.length} ETFs...\n`);

  let totalInserted = 0;
  let failed = 0;

  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    process.stdout.write(`  [${i + 1}/${tickers.length}] ${ticker}...`);

    try {
      const history = await fetchYahooHistory(ticker);

      if (history.length === 0) {
        console.log(" no data");
        failed++;
        await sleep(500);
        continue;
      }

      // Batch insert in chunks of 50 using a single SQL statement
      const chunkSize = 50;
      let inserted = 0;

      for (let j = 0; j < history.length; j += chunkSize) {
        const chunk = history.slice(j, j + chunkSize);

        // Build a multi-row VALUES clause
        const values = chunk
          .map(
            (p) =>
              `('${ticker}', '${p.date}', ${p.open.toFixed(4)}, ${p.high.toFixed(4)}, ${p.low.toFixed(4)}, ${p.close.toFixed(4)}, ${p.adjClose.toFixed(4)}, ${Math.round(p.volume)})`
          )
          .join(",\n");

        await sql.query(
          `INSERT INTO prices (ticker, date, open, high, low, close, adj_close, volume)
           VALUES ${values}
           ON CONFLICT DO NOTHING`
        );

        inserted += chunk.length;
      }

      totalInserted += inserted;
      console.log(` ${inserted} prices`);

      // Rate limit: 350ms between tickers
      await sleep(350);
    } catch (err) {
      console.log(` FAILED: ${err}`);
      failed++;
      await sleep(500);
    }
  }

  console.log(`\nDone!`);
  console.log(`  Inserted: ${totalInserted} price records`);
  console.log(`  Failed tickers: ${failed}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch(console.error);
