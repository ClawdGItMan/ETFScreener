import { NextRequest, NextResponse } from "next/server";
import { searchEtfs } from "@/lib/db/queries/etfs";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchEtfs(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
