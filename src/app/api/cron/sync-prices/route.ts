import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prices, etfs } from "@/lib/db/schema";
import { fetchYahooHistory } from "@/lib/api/yahoo";
import { sql } from "drizzle-orm";

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

    return NextResponse.json({
      synced,
      totalPoints,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Price sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
