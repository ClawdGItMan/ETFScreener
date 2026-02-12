/**
 * Verify all ETF data is populated.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/verify-data.ts
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Check ETF counts
  const etfCounts = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_blackrock = true) as blackrock,
      COUNT(*) FILTER (WHERE is_blackrock = false) as competitors,
      COUNT(*) FILTER (WHERE category = 'Digital Assets') as crypto,
      COUNT(*) FILTER (WHERE expense_ratio IS NOT NULL) as with_expense_ratio,
      COUNT(*) FILTER (WHERE price IS NOT NULL) as with_price
    FROM etfs
  `;

  // Check holdings count
  const holdingsCounts = await sql`
    SELECT COUNT(*) as total_holdings, COUNT(DISTINCT etf_ticker) as etfs_with_holdings
    FROM holdings
    WHERE weight IS NOT NULL
  `;

  // Check price records
  const priceCounts = await sql`
    SELECT COUNT(*) as total_prices, COUNT(DISTINCT ticker) as tickers_with_prices
    FROM prices
  `;

  // Check crypto ETFs specifically
  const cryptoEtfs = await sql`
    SELECT ticker, name, price, price_change_1w, price_change_1m
    FROM etfs
    WHERE category = 'Digital Assets'
    ORDER BY ticker
  `;

  console.log("=== ETF Database Summary ===\n");
  console.log("ETF Counts:");
  console.log("  Total ETFs:", etfCounts[0].total);
  console.log("  BlackRock ETFs:", etfCounts[0].blackrock);
  console.log("  Competitor ETFs:", etfCounts[0].competitors);
  console.log("  Crypto ETFs:", etfCounts[0].crypto);
  console.log("  With expense ratio:", etfCounts[0].with_expense_ratio);
  console.log("  With price data:", etfCounts[0].with_price);
  console.log();
  console.log("Holdings:", holdingsCounts[0].total_holdings, "across", holdingsCounts[0].etfs_with_holdings, "ETFs");
  console.log("Price Records:", priceCounts[0].total_prices, "across", priceCounts[0].tickers_with_prices, "tickers");
  console.log();
  console.log("Crypto ETFs:");
  for (const e of cryptoEtfs) {
    const price = e.price ? `$${parseFloat(e.price).toFixed(2)}` : "N/A";
    const change1w = e.price_change_1w ? `${parseFloat(e.price_change_1w).toFixed(2)}%` : "N/A";
    const change1m = e.price_change_1m ? `${parseFloat(e.price_change_1m).toFixed(2)}%` : "N/A";
    console.log(`  ${e.ticker}: ${price} (1W: ${change1w}, 1M: ${change1m})`);
  }
}

main().catch(console.error);
