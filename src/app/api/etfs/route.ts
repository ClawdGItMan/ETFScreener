import { NextRequest, NextResponse } from "next/server";
import { getFilteredEtfs, getEtfCount } from "@/lib/db/queries/etfs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sort = searchParams.get("sort") || "aum";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const issuer = searchParams.get("issuer") || undefined;
  const category = searchParams.get("category") || undefined;
  const assetClass = searchParams.get("asset_class") || undefined;
  const search = searchParams.get("q") || undefined;
  const blackrockOnly = searchParams.get("blackrock") === "true";

  const offset = (page - 1) * limit;

  try {
    const [etfs, total] = await Promise.all([
      getFilteredEtfs({
        sort,
        order,
        issuer,
        category,
        assetClass,
        search,
        blackrockOnly,
        limit,
        offset,
      }),
      getEtfCount({ issuer, category, assetClass, search, blackrockOnly }),
    ]);

    return NextResponse.json({
      data: etfs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch ETFs" },
      { status: 500 }
    );
  }
}
