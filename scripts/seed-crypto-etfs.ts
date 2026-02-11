/**
 * Seed crypto ETFs with hardcoded data (since FMP rate limits prevent fetching).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-crypto-etfs.ts
 */

import { neon } from "@neondatabase/serverless";

const CRYPTO_ETFS = [
  // Bitcoin Spot ETFs
  {
    ticker: "IBIT",
    name: "iShares Bitcoin Trust ETF",
    issuer: "BlackRock",
    isBlackrock: true,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "NASDAQ",
    inceptionDate: "2024-01-11",
    description: "The iShares Bitcoin Trust ETF seeks to reflect the performance of the price of bitcoin. The Trust holds bitcoin and issues shares that trade on NASDAQ.",
  },
  {
    ticker: "ETHA",
    name: "iShares Ethereum Trust ETF",
    issuer: "BlackRock",
    isBlackrock: true,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "NASDAQ",
    inceptionDate: "2024-07-23",
    description: "The iShares Ethereum Trust ETF seeks to reflect the performance of the price of ether. The Trust holds ether and issues shares that trade on NASDAQ.",
  },
  {
    ticker: "GBTC",
    name: "Grayscale Bitcoin Trust ETF",
    issuer: "Grayscale",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.015",
    exchange: "NYSE",
    inceptionDate: "2013-09-25",
    description: "Grayscale Bitcoin Trust is a digital currency investment product that allows investors to gain exposure to Bitcoin in the form of a security.",
  },
  {
    ticker: "ETHE",
    name: "Grayscale Ethereum Trust ETF",
    issuer: "Grayscale",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.025",
    exchange: "NYSE",
    inceptionDate: "2017-12-14",
    description: "Grayscale Ethereum Trust is a digital currency investment product that allows investors to gain exposure to Ethereum in the form of a security.",
  },
  {
    ticker: "FBTC",
    name: "Fidelity Wise Origin Bitcoin Fund",
    issuer: "Fidelity",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "CBOE",
    inceptionDate: "2024-01-11",
    description: "The Fidelity Wise Origin Bitcoin Fund seeks to track the performance of bitcoin, as measured by the Fidelity Bitcoin Reference Rate.",
  },
  {
    ticker: "FETH",
    name: "Fidelity Ethereum Fund",
    issuer: "Fidelity",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "CBOE",
    inceptionDate: "2024-07-23",
    description: "The Fidelity Ethereum Fund seeks to track the performance of ether.",
  },
  {
    ticker: "ARKB",
    name: "ARK 21Shares Bitcoin ETF",
    issuer: "ARK",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0021",
    exchange: "CBOE",
    inceptionDate: "2024-01-11",
    description: "ARK 21Shares Bitcoin ETF seeks to track the performance of bitcoin.",
  },
  {
    ticker: "BITB",
    name: "Bitwise Bitcoin ETF",
    issuer: "Bitwise",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.002",
    exchange: "NYSE",
    inceptionDate: "2024-01-11",
    description: "The Bitwise Bitcoin ETF seeks to track the value of bitcoin held by the Trust, less expenses and liabilities.",
  },
  {
    ticker: "HODL",
    name: "VanEck Bitcoin ETF",
    issuer: "VanEck",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.002",
    exchange: "CBOE",
    inceptionDate: "2024-01-11",
    description: "The VanEck Bitcoin ETF seeks to reflect the performance of the price of bitcoin.",
  },
  {
    ticker: "BRRR",
    name: "Valkyrie Bitcoin Fund",
    issuer: "Valkyrie",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "NASDAQ",
    inceptionDate: "2024-01-11",
    description: "The Valkyrie Bitcoin Fund seeks to provide exposure to the daily price movements of bitcoin.",
  },
  {
    ticker: "EZBC",
    name: "Franklin Bitcoin ETF",
    issuer: "Franklin",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0019",
    exchange: "CBOE",
    inceptionDate: "2024-01-11",
    description: "The Franklin Bitcoin ETF seeks to track the performance of bitcoin.",
  },
  {
    ticker: "BTCO",
    name: "Invesco Galaxy Bitcoin ETF",
    issuer: "Invesco",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "CBOE",
    inceptionDate: "2024-01-11",
    description: "The Invesco Galaxy Bitcoin ETF seeks to track the performance of bitcoin.",
  },
  {
    ticker: "BTCW",
    name: "WisdomTree Bitcoin Fund",
    issuer: "WisdomTree",
    isBlackrock: false,
    category: "Digital Assets",
    assetClass: "Cryptocurrency",
    expenseRatio: "0.0025",
    exchange: "CBOE",
    inceptionDate: "2024-01-11",
    description: "The WisdomTree Bitcoin Fund seeks to provide exposure to the price of bitcoin.",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Seeding crypto ETFs...\n");

  for (const etf of CRYPTO_ETFS) {
    try {
      await sql`
        INSERT INTO etfs (ticker, name, issuer, is_blackrock, category, asset_class, expense_ratio, exchange, inception_date, description, last_synced_at)
        VALUES (${etf.ticker}, ${etf.name}, ${etf.issuer}, ${etf.isBlackrock}, ${etf.category}, ${etf.assetClass}, ${etf.expenseRatio}, ${etf.exchange}, ${etf.inceptionDate}, ${etf.description}, NOW())
        ON CONFLICT (ticker) DO UPDATE SET
          name = EXCLUDED.name,
          issuer = EXCLUDED.issuer,
          is_blackrock = EXCLUDED.is_blackrock,
          category = EXCLUDED.category,
          asset_class = EXCLUDED.asset_class,
          expense_ratio = EXCLUDED.expense_ratio,
          description = EXCLUDED.description,
          updated_at = NOW()
      `;
      console.log(`  ✓ ${etf.ticker}: ${etf.name}`);
    } catch (e) {
      console.error(`  ✗ ${etf.ticker}: ${e}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
