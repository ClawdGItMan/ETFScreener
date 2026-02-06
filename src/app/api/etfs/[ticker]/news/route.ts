import { NextRequest, NextResponse } from "next/server";
import { getNewsArticles } from "@/lib/db/queries/news";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const page = parseInt(
    request.nextUrl.searchParams.get("page") || "1"
  );

  try {
    const news = await getNewsArticles({
      etfTicker: ticker.toUpperCase(),
      page,
      limit: 20,
    });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
