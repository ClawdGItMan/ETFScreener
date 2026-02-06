import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, getFromDateForPeriod } from "@/lib/db/queries/prices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const period = request.nextUrl.searchParams.get("period") || "1y";
  const fromDate = getFromDateForPeriod(period);

  try {
    const prices = await getPriceHistory(ticker.toUpperCase(), fromDate);
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      period,
      prices,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
