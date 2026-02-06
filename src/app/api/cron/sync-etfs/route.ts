import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { etfs } from "@/lib/db/schema";
import { fetchEtfList, fetchEtfProfile } from "@/lib/api/fmp";
import { eq } from "drizzle-orm";

// Known BlackRock/iShares issuer identifiers
const BLACKROCK_IDENTIFIERS = ["blackrock", "ishares", "barclays"];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const etfList = await fetchEtfList();

    let synced = 0;
    for (const item of etfList.slice(0, 50)) {
      // Rate limit: process in small batches
      if (!item.symbol || !item.companyName) continue;

      const isBlackrock = BLACKROCK_IDENTIFIERS.some((id) =>
        (item.companyName || "").toLowerCase().includes(id)
      );

      await db
        .insert(etfs)
        .values({
          ticker: item.symbol,
          name: item.companyName,
          issuer: isBlackrock ? "BlackRock" : extractIssuer(item.companyName),
          expenseRatio: item.etfExpenseRatio?.toString(),
          aum: item.aum?.toString(),
          price: item.price?.toString(),
          priceChange1d: item.changesPercentage?.toString(),
          exchange: item.exchangeShortName,
          isBlackrock,
          description: item.description,
          inceptionDate: item.ipoDate,
          lastSyncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: etfs.ticker,
          set: {
            name: item.companyName,
            expenseRatio: item.etfExpenseRatio?.toString(),
            aum: item.aum?.toString(),
            price: item.price?.toString(),
            priceChange1d: item.changesPercentage?.toString(),
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        });

      synced++;
    }

    return NextResponse.json({
      synced,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

function extractIssuer(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("vanguard")) return "Vanguard";
  if (lower.includes("state street") || lower.includes("spdr")) return "State Street";
  if (lower.includes("invesco")) return "Invesco";
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
