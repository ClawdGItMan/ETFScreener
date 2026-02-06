import { NextRequest, NextResponse } from "next/server";
import { getEtfsByTickers } from "@/lib/db/queries/etfs";
import { getAllHoldingsForETF } from "@/lib/db/queries/holdings";
import { computePairwiseOverlap } from "@/lib/utils/calculations";

export async function GET(request: NextRequest) {
  const tickersParam = request.nextUrl.searchParams.get("tickers") || "";
  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length < 2 || tickers.length > 5) {
    return NextResponse.json(
      { error: "Provide 2-5 tickers separated by commas" },
      { status: 400 }
    );
  }

  try {
    const etfs = await getEtfsByTickers(tickers);

    const holdingsMap: Record<string, { securityTicker: string | null }[]> =
      {};
    for (const t of tickers) {
      holdingsMap[t] = await getAllHoldingsForETF(t);
    }

    const overlap = computePairwiseOverlap(holdingsMap);

    return NextResponse.json({ etfs, overlap });
  } catch {
    return NextResponse.json(
      { error: "Failed to compare ETFs" },
      { status: 500 }
    );
  }
}
