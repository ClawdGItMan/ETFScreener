import { db } from "@/lib/db";
import { prices } from "@/lib/db/schema";
import { eq, and, sql, asc, desc } from "drizzle-orm";

export async function getPriceHistory(ticker: string, fromDate?: string) {
  const conditions = [eq(prices.ticker, ticker)];

  if (fromDate) {
    conditions.push(sql`${prices.date} >= ${fromDate}`);
  }

  return db
    .select({
      date: prices.date,
      open: prices.open,
      high: prices.high,
      low: prices.low,
      close: prices.close,
      adjClose: prices.adjClose,
      volume: prices.volume,
    })
    .from(prices)
    .where(and(...conditions))
    .orderBy(asc(prices.date));
}

export async function getLatestPrice(ticker: string) {
  const result = await db
    .select({
      date: prices.date,
      close: prices.close,
      volume: prices.volume,
    })
    .from(prices)
    .where(eq(prices.ticker, ticker))
    .orderBy(desc(prices.date))
    .limit(1);

  return result[0] || null;
}

export function getFromDateForPeriod(period: string): string {
  const now = new Date();
  const d = new Date(now);

  switch (period) {
    case "1d":
      d.setDate(d.getDate() - 1);
      break;
    case "1w":
      d.setDate(d.getDate() - 7);
      break;
    case "1m":
      d.setMonth(d.getMonth() - 1);
      break;
    case "3m":
      d.setMonth(d.getMonth() - 3);
      break;
    case "ytd":
      d.setMonth(0);
      d.setDate(1);
      break;
    case "1y":
      d.setFullYear(d.getFullYear() - 1);
      break;
    case "5y":
      d.setFullYear(d.getFullYear() - 5);
      break;
    default:
      d.setFullYear(d.getFullYear() - 1);
  }

  return d.toISOString().split("T")[0];
}
