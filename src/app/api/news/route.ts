import { NextRequest, NextResponse } from "next/server";
import { getNewsArticles } from "@/lib/db/queries/news";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const etfTicker = searchParams.get("etf") || undefined;
  const sentiment = searchParams.get("sentiment") || undefined;
  const apiSource = searchParams.get("source") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const result = await getNewsArticles({
      etfTicker,
      sentiment,
      apiSource,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
