import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prices, etfs } from "@/lib/db/schema";
import { fetchYahooHistory } from "@/lib/api/yahoo";
import { sql, eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all ETF tickers
    const allEtfs = await db
      .select({ ticker: etfs.ticker })
      .from(etfs)
      .orderBy(sql`${etfs.aum} DESC NULLS LAST`);

    let synced = 0;
    let totalPoints = 0;

    for (const etf of allEtfs) {
      try {
        // Fetch 1 week of daily data to stay current
        const history = await fetchYahooHistory(etf.ticker, "5d", "1d");

        for (const p of history) {
          await db
            .insert(prices)
            .values({
              ticker: etf.ticker,
              date: p.date,
              open: p.open.toFixed(4),
              high: p.high.toFixed(4),
              low: p.low.toFixed(4),
              close: p.close.toFixed(4),
              adjClose: p.adjClose.toFixed(4),
              volume: Math.round(p.volume).toString(),
            })
            .onConflictDoNothing();
        }

        totalPoints += history.length;
        synced++;

        // Rate limit: ~200ms between tickers
        await new Promise((r) => setTimeout(r, 200));
      } catch {
        continue;
      }
    }

    // Compute price changes for all ETFs
    const priceChangesUpdated = await computePriceChanges();

    return NextResponse.json({
      synced,
      totalPoints,
      priceChangesUpdated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Price sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

async function computePriceChanges(): Promise<number> {
  const allEtfs = await db.select({ ticker: etfs.ticker }).from(etfs);
  let updated = 0;

  const now = new Date();
  const periods = {
    "1d": 1,
    "1w": 7,
    "1m": 30,
    "3m": 90,
    ytd: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000),
    "1y": 365,
  };

  for (const etf of allEtfs) {
    try {
      // Get recent price history for this ETF
      const priceHistory = await db
        .select({ date: prices.date, close: prices.close })
        .from(prices)
        .where(eq(prices.ticker, etf.ticker))
        .orderBy(desc(prices.date))
        .limit(400);

      if (priceHistory.length < 2) continue;

      const latestPrice = parseFloat(priceHistory[0].close);
      const changes: Record<string, number | null> = {};

      for (const [period, days] of Object.entries(periods)) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - days);

        // Find closest price to target date
        const historicalPrice = priceHistory.find((p) => {
          const pDate = new Date(p.date);
          return pDate <= targetDate;
        });

        if (historicalPrice) {
          const oldPrice = parseFloat(historicalPrice.close);
          changes[period] = ((latestPrice - oldPrice) / oldPrice) * 100;
        } else {
          changes[period] = null;
        }
      }

      // Update ETF with calculated changes
      await db
        .update(etfs)
        .set({
          price: latestPrice.toString(),
          priceChange1d: changes["1d"]?.toFixed(4) || null,
          priceChange1w: changes["1w"]?.toFixed(4) || null,
          priceChange1m: changes["1m"]?.toFixed(4) || null,
          priceChange3m: changes["3m"]?.toFixed(4) || null,
          priceChangeYtd: changes["ytd"]?.toFixed(4) || null,
          priceChange1y: changes["1y"]?.toFixed(4) || null,
          updatedAt: new Date(),
        })
        .where(eq(etfs.ticker, etf.ticker));

      updated++;
    } catch {
      continue;
    }
  }

  return updated;
}
