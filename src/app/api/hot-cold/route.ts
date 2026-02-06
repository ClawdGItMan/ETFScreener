import { NextRequest, NextResponse } from "next/server";
import { getFilteredEtfs } from "@/lib/db/queries/etfs";
import { computeMomentumScore, getHeatLevel } from "@/lib/utils/calculations";

export async function GET(request: NextRequest) {
  const category =
    request.nextUrl.searchParams.get("category") || undefined;
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "50"
  );

  try {
    const etfs = await getFilteredEtfs({
      sort: "aum",
      order: "desc",
      category,
      limit,
      offset: 0,
    });

    const scored = etfs
      .map((etf) => {
        const score = computeMomentumScore({
          priceChange1w: etf.priceChange1w
            ? parseFloat(etf.priceChange1w)
            : null,
          priceChange1m: etf.priceChange1m
            ? parseFloat(etf.priceChange1m)
            : null,
          avgVolume: etf.avgVolume ? parseFloat(etf.avgVolume) : null,
        });

        return {
          ticker: etf.ticker,
          name: etf.name,
          issuer: etf.issuer,
          category: etf.category,
          price: etf.price,
          priceChange1d: etf.priceChange1d,
          priceChange1w: etf.priceChange1w,
          priceChange1m: etf.priceChange1m,
          aum: etf.aum,
          momentumScore: score,
          heatLevel: getHeatLevel(score),
        };
      })
      .sort((a, b) => b.momentumScore - a.momentumScore);

    return NextResponse.json(scored);
  } catch {
    return NextResponse.json(
      { error: "Failed to compute rankings" },
      { status: 500 }
    );
  }
}
