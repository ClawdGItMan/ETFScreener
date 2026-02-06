import { NextRequest, NextResponse } from "next/server";
import { getEtfByTicker } from "@/lib/db/queries/etfs";
import { getTopHoldings } from "@/lib/db/queries/holdings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    const etf = await getEtfByTicker(upperTicker);
    if (!etf) {
      return NextResponse.json({ error: "ETF not found" }, { status: 404 });
    }

    const topHoldings = await getTopHoldings(upperTicker, 10);

    return NextResponse.json({ ...etf, topHoldings });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch ETF" },
      { status: 500 }
    );
  }
}
