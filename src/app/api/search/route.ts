import { NextRequest, NextResponse } from "next/server";
import { searchEtfsEnhanced } from "@/lib/db/queries/etfs";
import { findEtfsByHolding } from "@/lib/db/queries/holdings";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 1) {
    return NextResponse.json({ results: [], holdingResults: [] });
  }

  try {
    // Search ETFs by ticker, name, category, etc.
    const etfResults = await searchEtfsEnhanced(q);

    // Also search for ETFs that hold a specific stock (if query looks like a stock ticker)
    let holdingResults: Array<{
      etfTicker: string;
      etfName: string;
      etfIssuer: string;
      etfCategory: string | null;
      etfAum: string | null;
      securityTicker: string | null;
      securityName: string;
      weight: string | null;
    }> = [];

    // Only search holdings if query is 1-5 uppercase letters (likely a stock ticker)
    // or if it looks like a company name
    if (q.length <= 5 || /^[A-Za-z\s]+$/.test(q)) {
      try {
        holdingResults = await findEtfsByHolding(q, 8);
      } catch {
        // Holdings search failed, continue with ETF results only
      }
    }

    return NextResponse.json({
      results: etfResults,
      holdingResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], holdingResults: [] });
  }
}
