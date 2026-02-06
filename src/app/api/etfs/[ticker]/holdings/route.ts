import { NextRequest, NextResponse } from "next/server";
import { getHoldings } from "@/lib/db/queries/holdings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const sort = searchParams.get("sort") || "weight";
  const search = searchParams.get("q") || undefined;

  try {
    const result = await getHoldings(ticker.toUpperCase(), {
      page,
      limit,
      sort,
      search,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch holdings" },
      { status: 500 }
    );
  }
}
