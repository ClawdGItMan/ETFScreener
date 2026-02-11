/**
 * Seed script to populate the database with BlackRock/iShares ETFs and major competitors.
 * Uses the FMP stable API (single-ticker /stable/profile endpoint).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-etfs.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const BLACKROCK_ETFS = [
  // === Core Series (Largest AUM) ===
  "IVV", "IEFA", "IEMG", "AGG", "ITOT", "IUSB", "IAGG", "IDEV",

  // === US Equity Style (Russell & S&P) ===
  "IWM", "IWF", "IWD", "IJH", "IJR", "IWB", "IWR", "IWS", "IWN", "IWP", "IWO",
  "IVW", "IVE", "IJK", "IJJ", "IJT", "IJS", "IWV", "IWC", "IWY", "IWX", "IWL",
  "OEF", "IUSG", "IUSV",

  // === International Equity ===
  "EFA", "EEM", "ACWI", "IXUS", "ACWX", "ACWV", "SCZ", "EFG", "EFV",
  "AAXJ", "EEMA", "EEMS", "EPP", "TOK", "URTH",

  // === Fixed Income ===
  "LQD", "HYG", "TIP", "SHY", "IEF", "TLT", "MUB", "SUB", "EMB",
  "GOVT", "SHV", "MBB", "FLOT", "NEAR", "SHYG", "IGSB", "IGIB", "USIG", "USHY",
  "ISTB", "ILTB", "TLH", "IEI", "AGZ", "STIP", "IGLB", "SGOV", "TFLO",
  "CEMB", "LEMB", "EMHY", "FALN", "CMBS", "ICVT", "SLQD", "GVI", "GNMA",
  "PFF", "IGOV", "ISHG",

  // === Dividend & Income ===
  "HDV", "DVY", "IDV", "DGRO", "DIVB", "DVYA", "DVYE", "IGRO",

  // === US Sector ===
  "IYW", "IYH", "IYF", "IYE", "IYR", "IYC", "IYK", "IYM", "IYJ", "IYG",
  "IYT", "IYZ", "IDU", "IAI", "IAK", "IAT", "IHF", "ITB",
  "IHI", "IBB", "IGV", "SOXX", "ITA", "IHE", "IEO", "IEZ",

  // === Factor / Smart Beta ===
  "QUAL", "MTUM", "VLUE", "USMV", "SIZE", "LRGF", "SMLF",
  "EFAV", "EEMV", "SMMV", "DYNF",

  // === Global Sector ===
  "ICLN", "IXC", "IXG", "IXJ", "IXN", "IXP", "IGF", "IGE", "IGM",
  "RXI", "KXI", "EXI", "MXI", "JXI",

  // === Single Country (Major) ===
  "INDA", "EWJ", "EWZ", "EWG", "EWU", "EWC", "EWA", "EWY", "EWT",
  "EWH", "EWS", "MCHI", "FXI", "EWW", "EWI", "EWQ", "EWP", "EWD",
  "EWL", "EWN", "EWM", "EZU", "EZA", "ECH", "THD", "TUR", "EPU",
  "EIDO", "EPHE", "EPOL", "ENOR", "ENZL", "EIRL", "EIS", "SMIN",
  "EWK", "EWZS", "EWUS", "EWJV", "CNYA", "KSA", "KWT",

  // === Cash & Ultra-Short ===
  "ICSH",

  // === Commodity ===
  "IAU", "SLV", "GSG", "COMT", "CMDY",

  // === Allocation ===
  "AOA", "AOR", "AOM", "AOK",

  // === Regional ===
  "ILF", "AIA", "BKF", "IEV",

  // === ESG ===
  "ESGU", "ESGD", "ESGE", "ESML", "SUSA", "DSI", "SUSL", "EAGG",
  "SUSC", "SUSB", "USXF", "DMXF", "EMXF",

  // === Thematic & Innovation ===
  "ARTY", "IDRV", "IHAK", "IDNA", "TECB", "ICOP", "ILIT",

  // === Crypto (Bitcoin & Ethereum Spot ETFs) ===
  "IBIT", "ETHA",  // BlackRock Bitcoin & Ethereum

  // === Active ETFs ===
  "BINC", "BLCV", "BLCR", "BGRO", "BRLN", "CLOA", "BRHY", "BRTR",
  "DYNF", "BAI", "TEK", "BALI", "BELT", "CSHP",

  // === iBonds (Target Date Fixed Income) ===
  "IBDR", "IBDS", "IBDT", "IBDU", "IBDV", "IBDW", "IBDX", "IBDY",

  // === Multi-Factor ===
  "INTF", "ISCF", "EMGF", "GLOF",

  // === Buffer & Defined Outcome ===
  "IVVM", "IVVB", "MAXJ", "SMAX", "DMAX", "MMAX",

  // === Additional Popular ===
  "EMXC", "HEFA", "HEWJ", "REET", "ICF", "GARP", "SVAL", "ISVL",
  "TLTW", "HYGW", "LQDW", "TMET", "MADE", "INMU", "SHYM",
  "SGOV", "GOVZ", "IFRA", "XT",
];

const COMPETITOR_ETFS = [
  // === Vanguard ===
  "VOO", "VTI", "VEA", "VWO", "BND", "VXUS", "VIG", "VYM", "VB", "VO",
  "VGT", "VHT", "VNQ", "VTV", "VUG",
  // === State Street SPDR ===
  "SPY", "MDY", "DIA", "GLD", "XLF", "XLK", "XLE", "XLV", "XLI", "XLY",
  "XLP", "XLU", "XLB", "XLRE", "XLC",
  // === Invesco ===
  "QQQ", "QQQM", "RSP",
  // === Schwab ===
  "SCHD", "SCHX", "SCHB", "SCHA", "SCHF", "SCHE",
  // === Crypto ETFs (Non-BlackRock) ===
  "GBTC", "ETHE",   // Grayscale Bitcoin & Ethereum
  "FBTC", "FETH",   // Fidelity Bitcoin & Ethereum
  "ARKB",           // ARK 21Shares Bitcoin
  "BITB",           // Bitwise Bitcoin
  "HODL",           // VanEck Bitcoin
  "BRRR",           // Valkyrie Bitcoin
  "EZBC",           // Franklin Bitcoin
  "BTCO",           // Invesco Galaxy Bitcoin
  "BTCW",           // WisdomTree Bitcoin
];

const FMP_BASE = "https://financialmodelingprep.com/stable";

async function fetchProfile(symbol: string, apiKey: string) {
  const url = `${FMP_BASE}/profile?symbol=${symbol}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.error("FMP_API_KEY is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const allTickers = [...BLACKROCK_ETFS, ...COMPETITOR_ETFS];
  console.log(`Seeding ${allTickers.length} ETFs (one at a time via /stable/profile)...\n`);

  let seeded = 0;
  let failed = 0;
  let rateLimited = 0;

  for (let i = 0; i < allTickers.length; i++) {
    const ticker = allTickers[i];
    const isBlackrock = BLACKROCK_ETFS.includes(ticker);

    try {
      const profile = await fetchProfile(ticker, apiKey);

      if (!profile) {
        console.log(`  [${i + 1}/${allTickers.length}] ${ticker} - No data (skipped)`);
        failed++;
        continue;
      }

      const issuer = isBlackrock
        ? "BlackRock"
        : extractIssuer(profile.companyName || "");

      const changePercent = profile.changePercentage ?? (
        profile.change && profile.price
          ? (profile.change / (profile.price - profile.change)) * 100
          : null
      );

      const yieldPct = profile.lastDividend && profile.price
        ? (profile.lastDividend / profile.price) * 100
        : null;

      await db
        .insert(schema.etfs)
        .values({
          ticker: profile.symbol || ticker,
          name: profile.companyName || ticker,
          issuer,
          category: profile.sector || null,
          assetClass: profile.industry || null,
          aum: profile.marketCap?.toString() || null,
          avgVolume: profile.averageVolume?.toString() || null,
          price: profile.price?.toString() || null,
          priceChange1d: changePercent?.toString() || null,
          dividendYield: yieldPct?.toString() || null,
          inceptionDate: profile.ipoDate || null,
          exchange: profile.exchange || null,
          isBlackrock,
          description: profile.description || null,
          lastSyncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.etfs.ticker,
          set: {
            name: profile.companyName || ticker,
            aum: profile.marketCap?.toString() || null,
            avgVolume: profile.averageVolume?.toString() || null,
            price: profile.price?.toString() || null,
            priceChange1d: changePercent?.toString() || null,
            dividendYield: yieldPct?.toString() || null,
            description: profile.description || null,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        });

      seeded++;
      console.log(
        `  [${i + 1}/${allTickers.length}] ${profile.symbol} - ${profile.companyName} ($${profile.price})`
      );
    } catch (e: any) {
      const msg = String(e);
      if (msg.includes("rate") || msg.includes("429") || msg.includes("limit")) {
        rateLimited++;
        console.log(`  [${i + 1}/${allTickers.length}] ${ticker} - Rate limited, waiting...`);
        await sleep(5000);
        i--; // Retry
        continue;
      }
      console.error(`  [${i + 1}/${allTickers.length}] ${ticker} - Error: ${msg.slice(0, 100)}`);
      failed++;
    }

    // Rate limit: free tier is ~5 req/sec, be conservative
    if ((i + 1) % 5 === 0) {
      await sleep(1500);
    } else {
      await sleep(300);
    }
  }

  console.log(`\nETFs done! Seeded: ${seeded}, Failed: ${failed}, Rate limited retries: ${rateLimited}`);

  // Seed comparison groups
  console.log("\nSeeding comparison groups...");
  const groups = [
    { groupName: "S&P 500 Trackers", groupSlug: "sp500-trackers", category: "Large Cap Blend", indexTracked: "S&P 500", tickers: ["IVV", "VOO", "SPY"] },
    { groupName: "Total US Market", groupSlug: "total-us-market", category: "Large Cap Blend", indexTracked: "Total US Market", tickers: ["ITOT", "VTI", "SCHB"] },
    { groupName: "International Developed", groupSlug: "intl-developed", category: "International", indexTracked: "MSCI EAFE", tickers: ["IEFA", "VEA", "EFA", "SCHF"] },
    { groupName: "Emerging Markets", groupSlug: "emerging-markets", category: "Emerging Markets", indexTracked: "MSCI EM", tickers: ["IEMG", "VWO", "EEM", "SCHE"] },
    { groupName: "US Aggregate Bond", groupSlug: "us-agg-bond", category: "Intermediate Bond", indexTracked: "Bloomberg US Agg", tickers: ["AGG", "BND"] },
    { groupName: "Small Cap US", groupSlug: "small-cap-us", category: "Small Cap", indexTracked: "Russell 2000", tickers: ["IWM", "VB", "SCHA"] },
    { groupName: "Nasdaq 100", groupSlug: "nasdaq-100", category: "Large Cap Growth", indexTracked: "NASDAQ 100", tickers: ["QQQ", "QQQM"] },
    { groupName: "Dividend Growth", groupSlug: "dividend-growth", category: "Dividend", indexTracked: "Various", tickers: ["DGRO", "VIG", "SCHD"] },
  ];

  for (const g of groups) {
    await db
      .insert(schema.etfComparisons)
      .values({
        groupName: g.groupName,
        groupSlug: g.groupSlug,
        category: g.category,
        indexTracked: g.indexTracked,
        tickers: JSON.stringify(g.tickers),
      })
      .onConflictDoNothing();
  }

  console.log("Comparison groups seeded.\nDone!");
}

function extractIssuer(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("ishares") || lower.includes("blackrock")) return "BlackRock";
  if (lower.includes("vanguard")) return "Vanguard";
  if (lower.includes("spdr") || lower.includes("state street")) return "State Street";
  if (lower.includes("invesco") || lower.includes("powershares")) return "Invesco";
  if (lower.includes("schwab")) return "Schwab";
  if (lower.includes("fidelity")) return "Fidelity";
  if (lower.includes("jpmorgan") || lower.includes("jp morgan")) return "JPMorgan";
  if (lower.includes("wisdomtree")) return "WisdomTree";
  if (lower.includes("vaneck")) return "VanEck";
  if (lower.includes("proshares")) return "ProShares";
  if (lower.includes("first trust")) return "First Trust";
  if (lower.includes("ark ")) return "ARK";
  return "Other";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

seed().catch(console.error);
