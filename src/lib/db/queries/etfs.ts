import { db } from "@/lib/db";
import { etfs } from "@/lib/db/schema";
import { eq, ilike, or, and, desc, asc, sql, SQL } from "drizzle-orm";
import type { ETFFilters } from "@/types/api";

export async function getFilteredEtfs(filters: ETFFilters) {
  const conditions: SQL[] = [];

  if (filters.blackrockOnly) {
    conditions.push(eq(etfs.isBlackrock, true));
  }
  if (filters.issuer) {
    conditions.push(eq(etfs.issuer, filters.issuer));
  }
  if (filters.category) {
    conditions.push(eq(etfs.category, filters.category));
  }
  if (filters.assetClass) {
    conditions.push(eq(etfs.assetClass, filters.assetClass));
  }
  if (filters.search) {
    conditions.push(
      or(
        ilike(etfs.ticker, `%${filters.search}%`),
        ilike(etfs.name, `%${filters.search}%`)
      )!
    );
  }

  const sortColumn = getSortColumn(filters.sort);
  const orderDir = filters.order === "asc" ? asc : desc;

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(etfs)
    .where(where)
    .orderBy(orderDir(sortColumn))
    .limit(filters.limit || 20)
    .offset(filters.offset || 0);

  return results;
}

export async function getEtfCount(
  filters: Omit<ETFFilters, "sort" | "order" | "limit" | "offset">
) {
  const conditions: SQL[] = [];

  if (filters.blackrockOnly) {
    conditions.push(eq(etfs.isBlackrock, true));
  }
  if (filters.issuer) {
    conditions.push(eq(etfs.issuer, filters.issuer));
  }
  if (filters.category) {
    conditions.push(eq(etfs.category, filters.category));
  }
  if (filters.assetClass) {
    conditions.push(eq(etfs.assetClass, filters.assetClass));
  }
  if (filters.search) {
    conditions.push(
      or(
        ilike(etfs.ticker, `%${filters.search}%`),
        ilike(etfs.name, `%${filters.search}%`)
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(etfs)
    .where(where);

  return Number(result[0]?.count || 0);
}

export async function getEtfByTicker(ticker: string) {
  const result = await db
    .select()
    .from(etfs)
    .where(eq(etfs.ticker, ticker))
    .limit(1);

  return result[0] || null;
}

export async function getEtfsByTickers(tickers: string[]) {
  if (tickers.length === 0) return [];
  const conditions = tickers.map((t) => eq(etfs.ticker, t));
  return db
    .select()
    .from(etfs)
    .where(or(...conditions));
}

export async function searchEtfs(query: string) {
  return db
    .select({
      ticker: etfs.ticker,
      name: etfs.name,
      issuer: etfs.issuer,
      category: etfs.category,
      aum: etfs.aum,
    })
    .from(etfs)
    .where(
      or(
        ilike(etfs.ticker, `%${query}%`),
        ilike(etfs.name, `%${query}%`)
      )
    )
    .orderBy(desc(etfs.aum))
    .limit(10);
}

/**
 * Enhanced search that also matches on category, issuer, asset class, and index
 */
export async function searchEtfsEnhanced(query: string) {
  const normalizedQuery = query.toLowerCase().trim();

  // Check for common keyword mappings
  const keywordMappings: Record<string, { field: "category" | "issuer" | "assetClass"; values: string[] }> = {
    // Asset classes
    "equity": { field: "assetClass", values: ["Equity"] },
    "stock": { field: "assetClass", values: ["Equity"] },
    "stocks": { field: "assetClass", values: ["Equity"] },
    "bond": { field: "assetClass", values: ["Fixed Income"] },
    "bonds": { field: "assetClass", values: ["Fixed Income"] },
    "fixed income": { field: "assetClass", values: ["Fixed Income"] },
    "commodity": { field: "assetClass", values: ["Commodity"] },
    "commodities": { field: "assetClass", values: ["Commodity"] },
    "crypto": { field: "category", values: ["Digital Assets"] },
    "bitcoin": { field: "category", values: ["Digital Assets"] },
    "ethereum": { field: "category", values: ["Digital Assets"] },
    "digital assets": { field: "category", values: ["Digital Assets"] },
    // Categories
    "tech": { field: "category", values: ["Technology"] },
    "technology": { field: "category", values: ["Technology"] },
    "healthcare": { field: "category", values: ["Health & Biotech"] },
    "health": { field: "category", values: ["Health & Biotech"] },
    "biotech": { field: "category", values: ["Health & Biotech"] },
    "energy": { field: "category", values: ["Energy"] },
    "financial": { field: "category", values: ["Financials"] },
    "financials": { field: "category", values: ["Financials"] },
    "real estate": { field: "category", values: ["Real Estate"] },
    "reit": { field: "category", values: ["Real Estate"] },
    "growth": { field: "category", values: ["Growth"] },
    "value": { field: "category", values: ["Value"] },
    "dividend": { field: "category", values: ["Dividend"] },
    "dividends": { field: "category", values: ["Dividend"] },
    "emerging": { field: "category", values: ["Emerging Markets"] },
    "emerging markets": { field: "category", values: ["Emerging Markets"] },
    "international": { field: "category", values: ["International Equity", "International Developed Markets"] },
    "esg": { field: "category", values: ["ESG"] },
    "sustainable": { field: "category", values: ["ESG"] },
    "small cap": { field: "category", values: ["Small-Cap"] },
    "mid cap": { field: "category", values: ["Mid-Cap"] },
    "large cap": { field: "category", values: ["Large-Cap"] },
    // Issuers
    "blackrock": { field: "issuer", values: ["BlackRock"] },
    "ishares": { field: "issuer", values: ["BlackRock"] },
    "vanguard": { field: "issuer", values: ["Vanguard"] },
    "state street": { field: "issuer", values: ["State Street"] },
    "spdr": { field: "issuer", values: ["State Street"] },
    "invesco": { field: "issuer", values: ["Invesco"] },
    "fidelity": { field: "issuer", values: ["Fidelity"] },
    "schwab": { field: "issuer", values: ["Schwab"] },
  };

  // Check if query matches any keyword
  const mapping = keywordMappings[normalizedQuery];

  // Build conditions for direct search
  const directConditions = or(
    ilike(etfs.ticker, `%${query}%`),
    ilike(etfs.name, `%${query}%`),
    ilike(etfs.category, `%${query}%`),
    ilike(etfs.assetClass, `%${query}%`),
    ilike(etfs.indexTracked, `%${query}%`)
  );

  // If we have a keyword mapping, prioritize that
  if (mapping) {
    const keywordConditions = mapping.values.map((v) => {
      if (mapping.field === "category") return eq(etfs.category, v);
      if (mapping.field === "issuer") return eq(etfs.issuer, v);
      return eq(etfs.assetClass, v);
    });

    const keywordResults = await db
      .select({
        ticker: etfs.ticker,
        name: etfs.name,
        issuer: etfs.issuer,
        category: etfs.category,
        aum: etfs.aum,
        matchType: sql<string>`'keyword'`.as("match_type"),
      })
      .from(etfs)
      .where(or(...keywordConditions))
      .orderBy(desc(etfs.aum))
      .limit(15);

    return keywordResults;
  }

  // Otherwise do direct matching
  return db
    .select({
      ticker: etfs.ticker,
      name: etfs.name,
      issuer: etfs.issuer,
      category: etfs.category,
      aum: etfs.aum,
      matchType: sql<string>`'direct'`.as("match_type"),
    })
    .from(etfs)
    .where(directConditions)
    .orderBy(desc(etfs.aum))
    .limit(15);
}

export async function getCategories() {
  const result = await db
    .selectDistinct({ category: etfs.category })
    .from(etfs)
    .where(sql`${etfs.category} IS NOT NULL`)
    .orderBy(asc(etfs.category));
  return result.map((r) => r.category).filter(Boolean) as string[];
}

export async function getIssuers() {
  const result = await db
    .selectDistinct({ issuer: etfs.issuer })
    .from(etfs)
    .orderBy(asc(etfs.issuer));
  return result.map((r) => r.issuer);
}

function getSortColumn(sort?: string) {
  switch (sort) {
    case "ticker":
      return etfs.ticker;
    case "name":
      return etfs.name;
    case "expense_ratio":
      return etfs.expenseRatio;
    case "price":
      return etfs.price;
    case "price_change_1d":
      return etfs.priceChange1d;
    case "price_change_1w":
      return etfs.priceChange1w;
    case "price_change_1m":
      return etfs.priceChange1m;
    case "dividend_yield":
      return etfs.dividendYield;
    case "aum":
    default:
      return etfs.aum;
  }
}
