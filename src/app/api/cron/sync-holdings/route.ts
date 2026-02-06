import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { holdings, holdingsSnapshots, etfs } from "@/lib/db/schema";
import { fetchEtfHoldings } from "@/lib/api/fmp";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get ETFs that haven't been synced in 24 hours
    const staleEtfs = await db
      .select({ ticker: etfs.ticker })
      .from(etfs)
      .where(
        sql`${etfs.lastSyncedAt} IS NULL OR ${etfs.lastSyncedAt} < NOW() - INTERVAL '24 hours'`
      )
      .limit(10); // Process 10 at a time due to rate limits

    let synced = 0;

    for (const etf of staleEtfs) {
      try {
        const holdingsData = await fetchEtfHoldings(etf.ticker);
        if (!holdingsData || holdingsData.length === 0) continue;

        const today = new Date().toISOString().split("T")[0];

        // Delete existing holdings for this ETF
        await db
          .delete(holdings)
          .where(eq(holdings.etfTicker, etf.ticker));

        // Insert new holdings
        for (const h of holdingsData) {
          await db.insert(holdings).values({
            etfTicker: etf.ticker,
            securityTicker: h.asset || null,
            securityName: h.name || "Unknown",
            weight: h.weightPercentage?.toString(),
            shares: h.sharesNumber?.toString(),
            marketValue: h.marketValue?.toString(),
            asOfDate: h.updated || today,
          });
        }

        // Create snapshot
        const topHoldings = holdingsData
          .slice(0, 10)
          .map((h) => ({
            ticker: h.asset,
            name: h.name,
            weight: h.weightPercentage,
          }));

        await db
          .insert(holdingsSnapshots)
          .values({
            etfTicker: etf.ticker,
            snapshotDate: today,
            holdingsData: JSON.stringify(holdingsData),
            holdingsCount: holdingsData.length,
            topHoldings: JSON.stringify(topHoldings),
            totalMarketValue: holdingsData
              .reduce((sum, h) => sum + (h.marketValue || 0), 0)
              .toString(),
          })
          .onConflictDoNothing();

        // Update ETF metadata
        await db
          .update(etfs)
          .set({
            holdingsCount: holdingsData.length,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(etfs.ticker, etf.ticker));

        synced++;
      } catch {
        // Skip individual ETF errors
        continue;
      }
    }

    return NextResponse.json({
      synced,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Holdings sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
