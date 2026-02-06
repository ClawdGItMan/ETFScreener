import { NextRequest, NextResponse } from "next/server";
import { getAllHoldingsForETF } from "@/lib/db/queries/holdings";
import { computePairwiseOverlap } from "@/lib/utils/calculations";

export async function POST(request: NextRequest) {
  try {
    const { tickers } = await request.json();

    if (
      !Array.isArray(tickers) ||
      tickers.length < 2 ||
      tickers.length > 5
    ) {
      return NextResponse.json(
        { error: "Provide 2-5 tickers" },
        { status: 400 }
      );
    }

    const holdingsMap: Record<string, { securityTicker: string | null }[]> =
      {};
    for (const t of tickers) {
      holdingsMap[t.toUpperCase()] = await getAllHoldingsForETF(
        t.toUpperCase()
      );
    }

    const overlap = computePairwiseOverlap(holdingsMap);
    return NextResponse.json(overlap);
  } catch {
    return NextResponse.json(
      { error: "Failed to compute overlap" },
      { status: 500 }
    );
  }
}
