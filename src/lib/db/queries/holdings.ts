import { db } from "@/lib/db";
import { holdings, holdingsSnapshots } from "@/lib/db/schema";
import { eq, desc, ilike, or, and, sql, asc, isNotNull } from "drizzle-orm";

export async function getHoldings(
  etfTicker: string,
  options?: { page?: number; limit?: number; sort?: string; search?: string }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  // Always exclude rows with null weight (disclaimer/header junk from CSV)
  const conditions = [
    eq(holdings.etfTicker, etfTicker),
    isNotNull(holdings.weight),
  ];

  if (options?.search) {
    conditions.push(
      or(
        ilike(holdings.securityTicker, `%${options.search}%`),
        ilike(holdings.securityName, `%${options.search}%`)
      )!
    );
  }

  const sortField = options?.sort || "weight";
  let orderExpr;

  switch (sortField) {
    case "name":
      orderExpr = asc(holdings.securityName);
      break;
    case "ticker":
      orderExpr = asc(holdings.securityTicker);
      break;
    case "shares":
      orderExpr = desc(holdings.shares);
      break;
    case "marketValue":
    case "market_value":
      orderExpr = desc(holdings.marketValue);
      break;
    case "weight":
    default:
      orderExpr = desc(holdings.weight);
      break;
  }

  const results = await db
    .select()
    .from(holdings)
    .where(and(...conditions))
    .orderBy(orderExpr)
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(holdings)
    .where(and(...conditions));

  return {
    data: results,
    total: Number(countResult[0]?.count || 0),
    page,
    limit,
    totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  };
}

export async function getTopHoldings(etfTicker: string, limit: number = 10) {
  return db
    .select()
    .from(holdings)
    .where(and(
      eq(holdings.etfTicker, etfTicker),
      isNotNull(holdings.weight),
    ))
    .orderBy(desc(holdings.weight))
    .limit(limit);
}

export async function getAllHoldingsForETF(etfTicker: string) {
  return db
    .select()
    .from(holdings)
    .where(and(
      eq(holdings.etfTicker, etfTicker),
      isNotNull(holdings.weight),
    ))
    .orderBy(desc(holdings.weight));
}

export async function getHoldingsSnapshots(
  etfTicker: string,
  from?: string | null,
  to?: string | null
) {
  const conditions = [eq(holdingsSnapshots.etfTicker, etfTicker)];

  if (from) {
    conditions.push(sql`${holdingsSnapshots.snapshotDate} >= ${from}`);
  }
  if (to) {
    conditions.push(sql`${holdingsSnapshots.snapshotDate} <= ${to}`);
  }

  return db
    .select({
      snapshotDate: holdingsSnapshots.snapshotDate,
      holdingsCount: holdingsSnapshots.holdingsCount,
      totalMarketValue: holdingsSnapshots.totalMarketValue,
      topHoldings: holdingsSnapshots.topHoldings,
    })
    .from(holdingsSnapshots)
    .where(and(...conditions))
    .orderBy(desc(holdingsSnapshots.snapshotDate));
}
