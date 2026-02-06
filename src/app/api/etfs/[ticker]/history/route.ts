import { NextRequest, NextResponse } from "next/server";
import { getHoldingsSnapshots } from "@/lib/db/queries/holdings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const snapshots = await getHoldingsSnapshots(
      ticker.toUpperCase(),
      from,
      to
    );
    return NextResponse.json({ snapshots });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
