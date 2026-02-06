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
