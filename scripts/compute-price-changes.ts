/**
 * Compute price change percentages (1W, 1M, 3M, YTD, 1Y) from historical price data
 * and update the ETF records.
 *
 * Usage: npx tsx --env-file=.env.local scripts/compute-price-changes.ts
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const sql = neon(process.env.DATABASE_URL);

  const etfs = await sql`SELECT ticker FROM etfs ORDER BY ticker`;
  console.log(`Computing price changes for ${etfs.length} ETFs...\n`);

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yearStart = `${now.getFullYear()}-01-01`;

  function daysAgo(n: number) {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  }
  function monthsAgo(n: number) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d.toISOString().split("T")[0];
  }

  let updated = 0;

  for (const etf of etfs) {
    const ticker = etf.ticker as string;

    // Get the latest price
    const latest = await sql`
      SELECT close FROM prices WHERE ticker = ${ticker} ORDER BY date DESC LIMIT 1
    `;
    if (!latest.length) continue;
    const currentPrice = parseFloat(latest[0].close as string);

    // Helper: get closest price on or before a date
    async function getPriceOn(targetDate: string): Promise<number | null> {
      const row = await sql`
        SELECT close FROM prices
        WHERE ticker = ${ticker} AND date <= ${targetDate}
        ORDER BY date DESC LIMIT 1
      `;
      return row.length ? parseFloat(row[0].close as string) : null;
    }

    const price1w = await getPriceOn(daysAgo(7));
    const price1m = await getPriceOn(monthsAgo(1));
    const price3m = await getPriceOn(monthsAgo(3));
    const priceYtd = await getPriceOn(yearStart);
    const price1y = await getPriceOn(monthsAgo(12));

    function pctChange(oldPrice: number | null): string | null {
      if (!oldPrice || oldPrice === 0) return null;
      return (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(4);
    }

    const change1w = pctChange(price1w);
    const change1m = pctChange(price1m);
    const change3m = pctChange(price3m);
    const changeYtd = pctChange(priceYtd);
    const change1y = pctChange(price1y);

    await sql`
      UPDATE etfs SET
        price_change_1w = ${change1w},
        price_change_1m = ${change1m},
        price_change_3m = ${change3m},
        price_change_ytd = ${changeYtd},
        price_change_1y = ${change1y},
        updated_at = NOW()
      WHERE ticker = ${ticker}
    `;

    updated++;
    const display = [
      change1w ? `1W:${change1w}%` : null,
      change1m ? `1M:${change1m}%` : null,
      change3m ? `3M:${change3m}%` : null,
      changeYtd ? `YTD:${changeYtd}%` : null,
      change1y ? `1Y:${change1y}%` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    console.log(`  ${ticker}: ${display}`);
  }

  console.log(`\nDone! Updated ${updated} ETFs.`);
}

main().catch(console.error);
